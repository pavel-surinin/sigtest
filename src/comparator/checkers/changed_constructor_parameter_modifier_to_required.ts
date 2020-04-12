import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function changed_constructor_parameter_modifier_to_required({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_constructor_parameter_modifier_to_required'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        // find required params after
        const afterOptsObj = after.constructors[0].parameters
            .filter(g => !g.isOptional)
            .reduce(
                Reducer.toObject(p => p.name),
                {}
            )
        // find changed parameters
        const changedParameters = before.constructors[0].parameters
            .filter(g => g.isOptional)
            .filter(p => Boolean(afterOptsObj[p.name]))

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