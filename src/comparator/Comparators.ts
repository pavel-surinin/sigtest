import { Signatures } from '../App.types'

export namespace Comparator {
    export type Action = 'removed' | 'added' | 'changed' | 'none'
    export type Status = 'compatible' | 'breaking'
    export type MemberType = Signatures.MemberType | 'common'
    export type Compare<T> = { before: T; after: T }
    export type CompareOpt<T> = { before: T; after?: T }

    export interface Change<C extends ChangeCode> {
        signatures: CompareOpt<Signatures.SignatureType>
        info: ChangeInfo<ChangeCode>
        message?: string
    }

    export interface ComparisonResult {
        versions: Compare<string>
        changes: Change<ChangeCode>[]
    }
    export type Comparator<C extends ChangeCode> = (
        comparison: Compare<Signatures.SignatureType>
    ) => Change<C>

    export type NothingChangedCode = 'no_change'
    export type ChangeCode =
        // generic
        | 'changed_member_type'
        | 'member_removal'
        | NothingChangedCode
        // class
        //  constructor
        | 'changed_required_constructor_parameters_count'
        | 'changed_constructor_parameter_modifier_to_optional'
        | 'changed_constructor_parameter_modifier_to_required'
        | 'changed_constructor_parameter_type'
        | 'changed_constructor_parameter_type_union'
        //  method
        | 'changed_method_return_type'

    export interface ChangeInfo<C extends ChangeCode> {
        status: Status
        action: Action
        code: C
        description: string
        memberType: MemberType
    }

    export namespace Utils {
        export namespace Types {
            export function areCompatible(v0: string, v1: string): boolean {
                const v0any = v0 === 'any'
                const v1any = v1 === 'any'
                if (v1any) {
                    return true
                }
                if (v0any && !v1any) {
                    return false
                }
                const v0Types = v0.split('|').map(s => s.trim())
                const v1Types = v1.split('|').map(s => s.trim())
                return v0Types.every(ut => v1Types.includes(ut))
            }
        }
    }
}