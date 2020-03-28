export namespace Signatures {
    export type MemberType = 'function' | 'class' | 'constant'

    export interface Paramter {
        name: string
        type: string
        isOptional: boolean
    }

    interface Signature {
        /**
         * path to file
         */
        path: string
        /**
         * exported member
         */
        memberType: MemberType
        /**
         * Namespace name, that contains this member
         */
        namespace?: string
        /**
         * exported name
         */
        memberName: string
    }

    interface FunctionDeclaration {
        parameters: Paramter[]
        returnType: string
    }

    interface ConstantDeclaration {
        type: string
    }

    export interface GenericDefinition {
        name: string
        default?: string
    }

    export interface ConstructorDefinition extends FunctionDeclaration {}

    export type AccessModifier = 'public' | 'protected' | 'private'
    export type WriteModifier = 'readonly'
    export type UsageModifier = 'instance' | 'static'
    export type Modifier = AccessModifier | WriteModifier | UsageModifier

    export interface ClassProperty {
        name: string
        type: string
        modifiers: Modifier[]
    }

    interface ClassDeclaration {
        generics: GenericDefinition[]
        constructors: ConstructorDefinition[]
        properties: ClassProperty[]
    }

    export interface FunctionSignature extends FunctionDeclaration, Signature {
        memberType: 'function'
    }

    export interface ConstantSignature extends ConstantDeclaration, Signature {
        memberType: 'constant'
    }

    export interface ClassSignature extends ClassDeclaration, Signature {
        memberType: 'class'
    }

    export type SignatureType = FunctionSignature | ConstantSignature | ClassSignature
}
