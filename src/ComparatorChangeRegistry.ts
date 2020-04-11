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
        memberType: 'common',
    },
    changed_member_type: {
        code: 'changed_member_type',
        description: 'Signature member type changed',
        action: 'changed',
        status: 'breaking',
        memberType: 'common',
    },
    member_removal: {
        action: 'removed',
        code: 'member_removal',
        description: 'Signature member removed from package',
        status: 'breaking',
        memberType: 'common',
    },
    changed_required_constructor_parameters_count: {
        action: 'changed',
        code: 'changed_required_constructor_parameters_count',
        description: 'Required parameters count in constructor has changed',
        memberType: 'class',
        status: 'breaking',
    },
}
