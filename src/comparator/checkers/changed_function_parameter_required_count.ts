import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import Common = Comparator.Utils.Common

export const changed_function_parameter_required_count = Common.comparatorFor.function(
    signatures => {
        const { after, before } = signatures
        const changed = Comparator.Utils.Parameters.getChangedRequired(
            before.parameters,
            after.parameters
        )
        if (changed.added.length || changed.removed.length) {
            const changedMessage = Comparator.Utils.Parameters.Message.getChangedRequired(changed)
            return {
                info: CHANGE_REGISTRY.changed_function_parameter_required_count,
                signatures,
                message: `Function required parameters count changed:${changedMessage}`,
            }
        }
    }
)
