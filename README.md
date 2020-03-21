# Signature Testing for TypeScript modules
This repository is WIP 

# Planned to support signature checking on nodes:
 - exported function
   - overloaded function declarations
   - arrow function
   - function parameters (required/optional)
   - return type
 - exported constant
   - with defined explicit type `const fish: Fish = 'gold'`
   - primitive string `const fish = 'gold'`
   - primitive number `const count = 1`
   - primitive boolean `const isGold = true`

# Implemented

|          | Generation | Comparing | Reports |
| -------- | ---------- | --------- | ------- |
| function | ✔️         |           |         |
| constant | ✔️         |           |         |

# Not Supported

## Variable Declaration and Export in different places
```TypeScript
const pc = 'Dell'
// not supported
// export computer = pc
// use instead explicit type annotation
export computer: string = pc
```