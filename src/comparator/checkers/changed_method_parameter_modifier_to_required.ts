import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function changed_method_parameter_modifier_to_required({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_method_parameter_modifier_to_required'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const changedMethods = Comparator.Utils.Methods.getCommonMethods(
            before.methods,
            after.methods
        )
            .map(p => ({
                method: p.beforeMethod,
                changedParameters: Comparator.Utils.Parameters.getChangedToRequired(
                    p.beforeMethod.parameters,
                    p.afterMethod.parameters
                ),
            }))
            .filter(r => Boolean(r.changedParameters.length))
        if (changedMethods.length) {
            return {
                info: CHANGE_REGISTRY.changed_method_parameter_modifier_to_required,
                signatures: { before, after },
                message: `Method parameters changed from optional to required:\n    ${changedMethods
                    .map(
                        m =>
                            `method '${m.method.name}' parameters: ${m.changedParameters
                                .map(p => `'${p.name}'`)
                                .join(', ')}`
                    )
                    .join('\n    ')}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
