import * as ts from 'typescript'
import { Signatures } from './App.types'
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
    constructor(readonly signature?: Signatures.SignatureType, readonly error?: SerializationError) {}
}

export class Serializer {
    constructor(private readonly checker: ts.TypeChecker) {
        this.serializeFunction = this.serializeFunction.bind(this)
        this.doFxDeclarations = this.doFxDeclarations.bind(this)
        this.serializeParameter = this.serializeParameter.bind(this)
        this.serializeClassProperty = this.serializeClassProperty.bind(this)
        this.serializeMethod = this.serializeMethod.bind(this)
    }

    doEnum(symbol: ts.Symbol): SerializationResult | SerializationResult[] {
        const enumDeclaration = symbol.declarations[0]
        function serializeValue(expression: ts.Expression): { value: string | number; type: string } {
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
            } as Signatures.EnumSignature)
        }
        return {}
    }

    doClass(symbol: ts.Symbol): SerializationResult | SerializationResult[] {
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
            } as Signatures.ClassSignature)
        }
        return EMPTY_RESULT
    }

    doConstant(symbol: ts.Symbol): SerializationResult {
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
                    return SerializationResult.fromSignature(this.serializeConst(symbol, variableDeclaration, type!))
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
                            this.serializeConst(symbol, variableDeclaration, `Array<${primitiveTypes.join(' | ')}>`)
                        )
                    }
                }
                return SerializationResult.fromError(SerializationError.fromDeclaration('S001', variableDeclaration))
            }
        }
        return EMPTY_RESULT
    }

    doArrowFxDeclarations(symbol: ts.Symbol): SerializationResult {
        let parameters: Signatures.Paramter[] = []
        const variableDeclaration = symbol.declarations[0]
        if (ts.isVariableDeclaration(variableDeclaration)) {
            if (variableDeclaration.initializer && ts.isArrowFunction(variableDeclaration.initializer)) {
                parameters = variableDeclaration.initializer.parameters.map(this.serializeParameter)
            }
        }
        return SerializationResult.fromSignature(this.serializeFunction(symbol, symbol.valueDeclaration, parameters))
    }

    doFxDeclarations(symbol: ts.Symbol): SerializationResult[] {
        return symbol.declarations
            .map(fxDeclaration => {
                let parameters: Signatures.Paramter[] = []
                if (ts.isFunctionDeclaration(fxDeclaration)) {
                    parameters = fxDeclaration.parameters.map(this.serializeParameter)
                }
                return this.serializeFunction(symbol, fxDeclaration, parameters)
            })
            .map(SerializationResult.fromSignature)
    }

    private serializeMethod(method: ts.MethodDeclaration): Signatures.MethodDefinition {
        return {
            name: method.name.getText(),
            modifier: method.modifiers ? (method.modifiers[0].getText() as Signatures.AccessModifier) : 'public',
            parameters: method.parameters.map(this.serializeParameter),
        }
    }

    private serializeClassProperty(prop: ts.PropertyDeclaration): Signatures.ClassProperty {
        return {
            name: this.checker.getSymbolAtLocation(prop.name)?.name!,
            modifiers: prop.modifiers?.map(m => m.getText() as Signatures.Modifier) ?? [],
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
        const constructorDefinitions = constructorSignatures.map(cs => {
            return {
                parameters: cs.parameters.map(p =>
                    this.serializeParameter(p.declarations[0] as ts.ParameterDeclaration)
                ),
                returnType: this.checker.typeToString(
                    this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
                ),
            }
        })
        const classPropDefinitions = (constructorSignatures[0]?.parameters ?? [])
            .filter(pp => Boolean(pp.valueDeclaration.modifiers))
            .map(pp => this.serializeClassProperty(pp.valueDeclaration as any))
        return { constructorDefinitions, classPropDefinitions }
    }

    private serializeTypeParameter(tpd: ts.TypeParameterDeclaration): Signatures.GenericDefinition {
        return {
            name: tpd.name.getText(),
            default: tpd.default?.getText(),
        }
    }

    private serializeConst(
        symbol: ts.Symbol,
        varDeclaration: ts.Declaration,
        type: string
    ): Signatures.ConstantSignature {
        return {
            memberName: symbol.getName(),
            memberType: 'constant',
            path: varDeclaration.getSourceFile().fileName,
            type,
        }
    }

    private serializeFunction(symbol: ts.Symbol, fxDeclaration: ts.Declaration, parameters: Signatures.Paramter[]) {
        const returnType = this.checker.typeToString(
            this.checker.getTypeOfSymbolAtLocation(symbol, fxDeclaration).getCallSignatures()[0].getReturnType()
        )
        return {
            memberName: symbol.getName(),
            memberType: 'function',
            path: fxDeclaration.getSourceFile().fileName,
            parameters,
            returnType,
        } as Signatures.FunctionSignature
    }

    private serializeParameter(param: ts.ParameterDeclaration): Signatures.Paramter {
        const paramType = this.checker.getTypeAtLocation(param)
        const type = this.checker.typeToString(paramType)
        const name = param.name.getText()
        const isOptional = this.checker.isOptionalParameter(param)
        this.checker.isOptionalParameter(param)
        return { name, type, isOptional }
    }

    private serializePrimitiveType(declaration: ts.Expression): string | undefined {
        return PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind]
    }

    private isPrimitiveDeclaration(declaration: ts.Expression): boolean {
        return Boolean(PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind])
    }
}
