import { Comparator } from '../../../src/comparator/Comparators'

describe('Comparator.Utils', () => {
    describe('Types', () => {
        describe('areCompatible', () => {
            const areCompatible = Comparator.Utils.Types.areCompatible
            it('should return true for v1 union', () => {
                expect(areCompatible('string', 'string | number')).toBeTruthy()
            })
            it('should return true for equal types', () => {
                expect(areCompatible('string', 'string | number')).toBeTruthy()
            })
            it('should return true for v0 and v1 union', () => {
                expect(areCompatible('string | number', 'string | number | Date ')).toBeTruthy()
            })
            it('should return false for v1 union', () => {
                expect(areCompatible('string | number | Date ', 'string | number')).toBeFalsy()
            })
            it('should return false for v0 AND v1 union', () => {
                expect(areCompatible('string & number', 'string | number')).toBeFalsy()
            })
            it('should return true for v1 any', () => {
                expect(areCompatible('string & number', 'any')).toBeTruthy()
            })
            it('should return false for v0 any', () => {
                expect(areCompatible('any', 'string')).toBeFalsy()
            })
            it('should return false for v0 v1 any', () => {
                expect(areCompatible('any', 'any')).toBeTruthy()
            })
        })
        describe('isMoreApplicable', () => {
            const isMoreApplicable = Comparator.Utils.Types.isMoreApplicable
            it('should check v1 union type', () => {
                expect(isMoreApplicable('string', 'string|number')).toBeTruthy()
                expect(isMoreApplicable('string|number', 'string |  number  | Date')).toBeTruthy()
            })
            it('should check v0 union type', () => {
                expect(isMoreApplicable('string | number | Date', 'number  |Date')).toBeFalsy()
            })
            it('should check v1 any', () => {
                expect(isMoreApplicable('string | number', 'any')).toBeTruthy()
                expect(isMoreApplicable('string', 'any')).toBeTruthy()
            })
            it('should check v0 any', () => {
                expect(isMoreApplicable('any', 'string')).toBeFalsy()
                expect(isMoreApplicable('any', 'string | number')).toBeFalsy()
            })
            it('should check equal types', () => {
                expect(isMoreApplicable('any', 'any')).toBeFalsy()
                expect(isMoreApplicable('string', 'string ')).toBeFalsy()
                expect(isMoreApplicable('string|number', 'string  | number')).toBeFalsy()
            })
        })
    })
    describe('Parameters', () => {
        describe('getChangedToOptional', () => {
            const getChangedToOptional = Comparator.Utils.Parameters.getChangedToOptional
            it('should find changed to optional parameters', () => {
                expect(
                    getChangedToOptional(
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ],
                        [
                            { name: 'a', isOptional: true, type: 'any' },
                            { name: 'a', isOptional: false, type: 'any' },
                        ]
                    )
                ).toHaveLength(1)
            })
            it('should find 2 changed to optional parameters', () => {
                expect(
                    getChangedToOptional(
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ],
                        [
                            { name: 'a', isOptional: true, type: 'any' },
                            { name: 'b', isOptional: true, type: 'any' },
                        ]
                    )
                ).toHaveLength(2)
            })
            it('should find 0 changed to optional parameters', () => {
                expect(
                    getChangedToOptional(
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ],
                        []
                    )
                ).toHaveLength(0)
            })
        })
        describe('getChangedToRequired', () => {
            const getChangedToRequired = Comparator.Utils.Parameters.getChangedToRequired
            it('should find changed to required parameters', () => {
                expect(
                    getChangedToRequired(
                        [
                            { name: 'a', isOptional: true, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ],
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ]
                    )
                ).toHaveLength(1)
            })
            it('should find 2 changed to required parameters', () => {
                expect(
                    getChangedToRequired(
                        [
                            { name: 'a', isOptional: true, type: 'any' },
                            { name: 'b', isOptional: true, type: 'any' },
                        ],
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ]
                    )
                ).toHaveLength(2)
            })
            it('should find 0 changed to optional parameters', () => {
                expect(
                    getChangedToRequired(
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ],
                        []
                    )
                ).toHaveLength(0)
                expect(
                    getChangedToRequired(
                        [],
                        [
                            { name: 'a', isOptional: false, type: 'any' },
                            { name: 'b', isOptional: false, type: 'any' },
                        ]
                    )
                ).toHaveLength(0)
                expect(getChangedToRequired([], [])).toHaveLength(0)
            })
        })
    })
    describe('Methods', () => {
        describe('getCommonMethods', () => {
            const getCommonMethods = Comparator.Utils.Methods.getCommonMethods
            it('should find common methods with function overload', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                    { isOptional: false, type: 'any', name: 'p3' },
                                ],
                            },
                        ],
                        [
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                    { isOptional: false, type: 'any', name: 'p3' },
                                ],
                            },
                        ]
                    )
                ).toHaveLength(1)
            })
            it('should find common methods', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ],
                        [
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ]
                    )
                ).toHaveLength(1)
            })
            it('should not find common methods when access modifier changed', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: 'protected',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ],
                        [
                            {
                                modifier: 'public',
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ]
                    )
                ).toHaveLength(0)
            })
        })
    })
})
