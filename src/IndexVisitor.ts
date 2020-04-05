import ts from 'typescript'

export interface Export {
    path: string
    members?: string[]
}

export function visitIndex(pathToIndex: string, options: ts.CompilerOptions): Export[] {
    let program = ts.createProgram([pathToIndex], options)

    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, visit)
        }
    }

    function visit(node: ts.Node) {
        ts.isExportAssignment(node)
        ts.isExportDeclaration(node)
        ts.isExportSpecifier(node)
        console.log(node)
    }
    return []
}
