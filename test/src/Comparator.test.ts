describe('Comparator', () => {
    it('changed_member_type', () => {
        expect({
            v1: `export const a = 1`,
            v2: `export function a() {}`,
            code: 'changed_member_type',
        }).toFailComparison("Member type changed from 'constant' to 'function'")
        expect({
            v1: `export const a = 1`,
            v2: `export const a = 'string'`,
            code: 'changed_member_type',
        }).toPassComparison()
        expect({
            v1: `export const a = 1`,
            v2: ``,
            code: 'changed_member_type',
        }).toPassComparison()
    })
    it('member_removal', () => {
        expect({
            v1: `export const a = 1`,
            v2: ``,
            code: 'member_removal',
        }).toFailComparison("Member 'a' removed from package")

        expect({
            v1: `
                export namespace Test {
                    export const a = 1
                } 
            `,
            v2: `
                export namespace Test {
                    const a = 1
                }
            `,
            code: 'member_removal',
        }).toFailComparison("Member 'Test.a' removed from package")

        expect({
            v1: `export const a = 1`,
            v2: `export const a = 'string'`,
            code: 'member_removal',
        }).toPassComparison()
    })
})
