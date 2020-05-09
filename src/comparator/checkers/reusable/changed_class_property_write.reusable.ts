import { Comparator } from '../../Comparators'
import { Signatures } from '../../../Signatures'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function createChangeWriteChecker(options: {
    compareWriteModifiers(
        tBefore?: Signatures.WriteModifier,
        tAfter?: Signatures.WriteModifier
    ): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function _createChangeWriteChecker({
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
                    before: prop.modifiers.write,
                    after: obj[resolveKey(prop)].modifiers.write,
                }))
                .filter(x => options.compareWriteModifiers(x.before, x.after))
            if (changed.length) {
                const changedMessage = changed
                    .map(x => `property '${x.name}' from '${x.before ?? ''}' to '${x.after ?? ''}'`)
                    .join('\n    ')
                return {
                    info: CHANGE_REGISTRY[options.changeCode],
                    signatures: { after, before },
                    message: `Properties changed write modifier:\n    ${changedMessage}`,
                }
            }
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}
