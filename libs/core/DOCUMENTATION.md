# Документация библиотеки core

## Содержание
- [Введение](#введение)
- [Начало работы](#начало-работы)
- [Структура библиотеки](#структура-библиотеки)
- [Сервисы](#сервисы)
  - [Сервис FileReaderService](#сервис-filereaderservice)
- [Интерсепторы](#интерсепторы)
  - [Интерсептор HttpErrorsInterceptorInterceptor](#интерсептор-httperrorsinterceptorinterceptor)
- [Модули](#модули)
  - [Модуль CoreModule](#модуль-coremodule)
- [Протокол Qtis](#проткол-qtis)
- [Тестирование](#тестирование)
- [Лицензия](#лицензия)

## Введение

Библиотека предназначена для работы с общим функционалом, который может быть повторно использован в разных модулях и подсистемах или при интеграции функционала одного приложения с другим 

## Начало работы

Для работы с библиотекой необходимо импортировать модуль `CoreModule` в нужный модуль конкретного приложения.

В рамках библиотеки `Core` реализована мультиязыковая поддержка. Для работы с `TranslateService` необходимо использовать `DI` токен `PRECONFIGURED_TRANSLATE_SERVICE`,
он возвращает готовый к работе instance `TranslateService`, который знает где брать файлы перевода и какой язык в браузере у пользователя
Подробнее с функционалом `TranslateService` можно ознакомиться в [документации](https://github.com/ngx-translate/core) к `@ngx-translate/core`

Файлы с переводами хранятся в каждом конкретном проекте по пути `apps/${name}/src/assets/i18n/*`
Файлы перевода копируются в дистрибутив при сборке. Настройки копирования описаны в каждом конкретном приложении в конфигурации сборки - `apps/${name}/project.json` -> `targets.configurations.*.assets`

`${name}` - наименование приложения

## Структура библиотеки

- `src/lib/constants`: константы, используемые библиотекой
- `src/lib/di`: объявления DI (Dependency Injection) токенов
- `src/lib/functions`: разные вспомогательные функции и функции общего назначения
- `src/lib/interceptors`: интерсепторы (перехватчики http запросов) `Angular`
- `src/lib/interfaces`: основные интерфейсы для всех приложений (вынесено в `Core` по причине возможности интеграции между frontend приложениями)
- `src/lib/pipes`: пайпы `Angular` для трансформирования значений в html шаблонах
- `src/lib/services`: сервисы, функционал которых может быть повторно использован в других приложениях
- `src/lib/types`: аналогично интерфейсам, типы, которые могут быть использованы в других приложениях

## Сервисы

### Сервис `FileReaderService`

Сервис предназначен для чтения файлов по частям с последующей трансформацией бинарных данных в разные текстовые представления: `base64`, `hex`

## Интерсепторы

### Интерсептор `HttpErrorsInterceptorInterceptor`

Задача `HttpErrorsInterceptorInterceptor` следить за возникающими в процессе http запросов ошибками и трансформировать их к единому виду, объекту `HttpErrorResponse`, который в свою очередь уже будут обрабатывать конкретные приложения по своим сценариям

## Модули

### Модуль `CoreModule`

Предоставляет доступ приложениям, которые используют библиотеку, к:

- сервису поддержки мультиязычности
- пайпам трансформации текста в шаблонах
- перехватчикам запросов для обработки ошибок при html запросах

## Проткол Qtis

В данной бибилиотеке описан базис JSON протокола взаимодействия `Qtis`

```ts
export interface QtisRequestResponseInterface<T> {
  r: T[];
  t: number;
}
```
где:
- `r` - запрос или ответ какого-либо типа переданного в `T` в зависимости от приложения
- `t` - время выполнения запроса / получения ответа

В конкретных приложениях с помощью дженерика `T` указывается тип запроса / ответа, например запрос на получение структуры в `explorer`:

```ts
// вспомогательные интерфейсы для формирования соответствующего запроса / ответа в explorer 
interface BaseCmsRequest {
  s: Subsystems;
  r: CmsRequestActions;
  l: SupportedLanguages;
}

interface BaseCmsResponse {
  s: Subsystems;
  l: SupportedLanguages;
}

export interface ViewRequest extends BaseCmsRequest {
  path: string;
}

export interface ViewResponse extends BaseCmsResponse {
  content: FileSystemObject[];
  e: number;
  m: string;
}
```

```ts
// пример сервиса по работе с Qtis протоколом
export class RequestService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<Res>>(
          `${config.apiUrl}/dispatch`,
          body
        )
      )
    );
  }
}
```

```ts
// пример использования сервиса для получения данных для просмотра контента
this.explorerService.dispatch<ViewRequest, ViewResponse>(request)
```

JSON запросы формируются с помощью отдельных сервисов в каждом приложении в соответствии с определенными для этих приложений интерфейсами.

## Тестирование

На текущий момент для данной библиотеке отсутствуют тесты и инструкции по их запуску

## Лицензия

См. `LICENSE` в корне репозитория
