import { Reducer } from 'declarative-js'
import toObject = Reducer.toObject
import flat = Reducer.flat

import { Snapshot, Signatures } from './Signatures'

import { Comparator } from './comparator/Comparators'
import Compare = Comparator.Compare
import ComparisonResult = Comparator.ComparisonResult
import ChangeCode = Comparator.ChangeCode

/**
 * Compares {@link Snapshot} of two different versions, producing {@link ComparisonResult}.
 *
 * @export
 * @class SnapshotComparator
 */
export class SnapshotProcessor {
    constructor(private comparators: Comparator.Comparator<ChangeCode, Signatures.MemberType>[]) {}

    compare(snapshots: Compare<Snapshot.Snapshot>): ComparisonResult {
        const versions: ComparisonResult['versions'] = {
            before: snapshots.before.version,
            after: snapshots.after.version,
        }

        const afterGrouped = snapshots.after.signatures.reduce(
            toObject(x => Signatures.toFulName(x.namespace, x.memberName)),
            {}
        )

        const changes = snapshots.before.signatures
            .map(before => ({
                before,
                after: afterGrouped[Signatures.toFulName(before.namespace, before.memberName)],
            }))
            .map(comparison => this.comparators.map(compare => compare(comparison)))
            .reduce(flat, [])
        return { versions, changes }
    }
}
