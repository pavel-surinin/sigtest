import { Comparator } from '../../Comparators'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import Common = Comparator.Utils.Common
import { Reducer } from 'declarative-js'
import { Signatures } from '../../../App.types'

export type CreateOptReqModifierChangeComparatorOptions = {
    compare: (v0: boolean, v1: boolean) => boolean
    changeCode: Comparator.ChangeCode
    modifierName: string
}

export function createOptReqModifierChangeComparator(
    options: CreateOptReqModifierChangeComparatorOptions
) {
    return Common.comparatorFor.function(signatures => {
        const { after, before } = signatures
        const afterO = after.parameters.reduce(
            Reducer.toObject<Signatures.Parameter>(Common.getName),
            {}
        )
        const changed = before.parameters
            .filter(Common.isIn(afterO, Common.getName))
            .filter(bef => options.compare(bef.isOptional, afterO[Common.getName(bef)].isOptional))
        if (changed.length) {
            const changedMessage = Common.formatSequenceMessage(changed)
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Parameters changed to ${options.modifierName}: ${changedMessage}`,
            }
        }
    })
}
