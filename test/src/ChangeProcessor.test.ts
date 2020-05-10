import { Comparator } from '../../src/comparator/Comparators'
import { CHANGE_REGISTRY } from '../../src/comparator/ComparatorChangeRegistry'
import { ChangeProcessor } from '../../src/ChangeProcessor'

describe('ChangeProcessor', () => {
    const comparisonResult: Comparator.ComparisonResult = {
        versions: {
            after: '0.0.2',
            before: '0.0.1',
        },
        changes: [
            {
                info: CHANGE_REGISTRY.added_class_property,
                signatures: {
                    after: {
                        path: '/home/file.ts',
                        memberName: 'TEXT',
                        namespace: 'Constants',
                    },
                } as any,
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
    it('should update changes', () => {
        const status = 'compatible'
        const updateReason = 'Object is an spi parameter'
        const updater: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => c.info.memberType == 'class',
            updaterName: 'test',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([], [updater])
        const processed = changeProcessor.processChanges(comparisonResult)

        expect(processed).toHaveLength(1)
        expect(processed[0].isUpdated).toBeTruthy()
        expect(processed[0].isUpdated && processed[0].update).toBeDefined()
        expect(processed[0].isUpdated && processed[0].update.status).toBe(status)
        expect(processed[0].isUpdated && processed[0].update.updateReason).toBe(updateReason)
    })
    it('should not update changes', () => {
        const status = 'compatible'
        const updateReason = 'Object is an spi parameter'
        const updater: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => c.info.memberType != 'class',
            updaterName: 'test',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([], [updater])
        const processed = changeProcessor.processChanges(comparisonResult)

        expect(processed).toHaveLength(1)
        expect(processed[0].isUpdated).toBeFalsy()
    })
    it('should fail when more than one updater is applicable', () => {
        const status = 'compatible'
        const updateReason = 'Object is an spi parameter'
        const updater1: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => true,
            updaterName: 'test1',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const updater2: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => true,
            updaterName: 'test2',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([], [updater1, updater2])
        expect(() =>
            changeProcessor.processChanges(comparisonResult)
        ).toThrowErrorMatchingInlineSnapshot(
            `"2 updaters (test1, test2) are applicable for change 'added_class_property' for 'Constants.TEXT' in file '/home/file.ts'"`
        )
    })
    it('should fail when more than one updater is applicable and no after signature is present', () => {
        const status = 'compatible'
        const updateReason = 'Object is an spi parameter'
        const updater1: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => true,
            updaterName: 'test1',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const updater2: ChangeProcessor.ChangeUpdater = {
            isApplicable: c => true,
            updaterName: 'test2',
            update: () => ({
                status,
                updateReason,
            }),
        }
        const changeProcessor = new ChangeProcessor.ChangeProcessor([], [updater1, updater2])
        expect(() =>
            changeProcessor.processChanges({
                ...comparisonResult,
                changes: [
                    {
                        ...comparisonResult.changes[0],
                        signatures: {
                            after: undefined,
                        } as any,
                    },
                ],
            })
        ).toThrowErrorMatchingInlineSnapshot(
            `"2 updaters (test1, test2) are applicable for change 'added_class_property' "`
        )
    })
})
