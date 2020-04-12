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
    changed_constructor_parameter_modifier_to_optional: {
        action: 'changed',
        code: 'changed_constructor_parameter_modifier_to_optional',
        description: 'Constructor parameter became optional',
        memberType: 'class',
        status: 'compatible',
    },
    changed_constructor_parameter_modifier_to_required: {
        action: 'changed',
        code: 'changed_constructor_parameter_modifier_to_required',
        description: 'Constructor paramter became required',
        memberType: 'class',
        status: 'breaking',
    },
    changed_constructor_parameter_type: {
        action: 'changed',
        code: 'changed_constructor_parameter_type',
        description: 'Constructor parameter type changed',
        memberType: 'class',
        status: 'breaking',
    },
}
