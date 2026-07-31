# Бизнес-модули

Все маршруты приложения имеют префикс `/api`.

## Root

`GET /` — техническая проверка доступности API; возвращает `{ "ping": "pong" }`.

## Auth

| Route | Поведение |
|---|---|
| `POST /auth/register` | Создаёт пользователя с хешированным паролем; при существующем email возвращает конфликт. |
| `POST /auth/login` | Проверяет email и пароль, создаёт refresh session, возвращает access token и устанавливает cookie `refreshToken`. |
| `POST /auth/refresh-tokens` | Берёт refresh token из cookie или тела запроса, заменяет refresh session и возвращает новую пару токенов. |
| `GET /auth/login/google` | Обрабатывает Google OAuth callback, находит или создаёт пользователя и перенаправляет клиента на настроенный frontend URL. |

## Users

`GET /users/current` — требует access token и возвращает текущего пользователя по `CurrentUserJwt.id`.

## Posts

| Route | Поведение |
|---|---|
| `GET /posts` | Требует access token и возвращает только посты текущего пользователя с пагинацией. |
| `POST /posts` | Требует access token, создаёт пост и назначает текущего пользователя владельцем. |

Известные незавершённые части этих сценариев перечислены в [текущих ограничениях](TODO.md).
