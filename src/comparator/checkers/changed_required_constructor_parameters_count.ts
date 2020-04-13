import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function changed_required_constructor_parameters_count({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_required_constructor_parameters_count'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const changed = Comparator.Utils.Parameters.getChangedRequired(
            before.constructors[0].parameters,
            after.constructors[0].parameters
        )
        if (changed.added.length || changed.removed.length) {
            const ra = Comparator.Utils.Parameters.Message.getChangedRequired(changed)
            return {
                info: CHANGE_REGISTRY.changed_required_constructor_parameters_count,
                signatures: { before, after },
                message: `Constructor required parameters count changed:${ra}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
