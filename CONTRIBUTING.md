# Contributing to React hooks library

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

## Table of Contents

- [Runbook](#runbook)

## Runbook <a name = "runbook"></a>

### System requirements

- `node` >=16
- `npm` >=8

### Fork

[Fork](https://help.github.com/articles/fork-a-repo/) the project, clone
your fork:
```sh
  # Clone your fork
  git clone https://github.com/<your-username>/library-react-hooks.git
  # Navigate to the newly cloned directory
  cd library-react-hooks
```

### First run

- Install dependencies `yarn install`
- Install dependencies for example `cd ./example && yarn install`

### Start

- Terminal1 start hooks `yarn run start`
- Terminal2 start example `cd ./example && yarn run start`

### Automatic creation of a new hook

- `yarn run create`

### Build

1. Run tests and linters `yarn run test`
2. Build a library `yarn run build`

### Описание архитектурных особенностей репозитория

- src - library
- examples - examples

### Локальное подключение библиотеки

`npm-link-better --copy ../library-react-hooks -w`

1. Установить глобально `npm install -g npm-link-better`
2. Выполнить локально билд в подключаемой библиотеке
3. Использовать локальную сборку и слушать изменения `npm-link-better --copy path/to/local/lib -w`

Где `path/to/local/lib` - путь к библиотеке относительно корневой папки проекта.

Если структура проектов выглядит так, то `path/to/local/lib` будет `../lib`:
```
/root
├───current-repo
├───lib
```
(Разлинковать можно например, переустановив пакет).
