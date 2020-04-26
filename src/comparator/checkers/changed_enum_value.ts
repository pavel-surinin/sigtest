import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import Common = Comparator.Utils.Common
import { Reducer } from 'declarative-js'
import { Signatures } from '../../App.types'

export const changed_enum_value = Common.comparatorFor.enum(signatures => {
    const { after, before } = signatures
    const afterO = after.values.reduce(
        Reducer.toObject<Signatures.EnumValueDefinition>(Common.getName),
        {}
    )
    const changed = before.values
        .filter(Common.isIn(afterO, Common.getName))
        .filter(v => v.value !== afterO[Common.getName(v)].value)
    if (changed.length) {
        const changedMessage = changed
            .map(change => ({
                from: change.value,
                to: afterO[Common.getName(change)].value,
                name: before.memberName + '.' + change.name,
            }))
            .map(t => `'${t.name}' from '${t.from}' to '${t.to}'`)
            .join('\n    ')
        return {
            info: CHANGE_REGISTRY.changed_enum_value,
            signatures,
            message: `Enum changed values:\n    ${changedMessage}`,
        }
    }
})
