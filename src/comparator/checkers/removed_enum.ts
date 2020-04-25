import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'
import Common = Comparator.Utils.Common

export const removed_enum = Common.comparatorFor.enum(signatures => {
    const { after, before } = signatures
    const o = after.values.reduce(Reducer.toObject(Common.getName), {})
    const changed = before.values.filter(Common.isNotIn(o, Common.getName))
    if (changed.length) {
        const changedMessage = Common.formatSequenceMessage(changed)
        return {
            info: CHANGE_REGISTRY.removed_enum,
            signatures,
            message: `Removed enum values: ${changedMessage}`,
        }
    }
})
