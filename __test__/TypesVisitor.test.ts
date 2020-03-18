import { generateSignatures } from '../src/TypeVisitor'
import { ModuleKind, ScriptTarget } from 'typescript'
import { Signatures } from '../src/App.types';

describe('TypesVisitor', () => {
    it('should visit function in non namespace', () => {
        const output = generateSignatures(
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
    it('should visit overloaded functions in non namespace', () => {
        const output = generateSignatures(
            ['./__test__/__testFiles__/overloadFunctions.data.ts'],
            {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS
            });
        expect(output).toHaveLength(3)

        expect(output[0]).toMatchObject({
            path: '__test__/__testFiles__/overloadFunctions.data.ts',
            memberType: 'function',
            memberName: 'sum',
            returnType: 'Blob',
            parameters: { n1: 'string', n2: 'string' }
        } as Signatures.FunctionSignature)

        expect(output[1]).toMatchObject({
            path: '__test__/__testFiles__/overloadFunctions.data.ts',
            memberType: 'function',
            memberName: 'sum',
            returnType: 'Blob',
            parameters: { n1: 'number', n2: 'number' }
        } as Signatures.FunctionSignature)

        expect(output[2]).toMatchObject({
            path: '__test__/__testFiles__/overloadFunctions.data.ts',
            memberType: 'function',
            memberName: 'sum',
            returnType: 'Blob',
            parameters: { n1: 'string | number', n2: 'string | number' }
        } as Signatures.FunctionSignature)
    });
});