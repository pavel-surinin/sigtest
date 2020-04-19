import { Comparator } from '../Comparators'
import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function changed_class_property_type({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_class_property_type'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const resolveKey = Comparator.Utils.ClassProperties.ToStrings.usage_name
        const obj = after.properties
            .filter(Comparator.Utils.ClassProperties.isNotPrivate)
            .reduce(Reducer.toObject(resolveKey), {})
        const changed = before.properties
            .filter(Comparator.Utils.ClassProperties.isNotPrivate)
            .filter(Comparator.Utils.Common.isIn(obj, resolveKey))
            .map(prop => ({
                name: resolveKey(prop),
                beforeType: prop.type,
                afterType: obj[resolveKey(prop)].type,
            }))
            .filter(x => !Comparator.Utils.Types.areCompatible(x.beforeType, x.afterType))
        if (changed.length) {
            const changedMessage = changed
                .map(x => `property '${x.name}' from '${x.beforeType}' to '${x.afterType}'`)
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY.changed_class_property_type,
                signatures: { after, before },
                message: `Properties changed type:\n    ${changedMessage}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
