import { generateDocumentation } from '../src/TypeVisitor'
import { ModuleKind, ScriptTarget } from 'typescript'
import { Signatures } from '../src/App.types';

describe('TypesVisitor', () => {
    it('should visit function in non namespace', () => {
        const output = generateDocumentation(
            ['./__test__/__testFiles__/function.data.ts'],
            {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS
            });
        expect(output).toHaveLength(1)
        expect(output[0]).toMatchObject({
            path: '__test__/__testFiles__/function.data.ts',
            memberType: 'function',
            memberName: 'namedFunction',
            returnType: 'boolean',
            parameters: { param: 'number', b: 'Blob' }
        } as Signatures.FunctionSignature)
    });
});