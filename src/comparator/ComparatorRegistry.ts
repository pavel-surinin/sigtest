import { Comparator } from './Comparators'

import { changed_member_type } from './checkers/changed-member-type'
import { member_removal } from './checkers/member_removal'
import { changed_required_constructor_parameters_count } from './checkers/changed_required_constructor_parameters_count'
import { changed_constructor_parameter_modifier_to_optional } from './checkers/changed_constructor_parameter_modifier_to_optional'
import { changed_constructor_parameter_modifier_to_required } from './checkers/changed_constructor_parameter_modifier_to_required'
import { changed_constructor_parameter_type } from './checkers/changed_constructor_parameter_type'
import { changed_constructor_parameter_type_union } from './checkers/changed_constructor_parameter_type_union'
import { changed_method_return_type } from './checkers/changed_method_return_type'
import { changed_method_return_type_union } from './checkers/changed_method_return_type_union'
import { changed_method_parameter_modifier_to_optional } from './checkers/changed_method_parameter_modifier_to_optional'
import { changed_method_parameter_modifier_to_required } from './checkers/changed_method_parameter_modifier_to_required'
import { changed_method_parameter_required_count } from './checkers/changed_method_parameter_required_count'

export type ComparatorRegistry = Record<
    Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>,
    Comparator.Comparator<Comparator.ChangeCode>
>

export const COMPARATOR_REGISTRY: ComparatorRegistry = {
    changed_member_type,
    member_removal,
    changed_required_constructor_parameters_count,
    changed_constructor_parameter_modifier_to_optional,
    changed_constructor_parameter_modifier_to_required,
    changed_constructor_parameter_type,
    changed_constructor_parameter_type_union,
    changed_method_return_type,
    changed_method_return_type_union,
    changed_method_parameter_modifier_to_optional,
    changed_method_parameter_modifier_to_required,
    changed_method_parameter_required_count,
}
