import * as ts from 'typescript'
import { Signatures } from './App.types';

export class Serializer {
    constructor(private readonly checker: ts.TypeChecker) {
        this.serializeFunction = this.serializeFunction.bind(this)
        this.doFxDeclarations = this.doFxDeclarations.bind(this)
        this.serializeParameter = this.serializeParameter.bind(this)
    }

    doArrowFxDeclarations(symbol: ts.Symbol): Signatures.SignatureType {
        let parameters: Signatures.Paramter[] = []
        const variableDeclaration = symbol.declarations[0]
        if (ts.isVariableDeclaration(variableDeclaration)) {
            if (variableDeclaration.initializer && ts.isArrowFunction(variableDeclaration.initializer)) {
                parameters = variableDeclaration.initializer.parameters.map(this.serializeParameter)
            }

        }
        return this.serializeFunction(symbol, symbol.valueDeclaration, parameters)
    }

    doFxDeclarations(symbol: ts.Symbol): Signatures.FunctionSignature[] {
        return symbol.declarations.map(fxDeclaration => {
            let parameters: Signatures.Paramter[] = []
            if (ts.isFunctionDeclaration(fxDeclaration)) {
                parameters = fxDeclaration
                    .parameters
                    .map(this.serializeParameter)
            }
            return this.serializeFunction(symbol, fxDeclaration, parameters);
        })
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

}