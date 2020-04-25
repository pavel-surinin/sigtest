import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export const added_class_property = Comparator.Utils.Common.comparatorFor.class(s => {
    const { after, before } = s
    const resolveKey = Comparator.Utils.ClassProperties.ToStrings.usage_name
    const obj = before.properties
        .filter(Comparator.Utils.ClassProperties.isNotPrivate)
        .reduce(Reducer.toObject(resolveKey), {})
    const added = after.properties
        .filter(Comparator.Utils.ClassProperties.isNotPrivate)
        .filter(Comparator.Utils.Common.isNotIn(obj, resolveKey))
    if (added.length) {
        const addedMessage = added
            .map(resolveKey)
            .map(x => `'${x}'`)
            .join(', ')
        return {
            info: CHANGE_REGISTRY.added_class_property,
            signatures: s,
            message: `Properties added: ${addedMessage}`,
        }
    }
})
