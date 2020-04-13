import { Signatures } from '../App.types'
import { Reducer } from 'declarative-js'
import toObject = Reducer.toObject

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
        //    constructor
        | 'changed_required_constructor_parameters_count'
        | 'changed_constructor_parameter_modifier_to_optional'
        | 'changed_constructor_parameter_modifier_to_required'
        | 'changed_constructor_parameter_type'
        | 'changed_constructor_parameter_type_union'
        //    method
        | 'changed_method_return_type'
        | 'changed_method_return_type_union'
        | 'changed_method_parameter_modifier_to_optional'
        | 'changed_method_parameter_modifier_to_required'

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
                if (v0.trim() === v1.trim()) {
                    return true
                }
                const v0any = v0 === 'any'
                const v1any = v1 === 'any'
                if (v1any) {
                    return true
                }
                if (v0any) {
                    return false
                }
                const v0Types = v0.split('|').map(s => s.trim())
                const v1Types = v1.split('|').map(s => s.trim())
                return v0Types.every(ut => v1Types.includes(ut))
            }
            export function isMoreApplicable(v0: string, v1: string): boolean {
                if (v0.trim() === v1.trim()) {
                    return false
                }
                const v0any = v0 === 'any'
                const v1any = v1 === 'any'
                if (v1any) {
                    return true
                }
                if (v0any) {
                    return false
                }
                const bUnionTypes = v0.split('|').map(s => s.trim())
                const aUnionTypes = v1.split('|').map(s => s.trim())
                const isAllIncluded = bUnionTypes.every(ut => aUnionTypes.includes(ut))
                return isAllIncluded && bUnionTypes.length < aUnionTypes.length
            }
        }
        export namespace Parameters {
            export function getChangedToOptional(
                v0Params: Signatures.Paramter[],
                v1Params: Signatures.Paramter[]
            ): Signatures.Paramter[] {
                if (!v0Params.length || !v1Params.length) {
                    return []
                }
                const afterOptsObj = v1Params
                    .filter(g => g.isOptional)
                    .reduce(
                        toObject(p => p.name),
                        {}
                    )
                return v0Params
                    .filter(g => !g.isOptional)
                    .filter(p => Boolean(afterOptsObj[p.name]))
            }
            export function getChangedToRequired(
                v0Params: Signatures.Paramter[],
                v1Params: Signatures.Paramter[]
            ): Signatures.Paramter[] {
                const afterOptsObj = v1Params
                    .filter(g => !g.isOptional)
                    .reduce(
                        Reducer.toObject(p => p.name),
                        {}
                    )
                return v0Params.filter(g => g.isOptional).filter(p => Boolean(afterOptsObj[p.name]))
            }
        }
        export namespace Methods {
            export function getCommonMethods(
                v0Methods: Signatures.MethodDefinition[],
                v1Methods: Signatures.MethodDefinition[]
            ): {
                beforeMethod: Signatures.MethodDefinition
                afterMethod: Signatures.MethodDefinition
            }[] {
                function methodKey(method: Signatures.MethodDefinition): string {
                    return `${method.name}:${method.parameters.map(p => p.name).join(',')}`
                }
                const afterMethods = v1Methods
                    .filter(method => method.modifier !== 'private')
                    .reduce(Reducer.toObject(methodKey), {})
                return v0Methods
                    .filter(method => method.modifier !== 'private')
                    .map(beforeMethod => ({
                        beforeMethod,
                        afterMethod: afterMethods[methodKey(beforeMethod)],
                    }))
                    .filter(p => Boolean(p.afterMethod))
                    .filter(p => p.beforeMethod.modifier === p.afterMethod.modifier)
            }
        }
    }
}
