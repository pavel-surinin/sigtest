import * as ts from 'typescript'
import { Signatures } from './App.types';
import { SerializationError } from './SerializerError';

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
    constructor(readonly signature?: Signatures.SignatureType, readonly error?: SerializationError) { }
}

export class Serializer {

    constructor(private readonly checker: ts.TypeChecker) {
        this.serializeFunction = this.serializeFunction.bind(this)
        this.doFxDeclarations = this.doFxDeclarations.bind(this)
        this.serializeParameter = this.serializeParameter.bind(this)
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
                    return SerializationResult.fromSignature(
                        this.serializeConst(
                            symbol,
                            variableDeclaration,
                            type
                        )
                    )
                }
                return SerializationResult.fromError(
                    SerializationError.fromDeclaration("S001", variableDeclaration)
                )
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
        return SerializationResult.fromSignature(
            this.serializeFunction(symbol, symbol.valueDeclaration, parameters)
        )
    }

    doFxDeclarations(symbol: ts.Symbol): SerializationResult[] {
        return symbol.declarations
            .map(fxDeclaration => {
                let parameters: Signatures.Paramter[] = []
                if (ts.isFunctionDeclaration(fxDeclaration)) {
                    parameters = fxDeclaration
                        .parameters
                        .map(this.serializeParameter)
                }
                return this.serializeFunction(symbol, fxDeclaration, parameters);
            })
            .map(SerializationResult.fromSignature)
    }

    private serializeConst(symbol: ts.Symbol, varDeclaration: ts.Declaration, type: string): Signatures.ConstantSignature {
        return {
            memberName: symbol.getName(),
            memberType: 'constant',
            path: varDeclaration.getSourceFile().fileName,
            type
        }
    }

    private serializeFunction(symbol: ts.Symbol, fxDeclaration: ts.Declaration, parameters: Signatures.Paramter[]) {
        const returnType = this.checker.typeToString(this.checker.getTypeOfSymbolAtLocation(symbol, fxDeclaration)
            .getCallSignatures()[0]
            .getReturnType());
        return {
            memberName: symbol.getName(),
            memberType: 'function',
            path: fxDeclaration.getSourceFile().fileName,
            parameters,
            returnType
        } as Signatures.FunctionSignature
    }

    private serializeParameter(param: ts.ParameterDeclaration): Signatures.Paramter {
        const paramType = this.checker.getTypeAtLocation(param)
        const type = this.checker.typeToString(paramType)
        const name = param.name.getText()
        const isOptional = this.checker.isOptionalParameter(param);
        this.checker.isOptionalParameter(param)
        return { name, type, isOptional }
    }

    private serializePrimitiveType(declaration: ts.Expression): string {
        return PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind]
    }

    private isPrimitiveDeclaration(declaration: ts.Expression): boolean {
        return Boolean(PRIMITIVE_KIND_NAME_REGISTRY[declaration.kind])
    }
}