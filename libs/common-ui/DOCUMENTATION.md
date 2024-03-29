# Документация библиотеки common-ui

## Содержание

- [Введение](#введение)
- [Начало работы](#начало-работы)
- [Структура библиотеки](#структура-библиотеки)
- [Компоненты](#компоненты)
  - [Компонент ButtonComponent](#компонент-buttoncomponent)
  - [Компонент FileListComponent](#компонент-filelistcomponent)
  - [Компонент HeaderComponent](#компонент-headercomponent)
  - [Компонент InputComponent](#компонент-inputcomponent)
  - [Компонент InputFileComponent](#компонент-inputfilecomponent)
  - [Компонент LoginDialogComponent](#компонент-logindialogcomponent)
  - [Компонент LoginPageComponent](#компонент-loginpagecomponent)
  - [Компонент PreloaderComponent](#компонент-preloadercomponent)
  - [Компонент ProgressBarComponent](#компонент-progressbarcomponent)
  - [Компонент PromptDialogComponent](#компонент-promptdialogcomponent)
  - [Компонент SelectComponent](#компонент-selectcomponent)
  - [Компонент TextareaComponent](#компонент-textareacomponent)
- [Директивы](#директивы)
  - [Директива FilesDropZoneDirective](#директива-filesdropzonedirective)
  - [Директива HoverCursorDirective](#директива-hovercursordirective)
  - [Директива HoverShadowDirective](#директива-hovershadowdirective)
  - [Директива RippleHoverDirective](#директива-ripplehoverdirective)
- [Тестирование](#тестирование)
- [Лицензия](#лицензия)

## Введение

Библиотека `common-ui` содержит в себе основные компоненты интерфейса для построения приложений, а также предоставляет доступ к общим стилям и шрифтам

Каждый компонент использует в своей основе компоненты [Angular Material](https://material.angular.io/components/categories) и расширяет их функционал.
Управление компонентами осуществляется посредством `@Input()` и `@Output()` декораторов, чтобы в
зависимости от варианта использования настроить компонент соответствущим образом

## Начало работы

Для работы с библиотекой необходимо импортировать модуль `CommonUiModule` в нужный модуль конкретного приложения.

В файлах, при необходимости использовать импорты для задействования нужных компонентов, например:

```ts
import { CommonUiModule } from '@eustrosoft-front/common-ui';
```

Следует предварительно указать файлы для экспорта в файле `index.js` в корне библиотеки

## Структура библиотеки

- `src/lib/components`: компоненты интерфейса (поля ввода, кнопки и так далее)
- `src/lib/constants`: константы, используемые библиотекой
- `src/lib/directives`: директивы
- `src/lib/material`: шрифты и стили, связанные с библиотекой `Angular Material`
- `src/lib/styles`: общие стили для проектов, а также оверрайды для сетки разметки и прочих утилит `Bootstrap`

## Компоненты

### Компонент `ButtonComponent`

Компонент кнопки. Можно выбрать внешний вид и иконку по названию из [шрифта иконок](https://fonts.google.com/icons), в случае есть кнопка подразумевает наличие иконки

### Компонент `FileListComponent`

Компонент для отображения списка файлов, выбранных с помощью `input` с `type=file`

### Компонент `HeaderComponent`

Компонент для отображения верхней части интерфейса приложений. Отображает имя аутентифицированного пользователя и может выполнять `logout()`

### Компонент `InputComponent`

Компонент для текстового ввода. Для манипуляции компонентом используется `FormControl`.Можно менять внешний вид и стили отображения, отключать возможность взаимодействия, отображать ошибки, допущенные при заполнения поля

### Компонент `InputFileComponent`

Компонент для взаимодействия с файловой системой клиента, построент на основе `<input type="file"/>`.
Взаимодействует с нативным HTML компонентом `input`, меняет его состояние в соответствии действиями пользователя, например:

- пользователь выбрал 1 файл, затем выбрал еще один - компонент добавит к старому файлу новый (в нативном поведении `input` перетирает все новыми файлами)
- пользователь удалил один файл - компонент удалит один файл, остальные (если они были) - останутся на месте

### Компонент `LoginDialogComponent`

Модальное окно входа в систему. Используется в каждом проекте для предоставления возможности пользователю аутентифицироваться.
В компонент передается HTML шаблон элементов входа. Сделано это для того, чтобы каждое приложение могло отображать свою форму входа, в случае если у каждого приложени будет какой-то свой дизайн

### Компонент `LoginPageComponent`

Компонент-обертка для `LoginDialogComponent`. В нем определен базовый шаблон окна входа. При необходимости в каждом приложений можно сделать свой компонент-обертку, изменив внешний вид и другие свойства

### Компонент `PreloaderComponent`

Компонент, отображающий индикатор загрузки, расширяющий `Preloader` из `Angular Material`

### Компонент `ProgressBarComponent`

Компонент, отображающий прогресс загрузки, расширяющий `ProgressBar` из `Angular Material`

### Компонент `PromptDialogComponent`

Компонент подтверждения действия. В качестве результата возвращает `true` или `false`. Интерфейс взаимодействия определен в файле `prompt-dialog-data.interface.ts`

### Компонент `SelectComponent`

Компонент отображающий список значений для выбора. Интерфейс опций для отображения, передаваемых компоненту определен в файле `option.interface.ts`

### Компонент `TextareaComponent`

Компонент текстового поля для длинного текста. Можно настраивать размеры, внешний вид, а также управлять состоянием через `FormControl`

## Директивы

### Директива `FilesDropZoneDirective`

Функционал директивы:

- наблюдает за вхождением курсора, перетаскивающего файлы и подсвечивает зону сброса, когда курсор находится над зоной сброса
- при сбросе - возвращает массив сброшенных файлов

### Директива `HoverCursorDirective`

Определяет какой стиль курсора применить, при наведении на определенный элемент интерфейса, на котором установлена директива

### Директива `HoverShadowDirective`

Добавляет тень при наведении на элемент

### Директива `RippleHoverDirective`

Добавляет анимацию пульсации и `Angular Material` при наведении на элемент

## Тестирование

На текущий момент для данной библиотеке отсутствуют тесты и инструкции по их запуску

## Лицензия

См. `LICENSE` в корне репозитория
