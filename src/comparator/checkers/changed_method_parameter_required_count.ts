import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'

export function changed_method_parameter_required_count({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_method_parameter_required_count'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const message = Comparator.Utils.Methods.getCommonMethods(before.methods, after.methods, {
            resolveMethodKey: method => method.name,
        })
            .map(p => ({
                name: p.beforeMethod.name,
                changed: Comparator.Utils.Parameters.getChangedRequired(
                    p.beforeMethod.parameters,
                    p.afterMethod.parameters
                ),
            }))
            .filter(p => p.changed.added.length || p.changed.removed.length)
            .map(
                p =>
                    `method '${p.name}':${Comparator.Utils.Parameters.Message.getChangedRequired(
                        p.changed,
                        8
                    )}`
            )
            .join('\n    ')
        if (message) {
            return {
                info: CHANGE_REGISTRY.changed_method_parameter_required_count,
                signatures: { before, after },
                message: `Method required parameters changed:\n    ${message}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
