import { Signatures } from '../../App.types'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import { Comparator } from '../Comparators'
import { Reducer } from 'declarative-js'
import Methods = Comparator.Utils.Methods

export function added_method({
    before,
    after,
}: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<'added_method'> {
    if (after && after.memberType === 'class' && before.memberType === 'class') {
        const beforeM = before.methods
            .filter(m => m.modifier !== 'private')
            .reduce(
                Reducer.groupBy(m => m.name),
                Reducer.Map()
            )
        const afterM = after.methods
            .filter(m => m.modifier !== 'private')
            .reduce(
                Reducer.groupBy(m => m.name),
                Reducer.Map()
            )
        const added = afterM
            .entries()
            .map(entry => {
                if (!beforeM.containsKey(entry.key)) {
                    return { name: entry.value[0].name, methods: afterM.get(entry.key)! }
                }
                const bms = beforeM.get(entry.key)!
                const ams = afterM.get(entry.key)!
                if (bms.length < ams.length) {
                    const now = ams.reduce(
                        Reducer.toObject(
                            Methods.ToStrings.modifier_name_parameters,
                            m => m,
                            // for overloaded methods
                            // key will be the same
                            // if duplicated set first
                            (a, b) => a
                        ),
                        {}
                    )
                    // remove prev methods
                    bms.map(Methods.ToStrings.modifier_name_parameters).forEach(
                        key => delete now[key]
                    )
                    return { name: entry.value[0].name, methods: Object.values(now) }
                }
                return { name: entry.value[0].name, methods: [] }
            })
            .filter(p => p.methods.length)
            .map(m => m.methods)
            .reduce(Reducer.flat, [])
            .map(Methods.ToStrings.modifier_name_parameters)
        if (added.length) {
            return {
                info: CHANGE_REGISTRY.added_method,
                signatures: { after, before },
                message: `Methods added:\n    ${added.join('\n    ')}`,
            }
        }
    }
    return {
        info: CHANGE_REGISTRY.no_change,
        signatures: { before, after },
    }
}
