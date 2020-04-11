import { Comparator } from '../../src/App.types'

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
})
