import { generateSignatures } from '../../src/TypeVisitor'
import { ModuleKind, ScriptTarget } from 'typescript'
import { Signatures } from '../../src/Signatures'
import { SerializationResult } from '../../src/serializer/Serializer'

describe('TypesVisitor', () => {
    function generate(path: string): SerializationResult[] {
        return generateSignatures([path], {
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
        })
    }
    describe('function', () => {
        it('should visit function with optional paramter', () => {
            const path = 'test/src/__testFiles__/functionWithOptParam.data.ts'
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
            const path = 'test/src/__testFiles__/function.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toMatchObject({
                path,
                memberType: 'function',
                memberName: 'namedFunction',
                returnType: 'boolean',
                generics: [
                    {
                        name: 'T',
                    },
                ],
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
                    {
                        isOptional: false,
                        name: 't',
                        type: 'T',
                    },
                ],
            } as Signatures.FunctionSignature)
        })
        it('should visit overloaded functions', () => {
            const path = 'test/src/__testFiles__/overloadFunctions.data.ts'
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
            const path = 'test/src/__testFiles__/arrowFunction.data.ts'
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
            const path = 'test/src/__testFiles__/constantPrimitives.data.ts'
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
            const path = './test/src/__testFiles__/error/S001.data.ts'
            const result = generate(path)
            expect(result).toHaveLength(1)
            expect(result[0].error).toBeDefined()
            expect(result[0].error!.message).toContain('S001')
        })
        it('should visit unsupported const and return error S002', () => {
            const path = './test/src/__testFiles__/error/S002.data.ts'
            const result = generate(path)
            expect(result).toHaveLength(1)
            expect(result[0].error).toBeDefined()
            expect(result[0].error!.message).toContain('S002')
        })
        it('should visit array constants', () => {
            const path = 'test/src/__testFiles__/constantArray.data.ts'
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
            const path = './test/src/__testFiles__/classFields.data.ts'
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
                        modifiers: {
                            access: 'public',
                            usage: 'instance',
                            write: 'readonly',
                        },
                        type: 'Map<string, V>',
                    } as Signatures.ClassProperty,
                    {
                        name: 'data',
                        modifiers: {
                            access: 'private',
                            usage: 'instance',
                            write: 'readonly',
                        },
                        type: 'Map<string, V>',
                    },
                    {
                        name: 'protectedData',
                        modifiers: {
                            access: 'protected',
                            usage: 'instance',
                        },
                        type: 'Map<string, V>',
                    },
                    {
                        name: 'noMod',
                        modifiers: {
                            access: 'public',
                            usage: 'instance',
                        },
                        type: 'string',
                    },
                    {
                        name: 'stat',
                        modifiers: {
                            access: 'public',
                            usage: 'static',
                        },
                        type: 'string',
                    },
                    {
                        name: 'fields',
                        modifiers: {
                            access: 'private',
                            usage: 'instance',
                        },
                        type: 'string',
                    },
                ],
                memberName: 'TestMap',
                memberType: 'class',
                path: 'test/src/__testFiles__/classFields.data.ts',
            })
        })
        it('should visit class methods', () => {
            const path = 'test/src/__testFiles__/classMethods.data.ts'
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
                        modifier: {
                            access: 'public',
                            usage: 'static',
                        },
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
                            {
                                name: 'n3',
                                type: 'number',
                                isOptional: true,
                            },
                        ],
                    },
                    {
                        name: 'div',
                        modifier: {
                            access: 'protected',
                            usage: 'instance',
                        },
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
                                isOptional: true,
                            },
                        ],
                    },
                    {
                        name: 'mul',
                        modifier: {
                            access: 'private',
                            usage: 'instance',
                        },
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
            const path = 'test/src/__testFiles__/enum.data.ts'
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
            const path = 'test/src/__testFiles__/error/S003.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].error).toBeDefined()
            expect(output[0].error?.message).toContain('S003')
        })
    })
    describe('interface', () => {
        it('should visit interface', () => {
            const path = 'test/src/__testFiles__/interface.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                memberName: 'FunctionHolder',
                memberType: 'interface',
                path: 'test/src/__testFiles__/interface.data.ts',
                generics: [],
                properties: {
                    arrowFx: {
                        isOptional: false,
                        isReadonly: true,
                        type: {
                            kind: 'function',
                            generics: [],
                            parameters: [],
                            returnType: 'string',
                        } as Signatures.FunctionInterfacePropertyType,
                    },
                    arrowFxWithParam: {
                        isOptional: false,
                        isReadonly: false,
                        type: {
                            kind: 'function',
                            generics: [],
                            parameters: [
                                {
                                    isOptional: false,
                                    name: 'p',
                                    type: 'string',
                                },
                            ],
                            returnType: 'string',
                        } as Signatures.FunctionInterfacePropertyType,
                    },
                    fx: {
                        isOptional: false,
                        isReadonly: false,
                        type: {
                            kind: 'function',
                            generics: [],
                            parameters: [],
                            returnType: 'string',
                        } as Signatures.FunctionInterfacePropertyType,
                    },
                    fxWithParam: {
                        isOptional: false,
                        isReadonly: false,
                        type: {
                            kind: 'function',
                            generics: [],
                            parameters: [
                                {
                                    isOptional: false,
                                    name: 'p',
                                    type: 'string',
                                },
                            ],
                            returnType: 'string',
                        } as Signatures.FunctionInterfacePropertyType,
                    },
                },
            })
            expect(output[1].signature).toMatchObject({
                memberName: 'Basic',
                memberType: 'interface',
                path: 'test/src/__testFiles__/interface.data.ts',
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
                        type: {
                            kind: 'type',
                            type: 'Blob',
                        },
                    },
                    opt: {
                        isOptional: true,
                        isReadonly: false,
                        type: {
                            kind: 'type',
                            type: 'string',
                        },
                    },
                    prop1: {
                        isOptional: false,
                        isReadonly: false,
                        type: {
                            kind: 'type',
                            type: 'T1',
                        },
                    },
                    tBlob: {
                        isOptional: false,
                        isReadonly: false,
                        type: {
                            kind: 'type',
                            type:
                                '{ new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob; prototype: Blob; }',
                        },
                    },
                },
            })
        })
        it('should visit interface with callable types', () => {
            const path = 'test/src/__testFiles__/interfaceCallable.data.ts'
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
                        name: 'isArray',
                        type: {
                            generics: [],
                            kind: 'function',
                            parameters: [
                                {
                                    name: 'arg',
                                    isOptional: false,
                                    type: 'any',
                                },
                            ],
                            returnType: 'boolean',
                        } as Signatures.FunctionInterfacePropertyType,
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
        it('should visit interface with indexed types', () => {
            const path = 'test/src/__testFiles__/interfaceIndex.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                indexed: { index: 'number', type: 'T', isReadonly: true },
                callableTypes: [],
                constructorTypes: [],
                generics: [
                    {
                        name: 'T',
                    },
                ],
                memberName: 'ArrayLike',
                memberType: 'interface',
                namespace: 'A',
                path: 'test/src/__testFiles__/interfaceIndex.data.ts',
                properties: {
                    length: {
                        isOptional: true,
                        isReadonly: true,
                        type: {
                            kind: 'type',
                            type: 'number',
                        },
                    },
                },
            })
        })
    })
    describe('type', () => {
        it('should visit type', () => {
            const path = 'test/src/__testFiles__/type.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(2)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                generics: [{ name: 'T' }],
                memberName: 'Data',
                memberType: 'type',
                path: 'test/src/__testFiles__/type.data.ts',
            })
            expect(output[1].signature).toBeDefined()
            expect(output[1].signature).toMatchObject({
                generics: [],
                memberName: 'InterfaceLike',
                memberType: 'type',
                path: 'test/src/__testFiles__/type.data.ts',
            })
        })
    })
    describe('namespace', () => {
        it('should visit type in namespace', () => {
            const path = 'test/src/__testFiles__/namespace.data.ts'
            const output = generate(path)
            expect(output).toHaveLength(1)
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toBeDefined()
            expect(output[0].signature).toMatchObject({
                generics: [],
                memberName: 'Dog',
                memberType: 'type',
                path,
                namespace: 'A.B.C',
            })
        })
    })
    describe('index', () => {
        it('should filter not exported in index and add signature from index', () => {
            const path = 'test/src/__testFiles__/index.ts'
            const output = generate(path)
            const members = output.filter(o => o.signature).map(o => o.signature?.memberName)
            expect(output).toHaveLength(3)
            expect(members).toContain('Basic')
            expect(members).toContain('divide')
            expect(members).toContain('test')
        })
        it('should collect nested exports', () => {
            const path = 'test/src/__testFiles__/entrypoint/nestedExports.data.ts'
            const output = generate(path)
            const members = output.filter(o => o.signature).map(o => o.signature?.memberName)
            expect(output).toHaveLength(3)
            expect(members).toContain('one')
            expect(members).toContain('two')
            expect(members).toContain('three')
        })
    })
})
