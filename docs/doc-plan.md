## Overview aka What this lib does

This library is excellent for:
comparing TypeScript npm package exported file members for broken backward compatibility.
generating reports (changelogs)
producing migration scripts (certain cases) for when the code changes break backward compatibility.

### Why you need it
This lib is useful if you:
-   care about npm module backward compatibility.
-   want to test your library and know what version to bump: patch or minor.
-   keep an auto-generated changelog for each release.

### What it doesn't do

SigTest is not a test tool/framework, nor is it a documentation generation tool.

## Configuration

### Configure Service Provided Interface (SPI) parameters

SPI parameters have compatibility requirements that are different from the other data.
If the SPI parameter has a new property, this is not considered a breaking change, because nobody was using that property before, and the user is not implementing the interface for the SPI parameter.

You can configure the SPI parameter behavior so that it ignores the add _comparators_. To set it like that, use the JsDocs [@callback](https://jsdoc.app/tags-callback.html) annotation in the documentation block. Put the @callback annotation on the callback function to mark all parameter types as SPI parameters and update the _change_ level from _breaking_ to _compatible_.

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

You can configure SigTest to ignore _members_ in codebase explicitly. Ignored _members_ are ignored for the whole application lifecycle. _Snapshots_ won't contain info about the ignored members. Ignore behavior is configured with the JsDoc [@ignore](https://jsdoc.app/tags-ignore.html) annotation in the documentation block of the _member_ or its property.

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

Define the global configuration in the root of the project in the `.<name>config` file.

#### Comparators

You can redefine the _comparators_ compatibility status, or ignore a _comparator_ can completely. If you redefine the _comparator_ compatibility status, the report is still generated; if you ignore the comparator, it is not included in the application lifecycle. See a full list of [comparators](./comparators-table.md) for more information.

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

Define the module path ignore patterns under the `pathIgnorePatterns` name.
The default value is `['node_modules']`

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

## SigTest workflow

The application evaluates libraries with the following steps:

-   Generate snapshot (introspection)
-   Load the previous version snapshot
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

Comparators compare the members from the previous version against the current version.
The full list of comparators with description and examples
is available here: [comparators definitions](./comparators-table.md).

### Error codes

Errors can happen during code introspection. See the full list of error codes and definitions [here](./error-code-table.md).
