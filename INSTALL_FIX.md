# Решение проблемы с установкой пакетов

## Проблема
Ошибка `EPERM: operation not permitted` при установке пакетов через npm.

## Решения

### Вариант 1: Исправить права доступа к npm кэшу

```bash
# Очистить кэш npm
sudo npm cache clean --force

# Или удалить кэш вручную
rm -rf ~/.npm/_cacache

# Затем установить пакеты
npm install
```

### Вариант 2: Использовать yarn (рекомендуется)

```bash
# Установить yarn (если еще не установлен)
npm install -g yarn

# Установить зависимости через yarn
yarn install
```

### Вариант 3: Использовать pnpm

```bash
# Установить pnpm (если еще не установлен)
npm install -g pnpm

# Установить зависимости через pnpm
pnpm install
```

### Вариант 4: Исправить права доступа к npm

```bash
# Проверить права доступа
ls -la /usr/local/lib/node_modules/npm/

# Исправить права (требует sudo)
sudo chown -R $(whoami) /usr/local/lib/node_modules/npm/
```

### Вариант 5: Переустановить npm через nvm

Если используете nvm:

```bash
# Переустановить Node.js и npm через nvm
nvm reinstall-packages
```

## После установки

После успешной установки пакетов запустите проект:

```bash
npm run dev
# или
yarn dev
# или
pnpm dev
```

## Установленные пакеты

- `vue-router` - для роутинга
- `sass` - для поддержки SCSS стилей
