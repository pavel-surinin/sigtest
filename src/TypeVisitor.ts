import * as ts from 'typescript'
import { Serializer, SerializationResult } from './serializer/Serializer'

export function generateSignatures(
    fileNames: string[],
    options: ts.CompilerOptions
): SerializationResult[] {
    let program = ts.createProgram(fileNames, options)
    let checker = program.getTypeChecker()
    let serializer = new Serializer(checker)

    let output: SerializationResult[] = []

    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, visit)
        }
    }

    return output

    function visit(node: ts.Node, namespace?: string) {
        if (!isNodeExported(node)) {
            return
        }
        if (ts.isModuleDeclaration(node)) {
            if (node.body && ts.isModuleBlock(node.body)) {
                const ns = namespace ? namespace + '.' + node.name.getText() : node.name.getText()
                node.body.statements.map(statement => visit(statement, ns))
            }
        }
        if (ts.isVariableStatement(node)) {
            if (ts.isVariableDeclarationList(node.declarationList)) {
                if (node.declarationList.declarations.length) {
                    const varDeclaration = node.declarationList.declarations[0]
                    if (
                        varDeclaration.initializer &&
                        ts.isArrowFunction(varDeclaration.initializer)
                    ) {
                        add(
                            serialize(varDeclaration.name, s =>
                                serializer.doArrowFxDeclarations(s, namespace)
                            )
                        )
                    } else {
                        add(
                            serialize(varDeclaration.name, s => serializer.doConstant(s, namespace))
                        )
                    }
                }
            }
        } else if (ts.isFunctionDeclaration(node) && node.name && node.body) {
            add(serialize(node.name, s => serializer.doFxDeclarations(s, namespace)))
        } else if (ts.isClassDeclaration(node) && node.name) {
            add(serialize(node.name, s => serializer.doClass(s, namespace)))
        } else if (ts.isEnumDeclaration(node)) {
            add(serialize(node.name, s => serializer.doEnum(s, namespace)))
        } else if (ts.isInterfaceDeclaration(node)) {
            add(serialize(node.name, s => serializer.doInterface(s, namespace)))
        } else if (ts.isTypeAliasDeclaration(node)) {
            add(serialize(node.name, s => serializer.doType(s, namespace)))
        } else if (ts.isModuleDeclaration(node) || ts.isModuleBlock(node)) {
            ts.forEachChild(node, visit)
        }
    }

    function serialize(
        node: ts.Node,
        serialize: (symbol: ts.Symbol) => SerializationResult | SerializationResult[]
    ) {
        let symbol = checker.getSymbolAtLocation(node)
        if (symbol) {
            let result = serialize(symbol)
            if (Array.isArray(result)) {
                return result
            }
            return [result]
        }
        return []
    }

    function add(result: SerializationResult[]) {
        output = output.concat(result)
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
    }
}
