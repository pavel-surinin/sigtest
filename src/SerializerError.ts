import ts from 'typescript';

export type SerializationErrorCode = 'S001'
export type SerializationErrorInput = Omit<SerializationErrorData, 'definition'> & { code: SerializationErrorCode }

interface SerializationErrorDefinition {
    description: string
    code: SerializationErrorCode
}

const ERROR_CODE_REGISTRY: Record<SerializationErrorCode, SerializationErrorDefinition> = {
    S001: {
        code: 'S001',
        description: 'Not supported exported constant initializer. '
            + 'Only primitive initializers are supported. '
            + 'Try using primitive initializer or define explicit type.'
    }
}

interface SerializationErrorData {
    definition: SerializationErrorDefinition
    file: string,
    text: string
    line: number,
    column: number
}

export class SerializationError extends Error {
    static fromDeclaration(code: SerializationErrorCode, declaration: ts.Declaration): SerializationError {
        const position = ts.getLineAndCharacterOfPosition(declaration.getSourceFile(), declaration.getStart())
        return new SerializationError({
            code,
            file: declaration.getSourceFile().fileName,
            line: position.line + 1,
            column: position.character + 1,
            text: declaration.getFullText()
        })
    }

    constructor(errorData: SerializationErrorInput) {
        super(errorDataToString(errorData));
        Object.setPrototypeOf(this, SerializationError.prototype);
    }
}

function errorDataToString(errorData: SerializationErrorInput): string {
    return `Error occurred during serialization:
  text:        ${errorData.text}
  file:        ${errorData.file}
  line:        ${errorData.line}
  column:      ${errorData.column}
  error code:  ${errorData.code}
  description: ${ERROR_CODE_REGISTRY[errorData.code].description}`
}
