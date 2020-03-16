export namespace Signatures {
    export type MemberType = "function" | "class" | "constant"

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
        parameters: Record<string, string>
        returnType: string
    }

    interface ConstantDeclaration {
        type: string
    }

    export interface FunctionSignature extends FunctionDeclaration, Signature {
        memberType: "function"
    }

    export interface ConstantSignature extends ConstantDeclaration, Signature {
        memberType: "constant"
    }

    export type SignatureType = FunctionSignature | ConstantSignature

}