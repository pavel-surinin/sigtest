import { Comparator } from '../../../../src/comparator/Comparators'
import { comparatorMatcher, ComparatorTestPayload } from '../../../matchers/Comparator.matcher'

beforeAll(comparatorMatcher.cleanGenerated)

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
    describe('changed_required_constructor_parameters_count', () => {
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
                        constructor(a: string, c: string, d: string, e?: string) {
                        }
                    } 
                `,
                code: 'changed_required_constructor_parameters_count' as Comparator.ChangeCode,
            }).toFailComparison(
                `Constructor required parameters count changed:
    added: 'c', 'd'
    removed: 'b'`
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
    describe('changed_method_parameter_required_count', () => {
        it('should find changed parameters count', () => {
            expect({
                v1: `
                export class Test {
                    public a(p1: string, p2?: Date, p3: boolean = true): boolean { return false }
                    public b(p1: any): boolean { return false }
                } 
                `,
                v2: `
                    export class Test {
                        public a(p2: Date, p3: boolean, p4: number, p5?: any): boolean { return false }
                        public b(p2: any): boolean { return false }
                    } 
                    `,
                code: 'changed_method_parameter_required_count' as Comparator.ChangeCode,
            }).toFailComparison(`Method required parameters changed:
    method 'a':
        added: 'p2', 'p3', 'p4'
        removed: 'p1'
    method 'b':
        added: 'p2'
        removed: 'p1'`)
        })
        it('should not find changed parameters', () => {
            expect({
                v1: `
                    export class Test {
                        a(p1: string, p2: Date): boolean { return false }
                    } 
                    `,
                v2: `
                    export class Test {
                        a(p1: string, p2: boolean): boolean { return false }
                    } 
                `,
                code: 'changed_method_parameter_required_count' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('added_method', () => {
        it('should find added methods count', () => {
            expect({
                v1: `
                export class Test {
                    public a(p1: string, p2:any, p3: any): boolean { return false }
                    protected qqq(p1: any): boolean { return false }
                    public c(): boolean { return false }
                } 
                `,
                v2: `
                export class Test {
                    qqq(p1: any): boolean { return false }
                    // added method overload
                    a(p1: string, p2:any, p3: any): boolean 
                    a(p1: string, p2: any): boolean
                    a(p1: string, p2:any, p3?: any): boolean {return false} 
                    
                    // added new method
                    protected b(): boolean { return false }
                    } 
                    `,
                code: 'added_method' as Comparator.ChangeCode,
            }).toFailComparison(`Methods added:
    public a(p1, p2)
    protected b()`)
        })
        it('should not find added methods', () => {
            expect({
                v1: `
                export class Test {
                    protected qqq(p1: any): boolean { return false }
                } 
                `,
                v2: `
                export class Test {
                    qqq(p1: any): boolean { return false }
                    private a(): boolean { return false }
                }
                    `,
                code: 'added_method' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('removed_method', () => {
        it('should find removed methods count', () => {
            expect({
                v1: `
                export class Test {
                    qqq(p1: any): boolean { return false }
                    // method overload
                    a(p1: string, p2:any, p3: any): boolean 
                    a(p1: string, p2: any): boolean
                    a(p1: string, p2:any, p3?: any): boolean {return false} 
                    
                    protected b(): boolean { return false }
                    } 
                    `,
                v2: `
                export class Test {
                    public a(p1: string, p2:any, p3: any): boolean { return false }
                    protected qqq(p1: any): boolean { return false }
                    public c(): boolean { return false }
                } 
                `,
                code: 'removed_method' as Comparator.ChangeCode,
            }).toFailComparison(`Methods removed:
    a(p1, p2)
    b()`)
        })
        it('should not find removed methods', () => {
            expect({
                v1: `
                export class Test {
                    qqq(p1: any): boolean { return false }
                    private a(): boolean { return false }
                } 
                `,
                v2: `
                export class Test {
                    protected qqq(p1: any): boolean { return false }
                }
                    `,
                code: 'removed_method' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_modifier_more_visible', () => {
        it('should find changed methods', () => {
            expect({
                v1: `
                export class Test {
                    a(p1: string, p2:any, p3?: any): boolean {return false} 
                    protected b(p1: any): boolean { return false }
                    private c(p1: any): boolean { return false }
                }
                `,
                v2: `
                export class Test {
                    a(p1: string, p2:any, p3?: any): boolean {return false} 
                    public b(p1: any): boolean { return false }
                    protected c(p1: any): boolean { return false }
                }
                `,
                code: 'changed_method_modifier_more_visible' as Comparator.ChangeCode,
            }).toFailComparison(`Methods changed access modifier:
    method 'b(p1)' from 'protected' to 'public'
    method 'c(p1)' from 'private' to 'protected'`)
        })
        it('should not find changed methods', () => {
            expect({
                v1: `
                export class Test {
                    a(p1: string, p2:any, p3?: any): boolean {return false} 
                    protected b(p1: any): boolean { return false }
                    private c(p1: any): boolean { return false }
                }
                `,
                v2: `
                export class Test {
                    private a(p1: string, p2:any, p3?: any): boolean {return false} 
                    private b(p1: any): boolean { return false }
                    private c(p1: any): boolean { return false }
                }
                `,
                code: 'changed_method_modifier_more_visible' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_method_modifier_less_visible', () => {
        it('should find changed methods', () => {
            expect({
                v1: `
                    export class Test {
                        a(p1: string, p2:any, p3?: any): boolean {return false} 
                        public b(p1: any): boolean { return false }
                        static public b(p1: any): boolean { return false }
                        protected c(p1: any): boolean { return false }
                    }
                    `,
                v2: `
                    export class Test {
                        a(p1: string, p2:any, p3?: any): boolean {return false} 
                        protected b(p1: any): boolean { return false }
                        static protected b(p1: any): boolean { return false }
                        private c(p1: any): boolean { return false }
                    }
                    `,
                code: 'changed_method_modifier_less_visible' as Comparator.ChangeCode,
            }).toFailComparison(`Methods changed access modifier:
    method 'b(p1)' from 'public' to 'protected'
    method 'static b(p1)' from 'public' to 'protected'
    method 'c(p1)' from 'protected' to 'private'`)
        })
        it('should not find changed methods', () => {
            expect({
                v2: `
                    export class Test {
                        a(p1: string, p2:any, p3?: any): boolean {return false} 
                        protected b(p1: any): boolean { return false }
                        private c(p1: any): boolean { return false }
                    }
                    `,
                v1: `
                    export class Test {
                        private a(p1: string, p2:any, p3?: any): boolean {return false} 
                        private b(p1: any): boolean { return false }
                        private c(p1: any): boolean { return false }
                    }
                    `,
                code: 'changed_method_modifier_less_visible' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_property_modifier_more_visible', () => {
        it('should find changed properties', () => {
            expect({
                v1: `
                export class Test {
                    a = false 
                    protected b = false 
                    private c = false
                }
                `,
                v2: `
                export class Test {
                    a = false 
                    b = false 
                    protected c = false
                }
                `,
                code: 'changed_property_modifier_more_visible' as Comparator.ChangeCode,
            }).toFailComparison(`Properties changed access modifier:
    property 'b' from 'protected' to 'public'
    property 'c' from 'private' to 'protected'`)
        })
        it('should not find changed methods', () => {
            expect({
                v1: `
                export class Test {
                    a = false 
                    b = false 
                    protected c = false
                }
                `,
                v2: `
                export class Test {
                    a = false 
                    protected b = false 
                    private c = false
                }
                `,
                code: 'changed_property_modifier_more_visible' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('changed_property_modifier_less_visible', () => {
        it('should find changed methods', () => {
            expect({
                v1: `
                export class Test {
                    static a = false 
                    a = false 
                    protected b = false 
                    private c = false
                }
                `,
                v2: `
                export class Test {
                    static protected a = false 
                    protected a = false 
                    private b = false 
                    protected c = false
                }
                `,
                code: 'changed_property_modifier_less_visible' as Comparator.ChangeCode,
            }).toFailComparison(`Properties changed access modifier:
    property 'static a' from 'public' to 'protected'
    property 'a' from 'public' to 'protected'
    property 'b' from 'protected' to 'private'`)
        })
        it('should not find changed methods', () => {
            expect({
                v1: `
                export class Test {
                    protected a = false 
                    private b = false 
                    protected c = false
                }
                `,
                v2: `
                export class Test {
                    a = false 
                    protected b = false 
                    protected c = false
                }
                `,
                code: 'changed_property_modifier_less_visible' as Comparator.ChangeCode,
            }).toPassComparison()
        })
    })
    describe('removed_class_property', () => {
        it('should find property removal', () => {
            expect({
                v1: `
                export class Test {
                    a = false
                    static a = false
                    protected b = false
                    private c = false
                }`,
                v2: `
                export class Test {
                }`,
                code: 'removed_class_property',
            } as ComparatorTestPayload).toFailComparison(`Properties removed: 'a', 'static a', 'b'`)
        })
        it('should not find removed property', () => {
            expect({
                v1: `
                export class Test {
                    private c = false
                }`,
                v2: `
                export class Test {
                    static a = false
                    a = false
                }`,
                code: 'removed_class_property',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
    describe('added_class_property', () => {
        it('should find added property', () => {
            expect({
                v1: `
                export class Test {
                }
                `,
                v2: `
                export class Test {
                    private a = 'a'
                    protected b = 'b'
                    c = 'c'
                    static c = 'c'
                }
                `,
                code: 'added_class_property',
            } as ComparatorTestPayload).toFailComparison(`Properties added: 'b', 'c', 'static c'`)
        })
        it('should not find added property', () => {
            expect({
                v2: `
                export class Test {
                }
                `,
                v1: `
                export class Test {
                    private a = 'a'
                    protected b = 'b'
                    c = 'c'
                    static c = 'c'
                }
                `,
                code: 'added_class_property',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
    describe('changed_class_property_type', () => {
        it('should find changed type', () => {
            expect({
                v1: `
                export class Test {
                    private a = 'a'
                    b = 'b'
                    static b = 'b'
                }
                `,
                v2: `
                export class Test {
                    private a = false
                    b = false
                    static b = false
                }
                `,
                code: 'changed_class_property_type',
            } as ComparatorTestPayload).toFailComparison(`Properties changed type:
    property 'b' from 'string' to 'boolean'
    property 'static b' from 'string' to 'boolean'`)
        })
        it('should not find changed type', () => {
            expect({
                v1: `
                export class Test {
                    private a = false
                    b: 'a' | 'b' = 'a'
                }
                `,
                v2: `
                export class Test {
                    private a = 'a'
                    b: 'a' | 'b' | 'c' = 'c'
                }
                `,
                code: 'changed_class_property_type',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
    describe('changed_class_property_type_union', () => {
        it('should find changed type', () => {
            expect({
                v1: `
                export class Test {
                    private a: 'b' | 'c' = 'b'
                    b: 'b' | 'c' = 'b'
                    static b: 'b' | 'c' = 'b'
                    d = 'a'
                }
                `,
                v2: `
                export class Test {
                    private a: 'b' | 'c' | 'd' = 'b'
                    b: 'b' | 'c' | 'd' = 'b'
                    static b: 'b' | 'c' | 'd' = 'b'
                    d: any
                }
                `,
                code: 'changed_class_property_type_union',
            } as ComparatorTestPayload).toFailComparison(`Properties changed type:
    property 'b' from '"b" | "c"' to '"b" | "c" | "d"'
    property 'static b' from '"b" | "c"' to '"b" | "c" | "d"'
    property 'd' from 'string' to 'any'`)
        })
        it('should not find changed type', () => {
            expect({
                v1: `
                export class Test {
                    private a: any = 'a'
                    b: 'a' | 'b' | 'c' = 'c'
                }
                `,
                v2: `
                export class Test {
                    private a = false
                    b: 'a' | 'b' = 'a'
                }
                `,
                code: 'changed_class_property_type_union',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
    describe('changed_class_property_to_readonly', () => {
        it('should find changes', () => {
            expect({
                v1: `
                export class Test {
                    private a = 'a'
                    static a = 'a'
                    readonly b = 'b'
                } 
                `,
                v2: `
                export class Test {
                    private readonly a = 'a'
                    readonly static a = 'a'
                    b = 'b'
                } 
                `,
                code: 'changed_class_property_to_readonly',
            } as ComparatorTestPayload).toFailComparison(`Properties changed write modifier:
    property 'static a' from '' to 'readonly'`)
        })
        it('should not find changes', () => {
            expect({
                v1: `
                export class Test {
                    private a = 'a'
                    readonly static a = 'a'
                    b = 'b'
                } 
                `,
                v2: `
                export class Test {
                    private readonly a = 'a'
                    static a = 'a'
                } 
                `,
                code: 'changed_class_property_to_readonly',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
    describe('changed_class_property_to_not_readonly', () => {
        it('should find changes', () => {
            expect({
                v1: `
                export class Test {
                    readonly private a = 'a'
                    readonly static a = 'a'
                    readonly b = 'b'
                } 
                `,
                v2: `
                export class Test {
                    private a = 'a'
                    static a = 'a'
                    b = 'b'
                } 
                `,
                code: 'changed_class_property_to_not_readonly',
            } as ComparatorTestPayload).toFailComparison(`Properties changed write modifier:
    property 'static a' from 'readonly' to ''
    property 'b' from 'readonly' to ''`)
        })
        it('should not find changes', () => {
            expect({
                v1: `
                export class Test {
                    private a = 'a'
                    static a = 'a'
                    b = 'b'
                } 
                `,
                v2: `
                export class Test {
                    readonly private a = 'a'
                    readonly static a = 'a'
                    readonly b = 'b'
                } 
                `,
                code: 'changed_class_property_to_not_readonly',
            } as ComparatorTestPayload).toPassComparison()
        })
    })
})
