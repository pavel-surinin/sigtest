import { Comparator } from '../../src/comparator/Comparators'
import Change = Comparator.Change
import Compare = Comparator.Compare
import ComparisonResult = Comparator.ComparisonResult
import Status = Comparator.Status

import { Signatures } from '../../src/Signatures'
import { CHANGE_REGISTRY } from '../../src/comparator/ComparatorChangeRegistry'

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
                        ? ` for ${Signatures.toFulName(
                              change.signatures.after.namespace,
                              change.signatures.after.memberName
                          )} `
                        : ''
                    const inFile = change.signatures.after
                        ? ` in file ${change.signatures.after.path} `
                        : ''
                    throw new Error(
                        `Change '${
                            change.info.code
                        }'${forSignature}${inFile} tries to update changes with ${
                            applicableUpdaters.length
                        } updaters: ${applicableUpdaters
                            .map(updater => updater.updaterName)
                            .join(', ')}`
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

describe('ChangeProcessor', () => {
    const comparisonResult = {
        versions: {
            after: '0.0.2',
            before: '0.0.1',
        },
        changes: [
            {
                info: CHANGE_REGISTRY.added_class_property,
                signatures: {} as any,
                message: 'Message',
            },
        ],
    }
    it('should pass through changes', () => {
        const changeProcessor = new ChangeProcessor.ChangeProcessor([], [])
        const processed = changeProcessor.processChanges(comparisonResult)

        expect(processed).toHaveLength(1)
        expect(processed[0].info).toBe(CHANGE_REGISTRY.added_class_property)
        expect(processed[0].isUpdated).toBe(false)
        expect(processed[0].message).toBe('Message')
        expect(processed[0].versions.before).toBe('0.0.1')
        expect(processed[0].versions.after).toBe('0.0.2')
    })
    it('should remove changes with one n/a filter', () => {
        const notCode: ChangeProcessor.ChangeFilter = {
            isApplicable: c => c.info.code !== 'added_class_property',
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([notCode], [])
        const processed = changeProcessor.processChanges(comparisonResult)

        expect(processed).toHaveLength(0)
    })
    it('should remove changes with one applicable and one n/a filter', () => {
        const notCode: ChangeProcessor.ChangeFilter = {
            isApplicable: c => c.info.code !== 'added_class_property',
        }
        const onlyClass: ChangeProcessor.ChangeFilter = {
            isApplicable: c => c.info.memberType == 'class',
        }

        const changeProcessor = new ChangeProcessor.ChangeProcessor([notCode, onlyClass], [])
        const processed = changeProcessor.processChanges(comparisonResult)
        expect(processed).toHaveLength(0)
    })
    it('should not remove changes with one applicable', () => {
        const onlyClass: ChangeProcessor.ChangeFilter = {
            isApplicable: c => c.info.memberType == 'class',
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([onlyClass], [])
        const processed = changeProcessor.processChanges(comparisonResult)

        expect(processed).toHaveLength(comparisonResult.changes.length)
    })
    it.todo('should update changes')
    it.todo('should not update changes')
    it.todo('should fail when more than one updater is applicable')
})
