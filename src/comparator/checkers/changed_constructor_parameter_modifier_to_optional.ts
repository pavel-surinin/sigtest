import { Signatures } from '../../Signatures'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'

export function changed_constructor_parameter_modifier_to_optional({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_constructor_parameter_modifier_to_optional'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const changedParameters = Comparator.Utils.Parameters.getChangedToOptional(
            before.constructors[0].parameters,
            after.constructors[0].parameters
        )

        if (changedParameters.length) {
            return {
                info: CHANGE_REGISTRY.changed_constructor_parameter_modifier_to_optional,
                signatures: { before, after },
                message: `Constructor parameters: ${changedParameters
                    .map(p => `'${p.name}'`)
                    .join(' and ')} became optional`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
