import { Comparator } from '../../../../src/comparator/Comparators'
import { ComparatorTestPayload } from '../../../matchers/Comparator.matcher'

// beforeAll(comparatorMatcher.cleanGenerated)

describe('Comparator', () => {
    describe('common', () => {
        describe('changed_member_type', () => {
            it('changes from const to function', () => {
                expect({
                    v1: `export const a = 1`,
                    v2: `export function a() {}`,
                    code: 'changed_member_type',
                }).toFindChanges("Member type changed from 'constant' to 'function'")
            })
            it('pass on no change', () => {
                expect({
                    v1: `export const a = 1`,
                    v2: `export const a = 'string'`,
                    code: 'changed_member_type',
                }).toFindNoChanges()
            })
            it('pass on removal', () => {
                expect({
                    v1: `export const a = 1`,
                    v2: ``,
                    code: 'changed_member_type',
                }).toFindNoChanges()
            })
        })
        describe('member_removal', () => {
            it('removal', () => {
                expect({
                    v1: `export const a = 1`,
                    v2: ``,
                    code: 'member_removal',
                }).toFindChanges("Member 'a' removed from package")
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
                }).toFindChanges("Member 'Test.a' removed from package")
            })
            it('should pass', () => {
                expect({
                    v1: `export const a = 1`,
                    v2: `export const a = 'string'`,
                    code: 'member_removal',
                }).toFindNoChanges()
            })
        })
    })
    describe('class', () => {
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
                }).toFindChanges(
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
                }).toFindNoChanges()
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Constructor parameters: 'a' and 'b' became optional`)
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Constructor parameters: 'a' and 'b' became required`)
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Constructor parameters: 'a', 'b', 'c', 'd' changed types:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Constructor parameters: 'a', 'b' changed types:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Method: 'a', 'b', 'c' changed return types:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Method: 'a', 'c' changed return types:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Method parameters changed from required to optional:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Method parameters changed from optional to required:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Method required parameters changed:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Methods added:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Methods removed:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Methods changed access modifier:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Methods changed access modifier:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Properties changed access modifier:
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
                }).toFindNoChanges()
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
                }).toFindChanges(`Properties changed access modifier:
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
                }).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(
                    `Properties removed: 'a', 'static a', 'b'`
                )
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
                } as ComparatorTestPayload).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(`Properties added: 'b', 'c', 'static c'`)
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
                } as ComparatorTestPayload).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(`Properties changed type:
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
                } as ComparatorTestPayload).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(`Properties changed type:
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
                } as ComparatorTestPayload).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(`Properties changed write modifier:
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
                } as ComparatorTestPayload).toFindNoChanges()
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
                } as ComparatorTestPayload).toFindChanges(`Properties changed write modifier:
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
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('removed_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export class Test<T, E> {
                    }`,
                    v2: `export class Test<T> {
                    }`,
                    code: 'removed_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type removed: 'E'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export class Test<T> {
                    }`,
                    v2: `export class Test<T, E> {
                            }`,
                    code: 'removed_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_required_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export class Test<T> {
                    }`,
                    v2: `export class Test<T, E> {
                    }`,
                    code: 'added_required_generic',
                } as ComparatorTestPayload).toFindChanges(`Added class generics: 'E'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export class Test<T> {
                    }`,
                    v2: `export class Test<T, E = any> {
                    }`,
                    code: 'added_required_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_optional_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export class Test<T> {
                    }`,
                    v2: `export class Test<T, E = any> {
                    }`,
                    code: 'added_optional_generic',
                } as ComparatorTestPayload).toFindChanges(`Added class generics: 'E'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export class Test<T> {
                    }`,
                    v2: `export class Test<T, E extends string> {
                    }`,
                    code: 'added_optional_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_generic_extends_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export class Test<E extends number, C> {
                    }`,
                    v2: `export class Test<E extends string, C extends Date> {
                    }`,
                    code: 'changed_generic_extends_type',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'E' from 'number' to 'string'
    generic 'C' from 'any' to 'Date'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export class Test<E extends number> {
                    }`,
                    v2: `export class Test<E extends any> {
                    }`,
                    code: 'changed_generic_extends_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_generic_extends_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export class Test<E extends number> {
                    }`,
                    v2: `export class Test<E extends any> {
                    }`,
                    code: 'changed_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'E' from 'number' to 'any'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export class Test<E extends any> {
                    }`,
                    v2: `export class Test<E extends string> {
                    }`,
                    code: 'changed_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
    })
    describe('constant', () => {
        describe('changed_constant_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export const a: string = 'a'`,
                    v2: `export const a: number = 2`,
                    code: 'changed_constant_type',
                } as ComparatorTestPayload).toFindChanges(
                    `Variable 'a' changed type from 'string' to 'number'`
                )
            })
            it('should not find changes', () => {
                expect({
                    v1: `export const a: string = 'a'`,
                    v2: `export const a: any = 'a'`,
                    code: 'changed_constant_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_constant_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export const a: string = 'a'`,
                    v2: `export const a: any = 'a'`,
                    code: 'changed_constant_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(
                    `Variable 'a' changed type from 'string' to 'any'`
                )
            })
            it('should not find changes', () => {
                expect({
                    v1: `export const a: any = 'a'`,
                    v2: `export const a= 'a'`,
                    code: 'changed_constant_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
    })
    describe('enum', () => {
        describe('added_enum', () => {
            it('should find changes', () => {
                expect({
                    v1: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v2: `
                    export enum Direction {
                        UP,
                        DOWN,
                        LEFT,
                        RIGHT
                    }
                    `,
                    code: 'added_enum',
                } as ComparatorTestPayload).toFindChanges(`Enum value added: 'LEFT', 'RIGHT'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `
                    export enum Direction {
                        UP,
                        DOWN,
                        LEFT,
                        RIGHT
                    }
                    `,
                    v2: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    code: 'added_enum',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('removed_enum', () => {
            it('should find changes', () => {
                expect({
                    v2: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v1: `
                    export enum Direction {
                        UP,
                        DOWN,
                        LEFT,
                        RIGHT
                    }
                    `,
                    code: 'removed_enum',
                } as ComparatorTestPayload).toFindChanges(`Enum value removed: 'LEFT', 'RIGHT'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v2: `
                    export enum Direction {
                        UP,
                        DOWN,
                        LEFT,
                        RIGHT
                    }
                    `,
                    code: 'removed_enum',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_enum_value', () => {
            it('should find changes num to num', () => {
                expect({
                    v1: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v2: `export enum Direction {
                        UP = 3,
                        DOWN
                    }
                    `,
                    code: 'changed_enum_value',
                } as ComparatorTestPayload).toFindChanges(`Enum changed values:
    'Direction.UP' from '0' to '3'
    'Direction.DOWN' from '1' to '4'`)
            })
            it('should find changes num to string', () => {
                expect({
                    v1: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v2: `export enum Direction {
                        UP = 'up',
                        DOWN = 'down'
                    }
                    `,
                    code: 'changed_enum_value',
                } as ComparatorTestPayload).toFindChanges(`Enum changed values:
    'Direction.UP' from '0' to 'up'
    'Direction.DOWN' from '1' to 'down'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export enum Direction {
                        UP,
                        DOWN
                    }
                    `,
                    v2: `export enum Direction {
                    }
                    `,
                    code: 'changed_enum_value',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
    })
    describe('function', () => {
        describe('changed_function_return_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function is() {
                        return false
                    }`,
                    v2: `export function is() {
                        return 1
                    }`,
                    code: 'changed_function_return_type',
                } as ComparatorTestPayload).toFindChanges(
                    `Function return type changed from 'boolean' to 'number'`
                )
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function is() {
                        return false
                    }
                    `,
                    v2: `export function is(): any {
                        return false
                    }
                    `,
                    code: 'changed_function_return_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_return_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function is() {
                        return false
                    }`,
                    v2: `export function is(): boolean | number {
                        return 1
                    }`,
                    code: 'changed_function_return_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(
                    `Function return type changed from 'boolean' to 'number | boolean'`
                )
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function is() {
                        return false
                    }`,
                    v2: `export function is() {
                        return 1
                    }`,
                    code: 'changed_function_return_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_parameter_modifier_to_optional', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test(a: string): void {}
                    `,
                    v2: `export function test(a?: string): void {}
                    `,
                    code: 'changed_function_parameter_modifier_to_optional',
                } as ComparatorTestPayload).toFindChanges(`Parameters changed to optional: 'a'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test(a?: string): void {}
                    `,
                    v2: `export function test(a: string): void {}
                    `,
                    code: 'changed_function_parameter_modifier_to_optional',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_parameter_modifier_to_required', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test(a?: string): void {}
                    `,
                    v2: `export function test(a: string): void {}
                    `,
                    code: 'changed_function_parameter_modifier_to_required',
                } as ComparatorTestPayload).toFindChanges(`Parameters changed to required: 'a'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test(a: string): void {}
                    `,
                    v2: `export function test(a?: string): void {}
                    `,
                    code: 'changed_function_parameter_modifier_to_required',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_parameter_required_count', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test(a: any, b: number = 1) {}
                    `,
                    v2: `export function test(b: number) {}
                    `,
                    code: 'changed_function_parameter_required_count',
                } as ComparatorTestPayload)
                    .toFindChanges(`Function required parameters count changed:
    added: 'b'
    removed: 'a'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test(a: any, b?: any) {}
                    `,
                    v2: `export function test(a: any, b?: any) {}
                    `,
                    code: 'changed_function_parameter_required_count',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_parameter_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test(a: number | string, b: any): void {}
                    `,
                    v2: `export function test(a: number, b: Date): void {}
                    `,
                    code: 'changed_function_parameter_type',
                } as ComparatorTestPayload).toFindChanges(`Function parameter changed type:
    'a' from 'string | number' to 'number'
    'b' from 'any' to 'Date'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test(a: number, b: string): void {}
                    `,
                    v2: `export function test(a: number | string, b: any): void {}
                    `,
                    code: 'changed_function_parameter_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_parameter_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test(a: number) {}
                    `,
                    v2: `export function test(a: any) {}
                    `,
                    code: 'changed_function_parameter_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(`Function parameter changed type:
    'a' from 'number' to 'any'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test(a: any) {}
                    `,
                    v2: `export function test(a: number) {}
                    `,
                    code: 'changed_function_parameter_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('removed_function_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test<T>() {}
                    `,
                    v2: `export function test() {}
                    `,
                    code: 'removed_function_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic types removed: 'T'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test() {}
                    `,
                    v2: `export function test<T>() {}
                    `,
                    code: 'removed_function_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_function_required_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test() {}
                    `,
                    v2: `export function test<T>() {}
                    `,
                    code: 'added_function_required_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type added: 'T'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test<T = any>() {}
                    `,
                    v2: `export function test<T>() {}
                    `,
                    code: 'added_function_required_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_function_optional_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test() {}
                    `,
                    v2: `export function test<T = string>() {}
                    `,
                    code: 'added_function_optional_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type added: 'T'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test() {}
                    `,
                    v2: `export function test<T>() {}
                    `,
                    code: 'added_function_optional_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_generic_extends_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test<T>() {}
                    `,
                    v2: `export function test<T extends string>() {}
                    `,
                    code: 'changed_function_generic_extends_type',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'T' from 'any' to 'string'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test<T>() {}
                    `,
                    v2: `export function test<T = any>() {}
                    `,
                    code: 'changed_function_generic_extends_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_function_generic_extends_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export function test<T extends string>() {}
                    `,
                    v2: `export function test<T extends string | number>() {}
                    `,
                    code: 'changed_function_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'T' from 'string' to 'string | number'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export function test<T extends any>() {}
                    `,
                    v2: `export function test<T extends string>() {}
                    `,
                    code: 'changed_function_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
    })
    describe('interface', () => {
        describe('removed_interface_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test<T> {}
                    `,
                    v2: `export interface Test {}
                    `,
                    code: 'removed_interface_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type removed: 'T'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test<T> {}
                    `,
                    v2: `export interface Test<T = any> {}
                    `,
                    code: 'removed_interface_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_interface_required_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {}
                    `,
                    v2: `export interface Test<T> {}
                    `,
                    code: 'added_interface_required_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type added: 'T'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test<T = any> {}
                    `,
                    v2: `export interface Test<T> {}
                    `,
                    code: 'added_interface_required_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_interface_optional_generic', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test<T> {}
                    `,
                    v2: `export interface Test<T, E extends number, R = any> {}
                    `,
                    code: 'added_interface_optional_generic',
                } as ComparatorTestPayload).toFindChanges(`Generic type added: 'R'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test<T, E> {}
                    `,
                    v2: `export interface Test<T, E, R extends number> {}
                    `,
                    code: 'added_interface_optional_generic',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_interface_generic_extends_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test<T extends string> {}
                    `,
                    v2: `export interface Test<T extends number> {}
                    `,
                    code: 'changed_interface_generic_extends_type',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'T' from 'string' to 'number'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test<T extends string> {}
                    `,
                    v2: `export interface Test<T extends any> {}
                    `,
                    code: 'changed_interface_generic_extends_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_interface_generic_extends_type_to_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test<T extends number, E extends number> {}
                    `,
                    v2: `export interface Test<T extends number | string, E extends any> {}
                    `,
                    code: 'changed_interface_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindChanges(`Generics changed type:
    generic 'T' from 'number' to 'number | string'
    generic 'E' from 'number' to 'any'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test<T extends any, E extends number | string> {}
                    `,
                    v2: `export interface Test<T extends number, E extends number> {}
                    `,
                    code: 'changed_interface_generic_extends_type_to_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_required_interface_property', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {
                    }
                    `,
                    v2: `export interface Test {
                        a: any
                    }
                    `,
                    code: 'added_required_interface_property',
                } as ComparatorTestPayload).toFindChanges(`Interface property added: 'a'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test {
                    }
                    `,
                    v2: `export interface Test {
                        a?: any
                    }
                    `,
                    code: 'added_required_interface_property',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('added_optional_interface_property', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: any
                    }
                    `,
                    v2: `export interface Test {
                        b?: any
                    }
                    `,
                    code: 'added_optional_interface_property',
                } as ComparatorTestPayload).toFindChanges(`Interface property added: 'b'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: any
                    }
                    `,
                    v2: `export interface Test {
                        a?: any
                    }
                    `,
                    code: 'added_optional_interface_property',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('removed_interface_property', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {
                        a?: any
                        b: any
                    }
                    `,
                    v2: `export interface Test {
                    }
                    `,
                    code: 'removed_interface_property',
                } as ComparatorTestPayload).toFindChanges(`Interface property removed: 'a', 'b'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: any
                    }
                    `,
                    v2: `export interface Test {
                        a?: any
                        b: any
                    }
                    `,
                    code: 'removed_interface_property',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_interface_property_type', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: string
                    }
                    `,
                    v2: `export interface Test {
                        a: number
                    }
                    `,
                    code: 'changed_interface_property_type',
                } as ComparatorTestPayload).toFindChanges(`Interface properties changed type:
    'a' from 'string' to 'number'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: string
                    }
                    `,
                    v2: `export interface Test {
                        a: string | number
                    }
                    `,
                    code: 'changed_interface_property_type',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
        describe('changed_interface_property_type_less_strict', () => {
            it('should find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: string
                    }
                    `,
                    v2: `export interface Test {
                        a: any
                    }
                    `,
                    code: 'changed_interface_property_type_less_strict',
                } as ComparatorTestPayload).toFindChanges(`Interface properties changed type:
    'a' from 'string' to 'any'`)
            })
            it('should not find changes', () => {
                expect({
                    v1: `export interface Test {
                        a: any
                    }
                    `,
                    v2: `export interface Test {
                        a: string
                    }
                    `,
                    code: 'changed_interface_property_type_less_strict',
                } as ComparatorTestPayload).toFindNoChanges()
            })
        })
    })
})
