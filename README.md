# EustrosoftFront

## Работа с репозиторием

Данный репозиторий использует `nx` . Для большего понимания - обратитесь к [документации Nx](https://nx.dev).
Для просмотра связей между приложениями и библиотеками можно воспользоваться утилитой `npm run nx:graph`

## Локальный запуск

1. Установить `node.js` версии `18.15.0`
2. Перейти в корень проекта (где лежит файл `package.json`) и выполнить установку зависимостей командой `npm install`
3. Запустить нужное приложение(-я). Для локального запуска приложений используйте команду: `nx serve app-name`, где `app-name` имя приложения из папки `apps`.
Также можно использовать заранее подготовленные команды `start:*` из объекта `scripts` в файле `package.json`.
Например: `npm run start:explorer`

## Развертывание

1. Установить на локальную или сборочную машину `node.js` версии `18.15.0`
2. Выполнить одну из команд из файла `package.json`:
   1. `npm run build:all:stage` - собрать все приложения для препродуктивного контура
   2. `npm run build:all:production` - собрать все приложения для продуктивного контура
   3. `npm run build:affected:stage` - собрать все приложения, файлы которых были изменены последним коммитом, для препродуктивного контура
   4. `npm run build:affected:production` - собрать все приложения, файлы которых были изменены последним коммитом, для продуктивного контура
3. Загрузить собранные файлы нужного приложение из директории `dist/apps/${name}` (где `${name}` - имя приложения, например `explorer`) на необходимый ресурс

Более подробную информации о тонкой настройке сборки в репозитории можно изучить [здесь](https://nx.dev/packages/nx/documents/run).

При необходимости изменить конфигурацию приложения - можно отредактировать значения в `config.json` в папке собранного проекта, не изменяя наименования ключей

## Документация

Документацию для каждого проекта в репозитории можно найти в файле `DOCUMENTATION.md` в корневой папке каждого проекта или библиотеки, в папках `apps` и `libs` соответственно

## Общие библиотеки

В папке `libs` находятся библиотеки, компоненты, интерфейсы и 
прочие программные инструменты, используемые во всех проектах из папки `apps`
