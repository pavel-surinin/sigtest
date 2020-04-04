# Signature Testing for TypeScript modules

This repository is WIP

# Planned to support signature checking on nodes:

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

# Implementation status

|           | Generation | Comparing | Reports |
| --------- | ---------- | --------- | ------- |
| function  | ✔️         |           |         |
| constant  | ✔️         |           |         |
| class     | ✔️         |           |         |
| enum      | ✔️         |           |         |
| interface | ✔️         |           |         |
| type      |            |           |         |

# Not Supported

## Variable Declaration and Export in different places

```TypeScript
const pc = 'Dell'
// not supported
// export computer = pc
// use instead explicit type annotation
export computer: string = pc
```

# Docs

Error code definitions: [link](./docs/error-code-table.md)
