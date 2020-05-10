import { Signatures } from './Signatures'
import { Comparator } from './comparator/Comparators'
import Change = Comparator.Change
import Compare = Comparator.Compare
import ComparisonResult = Comparator.ComparisonResult
import Status = Comparator.Status

export namespace ChangeProcessor {
    export interface WithUpdate extends WithUpdateFlag {
        isUpdated: true
        update: ChangeUpdate
    }

    export interface WithoutUpdate extends WithUpdateFlag {
        isUpdated: false
    }

    export type MaybeUpdated = WithUpdate | WithoutUpdate

    export interface WithVersions {
        versions: Compare<string>
    }

    export interface WithUpdateFlag {
        isUpdated: boolean
    }

    export type ProcessedChange = Change & WithVersions & MaybeUpdated
    export type ChangeUpdaterInput = Change & WithVersions

    export interface ChangeFilter {
        isApplicable(change: ProcessedChange): boolean
    }

    export interface ChangeUpdater {
        updaterName: string
        isApplicable(change: ChangeUpdaterInput): boolean
        update(change: ChangeUpdaterInput): ChangeUpdate
    }

    export interface ChangeUpdate {
        status: Status
        message?: string
        updateReason: string
    }

    /**
     * Processes {@link ComparisonResult} with provided {@link ChangeUpdater} and {@link ChangeFilter}
     * First it will update {@link Change}s, then filter them.
     *
     * @see {@link ChangeUpdater}
     * @see {@link ChangeFilter}
     * @export
     * @class ChangeProcessor
     */
    export class ChangeProcessor {
        constructor(
            private readonly changeFilters: ChangeFilter[],
            private readonly changeUpdaters: ChangeUpdater[]
        ) {}

        processChanges(changes: ComparisonResult) {
            // prepare changes
            const versionedChanges: ProcessedChange[] = changes.changes.map(c => ({
                ...c,
                versions: changes.versions,
                isUpdated: false,
            }))

            // update changes
            const changeFilterInputs: ProcessedChange[] = []
            for (const change of versionedChanges) {
                const applicableUpdaters = this.changeUpdaters.filter(updater =>
                    updater.isApplicable(change)
                )
                if (applicableUpdaters.length > 1) {
                    const forSignature = change.signatures.after
                        ? `for '${Signatures.toFulName(
                              change.signatures.after.namespace,
                              change.signatures.after.memberName
                          )}' `
                        : ''
                    const inFile = change.signatures.after
                        ? `in file '${change.signatures.after.path}'`
                        : ''
                    throw new Error(
                        `${applicableUpdaters.length} updaters (${applicableUpdaters
                            .map(updater => updater.updaterName)
                            .join(', ')}) are applicable for change '${
                            change.info.code
                        }' ${forSignature}${inFile}`
                    )
                } else if (applicableUpdaters.length == 1) {
                    const updater = applicableUpdaters[0]
                    const update = updater.update(change)
                    const updatedChange: ProcessedChange = {
                        ...change,
                        update,
                        isUpdated: true,
                    }
                    changeFilterInputs.push(updatedChange)
                } else {
                    changeFilterInputs.push(change)
                }
            }

            // filter changes
            return changeFilterInputs.filter(change =>
                this.changeFilters.every(filter => filter.isApplicable(change))
            )
        }
    }
}
