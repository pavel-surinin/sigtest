import { visitIndex } from '../src/IndexVisitor'
import { ScriptTarget, ModuleKind } from 'typescript'

describe('IndexVisitor', () => {
    it('should visit index file and generate export objects', () => {
        const exports = visitIndex('__test__/__testFiles__/index.ts', {
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
        })
        expect(exports).toHaveLength(3)
        expect(exports[0]).toMatchObject({
            path: '__testFiles__/arrowFunction.data',
        })
        expect(exports[1]).toMatchObject({
            path: '__testFiles__/interface.data',
            members: ['Basic'],
        })
        expect(exports[2]).toMatchObject({
            path: '__testFiles__/index.ts',
        })
    })
})
