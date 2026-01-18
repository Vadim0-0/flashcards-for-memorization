# Структура Feature-Sliced Design (FSD)

Проект организован по методологии Feature-Sliced Design:

```
src/
├── app/              # Инициализация приложения
│   ├── App.vue       # Корневой компонент
│   ├── index.js      # Точка входа
│   └── styles/       # Глобальные стили
│
├── pages/            # Страницы приложения
│   └── main/         # Главная страница
│
├── widgets/          # Крупные самостоятельные блоки UI
│
├── features/         # Функциональные возможности (действия пользователя)
│
├── entities/         # Бизнес-сущности
│
└── shared/           # Переиспользуемый код
    ├── ui/           # UI компоненты (Button, Input, etc.)
    ├── lib/          # Утилиты и хелперы
    ├── api/          # API клиенты
    └── config/        # Конфигурация
```

## Правила импорта (сверху вниз)

- `app` может импортировать из всех слоев
- `pages` может импортировать из `widgets`, `features`, `entities`, `shared`
- `widgets` может импортировать из `features`, `entities`, `shared`
- `features` может импортировать из `entities`, `shared`
- `entities` может импортировать только из `shared`
- `shared` не может импортировать из других слоев

## Примеры использования

### Shared UI компонент
```vue
<script setup>
import { Button } from '@/shared/ui'
</script>
```

### Страница
```vue
<script setup>
import { MainPage } from '@/pages'
</script>
```
