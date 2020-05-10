import { Reducer } from 'declarative-js'
import { Signatures } from '../../../Signatures'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import { Comparator } from '../../Comparators'
import Common = Comparator.Utils.Common

export function createChangeTypeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function _createChangeTypeChecker({
        before,
        after,
    }: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
        typeof options.changeCode
    > {
        if (after && after.memberType === 'class' && before.memberType === 'class') {
            const resolveKey = Comparator.Utils.ClassProperties.ToStrings.usage_name
            const obj = after.properties
                .filter(Comparator.Utils.ClassProperties.isNotPrivate)
                .reduce(Reducer.toObject(resolveKey), {})
            const changed = before.properties
                .filter(Comparator.Utils.ClassProperties.isNotPrivate)
                .filter(Comparator.Utils.Common.isIn(obj, resolveKey))
                .map(prop => ({
                    name: resolveKey(prop),
                    beforeType: prop.type,
                    afterType: obj[resolveKey(prop)].type,
                }))
                .filter(x => options.compareTypes(x.beforeType, x.afterType))
            if (changed.length) {
                const changedMessage = changed
                    .map(x => `property '${x.name}' from '${x.beforeType}' to '${x.afterType}'`)
                    .join('\n    ')
                return {
                    info: CHANGE_REGISTRY[options.changeCode],
                    signatures: { after, before },
                    message: `Properties changed type:\n    ${changedMessage}`,
                }
            }
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}

export function createGenericTypeChecker<
    M extends Signatures.MemberType,
    C extends Comparator.ChangeCode
>(options: {
    memberType: M
    changeCode: C
    getGeneric(s: Signatures.SignatureType<M>): Signatures.GenericDefinition[]
    compare(v0: string, v1: string): boolean
}) {
    return Comparator.Utils.Common.areSignaturesTypeOf(options.memberType)(signatures => {
        const { after, before } = signatures
        const afterO = options
            .getGeneric(after)
            .reduce(Reducer.toObject(Comparator.Utils.Common.getName), {})
        const changed = options
            .getGeneric(before)
            .filter(Comparator.Utils.Common.isIn(afterO, Common.getName))
            .map(beforeProp => ({
                name: Common.getName(beforeProp),
                beforeType: beforeProp.extends ?? 'any',
                afterType: afterO[Common.getName(beforeProp)].extends ?? 'any',
            }))
            .filter(x => options.compare(x.beforeType, x.afterType))

        if (changed.length) {
            const changedMessage = changed
                .map(x => `generic '${x.name}' from '${x.beforeType}' to '${x.afterType}'`)
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures: { after, before },
                message: `Generics changed type:\n    ${changedMessage}`,
            }
        }
    })
}

export function createConstantChangeTypeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function _createClassGenericChangeTypeChecker({
        before,
        after,
    }: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
        typeof options.changeCode
    > {
        if (after && after.memberType === 'constant' && before.memberType === 'constant') {
            if (options.compareTypes(before.type, after.type)) {
                return {
                    info: CHANGE_REGISTRY[options.changeCode],
                    signatures: { before, after },
                    message: `Variable '${after.memberName}' changed type from '${before.type}' to '${after.type}'`,
                }
            }
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}

export function createFunctionReturnTypeChangeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return Common.comparatorFor.function(signatures => {
        const { after, before } = signatures
        const foundChange = options.compareTypes(before.returnType, after.returnType)
        if (foundChange) {
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Function return type changed from '${before.returnType}' to '${after.returnType}'`,
            }
        }
    })
}

export function createFunctionParamsTypeChangeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return Common.comparatorFor.function(signatures => {
        const { after, before } = signatures
        const obj = after.parameters.reduce(Reducer.toObject(Common.getName), {})
        const changed = before.parameters
            .filter(Common.isIn(obj))
            .filter(b => options.compareTypes(b.type, obj[Common.getName(b)].type))
        if (changed.length) {
            const cm = changed
                .map(p => `'${p.name}' from '${p.type}' to '${obj[Common.getName(p)].type}'`)
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Function parameter changed type:\n    ${cm}`,
            }
        }
    })
}

export function createInterfacePropsTypeChangeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return Common.comparatorFor.interface(signatures => {
        const { after, before } = signatures
        const obj = Object.values(after.properties).reduce(Reducer.toObject(Common.getName), {})
        const changed = Object.values(before.properties)
            .filter(Common.isIn(obj))
            .filter(b => options.compareTypes(b.type, obj[Common.getName(b)].type))
        if (changed.length) {
            const cm = changed
                .map(p => `'${p.name}' from '${p.type}' to '${obj[Common.getName(p)].type}'`)
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Interface properties changed type:\n    ${cm}`,
            }
        }
    })
}

export function createInterfaceCallableTypeChangeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return Common.comparatorFor.interface(signatures => {
        const { after, before } = signatures
        const toNamed = Comparator.Utils.Interface.callableTypeToNamed(
            Comparator.Utils.Functions.ToString.toParameters
        )
        const obj = Object.values(after.callableTypes)
            .map(toNamed)
            .reduce(Reducer.toObject(Common.getName), {})
        const changed = Object.values(before.callableTypes)
            .map(toNamed)
            .filter(Common.isIn(obj))
            .filter(b => options.compareTypes(b.returnType, obj[Common.getName(b)].returnType))
        if (changed.length) {
            const cm = changed
                .map(
                    p =>
                        `'${p.name}' from '${p.returnType}' to '${
                            obj[Common.getName(p)].returnType
                        }'`
                )
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Interface callable changed return type:\n    ${cm}`,
            }
        }
    })
}
