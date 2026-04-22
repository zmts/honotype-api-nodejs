## Общая информация

- Project name: **honotype-api-nodejs**
- Language: **TypeScript**
- Runtime stack: **Node.js, Hono, PostgreSQL, Drizzle ORM, Knex migrations, Zod**
- Архитектурный стиль: **модульный API server с собственным lightweight framework поверх Hono**

## Code Quality Rules For Codex

- При работе в этом репозитории обязательно соблюдай правила из [`CODE_QUALITY.md`](.ai/CODE_QUALITY.md).
- `CODE_QUALITY.md` является источником правды для code quality, naming, style и общих правил написания кода для Codex в этом workspace.
- Не дублируй code quality rules в этом файле: `AGENTS.md` описывает архитектуру, слои, flow и проектные ограничения, а `CODE_QUALITY.md` — правила качества кода.

## Что это за проект по архитектуре

`honotype-api-nodejs` не использует NestJS-подобный framework layer с декораторами и DI-контейнером как основу приложения.
Вместо этого проект строит свой небольшой каркас поверх `Hono`:

- bootstrap и composition root находятся в `apps/api-main/main.ts` и `apps/api-main/server.ts`;
- HTTP-модули собираются вручную через массив контроллеров;
- каждый бизнес-модуль живет в собственной папке и имеет явный набор зависимостей;
- вход и выход из системы типизированы через DTO, contracts и resources;
- доступ к данным вынесен в отдельный repository layer;
- framework/runtime primitives и cross-cutting concerns лежат в `libs/core`;
- общие `inout`-артефакты лежат в `libs/common`.

Это делает код явным, предсказуемым и удобным для небольшого/среднего backend-проекта без тяжелой магии framework-а.

## Структура проекта

- `.old-api`
  старая реализация API, не источник правды для новой разработки
- `_templates`
  канонические шаблоны модулей и файлов. При добавлении новых модулей сначала сверяйся с ними
- `apps`
  прикладные приложения
- `apps/api-main`
  основное API-приложение
- `apps/api-main/config`
  конфигурация приложения и env mapping
- `apps/api-main/database`
  runtime connection, drizzle schema, knex migrations
- `apps/api-main/datalayer`
  репозитории доступа к данным
- `apps/api-main/global`
  глобальные зависимости и middleware
- `apps/api-main/modules`
  бизнес-модули API
- `libs/core`
  kernel/runtime building blocks без доменной логики
- `libs/common`
  общие `inout` contracts/resources, которые можно переиспользовать между модулями
- `libs/entities`
  доменные сущности

## Основные паттерны и шаблоны проекта

### 1. `apps/` + `libs/` split

Базовый structural pattern проекта:

- `apps/*` содержит runnable application;
- `libs/core` содержит kernel/runtime building blocks без доменной логики;
- `libs/common` содержит общие `inout` contracts/resources;
- `libs/entities` содержит доменные сущности;
- alias imports через `tsconfig.json` используются как обязательная практика.

Это означает, что новый код нужно класть не “по технологическому вкусу”, а по слою ответственности.

### 2. Composition Root и ручная сборка приложения

Проект использует явный composition root вместо скрытой DI-магии:

- `apps/api-main/main.ts` решает, запускать сервер или миграции;
- `apps/api-main/server.ts` создает `Hono` app;
- там же подключаются глобальные middleware;
- там же итерируется список контроллеров из `apps/api-main/modules/index.ts`;
- каждый контроллер создается вручную через `new Controller()`.

Это важный паттерн проекта: wiring должен быть виден явно в коде.

### 3. Manual Controller Registration

Контроллеры регистрируются через единый массив:

- `apps/api-main/modules/index.ts` экспортирует список controller classes;
- `server.ts` проходит по этому списку и монтирует маршруты.

Следствие для проектирования:

- новый HTTP-модуль не “подхватывается автоматически”;
- после создания контроллера его обязательно нужно добавить в `apps/api-main/modules/index.ts`.

### 4. Controller -> Action pattern

Ключевой прикладной шаблон проекта:

- controller отвечает только за route binding и чтение входных данных;
- action выполняет use-case;
- controller передает в `BaseController.execute(...)` результат action;
- action возвращает `Resource` или `ResourceList`.

Практически это выглядит так:

- controller создает DTO из `await c.req.json()`;
- controller достает auth-context при необходимости;
- controller создает action и вызывает `run(...)`;
- action работает с repo/service;
- action возвращает resource.

Это основной flow проекта и его нужно сохранять при проектировании новых endpoint-ов.

### 5. BaseController как единая точка HTTP-ответа

`libs/core/runtime/controller/base.controller.ts` реализует шаблон стандартизованного API response:

- action возвращает `Resource`/`ResourceList`;
- `BaseController.execute(...)` превращает это в единый JSON-ответ;
- здесь же выставляются status, cookies и headers;
- списки автоматически уходят в поле `list`, одиночные сущности в `data`.

Следствие:

- контроллеры не должны вручную собирать JSON-ответы для обычных бизнес-route-ов;
- ответ должен проходить через `Resource`-pipeline, чтобы формат API оставался единым.

### 6. Action as Use Case

`BaseAction` задает минимальный контракт: `run(...args) => Promise<Result>`.

Реальный паттерн проекта:

- один action = один use case;
- action получает зависимости через constructor injection;
- action не знает про Hono context;
- action оперирует DTO, entities, repos, services, resources.

Это не CQRS в полном смысле, но action layer уже играет роль use-case/application layer.

### 7. Module-local Dependency Object

Каждый модуль имеет собственную папку `dependency/`:

- `interface.ts` описывает контракт зависимостей;
- `dependency.ts` создает concrete dependencies;
- actions используют зависимости через этот объект.

Пример:

- `posts` зависит только от `PostsRepo`;
- `auth` собирает `UsersRepo`, `RefreshSessionsRepo`, `AuthService`, `jwtService`, `authConfig`.

Это один из главных паттернов проекта: зависимости собираются локально и явно, без скрытого контейнера.

### 8. Global Dependencies для cross-cutting concerns

Cross-cutting зависимости выделены отдельно:

- `apps/api-main/global/dependency/dependency.ts` создает `jwtService` и `jwtMiddleware`;
- `server.ts` подключает их глобально;
- модуль `auth` переиспользует `globalDeps.jwtService`.

То есть в проекте есть два уровня зависимостей:

- global deps для общесистемных concern-ов;
- module deps для конкретного бизнес-модуля.

### 9. In/Out Layer pattern

У каждого полноценного модуля есть папка `inout/` с тремя ролями:

- `validations/` — DTO и zod schema;
- `contracts/` — shape внешнего ответа;
- `resources/` — mapping domain/payload -> contract.

Это один из самых устойчивых шаблонов кодовой базы.

#### DTO + runtime validation

DTO-классы:

- наследуются от `BaseValidator`;
- валидируют вход прямо в constructor;
- используют `zod` как runtime validation layer;
- держат вход типизированным до передачи в action.

Практика проекта:

- schema primitives лежат рядом в `schema.ts`;
- DTO собирает итоговую Zod-схему через `zodSchema(...)`;
- invalid input приводит к `AppError(ErrorCode.VALIDATION)`.

#### Contract pattern

Contract описывает публичную форму ответа.

Его задача:

- отделить внутреннюю сущность/модель от внешнего API shape;
- не отдавать клиенту лишние поля из entity/database layer.

#### Resource pattern

Resource инкапсулирует:

- mapping в contract;
- response options: status, cookies, headers, pagination, meta.

`ResourceList` используется для коллекций и пагинации.

Это означает, что mapping и транспортная упаковка не должны жить внутри action или controller.

### 10. Lightweight Domain Entity pattern

Сущности в `libs/entities` построены как легкие классы поверх `BaseEntity`:

- constructor делает `Object.assign`;
- entity может содержать локальное доменное поведение;
- пример: `User.hashPassword`, `User.checkPassword`;
- пример: `RefreshSession` генерирует `refreshToken` при создании.

Здесь используется не rich domain model во всем проекте, а pragmatic entity pattern:

- данные остаются простыми;
- бизнес-правила добавляются только там, где они действительно нужны.

### 11. Repository pattern поверх Drizzle

Data access вынесен в `apps/api-main/datalayer`.

Общие признаки repo-слоя:

- каждый repo работает с одной сущностью/aggregate;
- repo изолирует SQL/ORM детали от action layer;
- repo возвращает entity instances;
- `BaseRepo` содержит общую обработку DB ошибок, empty responses и defaults.

Повторяющиеся шаблоны внутри репозиториев:

- `create`, `update`, `findOne`, `findAll`, иногда `findAndPaginate`;
- private `buildWhere(...)` для сборки фильтров;
- маппинг DB row -> `new Entity(result)`;
- перевод DB ошибок в `AppError`.

Для новых репозиториев нужно придерживаться этой же структуры.

### 12. Error Mapping pattern

В проекте есть единая error taxonomy:

- `AppError` задает код, status, description, meta;
- `ErrorCode` фиксирует бизнес- и инфраструктурные коды ошибок;
- `BaseRepo` маппит DB-level errors в `AppError`;
- `BaseValidator` маппит validation errors в `AppError`;
- auth/actions бросают `AppError` для бизнес-ошибок;
- `globalExceptionHandler` конвертирует всё в единый JSON error response.

Это значит:

- новые слои не должны выбрасывать “сырые” инфраструктурные ошибки наружу без маппинга;
- transport-формат ошибки должен оставаться централизованным.

### 13. Global Error Handler и единый error response

`libs/core/runtime/api/global-handlers/global-exception.handler.ts` реализует транспортный шаблон ошибок:

- собирает request context;
- различает `AppError`, `HTTPException` и generic error;
- возвращает единый shape `ApiResponseError`;
- suppress-логирование для части ожидаемых 4xx ошибок.

Паттерн важен для проектирования:

- локальный код не должен дублировать обработку ошибок на route-level;
- handler верхнего уровня является единственным местом формирования error response.

### 14. Auth Context через middleware + helper

Авторизация построена через два слоя:

- `JwtMiddleware` разбирает `Authorization` header и кладет пользователя в context;
- `getCurrentUserJwt(c)` валидирует наличие пользователя и бросает `NO_ANONYMOUS_ACCESS`.

Это повторяемый guard pattern проекта:

- middleware обогащает request context;
- helper извлекает обязательный auth-context;
- action получает уже проверенный `CurrentUserJwt`.

### 15. Config as validated object

Конфигурация оформлена как явный отдельный слой:

- каждый config-файл объявляет schema env variables;
- `ValidEnvConfig` читает `.env` и валидирует значения через Zod;
- `Config<T>` возвращает typed config object;
- `appConfig`, `databaseConfig`, `authConfig` импортируются как runtime constants.

Это обязательный шаблон для новых конфигов:

- env нельзя читать напрямую из `process.env` внутри бизнес-кода;
- новый config должен появляться как отдельный validated module.

### 16. Database schema/runtime split

В проекте намеренно разделены два сценария работы с БД:

- runtime queries идут через `Drizzle ORM`;
- schema migrations живут отдельно на `Knex`.

Иными словами:

- `apps/api-main/database/schemas/*` — runtime schema для Drizzle;
- `apps/api-main/database/migrations/*` — эволюция схемы БД;
- `main.ts --migrations` запускает отдельный migration flow.

Для последующего проектирования это важное ограничение: изменение данных в runtime и изменение схемы БД проект разделяет разными инструментами.

### 17. Template-first Module Scaffolding

Папка `_templates/module` задает канонический шаблон нового модуля:

- `actions/`
- `dependency/`
- `inout/contracts`
- `inout/resources`
- `inout/validations`
- `<module>.controller.ts`
- `index.ts`

Это не пример “на всякий случай”, а фактический blueprint, по которому уже собраны реальные модули `posts`, `users`, `auth`.

### 18. Barrel exports как стандарт навигации

В проекте активно используются `index.ts` как barrel exports:

- на уровне модулей;
- в `inout`;
- в `dependency`;
- в `database`;
- в `libs`.

Следствие:

- при добавлении нового файла его обычно нужно подключить в локальный `index.ts`;
- импортировать лучше через alias/barrel, а не через глубокие относительные пути.

### 19. Service layer используется точечно, а не везде

Важно не переобобщать архитектуру:

- `posts` и `users` обходятся controller + action + repo;
- отдельный service layer есть только там, где есть нетривиальная оркестрация, например в `auth`.

Значит, локальный паттерн проекта такой:

- не создавать service “по привычке”;
- добавлять service только когда бизнес-логика реально переиспользуется или требует отдельной инкапсуляции.

### 20. Явный startup lifecycle у контроллеров

Каждый контроллер реализует:

- `routes` getter;
- `init(): Promise<void>`.

Сейчас `init()` в основном логирует запуск, но сам hook уже является частью шаблона контроллера.

Для новых модулей этот интерфейс нужно сохранять, даже если инициализация пока тривиальна.

## Актуальная структура приложения

- bootstrap entrypoint: `apps/api-main/main.ts`
- HTTP server composition root: `apps/api-main/server.ts`
- runtime DB + schemas + migrations: `apps/api-main/database/*`
- repositories: `apps/api-main/datalayer/*`
- global middleware/deps: `apps/api-main/global/*`
- business modules: `apps/api-main/modules/*`
- reusable runtime/framework layer: `libs/core/*`
- shared inout resources/contracts: `libs/common/inout/*`
- domain entities: `libs/entities/*`

## Актуальные модули

- `root` — базовый ping endpoint
- `auth` — регистрация, login, refresh-tokens, Google OAuth flow
- `users` — current user endpoint
- `posts` — list/create posts

## Канонический шаблон нового HTTP-модуля

Если проектировать новый модуль в текущем стиле репозитория, ориентируйся на такую последовательность:

1. Создать папку `apps/api-main/modules/<module-name>`.
2. Добавить `<module>.controller.ts`.
3. Добавить `actions/` с отдельным action на каждый use case.
4. Добавить `dependency/interface.ts` и `dependency/dependency.ts`.
5. Добавить `inout/validations` для DTO и Zod schema.
6. Добавить `inout/contracts` для публичных response shapes.
7. Добавить `inout/resources` для mapping domain -> contract.
8. При необходимости добавить `services/`, но только если логика действительно сложная.
9. Если нужны данные, добавить/расширить repo в `apps/api-main/datalayer`.
10. Если меняется схема БД, обновить `database/schemas/*` и создать migration.
11. Экспортировать модуль через локальный `index.ts`.
12. Зарегистрировать controller в `apps/api-main/modules/index.ts`.

## Канонический flow нового endpoint-а

Для нового endpoint-а проект ожидает такой сценарий:

1. Route принимает запрос в controller.
2. Controller читает body/query/context.
3. DTO валидирует входные данные.
4. Controller вызывает соответствующий action.
5. Action работает с repo/service/entities.
6. Action возвращает `Resource` или `ResourceList`.
7. `BaseController.execute(...)` формирует унифицированный HTTP response.

Если endpoint требует авторизацию:

1. `JwtMiddleware` заранее кладет current user в context.
2. Controller вызывает `getCurrentUserJwt(c)`.
3. Action получает уже готовый typed auth context.

## Практические правила проектирования для этого репозитория

- Предпочитай явную сборку зависимостей неявной магии.
- Держи Hono-specific код только в controller/middleware layer.
- Не пиши бизнес-логику прямо в controller.
- Не отдавай entity/database row напрямую наружу, всегда проходи через contract/resource.
- Валидацию входа держи в DTO через `BaseValidator` + `zod`.
- Ошибки маппь в `AppError`, а не в произвольные `Error`.
- Repo должен возвращать entity, а не сырые DB rows.
- Новый конфиг оформляй как validated config module.
- Используй alias imports и barrel exports как стандарт проекта.
- Для новых модулей сначала смотри в `_templates/module`, потом в ближайший реальный модуль-референс.

## Что важно учитывать при дальнейшем проектировании

- Это lightweight modular server, а не framework-heavy enterprise architecture.
- Главный design goal проекта: явность, низкая магия, небольшой cognitive load.
- Здесь лучше работает простая модульная композиция, чем глубокие уровни абстракции.
- Источник правды для сборки зависимостей — модульные dependency-объекты (`dependency.ts`) и `globalDeps` для cross-cutting concerns.
- В репозитории на текущий момент не найден сформированный test layer. Для новых фич стоит проектировать тесты отдельно и не рассчитывать на уже устоявшийся тестовый шаблон внутри этого репозитория.

## Уточнения по текущему состоянию

- Источник правды по модульному шаблону: `_templates/module` и модули `posts`, `users`, `auth`.
- Источник правды по API bootstrap: `apps/api-main/main.ts` и `apps/api-main/server.ts`.
- Источник правды по response/error patterns: `libs/core/runtime/api/*` и `libs/core/runtime/errors/*`.
- Источник правды по config pattern: `apps/api-main/config/*`, `libs/core/kernel/config/*` и `libs/core/runtime/config/*`.
- Источник правды по data access pattern: `apps/api-main/datalayer/*` и `apps/api-main/database/*`.

## Локальные проектные ограничения

- Для нового кода сохраняй pattern: `controller -> action -> repo/service -> resource`.
- Для новых модулей используй `_templates/module` как базовый scaffold.
- Не читай `process.env` напрямую вне config layer.
- Не формируй API response вручную, если можно использовать `Resource` и `BaseController.execute(...)`.
