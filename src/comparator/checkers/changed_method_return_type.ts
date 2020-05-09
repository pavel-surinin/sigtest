import { Reducer } from 'declarative-js'
import { Signatures } from '../../Signatures'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'

export function changed_method_return_type({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_method_return_type'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const afterObj = after.methods.filter(Comparator.Utils.Methods.isNotPrivate).reduce(
            Reducer.toObject(method => method.name),
            {}
        )
        const methodReturnTypes = before.methods
            .filter(Comparator.Utils.Methods.isNotPrivate)
            .filter(method => Boolean(afterObj[method.name]))
            .map(beforeMethod => ({ beforeMethod, afterMethod: afterObj[beforeMethod.name] }))
            .filter(
                method =>
                    !Comparator.Utils.Types.areCompatible(
                        method.beforeMethod.returnType,
                        method.afterMethod.returnType
                    )
            )

        if (methodReturnTypes.length) {
            return {
                info: CHANGE_REGISTRY.changed_method_return_type,
                signatures: { before, after },
                message: `Method: ${methodReturnTypes
                    .map(m => `'${m.beforeMethod.name}'`)
                    .join(', ')} changed return types:\n    ${methodReturnTypes
                    .map(
                        p =>
                            `method '${p.beforeMethod.name}' before - '${p.beforeMethod.returnType}', current - '${p.afterMethod.returnType}'`
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
