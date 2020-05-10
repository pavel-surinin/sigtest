![CI](https://github.com/pavel-surinin/sigtest/workflows/CI/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/pavel-surinin/sigtest/badge.svg?branch=master)](https://coveralls.io/github/pavel-surinin/sigtest?branch=master)

# Signature Testing for TypeScript modules

This repository is WIP

# Implementation status

|               | Introspection | Comparing |
| ------------- | ------------- | --------- |
| **function**  | ☀️            | ☀️        |
| **constant**  | ☀️            | ☀️        |
| **class**     | ☀️            | ☀️        |
| **enum**      | ☀️            | ☀️        |
| **interface** | ☀️            | ☀️        |
| **type**      | ⛅            | ⛅        |
| **namespace** | ☀️            | ☀️        |

# Documentation

-   [Error codes definitions](./docs/error-code-table.md)

-   [Compatibility checkers definitions](./docs/comparators-table.md)

-   [Supported TypeScript nodes](./docs/supported-features.md)

## App flow diagram:

Application process the following steps:

-   Generate snapshot (introspection) ✔️
-   Load previous version snapshot
-   Process snapshots ✔️
-   Process changes ✔️
    -   update changes ✔️
    -   filter changes ✔️
-   Resolve compatibility
-   Generate report

*Diagram 1: Application flow diagram*
![test](./docs/sigtest%20flow%20diagramm.svg)
