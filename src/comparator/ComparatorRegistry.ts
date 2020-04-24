import { Comparator } from './Comparators'

import {
    createMethodModifierChecker,
    createPropertyModifierChecker,
} from './checkers/reusable/changed_modifier.reusable'
import {
    createChangeTypeChecker,
    createClassGenericChangeTypeChecker,
} from './checkers/reusable/changed_type.reusable'
import { createChangeWriteChecker } from './checkers/reusable/changed_class_property_write.reusable'
import { createAddedClassGenericTypeChecker } from './checkers/reusable/added_generic_type.reusable'

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
import { added_method } from './checkers/added_method'
import { removed_method } from './checkers/removed_method'
import { removed_class_property } from './checkers/removed_class_property'
import { added_class_property } from './checkers/added_class_property'
import { removed_generic } from './checkers/removed_generic'

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
    added_method,
    removed_method,
    changed_method_modifier_more_visible: createMethodModifierChecker({
        changeCode: 'changed_method_modifier_more_visible',
        compareModifiers: Comparator.Utils.Modifiers.isMoreVisible,
    }),
    changed_method_modifier_less_visible: createMethodModifierChecker({
        changeCode: 'changed_method_modifier_less_visible',
        compareModifiers: Comparator.Utils.Modifiers.isLessVisible,
    }),
    changed_property_modifier_less_visible: createPropertyModifierChecker({
        changeCode: 'changed_property_modifier_less_visible',
        compareModifiers: Comparator.Utils.Modifiers.isLessVisible,
    }),
    changed_property_modifier_more_visible: createPropertyModifierChecker({
        changeCode: 'changed_property_modifier_more_visible',
        compareModifiers: Comparator.Utils.Modifiers.isMoreVisible,
    }),
    removed_class_property,
    added_class_property,
    changed_class_property_type: createChangeTypeChecker({
        changeCode: 'changed_class_property_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_class_property_type_union: createChangeTypeChecker({
        changeCode: 'changed_class_property_type_union',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    changed_class_property_to_readonly: createChangeWriteChecker({
        changeCode: 'changed_class_property_to_readonly',
        compareWriteModifiers: Comparator.Utils.Modifiers.isNotReadOnlyCompatible,
    }),
    changed_class_property_to_not_readonly: createChangeWriteChecker({
        changeCode: 'changed_class_property_to_not_readonly',
        compareWriteModifiers: Comparator.Utils.Modifiers.isReadOnlyCompatible,
    }),
    added_optional_generic: createAddedClassGenericTypeChecker({
        changeCode: 'added_optional_generic',
        compare: Comparator.Utils.Generics.addedOptional,
    }),
    added_required_generic: createAddedClassGenericTypeChecker({
        changeCode: 'added_required_generic',
        compare: Comparator.Utils.Generics.addedRequired,
    }),
    removed_generic,
    changed_generic_extends_type: createClassGenericChangeTypeChecker({
        changeCode: 'changed_generic_extends_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_generic_extends_type_to_less_strict: createClassGenericChangeTypeChecker({
        changeCode: 'changed_generic_extends_type_to_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
}
