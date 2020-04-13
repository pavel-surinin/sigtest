import { Comparator } from '../../../../src/comparator/Comparators'

describe('Comparator', () => {
    describe('changed_member_type', () => {
        it('changes from const to function', () => {
            expect({
                v1: `export const a = 1`,
                v2: `export function a() {}`,
                code: 'changed_member_type',
            }).toFailComparison("Member type changed from 'constant' to 'function'")
        })
        it('pass on no change', () => {
            expect({
                v1: `export const a = 1`,
                v2: `export const a = 'string'`,
                code: 'changed_member_type',
            }).toPassComparison()
        })
        it('pass on removal', () => {
            expect({
                v1: `export const a = 1`,
                v2: ``,
                code: 'changed_member_type',
            }).toPassComparison()
        })
    })
    describe('member_removal', () => {
        it('removal', () => {
            expect({
                v1: `export const a = 1`,
                v2: ``,
                code: 'member_removal',
            }).toFailComparison("Member 'a' removed from package")
        })
        it('removal from namespace ', () => {
            expect({
                v1: `
                    export namespace Test {
                        export const a = 1
                    } 
                `,
                v2: `
                    export const a = 1
                `,
                code: 'member_removal',
            }).toFailComparison("Member 'Test.a' removed from package")
        })
        it('should pass', () => {
            expect({
                v1: `export const a = 1`,
                v2: `export const a = 'string'`,
                code: 'member_removal',
            }).toPassComparison()
        })
    })
    describe('changed_required_constructor_generics_count', () => {
        it('different count', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b: string) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string) {
                        }
                    } 
                `,
                code: 'changed_required_constructor_parameters_count' as Comparator.ChangeCode,
            }).toFailComparison(
                `Constructor required generics count changed. Previous version had 2, current 1`
            )
        })
        it('optional is ignored', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b?: string) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string) {
                        }
                    } 
                `,
                code: 'changed_required_constructor_parameters_count' as Comparator.ChangeCode,
            }).toPassComparison()
        })
        it('default is ignored', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b: string = 'b') {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string) {
                        }
                    } 
                `,
                code: 'changed_required_constructor_parameters_count' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_constructor_parameter_modifier_to_optional', () => {
        it('changed to optional and default ', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b: string) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a?: string, b: string = 'foo') {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_modifier_to_optional' as Comparator.ChangeCode,
            }).toFailComparison(`Constructor parameters: 'a' and 'b' became optional`)
        })
        it('changed from optional and default ', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b?: string) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string, b: string) {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_modifier_to_optional' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_constructor_parameter_modifier_to_required', () => {
        it('should find changes to required parameters', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a?: string, b: string = '42') {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string, b: string) {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_modifier_to_required' as Comparator.ChangeCode,
            }).toFailComparison(`Constructor parameters: 'a' and 'b' became required`)
        })
        it('should not find changes to required parameters', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a?: string) {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_modifier_to_required' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_constructor_parameter_type', () => {
        it('should find changes in parameter types', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b: string | boolean, c: string, d: {a: 1} | {b: 2}) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: Date, b: boolean, c: number | boolean, d: {a: 1} & {b: 2}) {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_type' as Comparator.ChangeCode,
            }).toFailComparison(`Constructor parameters: 'a', 'b', 'c', 'd' changed types:
    parameter 'a' before - 'string', current - 'Date'
    parameter 'b' before - 'string | boolean', current - 'boolean'
    parameter 'c' before - 'string', current - 'number | boolean'
    parameter 'd' before - '{ a: 1; } | { b: 2; }', current - '{ a: 1; } & { b: 2; }'`)
        })
        it('should not find changes in parameter types', () => {
            expect({
                v1: `
                    export class Test {
                        constructor(a: string, b: string | boolean) {
                        }
                    } 
                `,
                v2: `
                    export class Test {
                        constructor(a: string | number, b: boolean | number | string) {
                        }
                    } 
                `,
                code: 'changed_constructor_parameter_type' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_constructor_parameter_type_union', () => {
        it('should find changes to union type', () => {
            expect({
                v1: `
                        export class Test {
                            constructor(a: string, b: string | boolean) {
                            }
                        } 
                    `,
                v2: `
                        export class Test {
                            constructor(a: string | number, b: boolean | number | string) {
                            }
                        } 
                    `,
                code: 'changed_constructor_parameter_type_union' as Comparator.ChangeCode,
            }).toFailComparison(`Constructor parameters: 'a', 'b' changed types:
    parameter 'a' before - 'string', current - 'string | number'
    parameter 'b' before - 'string | boolean', current - 'string | number | boolean'`)
        })
        it('should not find changes to union type', () => {
            expect({
                v1: `
                        export class Test {
                            constructor(a: string, b: string | boolean) {
                            }
                        } 
                    `,
                v2: `
                        export class Test {
                            constructor(a: boolean | number, b: Date | number | string) {
                            }
                        } 
                    `,
                code: 'changed_constructor_parameter_type_union' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_return_type', () => {
        it('should find changed incompatible method return type', () => {
            expect({
                v1: `
                    export class Test {
                        a(): boolean | number   { return 1 }
                        b(): boolean            { return false}
                        c(): any                { return 1}
                    } 
                `,
                v2: `
                    export class Test {
                        a(): boolean            { return false }
                        b(): number             { return 1 }
                        c(): string             { return 'foo' }
                    } 
                `,
                code: 'changed_method_return_type' as Comparator.ChangeCode,
            }).toFailComparison(`Method: 'a', 'b', 'c' changed return types:
    method 'a' before - 'number | boolean', current - 'boolean'
    method 'b' before - 'boolean', current - 'number'
    method 'c' before - 'any', current - 'string'`)
        })
        it('should not find changed incompatible method return type', () => {
            expect({
                v1: `
                    export class Test {
                        a(): boolean    { return false}
                        c(): any        { return false}
                    } 
                `,
                v2: `
                    export class Test {
                        a(): boolean | string   { return false}
                        private c(): number     { return 1}
                    } 
                `,
                code: 'changed_method_return_type' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_return_type_union', () => {
        it('should find changed compatible method return type', () => {
            expect({
                v1: `
                    export class Test {
                        a(): boolean    { return false}
                        c(): number     { return 1}
                    } 
                `,
                v2: `
                    export class Test {
                        a(): boolean | string   { return false}
                        c(): any                { return false}
                    } 
                `,
                code: 'changed_method_return_type_union' as Comparator.ChangeCode,
            }).toFailComparison(`Method: 'a', 'c' changed return types:
    method 'a' before - 'boolean', current - 'string | boolean'
    method 'c' before - 'number', current - 'any'`)
        })
        it('should not find changed compatible method return type', () => {
            expect({
                v1: `
                    export class Test {
                        a(): any        { return false}
                        c(): boolean    { return false}
                    } 
                `,
                v2: `
                    export class Test {
                        a(): boolean | string   { return false}
                        private c(): any        { return false}
                    } 
                `,
                code: 'changed_method_return_type_union' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_parameter_modifier_to_optional', () => {
        it('should find changed parameters', () => {
            expect({
                v1: `
                    export class Test {
                        a(p1: string, p2: Date, p3: boolean): boolean { return false }
                        private b(p1: string): boolean { return false }
                        protected c(p1: string): boolean { return false }
                    } 
                    `,
                v2: `
                    export class Test {
                        a(p1: string, p2?: Date, p3: boolean = true): boolean { return false }
                        private b(p1?: string): boolean { return false }
                        protected c(p1?: string): boolean { return false }
                    } 
                `,
                code: 'changed_method_parameter_modifier_to_optional' as Comparator.ChangeCode,
            }).toFailComparison(`Method parameters changed from required to optional:
    method 'a' parameters: 'p2', 'p3'
    method 'c' parameters: 'p1'`)
        })
        it('should not find changed parameters', () => {
            expect({
                v1: `
                    export class Test {
                        public a(p1: string, p2: Date, p3: boolean): boolean { return false }
                        private b(p1: string): boolean { return false }
                        protected c(p1: string): boolean { return false }
                    } 
                    `,
                v2: `
                    export class Test {
                        a(p1: string, p2: boolean): boolean { return false }
                        private b(p1?: string): boolean { return false }
                    } 
                `,
                code: 'changed_method_parameter_modifier_to_optional' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_parameter_modifier_to_required', () => {
        it('should find changed parameters', () => {
            expect({
                v1: `
                export class Test {
                    public a(p1: string, p2?: Date, p3: boolean = true): boolean { return false }
                    private b(p1?: string): boolean { return false }
                    protected c(p1?: string): boolean { return false }
                } 
                `,
                v2: `
                    export class Test {
                        public a(p1: string, p2: Date, p3: boolean): boolean { return false }
                        private b(p1: string): boolean { return false }
                        protected c(p1: string): boolean { return false }
                    } 
                    `,
                code: 'changed_method_parameter_modifier_to_required' as Comparator.ChangeCode,
            }).toFailComparison(`Method parameters changed from optional to required:
    method 'a' parameters: 'p2', 'p3'
    method 'c' parameters: 'p1'`)
        })
        it('should not find changed parameters', () => {
            expect({
                v1: `
                    export class Test {
                        a(p1: string, p2: Date, p3: boolean): boolean { return false }
                        b(p1?: string): boolean { return false }
                        protected c(p1?: string): boolean { return false }
                    } 
                    `,
                v2: `
                    export class Test {
                        a(p1: string, p2: boolean): boolean { return false }
                        protected b(p1: string): boolean { return false }
                    } 
                `,
                code: 'changed_method_parameter_modifier_to_required' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
})
