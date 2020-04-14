import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'
import { Reducer } from 'declarative-js'
import Methods = Comparator.Utils.Methods

export function removed_method({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'removed_method'> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const afterM = after.methods
            .filter(m => m.modifier !== 'private')
            .reduce(
                Reducer.toObject(
                    Methods.ToStrings.name_parameters,
                    m => m,
                    // for overloaded methods
                    // key will be the same
                    // if duplicated set first
                    (a, b) => a
                ),
                {}
            )
        const removed = before.methods
            .filter(m => m.modifier !== 'private')
            .map(Methods.ToStrings.name_parameters)
            .filter(key => !Boolean(afterM[key]))

        if (removed.length) {
            return {
                info: CHANGE_REGISTRY.removed_method,
                signatures: { after, before },
                message: `Methods removed:\n    ${removed.join('\n    ')}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
