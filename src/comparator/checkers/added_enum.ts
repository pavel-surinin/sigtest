import { Comparator } from '../Comparators'
import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export const added_enum = Comparator.Utils.Common.comparatorFor.enum(v => {
    const { after, before } = v
    const resolveKey = (x: Signatures.EnumValueDefinition) => x.name

    const o = before.values.reduce(Reducer.toObject(resolveKey), {})
    const changed = after.values.filter(Comparator.Utils.Common.isNotIn(o, resolveKey))
    if (changed.length) {
        const changedMessage = changed
            .map(resolveKey)
            .map(Comparator.Utils.Common.surroundWithQuotes)
            .join(', ')
        return {
            info: CHANGE_REGISTRY.added_enum,
            signatures: v,
            message: `Enum values added: ${changedMessage}`,
        }
    }
})
