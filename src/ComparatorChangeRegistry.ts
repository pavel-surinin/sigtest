import { Comparator } from './App.types'

export const CHANGE_REGISTRY: Record<
    Comparator.ChangeCode,
    Comparator.ChangeInfo<Comparator.ChangeCode>
> = {
    no_change: {
        code: 'no_change',
        description: 'Nothing is changed',
        action: 'none',
        status: 'compatible',
    },
    changed_member_type: {
        code: 'changed_member_type',
        description: 'Signature member type changed',
        action: 'changed',
        status: 'breaking',
    },
    member_removal: {
        action: 'removed',
        code: 'member_removal',
        description: 'Signature member removed from package',
        status: 'breaking',
    },
}
