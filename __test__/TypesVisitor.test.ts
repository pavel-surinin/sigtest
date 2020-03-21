import { generateSignatures } from '../src/TypeVisitor'
import { ModuleKind, ScriptTarget } from 'typescript'
import { Signatures } from '../src/App.types';

describe('TypesVisitor', () => {
    describe('function', () => {
        it('should visit function with optional paramter', () => {
            const output = generateSignatures(
                ['./__test__/__testFiles__/functionWithOptParam.data.ts'],
                {
                    target: ScriptTarget.ES5,
                    module: ModuleKind.CommonJS
                });
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path: '__test__/__testFiles__/functionWithOptParam.data.ts',
                memberType: 'function',
                memberName: 'danceWith',
                returnType: 'string',
                parameters: [{
                    isOptional: true,
                    name: 'name',
                    type: 'string'
                }]
            } as Signatures.FunctionSignature)
        });
        it('should visit function', () => {
            const output = generateSignatures(
                ['./__test__/__testFiles__/function.data.ts'],
                {
                    target: ScriptTarget.ES5,
                    module: ModuleKind.CommonJS
                });
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path: '__test__/__testFiles__/function.data.ts',
                memberType: 'function',
                memberName: 'namedFunction',
                returnType: 'boolean',
                parameters: [
                    {
                        name: 'param',
                        type: 'number',
                        isOptional: false
                    },
                    {
                        name: 'b',
                        type: 'Blob',
                        isOptional: false
                    }
                ]
            } as Signatures.FunctionSignature)
        });
        it('should visit overloaded functions', () => {
            const output = generateSignatures(
                ['./__test__/__testFiles__/overloadFunctions.data.ts'],
                {
                    target: ScriptTarget.ES5,
                    module: ModuleKind.CommonJS
                });
            expect(output).toHaveLength(3)

            expect(output[0].signature).toMatchObject({
                path: '__test__/__testFiles__/overloadFunctions.data.ts',
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'string',
                        isOptional: false
                    },
                    {
                        name: 'n2',
                        type: 'string',
                        isOptional: false
                    }
                ]
            } as Signatures.FunctionSignature)

            expect(output[1].signature).toMatchObject({
                path: '__test__/__testFiles__/overloadFunctions.data.ts',
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'number',
                        isOptional: false
                    },
                    {
                        name: 'n2',
                        type: 'number',
                        isOptional: false
                    }
                ]
            } as Signatures.FunctionSignature)

            expect(output[2].signature).toMatchObject({
                path: '__test__/__testFiles__/overloadFunctions.data.ts',
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'string | number',
                        isOptional: false
                    },
                    {
                        name: 'n2',
                        type: 'string | number',
                        isOptional: false
                    }
                ]
            } as Signatures.FunctionSignature)
        });
        it('should visit arrow function', () => {
            const output = generateSignatures(
                ['./__test__/__testFiles__/arrowFunction.data.ts'],
                {
                    target: ScriptTarget.ES5,
                    module: ModuleKind.CommonJS
                });
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path: '__test__/__testFiles__/arrowFunction.data.ts',
                memberType: 'function',
                memberName: 'divide',
                returnType: 'number',
                parameters: [
                    {
                        name: 'n1',
                        type: 'number',
                        isOptional: false
                    },
                    {
                        name: 'n2',
                        type: 'number',
                        isOptional: false
                    }
                ]
            } as Signatures.FunctionSignature)
        })
    });
    describe('constant', () => {
        it('should visit constant primitives', () => {
            const output = generateSignatures(
                ['./__test__/__testFiles__/constantPrimitives.data.ts'],
                {
                    target: ScriptTarget.ES5,
                    module: ModuleKind.CommonJS
                });
            expect(output).toHaveLength(4)
            expect(output[0].signature).toMatchObject({
                path: '__test__/__testFiles__/constantPrimitives.data.ts',
                memberType: 'constant',
                memberName: 'date',
                type: 'number'
            } as Signatures.ConstantSignature)
            expect(output[1].signature).toMatchObject({
                path: '__test__/__testFiles__/constantPrimitives.data.ts',
                memberType: 'constant',
                memberName: 'amber',
                type: 'string'
            } as Signatures.ConstantSignature)
            expect(
                output.map(s => (s.signature as Signatures.ConstantSignature).type)
            ).toMatchObject(['number', 'string', 'Fish', 'boolean'])
        });
        it('should visit unsupported const and return error S001', () => {
            const result = generateSignatures(['./__test__/__testFiles__/error/S001.data.ts'], {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS
            });
            expect(result).toHaveLength(1)
            expect(result[0].error).toBeDefined()
            expect(result[0].error!.message).toContain('S001')
        });
    });
});