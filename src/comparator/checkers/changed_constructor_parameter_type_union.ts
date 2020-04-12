import { Signatures } from '../../App.types'
import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Reducer } from 'declarative-js'

export function changed_constructor_parameter_type_union({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
    'changed_constructor_parameter_type_union'
> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const afterObj = after.constructors[0].parameters.reduce(
            Reducer.toObject(p => p.name),
            {}
        )
        const changedTypeParams = before.constructors[0].parameters
            .filter(p => Boolean(afterObj[p.name]))
            .map(beforeParam => ({ beforeParam, afterParam: afterObj[beforeParam.name] }))
            .filter(p => {
                const bUnionTypes = p.beforeParam.type.split('|').map(s => s.trim())
                const aUnionTypes = p.afterParam.type.split('|').map(s => s.trim())
                const isAllIncluded = bUnionTypes.every(ut => aUnionTypes.includes(ut))
                return isAllIncluded && bUnionTypes.length < aUnionTypes.length
            })

        if (changedTypeParams.length) {
            return {
                info: CHANGE_REGISTRY.changed_constructor_parameter_type_union,
                signatures: { before, after },
                message: `Constructor parameters: ${changedTypeParams
                    .map(p => `'${p.beforeParam.name}'`)
                    .join(', ')} changed types:\n    ${changedTypeParams
                    .map(
                        p =>
                            `parameter '${p.beforeParam.name}' before - '${p.beforeParam.type}', current - '${p.afterParam.type}'`
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
