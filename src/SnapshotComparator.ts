import { Snapshot, Comparator } from './App.types'
import { Reducer } from 'declarative-js'
import toObject = Reducer.toObject
import flat = Reducer.flat

import Compare = Comparator.Compare
import ComparisonResult = Comparator.ComparisonResult
import SignatureComparator = Comparator.SignatureComparator

// prev version or explicit, current version
// snapshot v1, snapshot current
// diff
// report
export function compareSnapshots(
    snapshots: Compare<Snapshot.Snapshot>,
    comparators: SignatureComparator[]
): ComparisonResult {
    const versions: ComparisonResult['versions'] = {
        before: snapshots.before.version,
        after: snapshots.after.version,
    }

    const afterGrouped = snapshots.after.signatures.reduce(
        toObject(x => x.memberName),
        {}
    )

    const changes = snapshots.before.signatures
        .map(before => ({ before, after: afterGrouped[before.memberName] }))
        .map(comparison => comparators.map(compare => compare(comparison)))
        .reduce(flat, [])

    return { versions, changes }
}
