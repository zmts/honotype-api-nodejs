# Lightweight Charts Architecture Guide

## Основная философия

Базовый принцип архитектуры:

**headless framework-agnostic core**  
**+**  
**тонкий Vue component/composable adapter**

Это означает следующее:

- ядро графической системы не зависит от Vue
- ядро не знает о `ref`, `watch`, `computed`, `onMounted`, `props` и других механизмах фреймворка
- ядро отвечает за chart engine, rendering contracts, plugin orchestration, interaction logic и адаптацию backend-driven данных к внутренним read-model
- Vue-слой отвечает только за интеграцию этого ядра в приложение
- frontend не вычисляет торговую структуру, не определяет тренды, не ищет BOS, не рассчитывает pivots — всё это приходит с backend

Такой подход выбран не ради абстракции как самоцели, а ради практических выгод:

- меньше связности между chart engine и Vue lifecycle
- проще тестировать core отдельно от UI
- проще поддерживать дисциплину слоёв
- легче масштабировать систему по мере роста количества инструментов и overlays
- при необходимости можно использовать core не только во Vue-окружении

Важный принцип:

> **Backend computes business meaning. Frontend computes presentation only.**

То есть backend является единственным источником истины для:

- market structure
- HH / HL / LH / LL
- BOS / CHOCH
- zones
- signals
- derived overlays
- индикаторов и любых других расчётных сущностей

Frontend выполняет только:

- получение данных
- адаптацию контрактов
- хранение read-model для UI
- отображение
- локальное UI-поведение

---

## Почему не делать всё сразу как Vue-компонент

Подход "всё как Vue component/plugin" на старте действительно кажется быстрее, но у него есть системные недостатки:

- chart lifecycle смешивается с Vue lifecycle
- interaction logic быстро переезжает в `watch`, `props`, `emit` и шаблонные компромиссы
- rendering contracts начинают зависеть от Vue state management
- тестирование core-логики без браузерного окружения становится сложнее
- повторное использование вне Vue практически исчезает
- любая дальнейшая декомпозиция обходится дороже

Поэтому Vue должен быть **интеграционным слоем**, а не местом, где живёт всё ядро графической системы.

---

## Почему не делать "чистую абстрактную библиотеку" слишком рано

Обратная крайность — строить чрезмерно универсальную framework-agnostic библиотеку ещё до появления реальных сценариев использования.

Это тоже плохой вариант, потому что приводит к:

- преждевременным абстракциям
- избыточным интерфейсам “на будущее”
- лишнему бойлерплейту
- замедлению разработки

Поэтому практический компромисс выглядит так:

- core проектируется как framework-agnostic
- но разрабатывается сразу под реальные use cases текущего Vue-приложения
- Vue adapter строится тонким и прикладным
- избыточная универсализация сознательно откладывается

---

## Архитектурная цель

Нужна не просто обёртка вокруг Lightweight Charts, а собственная chart-подсистема со следующими свойствами:

- backend-driven semantics
- строгая изоляция rendering engine от UI framework
- возможность подключать собственные плагины и overlays
- единый источник истины для структур и сигналов
- понятная система слоёв
- предсказуемый поток данных

---

# Общая архитектурная схема

## Поток данных

```text
Backend payload
  -> transport layer
  -> mappers / read-model adapters
  -> stores
  -> chart core / plugin manager
  -> rendering
  -> Vue adapter / UI
```

## Поток интеракций

```text
User interaction
  -> Vue adapter
  -> interaction layer
  -> core commands
  -> store/ui state changes
  -> plugin re-render
```

---

# Слои системы

## 1. Backend layer

### Роль
Единственный вычислительный слой.

### Отвечает за

- candles и любые derived market data
- market structure
- trend state
- HH / HL / LH / LL
- BOS / CHOCH
- zones
- signals
- любые расчётные сущности

### Не должно быть на frontend

- определения тренда
- поиска swing points
- вычисления BOS
- вычисления supply/demand zones
- интерпретации сырых свечей в торговый смысл

---

## 2. Transport layer

### Роль
Доставка данных от backend к frontend.

### Отвечает за

- HTTP / WebSocket / SSE / polling
- подписки на каналы данных
- reconnect
- sequence / ordering
- deduplication
- snapshot / delta handling
- первичную обработку envelope-структур

### Не отвечает за

- бизнес-расчёты
- визуализацию
- chart state

### Примеры модулей

- `candles-stream.ts`
- `structure-stream.ts`
- `signals-stream.ts`
- `chart-api.ts`

---

## 3. Mappers / Read-model layer

### Роль
Преобразование backend DTO в frontend read-model, пригодные для рендера.

### Отвечает за

- DTO -> internal models
- нормализацию полей
- проверку пригодности данных к отображению
- сортировку
- фильтрацию невалидных записей
- унификацию enum-значений
- подготовку данных под plugin/render contracts

### Не отвечает за

- вычисление структуры
- пересчёт бизнес-смысла
- "исправление" backend truth

### Ключевой принцип

Если backend прислал `HH`, frontend не должен перепроверять, действительно ли это `HH`.

Frontend может только:

- отфильтровать повреждённую запись
- привести формат
- адаптировать данные под UI

---

## 4. Stores layer

### Роль
Источник истины для отображаемого frontend-состояния.

### Отвечает за

- хранение read-model
- хранение свечей
- хранение overlays
- visibility flags
- loading / error / status
- выделение объектов
- active tool
- локальное UI state

### Не отвечает за

- chart rendering
- бизнес-расчёты
- transport connection logic

### Пример состояния

- candles
- pivots
- zones
- bos markers
- signals
- hovered entity
- selected overlay
- active layer visibility

---

## 5. Headless chart core

### Роль
Низкоуровневое ядро графика, независимое от Vue.

### Отвечает за

- создание и уничтожение chart instance
- lifecycle Lightweight Charts
- управление main series
- attach/detach plugins
- обновление данных графика
- связь с plugin manager
- координацию рендеринга

### Не отвечает за

- Vue lifecycle
- шаблоны
- toolbar UI
- панели приложения
- бизнес-расчёты

### Важный принцип

Core должен быть **headless**.

Это значит, что он работает как движок, а не как фреймворк-компонент.

---

## 6. Plugin / Rendering layer

### Роль
Отрисовка всех кастомных визуальных элементов поверх Lightweight Charts.

### Отвечает за

- primitives
- custom series
- overlays
- zones
- markers
- labels
- tooltips
- signal rendering
- visual projection read-model в chart-space

### Не отвечает за

- вычисление торговой логики
- транспорт данных
- глобальный UI workflow

### Что тут может быть

- `candles-series.plugin.ts`
- `pivot-labels.plugin.ts`
- `bos.plugin.ts`
- `zones.plugin.ts`
- `signals.plugin.ts`
- `price-line.plugin.ts`

---

## 7. Interaction layer

### Роль
Обработка пользовательского поведения, не связанного с вычислением торговой логики.

### Отвечает за

- hover
- selection
- active tool mode
- pointer interactions
- keyboard shortcuts
- toggles
- layer visibility interactions
- focus / inspect mode

### Не отвечает за

- расчёт структуры
- вычисление сигналов
- chart rendering как таковой

### Примеры

- `hover-manager.ts`
- `selection-manager.ts`
- `visibility-manager.ts`
- `pointer-controller.ts`

---

## 8. Vue adapter layer

### Роль
Тонкий интеграционный слой между headless core и Vue-приложением.

### Отвечает за

- создание и уничтожение core в `mounted/unmounted`
- binding props к engine commands
- подключение store к компоненту
- проброс событий наружу
- composables для удобной интеграции
- локальную интеграцию toolbar/panels/slots

### Не отвечает за

- реализацию core
- plugin contracts
- расчётные модели
- бизнес-смысл рынка

### Формат
Предпочтительный формат интеграции:

- Vue component
- Vue composables

А не глобальный Vue plugin, пока в этом нет реальной необходимости.

---

# Главные архитектурные принципы

## 1. Core — framework agnostic

В core не должно быть:

- `ref`
- `computed`
- `watch`
- `onMounted`
- `onBeforeUnmount`
- прямой зависимости от Pinia/Vuex
- шаблонной логики Vue

---

## 2. Backend decides, frontend renders

Frontend не должен дублировать торговую логику backend.

Разрешённые frontend-операции:

- сортировка
- фильтрация
- адаптация DTO
- grouping для UI
- преобразование координат
- подготовка tooltip-данных
- visible-range projection

Запрещённые вычисления на frontend:

- определение HH / HL / LH / LL
- определение тренда
- поиск BOS
- вычисление зон
- пересчёт сигналов

---

## 3. Plugin layer только рендерит

Плагины не должны быть носителями бизнес-логики.

Они получают уже готовые read-model и отображают их.

---

## 4. Vue layer остаётся тонким

Vue слой не должен превращаться в место, где живёт chart engine.

Он только интегрирует headless core в приложение.

---

## 5. Stores хранят presentation state

Store — это источник истины для UI-представления, но не для торговых вычислений.

---

## 6. Однонаправленный поток данных

Данные должны идти в одну сторону:

```text
backend -> transport -> mapper -> store -> render
```

Интеракции:

```text
ui -> interaction -> commands -> state update -> render
```

Нельзя допускать хаотический двусторонний граф зависимостей, где plugin сам меняет бизнес-состояние, а store частично пересчитывает backend logic.

---

# Предлагаемая структура папок

```text
packages/
  chart-core/
    src/
      core/
        chart-engine.ts
        chart-core.ts
        plugin-manager.ts
        coordinate-mapper.ts
        command-bus.ts

      transport/
        candles-stream.ts
        structure-stream.ts
        signals-stream.ts
        chart-api.ts

      models/
        candle.model.ts
        structure.model.ts
        signal.model.ts
        zone.model.ts
        chart-ui.model.ts

      mappers/
        candle.mapper.ts
        structure.mapper.ts
        signal.mapper.ts
        zone.mapper.ts

      stores/
        candles.store.ts
        structure.store.ts
        signals.store.ts
        ui.store.ts

      plugins/
        candles-series.plugin.ts
        pivot-labels.plugin.ts
        bos.plugin.ts
        zones.plugin.ts
        signals.plugin.ts
        tooltip.plugin.ts

      interactions/
        hover-manager.ts
        selection-manager.ts
        visibility-manager.ts
        pointer-controller.ts
        keyboard-controller.ts

      types/
        chart.types.ts
        plugin.types.ts
        interaction.types.ts
        transport.types.ts

      utils/
        invariant.ts
        time.ts
        math.ts
        collections.ts

      index.ts

  chart-vue/
    src/
      components/
        TradingChart.vue
        ChartToolbar.vue
        ChartLegend.vue

      composables/
        useTradingChart.ts
        useChartVisibility.ts
        useChartSelection.ts

      adapters/
        create-chart-engine.ts
        bind-chart-props.ts
        bind-chart-events.ts

      providers/
        chart.provider.ts

      types/
        chart-vue.types.ts

      index.ts
```

---

# Альтернативный вариант структуры для одного приложения

Если пока это не отдельные пакеты, а внутренняя подсистема одного проекта, можно использовать более простой layout:

```text
src/
  chart/
    core/
    transport/
    models/
    mappers/
    stores/
    plugins/
    interactions/
    vue/
```

Но даже в этом случае логическая граница между `core` и `vue` должна быть сохранена.

---

# Ответственность папок

## `core/`
Сердце chart engine.

Содержит:

- lifecycle графика
- работу с Lightweight Charts instance
- registry plugins
- команды к движку
- координацию обновлений

---

## `transport/`
Коммуникация с backend.

Содержит:

- api-клиенты
- ws/sse streams
- envelopes
- reconnect logic
- snapshot/delta processing

---

## `models/`
Внутренние модели frontend-отображения.

Содержит:

- свечи
- зоны
- markers
- signal entities
- read-model структуры

---

## `mappers/`
Переход от DTO к read-model.

Содержит:

- map-функции
- normalization
- guard/filter logic
- enum adapters

---

## `stores/`
Frontend presentation state.

Содержит:

- состояние отображаемых слоёв
- текущие read-model
- ui flags
- selected/hovered state

---

## `plugins/`
Chart rendering extensions.

Содержит:

- plugins для primitives/custom series
- overlays
- chart-specific visual projections

---

## `interactions/`
Локальное поведение интерфейса графика.

Содержит:

- hover logic
- selection logic
- keyboard shortcuts
- pointer interaction orchestration

---

## `vue/` или `chart-vue/`
Тонкая интеграция во Vue.

Содержит:

- root chart component
- composables
- prop/event binders
- provider/injection glue

---

# Предлагаемая последовательность реализации

## Этап 1. Зафиксировать границы архитектуры

Сначала нужно формально определить правила:

- frontend не считает торговую структуру
- core не зависит от Vue
- rendering отделён от transport
- Vue слой только интеграционный
- store хранит presentation state

Это должен быть явно зафиксированный engineering rule set.

---

## Этап 2. Описать transport contracts

Нужно определить контракты данных от backend:

- candles envelope
- structure envelope
- signals envelope
- versioning
- sequence / generatedAt
- snapshot / delta mode

Пример:

```ts
export type StreamEnvelope<T> = {
  version: number
  sequence: number
  generatedAt: number
  payload: T
}
```

---

## Этап 3. Определить internal frontend models

После этого нужно описать read-model, которые реально нужны рендеру.

Например:

- `CandleModel`
- `StructureReadModel`
- `BosMarkerModel`
- `ZoneOverlayModel`
- `SignalMarkerModel`

---

## Этап 4. Реализовать mapper layer

Нужно построить преобразование:

```text
backend DTO -> normalized read-model
```

С проверкой:

- времени
- цены
- обязательных полей
- enum mapping
- сортировки

---

## Этап 5. Собрать stores

Stores должны стать единым frontend-source of truth для отображения.

Нужны как минимум:

- `candles.store`
- `structure.store`
- `signals.store`
- `ui.store`

---

## Этап 6. Реализовать chart core

Сделать headless engine, который умеет:

- инициализировать график
- управлять main series
- принимать данные
- attach/detach plugins
- триггерить render updates
- взаимодействовать со stores

---

## Этап 7. Реализовать plugin manager

Plugin manager должен управлять:

- регистрацией plugins
- lifecycle plugins
- update flow
- rerender orchestration

---

## Этап 8. Построить базовые rendering plugins

Минимальный набор:

- candles plugin / main series binding
- pivots labels plugin
- BOS markers plugin
- zones plugin
- signals plugin

---

## Этап 9. Реализовать interaction layer

Нужны:

- hover manager
- selection manager
- visibility manager
- pointer controller
- keyboard controller

Важно: interaction layer работает только с UI state и командами движка.

---

## Этап 10. Сделать Vue adapter

Vue adapter должен:

- создать engine при mount
- уничтожить engine при unmount
- связать props с core commands
- читать stores
- отдавать events наружу
- подключить toolbar/panels/legend

---

## Этап 11. Поверх Vue adapter добавить app-level UI

На этом этапе добавляются:

- toolbar
- layer toggles
- panel controls
- inspector views
- legends
- side panels

Этот слой должен быть отдельным от core.

---

# Минимальный MVP состав

Для первого рабочего результата достаточно:

## Core

- chart init/destroy
- main candles series
- plugin manager
- command interface

## Transport

- candles stream
- structures stream
- signals stream

## Mappers

- candle mapper
- structure mapper
- signal mapper

## Stores

- candles
- structures
- signals
- ui visibility

## Plugins

- candles
- pivot labels
- BOS markers
- zones
- signals

## Vue

- `TradingChart.vue`
- `useTradingChart()`
- toolbar visibility binding

---

# Что не стоит делать на первом этапе

Не стоит сразу делать:

- глобальный Vue plugin
- избыточную DI-систему
- поддержку нескольких фреймворков как продуктовую фичу
- сложный serialization designer
- полноценный object editor, если он не нужен для MVP
- heavy abstraction "на будущее"

---

# Практическое решение по формату интеграции

Если выбирать между:

- framework-agnostic core
- или Vue component / Vue plugin

то наиболее разумный путь:

## Выбор

**Framework-agnostic core**  
**+**  
**тонкий Vue component/composable adapter**

### Почему

- даёт лучший баланс скорости и чистоты архитектуры
- не запирает chart engine внутри Vue lifecycle
- не заставляет переизобретать всё как абстрактную библиотеку
- позволяет быстро интегрироваться в текущее Vue-приложение
- даёт возможность тестировать core отдельно
- оставляет путь к дальнейшему масштабированию

### Дополнительное решение

На первом этапе делать именно:

- `Vue component`
- `Vue composables`

А **не Vue plugin**, если нет жёсткой необходимости в глобальной установке и app-level injection.

---

# Итог

Рекомендуемая архитектура строится вокруг следующих правил:

1. Backend — единственный вычислительный слой.  
2. Frontend — слой представления и локального UI-поведения.  
3. Core — headless и framework-agnostic.  
4. Vue — тонкий интеграционный слой.  
5. Rendering plugins отображают, а не рассчитывают.  
6. Stores держат presentation state.  
7. Поток данных однонаправленный и предсказуемый.  
8. Архитектура расширяется слоями, а не хаотическим смешением логики.

Итоговый выбор для разработки:

> **Строить headless framework-agnostic core и поверх него делать тонкий Vue component/composable adapter.**

Это наиболее удобный и разумный путь для разработки, если система должна быть масштабируемой, тестируемой и архитектурно устойчивой.
