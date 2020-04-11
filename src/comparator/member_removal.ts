import { Comparator, Signatures } from '../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function member_removal({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'member_removal'> {
    if (!after) {
        return {
            info: CHANGE_REGISTRY.member_removal,
            signatures: { before, after },
            message: `Member '${
                before.namespace ? before.namespace + '.' + before.memberName : before.memberName
            }' removed from package`,
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
