# Flashcards for Memorization

Проект для создания карточек для запоминания на Vue 3 + Vite + TypeScript с архитектурой Feature-Sliced Design (FSD).

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Архитектура

Проект использует архитектуру Feature-Sliced Design (FSD):

- `app` - инициализация приложения, провайдеры, роутинг
- `pages` - страницы приложения
- `widgets` - крупные самостоятельные блоки интерфейса
- `features` - функциональные возможности (действия пользователя)
- `entities` - бизнес-сущности
- `shared` - переиспользуемые компоненты, утилиты, константы
