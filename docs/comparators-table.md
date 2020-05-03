# Change Comparators

 - [Common](#Common)
 - [Class](#Class)
 - [Constant](#Constant)
 - [Enum](#Enum)
 - [Function](#Function)
 - [Interface](#Interface)

## Common

### Breaking

- **changed_member_type**: Signature member type changed

```typescript
// version 0.0.1
export const a = 1;
```

```typescript
// version 0.0.2
export function a() {}
```

- **member_removal**: Signature member removed from package

```typescript
// version 0.0.1
export const a = 1;
```

```typescript
// version 0.0.2
```

### Compatible

- **no_change**: Nothing is changed

## Class

### Breaking

- **changed_required_constructor_parameters_count**: Required parameters count in constructor has changed

```typescript
// version 0.0.1
export class Test {
  constructor(a: string, b: string) {}
}
```

```typescript
// version 0.0.2
export class Test {
  constructor(a: string, c: string, d: string, e?: string) {}
}
```

- **changed_constructor_parameter_modifier_to_required**: Constructor paramter became required

```typescript
// version 0.0.1
export class Test {
  constructor(a?: string, b: string = "42") {}
}
```

```typescript
// version 0.0.2
export class Test {
  constructor(a: string, b: string) {}
}
```

- **changed_constructor_parameter_type**: Constructor parameter type changed

```typescript
// version 0.0.1
export class Test {
  constructor(
    a: string,
    b: string | boolean,
    c: string,
    d: { a: 1 } | { b: 2 }
  ) {}
}
```

```typescript
// version 0.0.2
export class Test {
  constructor(
    a: Date,
    b: boolean,
    c: number | boolean,
    d: { a: 1 } & { b: 2 }
  ) {}
}
```

- **changed_method_return_type**: Method return type changed

```typescript
// version 0.0.1
export class Test {
  a(): boolean | number {
    return 1;
  }
  b(): boolean {
    return false;
  }
  c(): any {
    return 1;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  a(): boolean {
    return false;
  }
  b(): number {
    return 1;
  }
  c(): string {
    return "foo";
  }
}
```

- **changed_method_parameter_modifier_to_required**: Method parameter changed from optional to required

```typescript
// version 0.0.1
export class Test {
  public a(p1: string, p2?: Date, p3: boolean = true): boolean {
    return false;
  }
  private b(p1?: string): boolean {
    return false;
  }
  protected c(p1?: string): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  public a(p1: string, p2: Date, p3: boolean): boolean {
    return false;
  }
  private b(p1: string): boolean {
    return false;
  }
  protected c(p1: string): boolean {
    return false;
  }
}
```

- **changed_method_parameter_required_count**: Changed required parameters count in class method

```typescript
// version 0.0.1
export class Test {
  public a(p1: string, p2?: Date, p3: boolean = true): boolean {
    return false;
  }
  public b(p1: any): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  public a(p2: Date, p3: boolean, p4: number, p5?: any): boolean {
    return false;
  }
  public b(p2: any): boolean {
    return false;
  }
}
```

- **removed_method**: Method removed from class

```typescript
// version 0.0.1
export class Test {
  qqq(p1: any): boolean {
    return false;
  }
  // method overload
  a(p1: string, p2: any, p3: any): boolean;
  a(p1: string, p2: any): boolean;
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }

  protected b(): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  public a(p1: string, p2: any, p3: any): boolean {
    return false;
  }
  protected qqq(p1: any): boolean {
    return false;
  }
  public c(): boolean {
    return false;
  }
}
```

- **changed_method_modifier_less_visible**: Method access modifier changed, to be more restrictive.

```typescript
// version 0.0.1
export class Test {
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }
  public b(p1: any): boolean {
    return false;
  }
  public static b(p1: any): boolean {
    return false;
  }
  protected c(p1: any): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }
  protected b(p1: any): boolean {
    return false;
  }
  protected static b(p1: any): boolean {
    return false;
  }
  private c(p1: any): boolean {
    return false;
  }
}
```

- **changed_property_modifier_less_visible**: Property access modifier changed, to be more restrictive.

```typescript
// version 0.0.1
export class Test {
  static a = false;
  a = false;
  protected b = false;
  private c = false;
}
```

```typescript
// version 0.0.2
export class Test {
  protected static a = false;
  protected a = false;
  private b = false;
  protected c = false;
}
```

- **removed_class_property**: Property was removed from class.

```typescript
// version 0.0.1
export class Test {
  a = false;
  static a = false;
  protected b = false;
  private c = false;
}
```

```typescript
// version 0.0.2
export class Test {}
```

- **changed_class_property_type**: Property type was changed

```typescript
// version 0.0.1
export class Test {
  private a = "a";
  b = "b";
  static b = "b";
}
```

```typescript
// version 0.0.2
export class Test {
  private a = false;
  b = false;
  static b = false;
}
```

- **changed_class_property_to_readonly**: Property write access was changed to more strict

```typescript
// version 0.0.1
export class Test {
  private a = "a";
  static a = "a";
  readonly b = "b";
}
```

```typescript
// version 0.0.2
export class Test {
  private readonly a = "a";
  static readonly a = "a";
  b = "b";
}
```

- **removed_generic**: Class generic type was removed

```typescript
// version 0.0.1
export class Test<T, E> {}
```

```typescript
// version 0.0.2
export class Test<T> {}
```

- **added_required_generic**: Class generic type was added

```typescript
// version 0.0.1
export class Test<T> {}
```

```typescript
// version 0.0.2
export class Test<T, E> {}
```

- **changed_generic_extends_type**: Class generic type constraint was changed

```typescript
// version 0.0.1
export class Test<E extends number, C> {}
```

```typescript
// version 0.0.2
export class Test<E extends string, C extends Date> {}
```

### Compatible

- **changed_constructor_parameter_modifier_to_optional**: Constructor parameter became optional

```typescript
// version 0.0.1
export class Test {
  constructor(a: string, b: string) {}
}
```

```typescript
// version 0.0.2
export class Test {
  constructor(a?: string, b: string = "foo") {}
}
```

- **changed_constructor_parameter_type_union**: Constructor parameter type changed to union type

```typescript
// version 0.0.1
export class Test {
  constructor(a: string, b: string | boolean) {}
}
```

```typescript
// version 0.0.2
export class Test {
  constructor(a: string | number, b: boolean | number | string) {}
}
```

- **changed_method_return_type_union**: Method return type changed to union type

```typescript
// version 0.0.1
export class Test {
  a(): boolean {
    return false;
  }
  c(): number {
    return 1;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  a(): boolean | string {
    return false;
  }
  c(): any {
    return false;
  }
}
```

- **changed_method_parameter_modifier_to_optional**: Method parameter changed from required to optional

```typescript
// version 0.0.1
export class Test {
  a(p1: string, p2: Date, p3: boolean): boolean {
    return false;
  }
  private b(p1: string): boolean {
    return false;
  }
  protected c(p1: string): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  a(p1: string, p2?: Date, p3: boolean = true): boolean {
    return false;
  }
  private b(p1?: string): boolean {
    return false;
  }
  protected c(p1?: string): boolean {
    return false;
  }
}
```

- **added_method**: Method added to class

```typescript
// version 0.0.1
export class Test {
  public a(p1: string, p2: any, p3: any): boolean {
    return false;
  }
  protected qqq(p1: any): boolean {
    return false;
  }
  public c(): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  qqq(p1: any): boolean {
    return false;
  }
  // added method overload
  a(p1: string, p2: any, p3: any): boolean;
  a(p1: string, p2: any): boolean;
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }

  // added new method
  protected b(): boolean {
    return false;
  }
}
```

- **changed_method_modifier_more_visible**: Method access modifier changed, to be less restrictive.

```typescript
// version 0.0.1
export class Test {
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }
  protected b(p1: any): boolean {
    return false;
  }
  private c(p1: any): boolean {
    return false;
  }
}
```

```typescript
// version 0.0.2
export class Test {
  a(p1: string, p2: any, p3?: any): boolean {
    return false;
  }
  public b(p1: any): boolean {
    return false;
  }
  protected c(p1: any): boolean {
    return false;
  }
}
```

- **changed_property_modifier_more_visible**: Property access modifier changed, to be less restrictive.

```typescript
// version 0.0.1
export class Test {
  a = false;
  protected b = false;
  private c = false;
}
```

```typescript
// version 0.0.2
export class Test {
  a = false;
  b = false;
  protected c = false;
}
```

- **added_class_property**: Property was added to class.

```typescript
// version 0.0.1
export class Test {}
```

```typescript
// version 0.0.2
export class Test {
  private a = "a";
  protected b = "b";
  c = "c";
  static c = "c";
}
```

- **changed_class_property_type_union**: Property type was changed to less strict

```typescript
// version 0.0.1
export class Test {
  private a: "b" | "c" = "b";
  b: "b" | "c" = "b";
  static b: "b" | "c" = "b";
  d = "a";
}
```

```typescript
// version 0.0.2
export class Test {
  private a: "b" | "c" | "d" = "b";
  b: "b" | "c" | "d" = "b";
  static b: "b" | "c" | "d" = "b";
  d: any;
}
```

- **changed_class_property_type_union**: Property write access was changed to less strict

```typescript
// version 0.0.1
export class Test {
  private a: "b" | "c" = "b";
  b: "b" | "c" = "b";
  static b: "b" | "c" = "b";
  d = "a";
}
```

```typescript
// version 0.0.2
export class Test {
  private a: "b" | "c" | "d" = "b";
  b: "b" | "c" | "d" = "b";
  static b: "b" | "c" | "d" = "b";
  d: any;
}
```

- **added_optional_generic**: Class optional generic type was added

```typescript
// version 0.0.1
export class Test<T> {}
```

```typescript
// version 0.0.2
export class Test<T, E = any> {}
```

- **changed_generic_extends_type_to_less_strict**: Class generic constraint type was changed to less strict

```typescript
// version 0.0.1
export class Test<E extends number> {}
```

```typescript
// version 0.0.2
export class Test<E extends any> {}
```

## Constant

### Breaking

- **changed_constant_type**: Variable constraint type was changed

```typescript
// version 0.0.1
export const a: string = "a";
```

```typescript
// version 0.0.2
export const a: number = 2;
```

### Compatible

- **changed_constant_type_to_less_strict**: Variable constraint type was changed to less strict

```typescript
// version 0.0.1
export const a: string = "a";
```

```typescript
// version 0.0.2
export const a: any = "a";
```

## Enum

### Breaking

- **removed_enum**: Enum value removed

```typescript
// version 0.0.1
export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}
```

```typescript
// version 0.0.2
export enum Direction {
  UP,
  DOWN,
}
```

- **changed_enum_value**: Enum changed value, serialized to json values will be different

### Compatible

- **added_enum**: Enum value added

```typescript
// version 0.0.1
export enum Direction {
  UP,
  DOWN,
}
```

```typescript
// version 0.0.2
export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}
```

## Function

### Breaking

- **changed_function_return_type**: Function return type changed

```typescript
// version 0.0.1
export function is() {
  return false;
}
```

```typescript
// version 0.0.2
export function is() {
  return 1;
}
```

- **changed_function_parameter_modifier_to_required**: Function parameter became required

```typescript
// version 0.0.1
export function test(a?: string): void {}
```

```typescript
// version 0.0.2
export function test(a: string): void {}
```

- **changed_function_parameter_required_count**: Function required parameters count changed

```typescript
// version 0.0.1
export function test(a: any, b: number = 1) {}
```

```typescript
// version 0.0.2
export function test(b: number) {}
```

- **changed_function_parameter_type**: Function paramter type changed

```typescript
// version 0.0.1
export function test(a: number | string, b: any): void {}
```

```typescript
// version 0.0.2
export function test(a: number, b: Date): void {}
```

- **removed_function_generic**: Function generic type is removed

```typescript
// version 0.0.1
export function test<T>() {}
```

```typescript
// version 0.0.2
export function test() {}
```

- **added_function_required_generic**: Added required generic type to function

```typescript
// version 0.0.1
export function test() {}
```

```typescript
// version 0.0.2
export function test<T>() {}
```

- **changed_function_generic_extends_type**: Changed function generic type constraint

```typescript
// version 0.0.1
export function test<T>() {}
```

```typescript
// version 0.0.2
export function test<T extends string>() {}
```

### Compatible

- **changed_function_return_type_to_less_strict**: Function return type changed to less strict

```typescript
// version 0.0.1
export function is() {
  return false;
}
```

```typescript
// version 0.0.2
export function is(): boolean | number {
  return 1;
}
```

- **changed_function_parameter_modifier_to_optional**: Function parameter became optional

```typescript
// version 0.0.1
export function test(a: string): void {}
```

```typescript
// version 0.0.2
export function test(a?: string): void {}
```

- **changed_function_parameter_type_to_less_strict**: Function paramter type changed to less strict

```typescript
// version 0.0.1
export function test(a: number) {}
```

```typescript
// version 0.0.2
export function test(a: any) {}
```

- **added_function_optional_generic**: Added optional generic type to function

```typescript
// version 0.0.1
export function test() {}
```

```typescript
// version 0.0.2
export function test<T = string>() {}
```

- **changed_function_generic_extends_type_to_less_strict**: Changed function generic type constraint to be less restrictive

```typescript
// version 0.0.1
export function test<T extends string>() {}
```

```typescript
// version 0.0.2
export function test<T extends string | number>() {}
```

## Interface

### Breaking

- **removed_interface_generic**: Removed interface generic type

```typescript
// version 0.0.1
export interface Test<T> {}
```

```typescript
// version 0.0.2
export interface Test {}
```

- **added_interface_required_generic**: Added interface required generic type

```typescript
// version 0.0.1
export interface Test {}
```

```typescript
// version 0.0.2
export interface Test<T> {}
```

- **changed_interface_generic_extends_type**: Changed interface generic type constraint

```typescript
// version 0.0.1
export interface Test<T extends string> {}
```

```typescript
// version 0.0.2
export interface Test<T extends number> {}
```

- **added_required_interface_property**: Added required interface property

```typescript
// version 0.0.1
export interface Test {}
```

```typescript
// version 0.0.2
export interface Test {
  a: any;
}
```

- **removed_interface_property**: Removed interface property

```typescript
// version 0.0.1
export interface Test {
  a?: any;
  b: any;
}
```

```typescript
// version 0.0.2
export interface Test {}
```

- **changed_interface_property_type**: Changed interface property type

```typescript
// version 0.0.1
export interface Test {
  a: string;
}
```

```typescript
// version 0.0.2
export interface Test {
  a: number;
}
```

- **added_interface_callable_type**: Interface callable type was added

```typescript
// version 0.0.1
export interface Test {
  (): any;
}
```

```typescript
// version 0.0.2
export interface Test {
  (): any;
  (a: string): any;
}
```

- **removed_interface_callable_type**: Interface callable type was removed

```typescript
// version 0.0.1
export interface Test {
  (): any;
  (a: any): Date;
}
```

```typescript
// version 0.0.2
export interface Test {
  (a: any): Date;
}
```

### Compatible

- **added_interface_optional_generic**: Added interface optional generic type

```typescript
// version 0.0.1
export interface Test<T> {}
```

```typescript
// version 0.0.2
export interface Test<T, E extends number, R = any> {}
```

- **changed_interface_generic_extends_type_to_less_strict**: Changed interface generic type constraint to be less strict

```typescript
// version 0.0.1
export interface Test<T extends number, E extends number> {}
```

```typescript
// version 0.0.2
export interface Test<T extends number | string, E extends any> {}
```

- **added_optional_interface_property**: Added optional interface property

```typescript
// version 0.0.1
export interface Test {
  a: any;
}
```

```typescript
// version 0.0.2
export interface Test {
  b?: any;
}
```

- **changed_interface_property_type_less_strict**: Changed interface property type to be less strict

```typescript
// version 0.0.1
export interface Test {
  a: string;
}
```

```typescript
// version 0.0.2
export interface Test {
  a: any;
}
```