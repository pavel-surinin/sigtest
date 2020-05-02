import { Signatures } from '../App.types'
import { Reducer } from 'declarative-js'
import toObject = Reducer.toObject
import { memoize } from 'auto-memoize'
import { CHANGE_REGISTRY } from './ComparatorChangeRegistry'

export namespace Comparator {
    export type Action = 'removed' | 'added' | 'changed' | 'none'
    export type Status = 'compatible' | 'breaking'
    export type MemberType = Signatures.MemberType | 'common'
    export type Compare<T> = { before: T; after: T }
    export type CompareOpt<T> = { before: T; after?: T }

    export interface Change<C extends ChangeCode> {
        signatures: CompareOpt<Signatures.SignatureType<Signatures.MemberType>>
        info: ChangeInfo<ChangeCode>
        message?: string
    }

    export interface ComparisonResult {
        versions: Compare<string>
        changes: Change<ChangeCode>[]
    }
    export type Comparator<C extends ChangeCode, T extends Signatures.MemberType> = (
        comparison: Compare<Signatures.SignatureType<T>>
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
        | 'added_method'
        | 'removed_method'
        | 'changed_method_modifier_more_visible'
        | 'changed_method_modifier_less_visible'
        //    property
        | 'changed_property_modifier_more_visible'
        | 'changed_property_modifier_less_visible'
        | 'removed_class_property'
        | 'added_class_property'
        | 'changed_class_property_type'
        | 'changed_class_property_type_union'
        | 'changed_class_property_to_readonly'
        | 'changed_class_property_to_not_readonly'
        //    generic type
        | 'removed_generic'
        | 'added_required_generic'
        | 'added_optional_generic'
        | 'changed_generic_extends_type'
        | 'changed_generic_extends_type_to_less_strict'
        // constant
        | 'changed_constant_type'
        | 'changed_constant_type_to_less_strict'
        // enum
        | 'added_enum'
        | 'removed_enum'
        | 'changed_enum_value'
        // function
        | 'changed_function_return_type'
        | 'changed_function_return_type_to_less_strict'
        | 'changed_function_parameter_modifier_to_optional'
        | 'changed_function_parameter_modifier_to_required'
        | 'changed_function_parameter_required_count'
        | 'changed_function_parameter_type'
        | 'changed_function_parameter_type_to_less_strict'
        //      generic type
        | 'removed_function_generic'
        | 'added_function_required_generic'
        | 'added_function_optional_generic'
        | 'changed_function_generic_extends_type'
        | 'changed_function_generic_extends_type_to_less_strict'
        // interface
        //    generic
        | 'removed_interface_generic'
        | 'added_interface_required_generic'
        | 'added_interface_optional_generic'
        | 'changed_interface_generic_extends_type'
        | 'changed_interface_generic_extends_type_to_less_strict'
    //    properties
    // | 'added_interface_property'
    // | 'removed_interface_property'
    // | 'changed_interface_property_type'
    // | 'changed_interface_property_type_less_strict'
    //     callableType
    //    | 'changed_callable_type_return_type'
    //    | 'changed_callable_type_return_type_to_less_strict'
    //    | 'changed_callable_type_parameter_modifier_to_optional'
    //    | 'changed_callable_type_parameter_modifier_to_required'
    //    | 'changed_callable_type_parameter_required_count'
    //    | 'changed_callable_type_parameter_type'
    //    | 'changed_callable_type_parameter_type_to_less_strict'

    export interface ChangeInfo<C extends ChangeCode> {
        status: Status
        action: Action
        code: C
        description: string
        memberType: MemberType
    }

    export namespace Utils {
        export namespace Types {
            /**
             * Check compatibility between types
             *
             * @export
             * @param {string} v0 type before
             * @param {string} v1 type after
             * @returns {boolean} are types compatible
             */
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

            export function areNotCompatible(v0: string, v1: string): boolean {
                return !areCompatible(v0, v1)
            }

            export function areMoreApplicable(v0: string, v1: string): boolean {
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
            export namespace ToStrings {
                export function name_parameters(method: Signatures.MethodDefinition): string {
                    return `${method.name}(${method.parameters.map(p => p.name).join(', ')})`
                }
                export function usage_name_parameters(method: Signatures.MethodDefinition): string {
                    let usage = ''
                    if (method.modifier.usage === 'static') {
                        usage = 'static '
                    }
                    return `${usage}${method.name}(${method.parameters
                        .map(p => p.name)
                        .join(', ')})`
                }
                export function modifier_name_parameters(
                    method: Signatures.MethodDefinition
                ): string {
                    let usage = ''
                    if (method.modifier.usage === 'static') {
                        usage = 'static '
                    }
                    return `${usage}${method.modifier.access} ${
                        method.name
                    }(${method.parameters.map(p => p.name).join(', ')})`
                }
            }
            export function getCommonMethods(
                v0Methods: Signatures.MethodDefinition[],
                v1Methods: Signatures.MethodDefinition[],

                options?: {
                    resolveMethodKey?: (method: Signatures.MethodDefinition) => string
                    isApplicable?: (method: Signatures.MethodDefinition) => boolean
                }
            ): {
                beforeMethod: Signatures.MethodDefinition
                afterMethod: Signatures.MethodDefinition
            }[] {
                const resolveKey = options?.resolveMethodKey || ToStrings.modifier_name_parameters
                const isApplicable = options?.isApplicable || Methods.isNotPrivate
                const afterMethods = v1Methods
                    .filter(isApplicable)
                    .reduce(Reducer.toObject(resolveKey), {})
                const methods = []
                for (const beforeMethod of v0Methods) {
                    if (isApplicable(beforeMethod)) {
                        const methodKey = resolveKey(beforeMethod)
                        if (afterMethods[methodKey]) {
                            methods.push({
                                beforeMethod,
                                afterMethod: afterMethods[resolveKey(beforeMethod)],
                            })
                        }
                    }
                }
                return methods
            }
            export function isNotPrivate(m: Signatures.MethodDefinition) {
                return m.modifier.access !== 'private'
            }
        }
        export namespace Modifiers {
            const ACCESS_MODIFIER_ORDER: Record<Signatures.AccessModifier, number> = {
                private: 10,
                protected: 20,
                public: 30,
            }
            export function isLessVisible(
                m1: Signatures.AccessModifier,
                m2: Signatures.AccessModifier
            ): boolean {
                return ACCESS_MODIFIER_ORDER[m1] < ACCESS_MODIFIER_ORDER[m2]
            }
            export function isMoreVisible(
                m1: Signatures.AccessModifier,
                m2: Signatures.AccessModifier
            ): boolean {
                return ACCESS_MODIFIER_ORDER[m1] > ACCESS_MODIFIER_ORDER[m2]
            }
            export function isReadOnlyCompatible(
                m1: Signatures.WriteModifier | undefined,
                m2: Signatures.WriteModifier | undefined
            ): boolean {
                return m1 === m2 || m1 === 'readonly'
            }
            export function isNotReadOnlyCompatible(
                m1?: Signatures.WriteModifier,
                m2?: Signatures.WriteModifier
            ): boolean {
                return !isReadOnlyCompatible(m1, m2)
            }
            export function isNowOptional(p0: boolean, p1: boolean) {
                return !p0 && p1
            }
            export function isNowRequired(p0: boolean, p1: boolean) {
                return p0 && !p1
            }
        }
        export namespace ClassProperties {
            export namespace ToStrings {
                export const usage_name = memoize(_usage_name, 'weak')
                function _usage_name(property: Signatures.ClassProperty) {
                    const modifier =
                        property.modifiers.usage === 'instance'
                            ? ''
                            : property.modifiers.usage + ' '
                    return `${modifier}${property.name}`
                }
                export function name(property: Signatures.ClassProperty) {
                    return property.name
                }
            }

            export function isNotPrivate(property: Signatures.ClassProperty): boolean {
                return property.modifiers.access !== 'private'
            }

            export function getCommonProperties(
                p0: Signatures.ClassProperty[],
                p1: Signatures.ClassProperty[],
                options?: {
                    resolveKey?: (method: Signatures.ClassProperty) => string
                }
            ) {
                function isApplicable(s: Signatures.ClassProperty) {
                    return true
                }
                const resolveKey = options?.resolveKey || ToStrings.name

                const afterMethods = p1.filter(isApplicable).reduce(toObject(resolveKey), {})
                return p0
                    .filter(isApplicable)
                    .map(beforeProp => ({
                        beforeProp: beforeProp,
                        afterProp: afterMethods[resolveKey(beforeProp)],
                    }))
                    .filter(p => Boolean(p.afterProp))
            }
        }
        export namespace Common {
            export type WithName = { name: string }
            export function formatSequenceMessage(p: WithName[]) {
                return p.map(Common.getName).map(Common.surroundWithQuotes).join(', ')
            }
            export function getName<T extends WithName>(p: T) {
                return p.name
            }
            export function isIn<T extends WithName>(
                object: Record<string, T>,
                toKey?: (el: T) => string
            ) {
                const resolveKey = toKey ?? Common.getName
                return function _isIn(el: T): boolean {
                    return object[resolveKey(el)] != null
                }
            }
            export function isNotIn<T extends WithName>(
                object: Record<string, T>,
                toKey?: (el: T) => string
            ) {
                return function _isNotIn(el: T): boolean {
                    return object[toKey ? toKey(el) : Common.getName(el)] == null
                }
            }
            export function surroundWithQuotes(s: string) {
                return "'" + s + "'"
            }
            export const comparatorFor = {
                enum: areSignaturesTypeOf('enum'),
                class: areSignaturesTypeOf('class'),
                constant: areSignaturesTypeOf('constant'),
                function: areSignaturesTypeOf('function'),
                interface: areSignaturesTypeOf('interface'),
                type: areSignaturesTypeOf('type'),
            }
            export function areSignaturesTypeOf<
                C extends Comparator.ChangeCode,
                T extends Signatures.MemberType
            >(memberType: T) {
                return function _createComparator(
                    compare: (
                        comparison: Compare<Signatures.SignatureType<T>>
                    ) => Change<C> | undefined
                ): Comparator.Comparator<Comparator.ChangeCode, T> {
                    return function __createComparator(v) {
                        if (
                            v.after &&
                            v.after.memberType === memberType &&
                            v.before.memberType === memberType
                        ) {
                            const change = compare(v)
                            if (change) {
                                return change
                            }
                        }
                        return {
                            info: CHANGE_REGISTRY.no_change,
                            signatures: { before: v.before, after: v.after },
                        }
                    }
                }
            }
        }
        export namespace Generics {
            export type AddedGenericPair = {
                beforeGeneric?: Signatures.GenericDefinition
                afterGeneric: Signatures.GenericDefinition
            }
            export function addedRequired(g: AddedGenericPair): boolean {
                return !g.beforeGeneric && g.afterGeneric.default == null
            }
            export function addedOptional(g: AddedGenericPair): boolean {
                return !g.beforeGeneric && g.afterGeneric.default != null
            }
        }
    }
}
