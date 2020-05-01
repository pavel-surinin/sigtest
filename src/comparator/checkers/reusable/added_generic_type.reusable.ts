import { Comparator } from '../../Comparators'
import { Signatures } from '../../../App.types'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function createAddedClassGenericTypeChecker(options: {
    compare(g: Comparator.Utils.Generics.AddedGenericPair): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function createAddedClassGenericTypeChecker({
        before,
        after,
    }: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
        typeof options.changeCode
    > {
        if (after && after.memberType === 'class' && before.memberType === 'class') {
            const beforeO = before.generics.reduce(
                Reducer.toObject(Comparator.Utils.Common.getName),
                {}
            )
            const changed = after.generics
                .map(afterGeneric => ({
                    beforeGeneric: beforeO[Comparator.Utils.Common.getName(afterGeneric)],
                    afterGeneric,
                }))
                .filter(options.compare)

            if (changed.length) {
                const changedMessage = changed
                    .map(x => x.afterGeneric.name)
                    .map(Comparator.Utils.Common.surroundWithQuotes)
                    .join(', ')
                return {
                    info: CHANGE_REGISTRY[options.changeCode],
                    signatures: { before, after },
                    message: `Added class generics: ${changedMessage}`,
                }
            }
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}
