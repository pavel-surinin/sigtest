describe('Comparator', () => {
    it('C001', () => {
        expect({
            v1: `export const a = 1`,
            v2: `export function a() {}`,
            code: 'C001',
        }).toFailComparison("Member type changed from 'constant' to 'function'")
        expect({
            v1: `export const a = 1`,
            v2: `export const a = 'string'`,
            code: 'C001',
        }).toPassComparison()
        expect({
            v1: `export const a = 1`,
            v2: ``,
            code: 'C001',
        }).toPassComparison()
    })
})
