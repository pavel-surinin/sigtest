import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function changed_method_parameter_modifier_to_optional({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_method_parameter_modifier_to_optional'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        function methodKey(method: Signatures.MethodDefinition): string {
            return `${method.name}:${method.parameters.map(p => p.name).join(',')}`
        }
        const afterMethods = after.methods
            .filter(method => method.modifier !== 'private')
            .reduce(Reducer.toObject(methodKey), {})
        const changedMethods = before.methods
            .filter(method => method.modifier !== 'private')
            .map(beforeMethod => ({
                beforeMethod,
                afterMethod: afterMethods[methodKey(beforeMethod)],
            }))
            .filter(p => Boolean(p.afterMethod))
            .map(p => ({
                method: p.beforeMethod,
                changedParameters: Comparator.Utils.Parameters.getChangedToOptional(
                    p.beforeMethod.parameters,
                    p.afterMethod.parameters
                ),
            }))
            .filter(r => Boolean(r.changedParameters.length))
        if (changedMethods.length) {
            return {
                info: CHANGE_REGISTRY.changed_method_parameter_modifier_to_optional,
                signatures: { before, after },
                message: `Method parameters changed from required to optional:\n    ${changedMethods
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
