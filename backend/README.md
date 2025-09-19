# Cash Flow Backend

Backend сервер для игры Cash Flow на Node.js с поддержкой WebSocket.

## Технологии

- **Node.js** - серверная платформа
- **Express** - веб-фреймворк
- **Socket.io** - WebSocket библиотека для real-time коммуникации
- **CORS** - для кросс-доменных запросов
- **UUID** - для генерации уникальных кодов игроков

## Установка

```bash
cd backend
npm install
```

## Запуск

### Режим разработки
```bash
npm run dev
```

### Продакшн режим
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:5001`

## API Endpoints

### REST API

- `GET /health` - проверка состояния сервера
- `POST /api/player/generate-code` - генерация уникального кода игрока

### WebSocket Events

#### Клиент → Сервер
- `join-game` - подключение игрока к игре
- `admin-join` - подключение администратора
- `player-action` - запрос действия от игрока
- `admin-response` - ответ администратора на действие

#### Сервер → Клиент
- `joined-game` - подтверждение подключения игрока
- `admin-joined` - подтверждение подключения администратора
- `player-joined` - уведомление о новом игроке
- `player-left` - уведомление об отключении игрока
- `action-request` - запрос на действие от игрока
- `action-result` - результат действия
- `current-players` - список текущих игроков

## Структура проекта

```
backend/
├── index.js          # Основной файл сервера
├── config.js         # Конфигурация
├── routes/           # API маршруты
├── models/           # Модели данных
├── controllers/      # Контроллеры
├── middleware/       # Промежуточное ПО
└── utils/           # Утилиты
```

## Хранение данных

В текущей версии используется in-memory хранилище (Map) для:
- Сессий игроков
- Данных игроков
- Ожидающих действий

Данные очищаются при перезапуске сервера.

## Конфигурация

Создайте файл `.env` в корне папки backend:

```env
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
