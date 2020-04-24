import { Comparator } from '../Comparators'
import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function removed_generic({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'removed_generic'> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        function resolveKey(g: Signatures.GenericDefinition) {
            return g.name
        }
        const afterO = after.generics.reduce(Reducer.toObject(resolveKey), {})
        const removed = before.generics.filter(Comparator.Utils.Common.isNotIn(afterO, resolveKey))
        if (removed.length) {
            const removedMessage = removed
                .map(resolveKey)
                .map(Comparator.Utils.Common.surroundWithQuotes)
                .join(', ')
            return {
                info: CHANGE_REGISTRY.removed_generic,
                signatures: { before, after },
                message: `Removed class generics: ${removedMessage}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
