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
        | 'changed_method_parameter_required_count'

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
            export namespace Message {
                /**
                 * To use with output from function {@link Comparator.Utils.Parameters.getChangedRequired}
                 */
                export function getChangedRequired(
                    changed: {
                        added: Signatures.Paramter[]
                        removed: Signatures.Paramter[]
                    },
                    indent: number = 4
                ): string {
                    function message(action: 'added' | 'removed', params: string): string {
                        return params ? `\n${' '.repeat(indent)}${action}: ${params}` : ''
                    }
                    const a = changed.added.map(p => `'${p.name}'`).join(', ')
                    const r = changed.removed.map(p => `'${p.name}'`).join(', ')
                    return `${message('added', a)}${message('removed', r)}`
                }
            }
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
            /**
             * Output can be stringified with {@link Comparator.Utils.Parameters.Message.getChangedRequired}
             */
            export function getChangedRequired(
                v0Params: Signatures.Paramter[],
                v1Params: Signatures.Paramter[]
            ): { added: Signatures.Paramter[]; removed: Signatures.Paramter[] } {
                const v0 = v0Params.filter(p => !p.isOptional)
                const v0Names = v0.map(p => p.name)
                const v1 = v1Params.filter(p => !p.isOptional)
                const v1Names = v1.map(p => p.name)

                return {
                    added: v1.filter(p => !v0Names.includes(p.name)),
                    removed: v0.filter(p => !v1Names.includes(p.name)),
                }
            }
        }
        export namespace Methods {
            export function getCommonMethods(
                v0Methods: Signatures.MethodDefinition[],
                v1Methods: Signatures.MethodDefinition[],
                resolveMethodKey?: (method: Signatures.MethodDefinition) => string
            ): {
                beforeMethod: Signatures.MethodDefinition
                afterMethod: Signatures.MethodDefinition
            }[] {
                function defaultMethodKey(method: Signatures.MethodDefinition): string {
                    return `${method.name}:${method.parameters.map(p => p.name).join(',')}`
                }
                const resolveKey = resolveMethodKey || defaultMethodKey
                const afterMethods = v1Methods
                    .filter(method => method.modifier !== 'private')
                    .reduce(Reducer.toObject(resolveKey), {})
                return v0Methods
                    .filter(method => method.modifier !== 'private')
                    .map(beforeMethod => ({
                        beforeMethod,
                        afterMethod: afterMethods[resolveKey(beforeMethod)],
                    }))
                    .filter(p => Boolean(p.afterMethod))
                    .filter(p => p.beforeMethod.modifier === p.afterMethod.modifier)
            }
        }
    }
}
