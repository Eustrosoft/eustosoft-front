# Документация приложения explorer

## Содержание
- [Введение](#введение)
- [Начало работы](#начало-работы)
- [Структура проекта](#структура-проекта)
- [Компоненты](#компоненты)
  - [Компонент AppComponent](#компонент-appcomponent)
  - [Компонент BreadcrumbsComponent](#компонент-breadcrumbscomponent)
  - [Компонент CreateRenameFolderDialogComponent](#компонент-createrenamefolderdialogcomponent)
  - [Компонент FilesystemTableComponent](#компонент-filesystemtablecomponent)
  - [Компонент MoveCopyDialogComponent](#компонент-movecopydialogcomponent)
  - [Компонент UploadObjectComponent](#компонент-uploadobjectcomponent)
  - [Компонент UploadOverlayComponent](#компонент-uploadoverlaycomponent)
  - [Компонент UploadPageComponent](#компонент-uploadpagecomponent)
- [Сервисы](#сервисы)
  - [Сервис ExplorerService](#сервис-explorerservice)
  - [Сервис ExplorerPathService](#сервис-explorerpathservice)
  - [Сервис ExplorerRequestBuilderService](#сервис-explorerrequestbuilderservice)
  - [Сервис ExplorerUploadService](#сервис-exploreruploadservice)
  - [Сервис ExplorerUploadItemFormFactoryService](#сервис-exploreruploaditemformfactoryservice)
  - [Сервис ExplorerUploadItemsService](#сервис-exploreruploaditemsservice)
- [Модули](#модули)
  - [Модуль AppModule](#модуль-appmodule)
- [Маршрутизация и навигация](#маршрутизация-и-навигация)
- [Тестирование](#тестирование)
- [Развертывание](#развертывание)
- [Лицензия](#лицензия)

## Введение

Проект `explorer` представляет собой реализацию файловой системы в браузерном интерфейсе.

## Начало работы

См. `README.md` в корне репозитория, подзаголовок "Локальный запуск"

## Структура проекта

- `src/app/explorer`: директория с основными программными компонентами приложения
  - `src/app/explorer/components`: `Angular` компоненты, используемые в приложении
  - `src/app/explorer/constants`: константы и перечисления
  - `src/app/explorer/services`: сервисы с бизнес логикой
- `src/app/login-page`: обертка для страницы логина (за основу используется компонент из библиотеки `core`)

## Компоненты

### Компонент `AppComponent`

...

### Компонент `BreadcrumbsComponent`

...

### Компонент `CreateRenameFolderDialogComponent`

...

### Компонент `FilesystemTableComponent`

...

### Компонент `MoveCopyDialogComponent`

...

### Компонент `UploadObjectComponent`

...

### Компонент `UploadOverlayComponent`

...

### Компонент `UploadPageComponent`

...

## Сервисы

### Сервис `ExplorerService`

...  

### Сервис `ExplorerPathService`

...

### Сервис `ExplorerRequestBuilderService`

...

### Сервис `ExplorerUploadService`

...

### Сервис `ExplorerUploadItemFormFactoryService`

...

### Сервис `ExplorerUploadItemsService`

...

## Модули

### Модуль `AppModule`

...
 
## Маршрутизация и навигация

Файл с маршрутизацией: `apps/explorer/src/app/app.routes.ts`

## Тестирование

На текущий момент в проекте отсутствуют тесты и инструкции по их запуску

## Развертывание

См. `README.md` в корне репозитория, подзаголовок "Развертывание"

## Лицензия

См. `LICENSE` в корне репозитория
