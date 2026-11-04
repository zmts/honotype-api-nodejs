# Миграции PostgreSQL через Knex

Этот документ обязателен к прочтению перед проектированием, созданием или изменением миграций.
Архитектурные требования, включая типы первичных и внешних ключей, определены в [architecture.md](architecture.md#идентификаторы-базы-данных).

## Файлы и синхронизация с Drizzle

- Миграции находятся в `apps/api-main/database/migrations` и имеют имя `YYYYMMDDHHmmss_<описание-на-английском>.js`.
- Использовать `export async function up(knex)` и `export async function down(knex)`.
- В том же изменении обновлять соответствующие файлы в `apps/api-main/database/schemas` и их экспорты в `schemas/index.ts`.
- Knex и Drizzle должны совпадать по типам, допустимости NULL, значениям по умолчанию, PK, FK, CHECK, уникальности, индексам и условиям частичных индексов.
- Миграция должна быть самодостаточной. Не импортировать текущие Drizzle-схемы, сервисы или конфигурацию приложения для динамического построения её содержимого: будущие изменения кода не должны менять поведение старой миграции.
- Уже применённые миграции не переписывать; последующие изменения оформлять новой миграцией.
  Новую миграцию, которая ещё нигде не применялась, можно исправлять до применения.

## Обязательный стиль: Knex Schema Builder

Использовать API Knex для всех операций, которые он поддерживает:

- `knex.schema.createTable`, `alterTable`, `dropTable`;
- `table.text`, `uuid`, `bigInteger`, `integer`, `jsonb` и другие построители колонок;
- `notNullable`, `defaultTo`, `primary`;
- `references`, `inTable`, `foreign`, `onDelete`;
- `unique`, `index`, `check`.

Не писать целые `CREATE TABLE`, `ALTER TABLE` или `CREATE INDEX` через `knex.schema.raw` / `knex.raw`, если операция выражается через Schema Builder.

`specificType` допустим для PostgreSQL-типа или определения, у которого нет подходящего построителя, например `bigint generated always as identity`.

SQL-выражения внутри `table.check` и предикатов индексов допустимы. Точечный raw SQL для остальных операций использовать только при отсутствии подходящего API Knex; рядом объяснять, почему Schema Builder недостаточен. Не оборачивать всю миграцию в raw SQL из-за одной такой операции.

## Пример новой таблицы

```js
export async function up(knex) {
  await knex.schema.createTable('items', table => {
    table.specificType('id', 'bigint generated always as identity').primary();
    table.uuid('uuid').notNullable();
    table.text('title').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.jsonb('metadata_json');
    table.bigInteger('created_at_ms').notNullable();
    table.bigInteger('updated_at_ms').notNullable();

    table.unique(['uuid'], { indexName: 'UIDX_items__uuid', useConstraint: false });
    table.index(['status', 'created_at_ms', 'id'], 'IDX_items__status-created');
    table.check("status IN ('pending', 'completed')", [], 'CHK_items__status');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('items');
}
```

Значения `created_at_ms` / `updated_at_ms` в этом примере передаёт приложение.
`updated_at_ms` сам по себе не обновляется при изменении строки.

## Связи, ограничения и индексы

- PK и FK должны соответствовать [правилам идентификаторов](architecture.md#идентификаторы-базы-данных).
  Не использовать `increments`, `serial` или `bigserial` вместо identity PK.
- Явно выбирать `ON DELETE` по смыслу данных. Для финансовой истории обычно нужен `RESTRICT`; `CASCADE` допустим только при намеренном удалении зависимых записей.
- Давать ограничениям и индексам имена: `PK_`, `FK_`, `CHK_`, `UIDX_`, `IDX_`.
  Автоматические имена Knex/Drizzle допустимы, если совпадают и укладываются в лимит PostgreSQL — 63 байта. Не полагаться на автоматическое усечение длинного имени.
- Для отдельного уникального индекса указывать `useConstraint: false`; для ограничения UNIQUE использовать соответствующую форму Knex и такое же ограничение в Drizzle.
- Учитывать, что CHECK с результатом SQL NULL пропускает строку. Обязательные поля дополнительно защищать `notNullable` и явными проверками NULL там, где это необходимо.
- JSONB проверять на ожидаемый тип, если от него зависит корректность данных.
  Проверки структуры и содержимого согласовывать с валидацией приложения.
- Индексы добавлять под конкретные запросы, FK и правила уникальности.

Частичный уникальный индекс также оформлять через Knex:

```js
table.unique(['position_id'], {
  indexName: 'UIDX_orders__position-active',
  useConstraint: false,
  predicate: knex.queryBuilder().whereRaw("status IN ('pending', 'submitted')"),
});
```

Для установленного Knex PostgreSQL-компилятор индексов не сохраняет привязки параметров предиката.
Поэтому здесь нужны фиксированные SQL-литералы, а не `whereIn('status', values)` с плейсхолдерами. Проверять итоговый SQL через `toSQL()`: в DDL не должно оставаться неразрешённых плейсхолдеров. Не интерполировать пользовательские значения в SQL.

## Точность и единицы измерения

- Для денежных величин и количества токенов использовать точные целые в минимальных единицах или обоснованный `numeric`, без `float` / `double`.
- Для текстового представления целых добавлять CHECK допустимого формата и диапазона, необходимого предметной области. Не преобразовывать большие значения в JS `Number`.
- Единицы отражать в именах: `_wei`, `_raw`, `_bps`, `_ms`, `_unix_sec`.
- Для PostgreSQL `bigint` учитывать режим Drizzle и точность JS при чтении значений.

## Проверка и применение

1. Проверить порядок создания таблиц, FK и индексов. В `down` удалять зависимости в обратном порядке. Помнить, что `down` с удалением таблиц уничтожает их данные.
2. Сверить миграцию с Drizzle, включая значения по умолчанию, CHECK и предикаты индексов.
3. Проверить синтаксис JS, форматирование и TypeScript проекта.
4. Скомпилировать Schema Builder через `toSQL()` с `client: 'pg'`, не выполняя запросы.
   Это проверка генерации SQL; она не заменяет выполнение в PostgreSQL.
5. Применять миграцию только в рамках явного разрешения на применение.
   Подготовка файлов миграции сама по себе такого разрешения не даёт.

Команда проекта `npm run migrations:api-main` запускает код из `dist`, поэтому при согласованном применении сначала нужна актуальная сборка. Не запускать эту команду для проверки синтаксиса или вместо компиляции через `toSQL()`.
