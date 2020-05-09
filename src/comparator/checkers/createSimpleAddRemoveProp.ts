import { Comparator } from '../Comparators'
import { CHANGE_REGISTRY } from '../ComparatorChangeRegistry'
import Common = Comparator.Utils.Common
import { Reducer } from 'declarative-js'
import { Signatures } from '../../Signatures'

export function createRemovedComparator<
    C extends Comparator.ChangeCode,
    T extends Signatures.MemberType,
    W extends Common.WithName,
    S extends Signatures.SignatureType<T>
>(
    options: {
        memberType: T
        changeCode: C
        elementsName: string
    } & Pick<FindChangedOptions<W, S>, 'getElements' | 'preFilter'>
) {
    return Common.areSignaturesTypeOf(options.memberType)(signatures => {
        const changed = findRemoved(signatures, {
            getElements: options.getElements as any,
        })
        if (changed.length) {
            const changedMessage = Common.formatSequenceMessage(changed)
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `${options.elementsName} removed: ${changedMessage}`,
            }
        }
    })
}

function findRemoved<T extends Common.WithName, S extends Signatures.SignatureType>(
    signatures: Comparator.Compare<S>,
    options: Pick<FindChangedOptions<T, S>, 'getElements' | 'preFilter'>
) {
    return findChanged({
        ...options,
        changeFilter: (aO, t) => Common.isNotIn(aO)(t),
        left: signatures.after,
        right: signatures.before,
    })
}

export function createAddedComparator<
    C extends Comparator.ChangeCode,
    T extends Signatures.MemberType,
    W extends Common.WithName,
    S extends Signatures.SignatureType<T>
>(
    options: {
        memberType: T
        changeCode: C
        elementsName: string
    } & Pick<FindChangedOptions<W, S>, 'getElements' | 'preFilter'> & {
            changeFilter?: ChangeFilter<W>
        }
) {
    return Common.areSignaturesTypeOf(options.memberType)(signatures => {
        const changed = findAdded(signatures, {
            getElements: options.getElements as any,
            changeFilter: options.changeFilter,
            preFilter: options.preFilter,
        })
        if (changed.length) {
            const changedMessage = Common.formatSequenceMessage(changed)
            return {
                info: CHANGE_REGISTRY[options.changeCode],
                signatures,
                message: `${options.elementsName} added: ${changedMessage}`,
            }
        }
    })
}

type ChangeFilter<T extends Common.WithName> = (aObj: Record<string, T>, el: T) => boolean

function findAdded<T extends Common.WithName, S extends Signatures.SignatureType>(
    signatures: Comparator.Compare<S>,
    options: Pick<FindChangedOptions<T, S>, 'getElements' | 'preFilter'> & {
        changeFilter?: ChangeFilter<T>
    }
) {
    function defaultChangFilter(aO: Record<string, T>, t: T) {
        return Common.isNotIn(aO)(t)
    }
    return findChanged({
        ...options,
        changeFilter: options.changeFilter || defaultChangFilter,
        left: signatures.before,
        right: signatures.after,
    })
}

type FindChangedOptions<W extends Common.WithName, S extends Signatures.SignatureType> = {
    left: S
    right: S
    getElements: (s: S) => W[]
    preFilter?: (el: W) => boolean
    changeFilter: ChangeFilter<W>
}

function findChanged<T extends Common.WithName, S extends Signatures.SignatureType>(
    options: FindChangedOptions<T, S>
) {
    function defaultPreFilter(t: T) {
        return true
    }
    const preFilter = options.preFilter || defaultPreFilter
    const aO = (options.getElements(options.left) || [])
        .filter(preFilter)
        .reduce(Reducer.toObject<T>(Common.getName), {})
    const changed = (options.getElements(options.right) || [])
        .filter(preFilter)
        .filter(t => options.changeFilter(aO, t))
    return changed
}
