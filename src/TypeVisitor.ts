import * as ts from "typescript";
import { Signatures } from './App.types';
import { Reducer } from 'declarative-js'

export function generateSignatures(
    fileNames: string[],
    options: ts.CompilerOptions
): Signatures.SignatureType[] {
    let program = ts.createProgram(fileNames, options);
    let checker = program.getTypeChecker();
    let output: Signatures.SignatureType[] = [];

    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, visit);
        }
    }

    return output;

    function visit(node: ts.Node) {
        // for namespaces
        // !ts.isModuleBlock(node) &&
        if (!isNodeExported(node)) {
            return;
        }
        if (ts.isFunctionDeclaration(node) && node.name && node.body) {
            let symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                output = output.concat(serializeFunction(symbol))
            }
        } else if (ts.isClassDeclaration(node) && node.name) {
            let symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                // TODO get class signatures
                // output.push(serializeClass(symbol));
            }
        } else if (ts.isModuleDeclaration(node) || ts.isModuleBlock(node)) {
            ts.forEachChild(node, visit);
        }
    }

    function serializeSymbol(symbol: ts.Symbol): any {
        return {
            name: symbol.getName(),
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            type: checker.typeToString(
                checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
            )
        };
    }

    function serializeClass(symbol: ts.Symbol) {
        let details = serializeSymbol(symbol);

        let constructorType = checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration!
        );
        details.constructors = constructorType
            .getConstructSignatures()
            .map(serializeSignature);
        return details;
    }

    function serializeSignature(signature: ts.Signature) {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType()),
            documentation: ts.displayPartsToString(signature.getDocumentationComment(checker))
        };
    }

    function serializeFunction(symbol: ts.Symbol): Signatures.FunctionSignature[] {
        return symbol.declarations
            .map(functionDeclaration => {
                let parameters = {}
                if (ts.isFunctionDeclaration(functionDeclaration)) {
                    parameters = functionDeclaration.parameters
                        .map(param => {
                            const paramType = checker.getTypeAtLocation(param)
                            const type = checker.typeToString(paramType)
                            const name = param.name.getText()
                            return { name, type }
                        })
                        .reduce(Reducer.toObject(x => x.name, x => x.type), {})
                }

                const returnType = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, functionDeclaration)
                    .getCallSignatures()[0]
                    .getReturnType());
                return {
                    memberName: symbol.getName(),
                    memberType: 'function',
                    path: functionDeclaration.getSourceFile().fileName,
                    parameters,
                    returnType
                }
            })
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (
            (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
            // not working with namespaces
            // || (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
        );
    }
}