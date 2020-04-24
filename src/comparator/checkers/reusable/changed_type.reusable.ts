import { Comparator } from '../../Comparators'
import { Signatures } from '../../../App.types'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

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

export function createClassGenericChangeTypeChecker(options: {
    compareTypes(tBefore: string, tAfter: string): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function _createClassGenericChangeTypeChecker({
        before,
        after,
    }: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
        typeof options.changeCode
    > {
        if (after && after.memberType === 'class' && before.memberType === 'class') {
            function resolveKey(g: Signatures.GenericDefinition) {
                return g.name
            }
            const obj = after.generics.reduce(Reducer.toObject(resolveKey), {})
            const changed = before.generics
                .filter(Comparator.Utils.Common.isIn(obj, resolveKey))
                .map(prop => ({
                    name: resolveKey(prop),
                    beforeType: prop.extends ?? 'any',
                    afterType: obj[resolveKey(prop)].extends ?? 'any',
                }))
                .filter(x => options.compareTypes(x.beforeType, x.afterType))
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
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}
