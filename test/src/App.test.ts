import { CHANGE_REGISTRY } from '../../src/comparator/ComparatorChangeRegistry'

describe('CHANGE_REGISTRY', () => {
    it('should not modify ', () => {
        expect(() => (CHANGE_REGISTRY.added_class_property.action = 'none')).toThrow()
    })
})
