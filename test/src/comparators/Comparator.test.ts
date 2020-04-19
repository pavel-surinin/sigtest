import { Comparator } from '../../../src/comparator/Comparators'
import { Signatures } from '../../../src/App.types'
import { Reducer } from 'declarative-js'

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
        describe('getChangedRequired', () => {
            const getChangedRequired = Comparator.Utils.Parameters.getChangedRequired
            it('should find changed parameters', () => {
                const result = getChangedRequired(
                    [{ name: 'b', isOptional: false, type: 'any' }],
                    [{ name: 'a', isOptional: false, type: 'any' }]
                )
                expect(result.added).toHaveLength(1)
                expect(result.removed).toHaveLength(1)
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
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                            {
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
            it('should not common methods with function overload with custom key resolver', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                                name: 'sum',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                            {
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                                name: 'sum',
                                returnType: 'any',
                                parameters: [{ isOptional: false, type: 'any', name: 'p3' }],
                            },
                        ],
                        { resolveMethodKey: m => m.name }
                    )
                ).toHaveLength(2)
            })
            it('should find common methods', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
                                modifier: {
                                    access: 'protected' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
                                modifier: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
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
            it('should find common methods including private', () => {
                expect(
                    getCommonMethods(
                        [
                            {
                                modifier: {
                                    access: 'private' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                                name: 'div',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ],
                        [
                            {
                                modifier: {
                                    access: 'private' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                                name: 'div',
                                returnType: 'any',
                                parameters: [
                                    { isOptional: false, type: 'any', name: 'p1' },
                                    { isOptional: false, type: 'any', name: 'p2' },
                                ],
                            },
                        ],
                        { isApplicable: () => true }
                    )
                ).toHaveLength(1)
            })
        })
    })
    describe('Modifiers', () => {
        const isLessVisible = Comparator.Utils.Modifiers.isLessVisible
        const isMoreVisible = Comparator.Utils.Modifiers.isMoreVisible
        it('should compare to be less visible', () => {
            expect(isLessVisible('private', 'protected')).toBeTruthy()
            expect(isLessVisible('private', 'public')).toBeTruthy()
            expect(isLessVisible('protected', 'public')).toBeTruthy()
            expect(isLessVisible('public', 'public')).toBeFalsy()
        })
        it('should compare to be more visible', () => {
            expect(isMoreVisible('public', 'protected')).toBeTruthy()
            expect(isMoreVisible('public', 'private')).toBeTruthy()
            expect(isMoreVisible('protected', 'private')).toBeTruthy()
            expect(isMoreVisible('protected', 'protected')).toBeFalsy()
            expect(isMoreVisible('protected', 'public')).toBeFalsy()
        })
    })
    describe('ClassProperties', () => {
        describe('getCommonProperties', () => {
            const getCommonProperties = Comparator.Utils.ClassProperties.getCommonProperties
            it('should find common properties', () => {
                expect(
                    getCommonProperties(
                        [
                            {
                                type: 'any',
                                name: 'a',
                                modifiers: {
                                    access: 'private',
                                    usage: 'instance',
                                },
                            },
                            {
                                type: 'any',
                                name: 'b',
                                modifiers: {
                                    access: 'private',
                                    usage: 'static',
                                },
                            },
                            {
                                type: 'any',
                                name: 'c',
                                modifiers: {
                                    access: 'protected',
                                    usage: 'instance',
                                },
                            },
                        ],
                        [
                            {
                                type: 'any',
                                name: 'a',
                                modifiers: {
                                    access: 'private' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                            },
                            {
                                type: 'any',
                                name: 'a',
                                modifiers: {
                                    access: 'private' as Signatures.AccessModifier,
                                    usage: 'static' as Signatures.UsageModifier,
                                },
                            },
                            {
                                type: 'any',
                                name: 'c',
                                modifiers: {
                                    access: 'public' as Signatures.AccessModifier,
                                    usage: 'instance' as Signatures.UsageModifier,
                                },
                            },
                        ],
                        {
                            resolveKey: p => `${p.modifiers.usage} ${p.name}`,
                        }
                    )
                ).toHaveLength(2)
            })
        })
    })
    describe('Common', () => {
        describe('isIn', () => {
            const isIn = Comparator.Utils.Common.isIn
            it('should find common', () => {
                const v1: Signatures.ClassProperty[] = [
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test1',
                        type: 'any',
                    },
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test2',
                        type: 'any',
                    },
                ]
                const v2: Signatures.ClassProperty[] = [
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test1',
                        type: 'any',
                    },
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test3',
                        type: 'any',
                    },
                ]
                const obj = v1.reduce(
                    Reducer.toObject(x => x.name),
                    {}
                )
                expect(v2.filter(isIn(obj, x => x.name))).toHaveLength(1)
            })
        })
        describe('isNotIn', () => {
            const isNotIn = Comparator.Utils.Common.isNotIn
            it('should find common', () => {
                const v1: Signatures.ClassProperty[] = [
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test1',
                        type: 'any',
                    },
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test2',
                        type: 'any',
                    },
                ]
                const v2: Signatures.ClassProperty[] = [
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test1',
                        type: 'any',
                    },
                    {
                        modifiers: { access: 'private', usage: 'instance' },
                        name: 'test2',
                        type: 'any',
                    },
                ]
                const obj = v1.reduce(
                    Reducer.toObject(x => x.name),
                    {}
                )
                expect(v2.filter(isNotIn(obj, x => x.name))).toHaveLength(0)
            })
        })
    })
})
