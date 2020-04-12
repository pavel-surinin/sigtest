import { Comparator } from '../../../src/comparator/Comparators'

describe('Comparator.Utils', () => {
    describe('Types', () => {
        describe('areCompatible', () => {
            it('should return true for v1 union', () => {
                expect(
                    Comparator.Utils.Types.areCompatible('string', 'string | number')
                ).toBeTruthy()
            })
            it('should return true for v0 and v1 union', () => {
                expect(
                    Comparator.Utils.Types.areCompatible(
                        'string | number',
                        'string | number | Date '
                    )
                ).toBeTruthy()
            })
            it('should return false for v1 union', () => {
                expect(
                    Comparator.Utils.Types.areCompatible(
                        'string | number | Date ',
                        'string | number'
                    )
                ).toBeFalsy()
            })
            it('should return false for v0 AND v1 union', () => {
                expect(
                    Comparator.Utils.Types.areCompatible('string & number', 'string | number')
                ).toBeFalsy()
            })
            it('should return true for v1 any', () => {
                expect(Comparator.Utils.Types.areCompatible('string & number', 'any')).toBeTruthy()
            })
            it('should return false for v0 any', () => {
                expect(Comparator.Utils.Types.areCompatible('any', 'string')).toBeFalsy()
            })
            it('should return false for v0 v1 any', () => {
                expect(Comparator.Utils.Types.areCompatible('any', 'any')).toBeTruthy()
            })
        })
    })
})
