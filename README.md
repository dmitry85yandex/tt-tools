tt-tools
========
source code

Инструмент для обновление Pull Request дескрипшина 

## pr-updater

Пример запуска (обновление/добавление codestyle секции в дескрипшине Pull Request-а под первым номером (--pr 1) ): 

$ node pr-updater --pr 1 --section codestyle 'Codestyle: 13 errors'

Запуск mocha тестов: 

$ mocha  

Скрипт разово запросит пароль к текщему пользователю репозитория. 

## автор 
Суржиков Дмитрий