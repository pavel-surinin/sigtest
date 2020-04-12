import { Comparator, Signatures } from '../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function changed_required_constructor_parameters_count({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_required_constructor_parameters_count'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const beforeGCount = before.constructors[0].parameters.filter(g => !g.isOptional).length
        const afterGCount = after.constructors[0].parameters.filter(g => !g.isOptional).length
        if (beforeGCount !== afterGCount) {
            return {
                info: CHANGE_REGISTRY.changed_required_constructor_parameters_count,
                signatures: { before, after },
                message: `Constructor required generics count changed. Previous version had ${beforeGCount}, current ${afterGCount}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
