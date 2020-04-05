import { Comparator, Signatures } from './App.types'
import { CHANGE_REGISTRY } from './ComparatorChangeMessage'

function compareByType({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change {
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

export const comparators: Comparator.SignatureComparator[] = [compareByType]
