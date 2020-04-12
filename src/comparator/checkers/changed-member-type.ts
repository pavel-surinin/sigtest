import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'

export function changed_member_type({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'changed_member_type'> {
    if (after) {
        if (before.memberType != after.memberType) {
            return {
                info: CHANGE_REGISTRY.changed_member_type,
                signatures: { before, after },
                message: `Member type changed from '${before.memberType}' to '${after.memberType}'`,
            }
        } else {
            return {
                info: CHANGE_REGISTRY.no_change,
                signatures: { before, after },
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
