import { Comparator } from '../../Comparators'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'
import Common = Comparator.Utils.Common
import { Reducer } from 'declarative-js'
import { Signatures } from '../../../Signatures'

export type CreateOptReqModifierChangeComparatorOptions = {
    compare: (v0: boolean, v1: boolean) => boolean
    changeCode: Comparator.ChangeCode
    modifierName: string
}

export function createOptReqModifierChangeComparator(
    options: CreateOptReqModifierChangeComparatorOptions
) {
    return Common.comparatorFor.function(signatures => {
        const { after, before } = signatures
        const afterO = after.parameters.reduce(
            Reducer.toObject<Signatures.Parameter>(Common.getName),
            {}
        )
        const changed = before.parameters
            .filter(Common.isIn(afterO, Common.getName))
            .filter(bef => options.compare(bef.isOptional, afterO[Common.getName(bef)].isOptional))
        if (changed.length) {
            const changedMessage = Common.formatSequenceMessage(changed)
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Parameters changed to ${options.modifierName}: ${changedMessage}`,
            }
        }
    })
}

export function createInterfaceCallbleOptReqModifierChangeComparator(options: {
    compare: (
        v0Params: Signatures.Parameter[],
        v1Params: Signatures.Parameter[]
    ) => Signatures.Parameter[]
    changeCode: Comparator.ChangeCode
    modifierName: string
}) {
    return Common.comparatorFor.interface(signatures => {
        const { after, before } = signatures
        const toNamed = Comparator.Utils.Interface.callableTypeToNamed(
            Comparator.Utils.Functions.ToString.toParameters
        )
        const afterO = after.callableTypes.map(toNamed).reduce(Reducer.toObject(Common.getName), {})
        const changed = before.callableTypes
            .map(toNamed)
            .filter(Common.isIn(afterO))
            .map(beforeCallable => ({
                afterCallable: afterO[beforeCallable.name],
                beforeCallable,
                changed: options.compare(
                    beforeCallable.parameters,
                    afterO[beforeCallable.name].parameters
                ),
            }))
            .filter(r => r.changed.length)
        if (changed.length) {
            const changedMessage = changed
                .map(
                    param =>
                        `callable ${param.afterCallable.name} parameters: ${param.changed
                            .map(Common.getName)
                            .map(Common.surroundWithQuotes)
                            .join(', ')}`
                )
                .join('\n    ')
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `Parameters changed to ${options.modifierName} in:\n    ${changedMessage}`,
            }
        }
    })
}
