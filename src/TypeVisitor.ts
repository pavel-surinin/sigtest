import * as ts from "typescript";
import * as fs from "fs";
import { Signatures } from './App.types';
import { Reducer } from 'declarative-js'

export interface DocEntry {
    name?: string;
    fileName?: string;
    documentation?: string;
    type?: string;
    constructors?: DocEntry[];
    parameters?: DocEntry[];
    returnType?: string;
}

/** Generate documentation for all classes in a set of .ts files */
export function generateDocumentation(
    fileNames: string[],
    options: ts.CompilerOptions
): Signatures.SignatureType[] {
    let program = ts.createProgram(fileNames, options);
    let checker = program.getTypeChecker();
    let output: Signatures.SignatureType[] = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, visit);
        }
    }

    // print out the doc
    // fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 4));

    return output;

    /** visit nodes finding exported classes */
    function visit(node: ts.Node) {
        // for namespaces
        // !ts.isModuleBlock(node) &&
        if (!isNodeExported(node)) {
            return;
        }
        if (ts.isFunctionDeclaration(node) && node.name) {
            let symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                // TODO visit function
                output.push(serializeFunction(symbol));
            }
        } else if (ts.isClassDeclaration(node) && node.name) {
            let symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                // output.push(serializeClass(symbol));
            }
        } else if (ts.isModuleDeclaration(node)) {
            ts.forEachChild(node, visit);
        } else if (ts.isModuleBlock(node)) {
            ts.forEachChild(node, visit);
        }
    }

    /** Serialize a symbol into a json object */
    function serializeSymbol(symbol: ts.Symbol): DocEntry {
        return {
            name: symbol.getName(),
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            type: checker.typeToString(
                checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
            )
        };
    }

    /** Serialize a class symbol information */
    function serializeClass(symbol: ts.Symbol) {
        let details = serializeSymbol(symbol);

        // Get the construct signatures
        let constructorType = checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration!
        );
        details.constructors = constructorType
            .getConstructSignatures()
            .map(serializeSignature);
        return details;
    }

    /** Serialize a signature (call or construct) */
    function serializeSignature(signature: ts.Signature) {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType()),
            documentation: ts.displayPartsToString(signature.getDocumentationComment(checker))
        };
    }

    function serializeFunction(symbol: ts.Symbol): Signatures.FunctionSignature {
        const functionDeclaration = symbol.declarations[0]
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
        return {
            memberName: symbol.getName(),
            memberType: 'function',
            path: functionDeclaration.getSourceFile().fileName,
            parameters,
            returnType: checker.typeToString(symbol as any)
        } as any
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (
            (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
            // || (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
        );
    }
}