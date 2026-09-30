# Архитектура API

## Статус и границы

Проект представляет собой модульный TypeScript API-каркас, построенный поверх Hono.

Архитектурный принцип: новый доменный функционал добавляется отдельными бизнес-модулями. Его нельзя прятать в `libs/core`, расширять через несвязанный демонстрационный модуль или смешивать с transport-слоем.

## Карта слоёв

```text
apps/api-main
  main.ts                 process entry point: server or migrations
  server.ts               composition root: Hono, middleware, controllers
  config/                 validated configuration from environment
  database/               Drizzle runtime schema and Knex migrations
  datalayer/              repositories and database error mapping
  global/                 cross-cutting dependencies and middleware
  modules/                business modules and HTTP controllers

libs
  core/
    kernel/               abstract contracts and base application rules
    runtime/              reusable technical implementations
  common/                 shared contracts, resources and stateless helpers
  entities/               lightweight domain entities
```

Правило размещения:

- `apps/api-main/modules/<module>` — use cases и HTTP API конкретного домена.
- `apps/api-main/datalayer` — SQL/Drizzle access; repository не содержит HTTP-логику.
- `libs/entities` — доменные данные и небольшое локальное поведение.
- `libs/core` — только переиспользуемые инфраструктурные примитивы. Бизнес-логика конкретного домена сюда не помещается.
- `libs/common` — только действительно общие transport-артефакты, а не contracts одного модуля.

## Core: kernel, runtime и common

### `libs/core/kernel`

`kernel` содержит только базовые абстракции приложения:

- interfaces, abstract classes, базовые types и protocol contracts;
- общие lifecycle- и repository-контракты;
- правила взаимодействия слоёв.

`kernel` не содержит concrete clients, I/O, HTTP handlers, Redis, WebSocket, database access, domain logic или imports из `apps/**` и `modules/**`.

### `libs/core/runtime`

`runtime` содержит переиспользуемые технические реализации, которые выполняют работу во время запуска приложения:

- HTTP server primitives, base controller, middleware, validator, error handling;
- Redis-, database-, queue- и generic WebSocket-клиенты;
- lifecycle utilities, retries, migrations и другие инфраструктурные адаптеры.

`runtime` может зависеть от `kernel`, внешних пакетов и других `libs/**`, но не от `apps/**` или доменных `modules/**`.

### `libs/common`

`common` содержит нейтральные, переиспользуемые несколькими модулями contracts, resources и stateless helpers. Здесь допустимы общие API contracts, response envelopes, pagination, pure helpers, преобразования, форматирование и validation primitives без I/O, lifecycle и domain-specific правил.

`common` не содержит infrastructure clients, HTTP/Redis/WebSocket/database access и бизнес-логику конкретного домена.

### Правило выбора расположения

- Абстракция или interface без concrete runtime behavior → `libs/core/kernel`.
- Переиспользуемая техническая реализация с I/O, lifecycle или framework integration → `libs/core/runtime`.
- Общий нейтральный API contract, resource или pure stateless helper → `libs/common`.
- Контракт или логика одного домена → `apps/api-main/modules/<module>`.
- `libs/**` не импортирует `apps/**`, включая `import type`.

## Направление зависимостей

`apps` — верхний application layer, `libs` — нижние переиспользуемые слои.

- `apps/**` может импортировать `libs/**`.
- `libs/**` не может импортировать ничего из `apps/**`.
- Запрет относится к runtime-импортам, `import type`, alias-путям, относительным путям и barrel exports.
- `libs/**` может зависеть только от Node.js, внешних пакетов и других модулей в `libs/**`.
- Если коду внутри `libs/**` нужен тип или контракт, который сейчас объявлен в `apps/**`, этот тип или контракт нужно перенести либо выделить в `libs/**`. Импортировать его из `apps/**` нельзя.

### Владение infrastructure-клиентами

Infrastructure-клиент принадлежит слою, в котором он объявлен. Потребители импортируют клиент и связанные с ним контракты напрямую из слоя-владельца.

Нельзя создавать compatibility re-export, переименованный alias или промежуточный модуль в другом слое только для сохранения прежнего пути импорта.

При переносе клиента в другой слой в том же изменении необходимо обновить импорты всех потребителей и удалить устаревшие промежуточные exports или каталоги.


## Composition root и регистрация модулей

`apps/api-main/main.ts` выбирает режим запуска: HTTP server или migrations.

`apps/api-main/server.ts` является единственным composition root. Здесь создаются Hono application, global middleware, CORS, error handlers и контроллеры из `apps/api-main/modules/index.ts`.

Новый HTTP-модуль должен быть явно зарегистрирован в `modules/index.ts`. Автоматического discovery нет и он не нужен: регистрация должна оставаться обозримой.

Каждый контроллер реализует `IBaseController`: предоставляет `routes` и асинхронный `init()`. Перед монтированием маршрутов `server.ts` вызывает `init()` каждого контроллера.

```text
Request
  -> Hono global middleware
  -> Controller route
  -> DTO validation
  -> Action
  -> Service / Repository
  -> Entity / persistence
  -> Resource
  -> BaseController.execute
  -> JSON response
```

## Модуль как единица бизнес-функциональности

Один модуль владеет одним доменным контекстом. Для нового доменного контекста структура должна быть такой:

```text
modules/example/
  actions/
  dependency/
  inout/
    validations/
    contracts/
    resources/
  services/
  example.controller.ts
  index.ts
```

Правила:

- controller связывает HTTP route с use case, но не реализует бизнес-логику;
- один `Action` выражает один use case;
- каждый `Action` class хранится в отдельном файле `actions/<operation>-<entity>.action.ts`; `actions/index.ts` содержит только exports;
- `Action` не получает `Hono.Context` и не формирует HTTP response;
- `Action` не создаёт services через `new`; он использует только сервисы, созданные в `dependency.ts` и переданные через constructor;
- service содержит переиспользуемые доменные операции, которые не принадлежат одной action;
- чистые stateless helpers без зависимостей и lifecycle размещаются в `modules/<module>/common/` в файлах с предметным именем, например `slugs.ts`, без суффикса `.service`;
- `services/` используется только для переиспользуемой доменной логики с самостоятельной ответственностью и реальными зависимостями;
- repository скрывает Drizzle и детали запросов;
- resource маппит внутренние данные в публичный API contract;
- module не импортирует internals другого module напрямую; общий контракт должен быть выражен явно.

Не нужно создавать module ради одной технической функции. Если код не имеет самостоятельной доменной ответственности, он остаётся рядом с владельцем use case или в `libs/core` только при доказанной повторной применимости.

Новый модуль создаётся на основе `_templates/module`. Его внешний модульный интерфейс выражается через локальный `index.ts`; другие модули не должны импортировать его внутренние файлы напрямую.

## Явные зависимости

Проект не использует глобальный DI container. Зависимости собираются вручную:

- global dependencies — cross-cutting services, например JWT middleware;
- module dependencies — repositories и services конкретного модуля; `dependency.ts` создаёт их один раз и передаёт через dependency interface;
- action получает repositories и services только через constructor dependencies.

Это намеренный подход. Он делает runtime wiring и ownership зависимостей видимыми в коде.

Правила:

- не создавать service locator;
- не читать `process.env` в action, controller или repository;
- config передавать через validated config modules;
- не превращать dependency object в неявный глобальный контейнер;
- stateless actions можно создавать на request; stateful объекты требуют явно выбранного lifecycle.

## HTTP, DTO и публичные контракты

Входные данные проходят runtime validation через DTO на базе Zod. DTO создаётся в controller до запуска action.

```text
HTTP JSON -> DTO -> Action input
Entity / domain result -> Resource -> Contract -> API JSON
```

### Структура `inout`

Каждая сущность имеет собственные contract и resource файлы: `contracts/<entity>.contract.ts` и `resources/<entity>.resource.ts`. Не объединять contracts или resources разных сущностей в общий файл.

Каждый вход use case имеет отдельный DTO-файл в `validations/` с именем `<operation>-<entity>.dto.ts`. DTO наследует `BaseValidator`, собирает итоговую Zod-схему и валидирует вход при создании.

`validations/schema.ts` содержит только переиспользуемые Zod-примитивы полей конкретного модуля. `index.ts` в `inout/` и его подпапках используется только для barrel exports.

`contracts` описывают публичный API shape. Они не должны быть типом Drizzle row или entity.

`resources` — единственное обычное место для mapping entity в API output. Обычные бизнес-route должны возвращать `Resource` или `ResourceList` через `BaseController.execute(...)`.

Стандартный response:

```json
{
  "status": 200,
  "data": {},
  "list": [],
  "pagination": {
    "limit": 20,
    "total": 0
  },
  "meta": {}
}
```

Для конкретного ответа используется либо `data`, либо `list`. Не нужно вручную собирать этот envelope в controller.

Исключения: health checks, OAuth redirects и другие чисто транспортные endpoints могут возвращать Hono response непосредственно, если Resource pipeline для них не применим.

## Ошибки и авторизация

Ожидаемые ошибки выражаются через `AppError` и `ErrorCode`. Верхнеуровневый `globalExceptionHandler` конвертирует их в единый JSON error response.

Правила:

- validation, business rules и repository errors переводятся в `AppError`;
- не дублировать try/catch и HTTP error responses в каждом controller;
- неизвестные ошибки не должны утекать клиенту с техническими деталями;
- `JwtMiddleware` только извлекает identity из access token;
- action, которой требуется пользователь, получает `CurrentUserJwt` через `getCurrentUserJwt(c)`.

Авторизация должна быть частью use case: получение identity в controller допустимо, но проверка ownership и прав доступа принадлежит action/service.

## Entities и persistence

Entities в `libs/entities` — lightweight classes. Они не являются ORM-моделями и могут содержать только локальное доменное поведение, например password hashing или генерацию refresh token.

Repositories:

- выполняют Drizzle queries;
- маппят DB row в entity;
- не отдают raw database rows выше data layer;
- переводят database-specific errors в `AppError`;
- не делают presentation mapping.

Если несколько методов поиска одной сущности отличаются только дополнительными условиями одного lookup, repository предоставляет один `findOneBy(filter)`. Тип `filter` должен быть узким domain-типом с обязательным ключом поиска; нельзя принимать `Partial<Entity>` или допускать пустой filter. Методы с разной бизнес-семантикой или разными правилами доступа не объединяются.

Для lookup, где отсутствие сущности является ошибкой use case, repository поддерживает опцию `{ findOrThrow: true }`. В этом режиме repository выбрасывает `AppError(ErrorCode.NOT_FOUND)` и возвращает non-null entity. Не создавать service только для вызова repository и преобразования `null` в `NOT_FOUND`; service содержит только общую доменную логику модуля.

Изменение схемы данных всегда состоит из двух синхронных частей:

1. новая Knex migration в `database/migrations`;
2. соответствующее изменение Drizzle schema в `database/schemas`.

Knex migration описывает эволюцию реальной базы. Drizzle schema описывает runtime contract. Ни один из них не заменяет другой.

## Database identifiers

- Для таблиц первичный ключ должен быть `bigint generated always as identity primary key`.
- Внешние ключи должны использовать тот же тип, что и связанный первичный ключ — обычно `bigint`.
- Не использовать `serial` и `bigserial` в новых схемах; применять `GENERATED ... AS IDENTITY`.

## Критерии готовности нового модуля

Перед регистрацией модуля проверить:

- module имеет единственную понятную доменную ответственность;
- route зарегистрирован в `modules/index.ts`;
- input валидируется DTO;
- action не зависит от Hono;
- наружу возвращается contract через resource;
- ownership проверен в action/service;
- repository не протекает в controller;
- migration и Drizzle schema синхронизированы;
- конфигурация валидируется отдельным config module;
- добавлены тесты критичного use case и API contract.
