export namespace Signatures {
    export type MemberType = 'function' | 'class' | 'constant' | 'enum' | 'interface' | 'type'

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

    export interface FunctionDeclaration {
        generics: GenericDefinition[]
        parameters: Paramter[]
        returnType: string
    }

    export interface ConstantDeclaration {
        type: string
    }

    export interface GenericDefinition {
        name: string
        default?: string
        extends?: string
    }

    export interface ConstructorDefinition extends FunctionDeclaration {}

    export type AccessModifier = 'public' | 'protected' | 'private'
    export type WriteModifier = 'readonly'
    export type UsageModifier = 'instance' | 'static'
    export type Modifier = AccessModifier | WriteModifier | UsageModifier

    export interface ClassProperty {
        name: string
        type: string
        modifiers: {
            access: AccessModifier
            usage: UsageModifier
            write?: WriteModifier
        }
    }

    export interface MethodDefinition {
        modifier: {
            usage: UsageModifier
            access: AccessModifier
        }
        name: string
        parameters: Paramter[]
        returnType: string
    }

    interface ClassDeclaration {
        generics: GenericDefinition[]
        constructors: ConstructorDefinition[]
        properties: ClassProperty[]
        methods: MethodDefinition[]
    }

    export interface EnumValueDefinition {
        name: string
        type: string
        value: any
    }

    export interface EnumDeclaration {
        values: EnumValueDefinition[]
    }

    export interface InterfaceProperty {
        type: string
        isOptional: boolean
        isReadonly: boolean
    }

    export interface InterfaceDeclaration {
        properties: Record<string, InterfaceProperty>
        generics: GenericDefinition[]
        indexed?: { index: string; type: string }
        callableTypes: FunctionDeclaration[]
        constructorTypes: ConstructorDefinition[]
    }

    export interface TypeDeclaration {
        generics: GenericDefinition[]
        type: string
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

    export interface EnumSignature extends EnumDeclaration, Signature {
        memberType: 'enum'
    }

    export interface InterfaceSignature extends InterfaceDeclaration, Signature {
        memberType: 'interface'
    }

    export interface TypeAliasSignature extends TypeDeclaration, Signature {
        memberType: 'type'
    }

    export type SignatureType =
        | FunctionSignature
        | ConstantSignature
        | ClassSignature
        | EnumSignature
        | InterfaceSignature
        | TypeAliasSignature

    export function toFulName(namespace: string | undefined, memberName: string): string {
        return namespace ? namespace + '.' + memberName : memberName
    }
}

export namespace Snapshot {
    export interface Snapshot {
        signatures: Signatures.SignatureType[]
        version: string
    }
}
