import { Comparator, Signatures } from '../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function C001({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'C001'> {
    if (after) {
        if (before.memberType != after.memberType) {
            return {
                info: CHANGE_REGISTRY.C001,
                signatures: { before, after },
                message: `Member type changed from '${before.memberType}' to '${after.memberType}'`,
            }
        } else {
            return {
                info: CHANGE_REGISTRY.C000,
                signatures: { before, after },
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.C000,
        signatures: { before, after },
    }
}
