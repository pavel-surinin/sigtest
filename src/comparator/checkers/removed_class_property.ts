import { Comparator } from '../Comparators'
import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function removed_class_property({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'removed_class_property'> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const resolveKey = Comparator.Utils.ClassProperties.ToStrings.usage_name

        const afterO = after.properties
            .filter(Comparator.Utils.ClassProperties.isNotPrivate)
            .reduce(Reducer.toObject(resolveKey), {})
        const removed = before.properties
            .filter(Comparator.Utils.ClassProperties.isNotPrivate)
            .filter(Comparator.Utils.Common.isNotIn(afterO, resolveKey))
        if (removed.length) {
            return {
                info: CHANGE_REGISTRY.removed_class_property,
                signatures: { before, after },
                message: `Properties removed: ${removed
                    .map(resolveKey)
                    .map(x => `'${x}'`)
                    .join(', ')}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
