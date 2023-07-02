# Документация библиотеки security

## Содержание
- [Введение](#введение)
- [Начало работы](#начало-работы)
- [Структура библиотеки](#структура-библиотеки)
- [Сервисы](#сервисы)
  - [Сервис LoginService](#сервис-loginservice)
  - [Сервис AuthenticationService](#сервис-authenticationservice)
- [Интерсепторы](#интерсепторы)
  - [Интерсептор UnauthenticatedInterceptor](#интерсептор-unauthenticatedinterceptor)
  - [Интерсептор WithCredentialsInterceptor](#интерсептор-withcredentialsinterceptor)
- [Модули](#модули)
  - [Модуль SecurityModule](#модуль-securitymodule)
- [Тестирование](#тестирование)

## Введение

Библиотека предназначена для управления доступом к компонентам приложений. 

## Начало работы

Для работы с библиотекой необходимо импортировать модуль `SecurityModule` в нужный модуль конкретного приложения.

Импортировав модуль, библиотека будет следить за состоянием аутентификации и ограничивать доступ не аутентифицированным пользователям соответственно посредством использования `authenticationGuard` и `UnauthenticatedInterceptor` 

## Структура библиотеки

- `src/lib/guards`: защитники, основная функция - предотвращать доступ к определенным ресурсам по определенным условиям
- `src/lib/interceptors`: интерсепторы (перехватчики http запросов) `Angular`, в рамках `security` призваны проверять, аутентифицирован ли пользователь при каждом http запросе 
- `src/lib/services`: сервисы, организующие процесс аутентификации и деаутентификации

## Сервисы

### Сервис `LoginService`

Сервис отвечает за аутентификацию и деаутентификацию пользователя, посредством методов `login()` и `logout()` соответственно

### Сервис `AuthenticationService`

Сервис получает информацию о аутентифицированном пользователе, на данный момент это только имя и идентификатор, возможно в дальнейшем, также будет получать права доступа и прочую информацию для разграничения доступа в приложениях

## Интерсепторы

### Интерсептор `UnauthenticatedInterceptor`

Отслеживает за каждым запросом и при наличии в теле статуса 401 (согласно протоколу `Qtis`) - перекидывает пользователя на страницу аутентификации

### Интерсептор `WithCredentialsInterceptor`

Добавляет к запросу свойство `withCredentials`, указывающее, следует ли выполнять межсайтовые запросы управления доступом с использованием учетных данных, таких как файлы cookie, заголовки авторизации или клиентские сертификаты TLS.
Нужно для корректной работы между приложениями, размещенных на разных ресурсах (url), но использующих одну аутентификацию

## Модули

### Модуль `SecurityModule`

Предоставляет доступ к:

- сервисам, работающих с процессами аутентификации и авторизации
- перехватчикам запросов для обработки ситуаций с истекшим временем сессии или запретом доступа к определенным ресурсам

## Тестирование

На текущий момент для данной библиотеке отсутствуют тесты и инструкции по их запуску

## Лицензия

См. `LICENSE` в корне репозитория