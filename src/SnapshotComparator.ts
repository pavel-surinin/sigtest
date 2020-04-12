import { Reducer } from 'declarative-js'
import toObject = Reducer.toObject
import flat = Reducer.flat
import { Snapshot, Signatures } from './App.types'

import { Comparator } from './comparator/Comparators'
import Compare = Comparator.Compare
import ComparisonResult = Comparator.ComparisonResult
import ChangeCode = Comparator.ChangeCode

// prev version or explicit, current version
// snapshot v1, snapshot current
// diff
// report
export function compareSnapshots(
    snapshots: Compare<Snapshot.Snapshot>,
    comparators: Comparator.Comparator<ChangeCode>[]
): ComparisonResult {
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
        .map(comparison => comparators.map(compare => compare(comparison)))
        .reduce(flat, [])

    return { versions, changes }
}
