import { Comparator } from '../Comparators'
import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function added_class_property({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'added_class_property'> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
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
                signatures: { after, before },
                message: `Properties added: ${addedMessage}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
