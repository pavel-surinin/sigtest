export namespace Signatures {
    export type MemberType = 'function' | 'class' | 'constant' | 'enum' | 'interface' | 'type'

    export interface Parameter {
        name: string
        type: string
        isOptional: boolean
    }

    interface Signature<T extends MemberType> {
        /**
         * path to file
         */
        path: string
        /**
         * exported member
         */
        memberType: T
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
        parameters: Parameter[]
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
        parameters: Parameter[]
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

    export type BaseInterfacePropertyTypeKind = 'function' | 'type'

    export interface BaseInterfacePropertyType {
        kind: BaseInterfacePropertyTypeKind
    }

    export interface FunctionInterfacePropertyType
        extends BaseInterfacePropertyType,
            FunctionDeclaration {
        kind: 'function'
    }

    export interface TypeInterfacePropertyType extends BaseInterfacePropertyType {
        kind: 'type'
        type: string
    }

    export type InterfacePropertyType = TypeInterfacePropertyType | FunctionInterfacePropertyType

    export interface InterfaceProperty {
        name: string
        type: InterfacePropertyType
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

    export interface FunctionSignature extends FunctionDeclaration, Signature<'function'> {
        memberType: 'function'
    }

    export interface ConstantSignature extends ConstantDeclaration, Signature<'constant'> {
        memberType: 'constant'
    }

    export interface ClassSignature extends ClassDeclaration, Signature<'class'> {
        memberType: 'class'
    }

    export interface EnumSignature extends EnumDeclaration, Signature<'enum'> {
        memberType: 'enum'
    }

    export interface InterfaceSignature extends InterfaceDeclaration, Signature<'interface'> {
        memberType: 'interface'
    }

    export interface TypeAliasSignature extends TypeDeclaration, Signature<'type'> {
        memberType: 'type'
    }

    export type SignatureType<
        T extends Signatures.MemberType = Signatures.MemberType
    > = T extends 'function'
        ? FunctionSignature
        : T extends 'constant'
        ? ConstantSignature
        : T extends 'class'
        ? ClassSignature
        : T extends 'enum'
        ? EnumSignature
        : T extends 'interface'
        ? InterfaceSignature
        : T extends 'type'
        ? TypeAliasSignature
        : never

    export function toFulName(namespace: string | undefined, memberName: string): string {
        return namespace ? namespace + '.' + memberName : memberName
    }
}

export namespace Snapshot {
    export interface Snapshot {
        signatures: Signatures.SignatureType<Signatures.MemberType>[]
        version: string
    }
}
