import * as ts from 'typescript'
import { Signatures } from '../Signatures'
import { SerializationError } from './SerializerError'

const EMPTY_RESULT = {}

const PRIMITIVE_KIND_NAME_REGISTRY = {
    [ts.SyntaxKind.StringLiteral as ts.SyntaxKind]: 'string',
    [ts.SyntaxKind.NumericLiteral as ts.SyntaxKind]: 'number',
    [ts.SyntaxKind.TrueKeyword as ts.SyntaxKind]: 'boolean',
    [ts.SyntaxKind.FalseKeyword as ts.SyntaxKind]: 'boolean',
}

export class SerializationResult {
    static fromError(error: SerializationError) {
        return new SerializationResult(undefined, error)
    }
    static fromSignature(signature: Signatures.SignatureType) {
        return new SerializationResult(signature)
    }
    constructor(
        readonly signature?: Signatures.SignatureType,
        readonly error?: SerializationError
    ) {}
}

export class Serializer {
    constructor(private readonly checker: ts.TypeChecker) {
        this.serializeFunction = this.serializeFunction.bind(this)
        this.doFxDeclarations = this.doFxDeclarations.bind(this)
        this.serializeParameter = this.serializeParameter.bind(this)
        this.serializeClassProperty = this.serializeClassProperty.bind(this)
        this.serializeMethod = this.serializeMethod.bind(this)
    }

    doType(
        symbol: ts.Symbol,
        namespace: string | undefined
    ): SerializationResult | SerializationResult[] {
        const typeDeclaration = symbol.declarations[0]
        if (ts.isTypeAliasDeclaration(typeDeclaration)) {
            const path = typeDeclaration.getSourceFile().fileName
            const generics = typeDeclaration.typeParameters?.map(this.serializeTypeParameter) ?? []
            return SerializationResult.fromSignature({
                path,
                generics,
                memberName: typeDeclaration.name.getText(),
                memberType: 'type',
                namespace,
            } as Signatures.TypeAliasSignature)
        }
        return {}
    }

    private serializeInterfaceProperty(
        el: ts.TypeElement
    ): Signatures.InterfacePropertyType | undefined {
        if (ts.isMethodSignature(el)) {
            return {
                kind: 'function',
                generics: el.typeParameters?.map(this.serializeTypeParameter) ?? [],
                parameters: el.parameters.map(this.serializeParameter),
                returnType: this.serializeType(el.type),
            }
        } else if (ts.isPropertySignature(el)) {
            if (el.type && el.type.kind === ts.SyntaxKind.PropertySignature) {
                return {
                    kind: 'type',
                    type: this.serializeType(el.type),
                }
            } else if (el.type && ts.isFunctionTypeNode(el.type)) {
                el.type.parameters
                return {
                    kind: 'function',
                    parameters: el.type.parameters?.map(this.serializeParameter) ?? [],
                    generics: el.type.typeParameters?.map(this.serializeTypeParameter) ?? [],
                    returnType: this.serializeType(el.type.type),
                }
            } else {
                return {
                    kind: 'type',
                    type: this.serializeType(el.type),
                }
            }
        }
    }

    doInterface(
        symbol: ts.Symbol,
        namespace: string | undefined
    ): SerializationResult | SerializationResult[] {
        const interfaceDeclaration = symbol.declarations[0]

        if (ts.isInterfaceDeclaration(interfaceDeclaration)) {
            const path = interfaceDeclaration.getSourceFile().fileName
            const properties: Record<string, Signatures.InterfaceProperty> = {}
            const callableTypes: Signatures.FunctionDeclaration[] = []
            const constructorTypes: Signatures.ConstructorDefinition[] = []
            let indexed
            for (const member of interfaceDeclaration.members) {
                if (member.name) {
                    properties[member.name.getText()] = {
                        name: member.name.getText(),
                        isOptional: Boolean(member.questionToken),
                        type: this.serializeInterfaceProperty(member) || ({} as any),
                        isReadonly: Boolean(
                            ts.ModifierFlags.Readonly & ts.getCombinedModifierFlags(member)
                        ),
                    }
                } else if (ts.isConstructSignatureDeclaration(member)) {
                    const returnType = this.serializeType(member.type)
                    constructorTypes.push({
                        generics: member.typeParameters?.map(this.serializeTypeParameter) ?? [],
                        parameters: member.parameters?.map(this.serializeParameter) ?? [],
                        returnType,
                    })
                } else if (ts.isCallSignatureDeclaration(member)) {
                    const returnType = this.serializeType(member.type)
                    callableTypes.push({
                        generics: member.typeParameters?.map(this.serializeTypeParameter) ?? [],
                        parameters: member.parameters?.map(this.serializeParameter) ?? [],
                        returnType,
                    })
                } else if (ts.isIndexSignatureDeclaration(member)) {
                    indexed = {
                        index: this.serializeType(member.parameters[0].type),
                        type: this.serializeType(member.type),
                        isReadonly: Boolean(
                            ts.ModifierFlags.Readonly & ts.getCombinedModifierFlags(member)
                        ),
                    }
                }
            }
            const generics =
                interfaceDeclaration.typeParameters?.map(this.serializeTypeParameter) ?? []
            return SerializationResult.fromSignature({
                indexed,
                callableTypes,
                constructorTypes,
                generics,
                properties,
                memberType: 'interface',
                memberName: symbol.name,
                path,
                namespace,
            } as Signatures.InterfaceSignature)
        }
        return {}
    }

    doEnum(
        symbol: ts.Symbol,
        namespace: string | undefined
    ): SerializationResult | SerializationResult[] {
        const enumDeclaration = symbol.declarations[0]
        function serializeValue(
            expression: ts.Expression
        ): { value: string | number; type: string } {
            if (ts.isNumericLiteral(expression)) {
                return { value: eval(expression.getText()), type: 'number' }
            } else {
                return { value: eval(expression.getText()), type: 'string' }
            }
        }
        if (ts.isEnumDeclaration(enumDeclaration)) {
            const path = enumDeclaration.getSourceFile().fileName
            const values: Signatures.EnumValueDefinition[] = []

            for (const member of enumDeclaration.members) {
                if (ts.isEnumMember(member)) {
                    // string or number
                    if (member.initializer) {
                        let valueType
                        try {
                            valueType = serializeValue(member.initializer)
                        } catch {
                            return SerializationResult.fromError(
                                SerializationError.fromDeclaration('S003', enumDeclaration)
                            )
                        }
                        values.push({
                            name: member.name.getText(),
                            type: valueType.type,
                            value: valueType.value,
                        })
                        // not first enum value definition
                        // without initializer, number
                    } else if (values.length) {
                        values.push({
                            name: member.name.getText(),
                            type: 'number',
                            value: (values[0].value as number) + 1,
                        })
                    } else {
                        // first enum value definition without initializer
                        values.push({
                            name: member.name.getText(),
                            type: 'number',
                            value: 0,
                        })
                    }
                }
            }
            return SerializationResult.fromSignature({
                memberType: 'enum',
                path,
                memberName: symbol.name,
                values,
                namespace,
            } as Signatures.EnumSignature)
        }
        return {}
    }

    doClass(
        symbol: ts.Symbol,
        namespace: string | undefined
    ): SerializationResult | SerializationResult[] {
        const classDeclaration = symbol.declarations[0]
        if (ts.isClassDeclaration(classDeclaration)) {
            const generics = classDeclaration.typeParameters?.map(this.serializeTypeParameter) ?? []
            const constructor = this.serializeClassConstructors(symbol)
            const path = classDeclaration.getSourceFile().fileName
            const properties = classDeclaration.members
                .filter(ts.isPropertyDeclaration)
                .map(this.serializeClassProperty)
                .concat(constructor.classPropDefinitions)
            const methods = classDeclaration.members
                .filter(member => ts.isMethodDeclaration(member))
                .map(member => this.serializeMethod(member as ts.MethodDeclaration))
            return SerializationResult.fromSignature({
                memberType: 'class',
                memberName: symbol.name,
                generics,
                constructors: constructor.constructorDefinitions,
                path,
                properties,
                methods,
                namespace,
            } as Signatures.ClassSignature)
        }
        return EMPTY_RESULT
    }

    doConstant(symbol: ts.Symbol, namespace: string | undefined): SerializationResult {
        if (symbol.declarations.length && symbol.declarations[0]) {
            const variableDeclaration = symbol.declarations[0]
            if (ts.isVariableDeclaration(variableDeclaration) && variableDeclaration.initializer) {
                // constants only for primitive types are supported
                if (this.isPrimitiveDeclaration(variableDeclaration.initializer)) {
                    let type
                    if (variableDeclaration.type) {
                        type = variableDeclaration.type.getText()
                    } else {
                        type = this.serializePrimitiveType(variableDeclaration.initializer)
                    }
                    return SerializationResult.fromSignature(
                        this.serializeConst(symbol, variableDeclaration, type!, namespace)
                    )
                } else if (ts.isArrayLiteralExpression(variableDeclaration.initializer)) {
                    const primitiveTypes = variableDeclaration.initializer.elements.map(el =>
                        this.serializePrimitiveType(el)
                    )
                    if (primitiveTypes.includes(undefined)) {
                        return SerializationResult.fromError(
                            SerializationError.fromDeclaration('S002', variableDeclaration)
                        )
                    } else {
                        return SerializationResult.fromSignature(
                            this.serializeConst(
                                symbol,
                                variableDeclaration,
                                `Array<${primitiveTypes.join(' | ')}>`,
                                namespace
                            )
                        )
                    }
                }
                return SerializationResult.fromError(
                    SerializationError.fromDeclaration('S001', variableDeclaration)
                )
            }
        }
        return EMPTY_RESULT
    }

    doArrowFxDeclarations(symbol: ts.Symbol, namespace: string | undefined): SerializationResult {
        let parameters: Signatures.Parameter[] = []
        const variableDeclaration = symbol.declarations[0]
        if (ts.isVariableDeclaration(variableDeclaration)) {
            if (
                variableDeclaration.initializer &&
                ts.isArrowFunction(variableDeclaration.initializer)
            ) {
                parameters = variableDeclaration.initializer.parameters.map(this.serializeParameter)
            }
        }
        return SerializationResult.fromSignature(
            this.serializeFunction(symbol, symbol.valueDeclaration, parameters, namespace)
        )
    }

    doFxDeclarations(symbol: ts.Symbol, namespace: string | undefined): SerializationResult[] {
        return symbol.declarations
            .map(fxDeclaration => {
                let parameters: Signatures.Parameter[] = []
                if (ts.isFunctionDeclaration(fxDeclaration)) {
                    parameters = fxDeclaration.parameters.map(this.serializeParameter)
                }
                return this.serializeFunction(symbol, fxDeclaration, parameters, namespace)
            })
            .map(SerializationResult.fromSignature)
    }

    private serializeType(node?: ts.TypeNode) {
        return node ? this.checker.typeToString(this.checker.getTypeFromTypeNode(node)) : 'any'
    }

    private serializeMethod(method: ts.MethodDeclaration): Signatures.MethodDefinition {
        const flags = ts.getCombinedModifierFlags(method)
        let access: Signatures.AccessModifier = 'public'
        if (ts.ModifierFlags.Protected & flags) {
            access = 'protected'
        } else if (ts.ModifierFlags.Private & flags) {
            access = 'private'
        }
        const usage: Signatures.UsageModifier =
            ts.ModifierFlags.Static & flags ? 'static' : 'instance'
        return {
            returnType: method.type
                ? this.checker.typeToString(this.checker.getTypeFromTypeNode(method.type))
                : 'any',
            name: method.name.getText(),
            modifier: {
                access,
                usage,
            },
            parameters: method.parameters.map(this.serializeParameter),
        }
    }

    private serializeClassProperty(prop: ts.PropertyDeclaration): Signatures.ClassProperty {
        const all = prop.modifiers?.map(m => m.getText() as Signatures.Modifier) ?? []
        const usage: Signatures.UsageModifier[] = ['instance', 'static']
        const access: Signatures.AccessModifier[] = ['private', 'protected', 'public']
        const modifiers: Signatures.ClassProperty['modifiers'] = {
            access:
                (all.find(m =>
                    access.includes(m as Signatures.AccessModifier)
                ) as Signatures.AccessModifier) || 'public',
            usage:
                (all.find(m =>
                    usage.includes(m as Signatures.UsageModifier)
                ) as Signatures.UsageModifier) || 'instance',
            write: all.find(m => m === 'readonly') as Signatures.WriteModifier,
        }
        return {
            name: this.checker.getSymbolAtLocation(prop.name)?.name!,
            modifiers,
            type: this.checker.typeToString(this.checker.getTypeAtLocation(prop)),
        }
    }

    private serializeClassConstructors(
        symbol: ts.Symbol
    ): {
        constructorDefinitions: Signatures.ConstructorDefinition[]
        classPropDefinitions: Signatures.ClassProperty[]
    } {
        const constructorSignatures = this.checker
            .getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
            .getConstructSignatures()
        const constructorDefinitions = constructorSignatures.map(cs =>
            this.serializeConstructSignature(symbol, cs)
        )
        const classPropDefinitions = (constructorSignatures[0]?.parameters ?? [])
            .filter(pp => Boolean(pp.valueDeclaration.modifiers))
            .map(pp => this.serializeClassProperty(pp.valueDeclaration as any))
        return { constructorDefinitions, classPropDefinitions }
    }

    private serializeConstructSignature(
        symbol: ts.Symbol,
        cs: ts.Signature
    ): Signatures.ConstructorDefinition {
        return {
            generics: [],
            parameters: cs.parameters.map(p =>
                this.serializeParameter(p.declarations[0] as ts.ParameterDeclaration)
            ),
            returnType: this.checker.typeToString(
                this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
            ),
        }
    }

    private serializeTypeParameter(tpd: ts.TypeParameterDeclaration): Signatures.GenericDefinition {
        return {
            name: tpd.name.getText(),
            default: tpd.default?.getText(),
            extends: tpd.constraint?.getText(),
        }
    }

    private serializeConst(
        symbol: ts.Symbol,
        varDeclaration: ts.Declaration,
        type: string,
        namespace: string | undefined
    ): Signatures.ConstantSignature {
        return {
            memberName: symbol.getName(),
            memberType: 'constant',
            path: varDeclaration.getSourceFile().fileName,
            type,
            namespace,
        }
    }

    private serializeFunction(
        symbol: ts.Symbol,
        fxDeclaration: ts.Declaration,
        parameters: Signatures.Parameter[],
        namespace: string | undefined
    ) {
        const generics =
            (fxDeclaration as ts.SignatureDeclarationBase).typeParameters?.map(
                this.serializeTypeParameter
            ) ?? []
        const returnType = this.checker.typeToString(
            this.checker
                .getTypeOfSymbolAtLocation(symbol, fxDeclaration)
                .getCallSignatures()[0]
                .getReturnType()
        )
        return {
            memberName: symbol.getName(),
            memberType: 'function',
            path: fxDeclaration.getSourceFile().fileName,
            parameters,
            returnType,
            namespace,
            generics,
        } as Signatures.FunctionSignature
    }

    private serializeParameter(param: ts.ParameterDeclaration): Signatures.Parameter {
        const paramType = this.checker.getTypeAtLocation(param)
        const type = this.checker.typeToString(paramType)
        const name = param.name.getText()
        const isOptional = this.checker.isOptionalParameter(param)
        return { name, type, isOptional }
    }

    private serializePrimitiveType(declaration: ts.Expression): string | undefined {
        return PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind]
    }

    private isPrimitiveDeclaration(declaration: ts.Expression): boolean {
        return Boolean(PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind])
    }
}
