import { generateSignatures } from '../src/TypeVisitor'
import { ModuleKind, ScriptTarget } from 'typescript'
import { Signatures } from '../src/App.types'
import { SerializationResult } from '../src/Serializer'

describe('TypesVisitor', () => {
    function generate(path: string): SerializationResult[] {
        return generateSignatures([path], {
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
        })
    }
    describe('function', () => {
        it('should visit function with optional paramter', () => {
            const path = '__test__/__testFiles__/functionWithOptParam.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'danceWith',
                returnType: 'string',
                parameters: [
                    {
                        isOptional: true,
                        name: 'name',
                        type: 'string',
                    },
                ],
            })
        })
        it('should visit function', () => {
            const path = '__test__/__testFiles__/function.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'namedFunction',
                returnType: 'boolean',
                parameters: [
                    {
                        name: 'param',
                        type: 'number',
                        isOptional: false,
                    },
                    {
                        name: 'b',
                        type: 'Blob',
                        isOptional: false,
                    },
                ],
            } as Signatures.FunctionSignature)
        })
        it('should visit overloaded functions', () => {
            const path = '__test__/__testFiles__/overloadFunctions.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(3)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'string',
                        isOptional: false,
                    },
                    {
                        name: 'n2',
                        type: 'string',
                        isOptional: false,
                    },
                ],
            } as Signatures.FunctionSignature)

            expect(output[1].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'number',
                        isOptional: false,
                    },
                    {
                        name: 'n2',
                        type: 'number',
                        isOptional: false,
                    },
                ],
            } as Signatures.FunctionSignature)

            expect(output[2].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'sum',
                returnType: 'Blob',
                parameters: [
                    {
                        name: 'n1',
                        type: 'string | number',
                        isOptional: false,
                    },
                    {
                        name: 'n2',
                        type: 'string | number',
                        isOptional: false,
                    },
                ],
            } as Signatures.FunctionSignature)
        })
        it('should visit arrow function', () => {
            const path = '__test__/__testFiles__/arrowFunction.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'divide',
                returnType: 'number',
                parameters: [
                    {
                        name: 'n1',
                        type: 'number',
                        isOptional: false,
                    },
                    {
                        name: 'n2',
                        type: 'number',
                        isOptional: false,
                    },
                ],
            } as Signatures.FunctionSignature)
        })
    })
    describe('constant', () => {
        it('should visit constant primitives', () => {
            const path = '__test__/__testFiles__/constantPrimitives.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(4)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'constant',
                memberName: 'date',
                type: 'number',
            } as Signatures.ConstantSignature)
            expect(output[1].signature).toMatchObject({
                path,
                memberType: 'constant',
                memberName: 'amber',
                type: 'string',
            } as Signatures.ConstantSignature)
            expect(
                output.map(s => (s.signature as Signatures.ConstantSignature).type)
            ).toMatchObject(['number', 'string', 'Fish', 'boolean'])
        })
        it('should visit unsupported const and return error S001', () => {
            const path = './__test__/__testFiles__/error/S001.data.ts'
            const result = generate(path)
            expect(result).toHaveLength(1)
            expect(result[0].error).toBeDefined()
            expect(result[0].error!.message).toContain('S001')
        })
        it('should visit unsupported const and return error S002', () => {
            const path = './__test__/__testFiles__/error/S002.data.ts'
            const result = generate(path)
            expect(result).toHaveLength(1)
            expect(result[0].error).toBeDefined()
            expect(result[0].error!.message).toContain('S002')
        })
        it('should visit array constants', () => {
            const path = '__test__/__testFiles__/constantArray.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'constant',
                memberName: 'numbers',
                type: 'Array<number>',
            } as Signatures.ConstantSignature)
            expect(output[1].signature).toMatchObject({
                path,
                memberType: 'constant',
                memberName: 'strings',
                type: 'Array<string | number>',
            } as Signatures.ConstantSignature)
        })
    })
    describe('class', () => {
        it('should visit class fields', () => {
            const path = './__test__/__testFiles__/classFields.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature!).toMatchObject({
                constructors: [
                    {
                        parameters: [
                            {
                                isOptional: false,
                                name: 'fields',
                                type: 'string',
                            },
                            {
                                isOptional: true,
                                name: 'optional',
                                type: 'Blob',
                            },
                        ],
                        returnType: 'typeof TestMap',
                    },
                ],
                generics: [
                    {
                        default: undefined,
                        name: 'V',
                    },
                    {
                        default: 'string',
                        name: 'D',
                    },
                    {
                        default: 'any',
                        name: 'A',
                    },
                ],
                properties: [
                    {
                        name: 'publicData',
                        modifiers: ['public', 'readonly'],
                        type: 'Map<string, V>',
                    },
                    {
                        name: 'data',
                        modifiers: ['private', 'readonly'],
                        type: 'Map<string, V>',
                    },
                    {
                        name: 'protectedData',
                        modifiers: ['protected'],
                        type: 'Map<string, V>',
                    },
                    {
                        name: 'fields',
                        modifiers: ['private'],
                        type: 'string',
                    },
                ],
                memberName: 'TestMap',
                memberType: 'class',
                path: '__test__/__testFiles__/classFields.data.ts',
            })
        })
        it('should visit class methods', () => {
            const path = '__test__/__testFiles__/classMethods.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature!).toMatchObject({
                constructors: [
                    {
                        generics: [],
                        parameters: [],
                        returnType: 'typeof Calc',
                    },
                ],
                generics: [] as any[],
                properties: [] as any[],
                methods: [
                    {
                        name: 'sum',
                        modifier: 'public',
                        parameters: [
                            {
                                name: 'n1',
                                type: 'number',
                                isOptional: false,
                            },
                            {
                                name: 'n2',
                                type: 'number',
                                isOptional: false,
                            },
                            {
                                name: 'n3',
                                type: 'number',
                                isOptional: true,
                            },
                        ],
                    },
                    {
                        name: 'div',
                        modifier: 'protected',
                        parameters: [
                            {
                                name: 'n1',
                                type: 'number',
                                isOptional: false,
                            },
                            {
                                name: 'n2',
                                type: 'number',
                                isOptional: false,
                            },
                        ],
                    },
                    {
                        name: 'mul',
                        modifier: 'private',
                        parameters: [
                            {
                                name: 'n1',
                                type: 'number',
                                isOptional: false,
                            },
                            {
                                name: 'n2',
                                type: 'number',
                                isOptional: false,
                            },
                        ],
                    },
                ],
                memberName: 'Calc',
                memberType: 'class',
                path,
            } as Signatures.ClassSignature)
        })
    })
    describe('enum', () => {
        it('should visit enum', () => {
            const path = '__test__/__testFiles__/enum.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(3)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                memberName: 'DirectionWithDefinedStart',
                memberType: 'enum',
                path,
                values: [
                    {
                        name: 'Up',
                        type: 'number',
                        value: 1,
                    },
                    {
                        name: 'Down',
                        type: 'number',
                        value: 2,
                    },
                ],
            } as Signatures.EnumSignature)
            expect(output[1].signature).toMatchObject({
                memberName: 'Direction',
                memberType: 'enum',
                path,
                values: [
                    {
                        name: 'Up',
                        type: 'number',
                        value: 0,
                    },
                    {
                        name: 'Down',
                        type: 'number',
                        value: 1,
                    },
                ],
            } as Signatures.EnumSignature)
            expect(output[2].signature).toMatchObject({
                memberName: 'DirectionString',
                memberType: 'enum',
                path,
                values: [
                    {
                        name: 'Up',
                        type: 'string',
                        value: 'Up!',
                    },
                    {
                        name: 'Down',
                        type: 'string',
                        value: 'Down!',
                    },
                    {
                        name: 'Left',
                        type: 'string',
                        value: 'Down!90d',
                    },
                ],
            } as Signatures.EnumSignature)
        })
        it('should throw on computed value number', () => {
            const path = '__test__/__testFiles__/error/S003.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].error).toBeDefined()
            expect(output[0].error?.message).toContain('S003')
        })
    })
    describe('interface', () => {
        it('should visit interface', () => {
            const path = '__test__/__testFiles__/interface.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                memberName: 'FunctionHolder',
                memberType: 'interface',
                path: '__test__/__testFiles__/interface.data.ts',
                generics: [],
                properties: {
                    arrowFx: {
                        isOptional: false,
                        isReadonly: true,
                        type: '() => string',
                    },
                    arrowFxWithParam: {
                        isOptional: false,
                        isReadonly: false,
                        type: '(p: string) => string',
                    },
                    fx: {
                        isOptional: false,
                        isReadonly: false,
                        type: '() => string',
                    },
                    fxWithParam: {
                        isOptional: false,
                        isReadonly: false,
                        type: '(p: string) => string',
                    },
                },
            })
            expect(output[1].signature).toMatchObject({
                memberName: 'Basic',
                memberType: 'interface',
                path: '__test__/__testFiles__/interface.data.ts',
                generics: [
                    {
                        name: 'T1',
                    },
                    {
                        name: 'T3',
                        extends: 'Function',
                    },
                    {
                        name: 'K',
                        extends: 'keyof any',
                    },
                    {
                        name: 'T2',
                        default: 'string',
                    },
                ] as Signatures.GenericDefinition[],
                properties: {
                    blob: {
                        isOptional: false,
                        isReadonly: false,
                        type: 'Blob',
                    },
                    opt: {
                        isOptional: true,
                        isReadonly: false,
                        type: 'string',
                    },
                    prop1: {
                        isOptional: false,
                        isReadonly: false,
                        type: 'T1',
                    },
                    tBlob: {
                        isOptional: false,
                        isReadonly: false,
                        type:
                            '{ new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob; prototype: Blob; }',
                    },
                },
            })
        })
        it('should visit interface with callable types', () => {
            const path = '__test__/__testFiles__/interfaceCallable.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                memberName: 'ClassInterface',
                memberType: 'interface',
                path,
                generics: [],
                properties: {
                    isArray: {
                        type: '(arg: any) => arg is any[]',
                        isOptional: false,
                        isReadonly: false,
                    },
                },
                callableTypes: [
                    {
                        generics: [{ name: 'T' }],
                        parameters: [{ isOptional: false, type: 'T[]', name: 'items' }],
                        returnType: 'T[]',
                    },
                    {
                        generics: [],
                        parameters: [{ isOptional: false, type: 'number', name: 'n' }],
                        returnType: 'number[]',
                    },
                ],
                constructorTypes: [
                    {
                        generics: [],
                        parameters: [{ isOptional: true, name: 'arrayLength', type: 'number' }],
                        returnType: 'any[]',
                    },
                    {
                        generics: [],
                        parameters: [],
                        returnType: 'any[]',
                    },
                ],
            } as Signatures.InterfaceSignature)
        })
    })
    describe('type', () => {
        it('should visit type', () => {
            const path = '__test__/__testFiles__/type.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                generics: [{ name: 'T' }],
                memberName: 'Data',
                memberType: 'type',
                path: '__test__/__testFiles__/type.data.ts',
            })
            expect(output[1].signature).toBeDefined()
            expect(output[1].signature).toMatchObject({
                generics: [],
                memberName: 'InterfaceLike',
                memberType: 'type',
                path: '__test__/__testFiles__/type.data.ts',
            })
        })
    })
    describe('type', () => {
        it('should visit type', () => {
            const path = '__test__/__testFiles__/type.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                generics: [],
                memberName: 'InterfaceLike',
                memberType: 'type',
                path,
            })
        })
    })
})
