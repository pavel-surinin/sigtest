# SigTest Documentation plan

-   [SigTest Documentation plan](#sigtest-documentation-plan)
    -   [Overview aka What is it and what's it for](#overview-aka-what-is-it-and-whats-it-for)
        -   [Library features](#library-features)
        -   [You can need it when you](#you-can-need-it-when-you)
        -   [What it doesn't do](#what-it-doesnt-do)
    -   [Configuration](#configuration)
        -   [Configure Service Provided Interface (SPI) parameters](#configure-service-provided-interface-spi-parameters)
        -   [Configure members to ignore](#configure-members-to-ignore)
        -   [Global config](#global-config)
            -   [comparators](#comparators)
            -   [pathIgnorePatterns](#pathignorepatterns)
            -   [reportOutputDir](#reportoutputdir)
            -   [reportGenerator](#reportgenerator)
    -   [Usage](#usage)
    -   [Reference aka How it works](#reference-aka-how-it-works)
        -   [Testing flow](#testing-flow)
        -   [Supported members](#supported-members)
        -   [Comparators](#comparators-1)
        -   [Error codes](#error-codes)

## Overview aka What is it and what's it for

This library can compare TypeScript npm package exported file members for broke backwards compatibility.
Also it can generate reports (changelogs) and generate migration scripts (not all cases)
when code changes braked backwards compatibility.

### Library features

-   check TypeScript code for backwards compatibility
-   generate changelog
-   provide migration scripts

### You can need it when you

-   care about npm module backwards compatibility.
-   want to test your library and know what version to bump patch or minor.
-   want to have generated changelog in each version change.

### What it doesn't do

-   is not test tool/framework
-   is not documentation generation tool

## Configuration

### Configure Service Provided Interface (SPI) parameters

SPI parameters have different compatibility requirements, than other data.
If SPI parameter has new property in it, this is not breaking change,
because nobody was using this property before and user is not implementing the
interface for the spi parameter.

Behavior, when SPI parameter is ignoring add _comparators_ can be configured using JsDocs [@callback](https://jsdoc.app/tags-callback.html) annotation in documentation block. Putting this annotation on the callback function will mark all parameter types as SPI parameters and will update _change_ from _breaking_ to _compatible_.

_example_

```typescript
interface FunctionInput {
    data: string
}

interface ServiceProvidedInterface {
    /**
     * @callback
     */
    calculate(input: FunctionInput): boolean
}
```

### Configure members to ignore

_Members_ in codebase can be explicitly ignored. Ignored _members_ will be ignored for all application life cycle. _Snapshots_ will not contain info about ignored members. Ignore behavior is configured with JsDoc [@ignore](https://jsdoc.app/tags-ignore.html) annotation in documentation block on the _member_ or its property.

_example_

```typescript
/**
 * Ignores interface
 *
 * @ignore
 */
interface ServiceA {
    getData(): string
}

interface ServiceB {
    /**
     * Ignores method
     *
     * @ignore
     */
    getData(): string
}
```

### Global config

Global configuration is defined in the root of the project in `.<name>config` file.

#### comparators

_Comparators_ compatibility status can be redefined, or _comparator_ can be ignored at all. If _comparator_ compatibility status is redefined, the report still will be generated, if it is ignored, it will not be included in application life cycle. Here is a full list of [comparators](./comparators-table.md).

> type: `{ [comparator_name] : 'compatible'|'breaking'|'ignore' }`

_example_

```javascript
module.exports = {
    comparators: {
        changed_method_return_type: 'compatible',
        removed_method: 'ignore',
    },
}
```

#### pathIgnorePatterns

Module path ignore patterns are defined under name `pathIgnorePatterns`.
Default value is `['node_modules']`

> type: `array`

_example_

```javascript
module.exports = {
    pathIgnorePatterns: ['node_modules', 'out', '**.test.ts'],
}
```

#### reportOutputDir

todo

> type: `string`

```javascript
module.exports = {
    reportOutputDir: 'out/',
}
```

#### reportGenerator

todo

> type: `string`

```javascript
module.exports = {
    reportGenerator: 'markdown',
}
```

## Usage

## Reference aka How it works

Application will evaluate the following steps:

-   Generate snapshot (introspection)
-   Load previous version snapshot
-   Process snapshots
-   Process changes
    -   update changes
    -   filter changes
-   Resolve compatibility
-   Generate report

---

_Diagram 1: Application flow diagram_

![test](./sigtest%20flow%20diagramm.svg)

---

### Testing flow

The diagram goes here.

### Supported members

-   exported function declaration
    -   overloaded function declarations
    -   arrow function
    -   function parameters (required/optional)
    -   return type
-   exported constant declaration
    -   with defined explicit type `const fish: Fish = 'gold'`
    -   primitive string `const fish = 'gold'`
    -   primitive number `const count = 1`
    -   primitive boolean `const isGold = true`
    -   primitive string array
    -   primitive number array
    -   primitive boolean array
    -   primitive union array `const fishes = ['gold', 1]`
-   exported class declaration
    -   class fields
        -   types
        -   modifiers
    -   constructors
        -   parameters
            -   types
            -   modifiers
    -   methods
        -   parameters
            -   types
            -   modifiers
        -   return type
        -   modifiers
-   exported enums
-   exported interfaces
-   exported types _(is supported partially. In the future it is planned to support type aliases also)_
    -   type parameters for type aliases
    -   type name

### Comparators

Comparators will compare members from previous version against current version.
The full list of comparators with description and examples
can be found here: [comparators definitions](./comparators-table.md).

### Error codes

Errors can occur during code introspection.
Error codes and definitions can be found [here](./error-code-table.md).
