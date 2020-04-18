import { Signatures } from '../../../App.types'
import { Comparator } from '../../Comparators'
import { CHANGE_REGISTRY } from '../../ComparatorChangeRegistry'

export function createMethodModifierChecker(options: {
    compareModifiers(m1: Signatures.AccessModifier, m2: Signatures.AccessModifier): boolean
    changeCode: Comparator.ChangeCode
}) {
    return function changed_method_modifier_more_visible({
        before,
        after,
    }: Comparator.CompareOpt<Signatures.SignatureType>): Comparator.Change<
        typeof options.changeCode
    > {
        if (after && after.memberType === 'class' && before.memberType === 'class') {
            const changed = Comparator.Utils.Methods.getCommonMethods(
                before.methods,
                after.methods,
                {
                    isApplicable: () => true,
                    resolveMethodKey: Comparator.Utils.Methods.ToStrings.name_parameters,
                }
            ).filter(p => options.compareModifiers(p.afterMethod.modifier, p.beforeMethod.modifier))
            if (changed.length) {
                const message = changed
                    .map(p => ({
                        name: Comparator.Utils.Methods.ToStrings.name_parameters(p.beforeMethod),
                        before: p.beforeMethod.modifier,
                        after: p.afterMethod.modifier,
                    }))
                    .map(p => `method '${p.name}' from '${p.before}' to '${p.after}'`)
                    .join('\n    ')
                return {
                    info: CHANGE_REGISTRY[options.changeCode],
                    signatures: { before, after },
                    message: `Methods changed access modifier:\n    ${message}`,
                }
            }
        }
        return {
            info: CHANGE_REGISTRY.no_change,
            signatures: { before, after },
        }
    }
}
