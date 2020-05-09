import { Signatures } from '../../Signatures'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'

export function member_removal({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'member_removal'> {
    if (!after) {
        return {
            info: CHANGE_REGISTRY.member_removal,
            signatures: { before, after },
            message: `Member '${Signatures.toFulName(
                before.namespace,
                before.memberName
            )}' removed from package`,
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
