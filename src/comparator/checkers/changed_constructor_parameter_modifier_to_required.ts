import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function changed_constructor_parameter_modifier_to_required({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_constructor_parameter_modifier_to_required'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const changedParameters = Comparator.Utils.Parameters.getChangedToRequired(
            before.constructors[0].parameters,
            after.constructors[0].parameters
        )

        if (changedParameters.length) {
            return {
                info: CHANGE_REGISTRY.changed_constructor_parameter_modifier_to_required,
                signatures: { before, after },
                message: `Constructor parameters: ${changedParameters
                    .map(p => `'${p.name}'`)
                    .join(' and ')} became required`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
