import { Signatures } from '../App.types'
import { Comparator } from './Comparators'

import {
    createMethodModifierChecker,
    createPropertyModifierChecker,
} from './checkers/reusable/changed_modifier.reusable'
import {
    createChangeTypeChecker,
    createConstantChangeTypeChecker,
    createFunctionReturnTypeChangeChecker,
    createFunctionParamsTypeChangeChecker,
    createGenericTypeChecker,
    createInterfacePropsTypeChangeChecker,
    createInterfaceCallableTypeChangeChecker,
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
import { changed_enum_value } from './checkers/changed_enum_value'
import {
    createOptReqModifierChangeComparator,
    createInterfaceCallbleOptReqModifierChangeComparator,
} from './checkers/reusable/opt_req_modifier.reusable'
import { changed_function_parameter_required_count } from './checkers/changed_function_parameter_required_count'

import {
    createRemovedComparator,
    createAddedComparator,
} from './checkers/createSimpleAddRemoveProp'

export type ComparatorRegistry = Record<
    Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>,
    Comparator.Comparator<Comparator.ChangeCode, Signatures.MemberType>
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
    removed_generic: createRemovedComparator({
        changeCode: 'removed_generic',
        elementsName: 'Generic type',
        memberType: 'class',
        getElements: x => x.generics,
    }),
    changed_generic_extends_type: createGenericTypeChecker({
        changeCode: 'changed_generic_extends_type',
        memberType: 'class',
        getGeneric: x => x.generics,
        compare: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_generic_extends_type_to_less_strict: createGenericTypeChecker({
        changeCode: 'changed_generic_extends_type_to_less_strict',
        memberType: 'class',
        getGeneric: x => x.generics,
        compare: Comparator.Utils.Types.areMoreApplicable,
    }),
    changed_constant_type: createConstantChangeTypeChecker({
        changeCode: 'changed_constant_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_constant_type_to_less_strict: createConstantChangeTypeChecker({
        changeCode: 'changed_constant_type_to_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    added_enum: createAddedComparator({
        changeCode: 'added_enum',
        elementsName: 'Enum value',
        memberType: 'enum',
        getElements: x => x.values,
    }),
    removed_enum: createRemovedComparator({
        memberType: 'enum',
        changeCode: 'removed_enum',
        elementsName: 'Enum value',
        getElements: x => x.values,
    }),
    changed_enum_value,
    changed_function_return_type: createFunctionReturnTypeChangeChecker({
        changeCode: 'changed_function_return_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_function_return_type_to_less_strict: createFunctionReturnTypeChangeChecker({
        changeCode: 'changed_function_return_type_to_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    changed_function_parameter_modifier_to_optional: createOptReqModifierChangeComparator({
        changeCode: 'changed_function_parameter_modifier_to_optional',
        compare: Comparator.Utils.Modifiers.isNowOptional,
        modifierName: 'optional',
    }),
    changed_function_parameter_modifier_to_required: createOptReqModifierChangeComparator({
        changeCode: 'changed_function_parameter_modifier_to_required',
        compare: Comparator.Utils.Modifiers.isNowRequired,
        modifierName: 'required',
    }),
    changed_function_parameter_required_count,
    changed_function_parameter_type: createFunctionParamsTypeChangeChecker({
        changeCode: 'changed_function_parameter_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_function_parameter_type_to_less_strict: createFunctionParamsTypeChangeChecker({
        changeCode: 'changed_function_parameter_type_to_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    removed_function_generic: createRemovedComparator({
        memberType: 'function',
        changeCode: 'removed_function_generic',
        elementsName: 'Generic types',
        getElements: x => x.generics,
    }),
    added_function_optional_generic: createAddedComparator({
        changeCode: 'added_function_optional_generic',
        elementsName: 'Generic type',
        memberType: 'function',
        getElements: x => x.generics,
        changeFilter: (
            obj: Record<string, Signatures.GenericDefinition>,
            el: Signatures.GenericDefinition
        ) =>
            Comparator.Utils.Generics.addedOptional({
                afterGeneric: el,
                beforeGeneric: obj[el.name],
            }),
    }),
    added_function_required_generic: createAddedComparator({
        changeCode: 'added_function_required_generic',
        elementsName: 'Generic type',
        memberType: 'function',
        getElements: x => x.generics,
        changeFilter: (
            obj: Record<string, Signatures.GenericDefinition>,
            el: Signatures.GenericDefinition
        ) =>
            Comparator.Utils.Generics.addedRequired({
                afterGeneric: el,
                beforeGeneric: obj[el.name],
            }),
    }),
    changed_function_generic_extends_type: createGenericTypeChecker({
        changeCode: 'changed_function_generic_extends_type',
        memberType: 'function',
        getGeneric: x => x.generics,
        compare: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_function_generic_extends_type_to_less_strict: createGenericTypeChecker({
        changeCode: 'changed_function_generic_extends_type_to_less_strict',
        memberType: 'function',
        getGeneric: x => x.generics,
        compare: Comparator.Utils.Types.areMoreApplicable,
    }),
    removed_interface_generic: createRemovedComparator({
        changeCode: 'removed_interface_generic',
        elementsName: 'Generic type',
        getElements: x => x.generics,
        memberType: 'interface',
    }),
    added_interface_required_generic: createAddedComparator({
        changeCode: 'added_interface_required_generic',
        elementsName: 'Generic type',
        getElements: x => x.generics,
        memberType: 'interface',
        changeFilter: (
            obj: Record<string, Signatures.GenericDefinition>,
            el: Signatures.GenericDefinition
        ) =>
            Comparator.Utils.Generics.addedRequired({
                afterGeneric: el,
                beforeGeneric: obj[el.name],
            }),
    }),
    added_interface_optional_generic: createAddedComparator({
        changeCode: 'added_interface_optional_generic',
        elementsName: 'Generic type',
        getElements: x => x.generics,
        memberType: 'interface',
        changeFilter: (
            obj: Record<string, Signatures.GenericDefinition>,
            el: Signatures.GenericDefinition
        ) =>
            Comparator.Utils.Generics.addedOptional({
                afterGeneric: el,
                beforeGeneric: obj[el.name],
            }),
    }),
    changed_interface_generic_extends_type: createGenericTypeChecker({
        changeCode: 'changed_interface_generic_extends_type',
        memberType: 'interface',
        compare: Comparator.Utils.Types.areNotCompatible,
        getGeneric: x => x.generics,
    }),
    changed_interface_generic_extends_type_to_less_strict: createGenericTypeChecker({
        changeCode: 'changed_interface_generic_extends_type_to_less_strict',
        memberType: 'interface',
        compare: Comparator.Utils.Types.areMoreApplicable,
        getGeneric: x => x.generics,
    }),
    added_required_interface_property: createAddedComparator({
        changeCode: 'added_required_interface_property',
        elementsName: 'Interface property',
        memberType: 'interface',
        getElements: x => Object.values(x.properties),
        changeFilter: (
            obj: Record<string, Signatures.InterfaceProperty>,
            el: Signatures.InterfaceProperty
        ) => obj[el.name] == null && !el.isOptional,
    }),
    added_optional_interface_property: createAddedComparator({
        changeCode: 'added_optional_interface_property',
        memberType: 'interface',
        elementsName: 'Interface property',
        getElements: x => Object.values(x.properties),
        changeFilter: (
            obj: Record<string, Signatures.InterfaceProperty>,
            el: Signatures.InterfaceProperty
        ) => obj[el.name] == null && el.isOptional,
    }),
    removed_interface_property: createRemovedComparator({
        changeCode: 'removed_interface_property',
        elementsName: 'Interface property',
        memberType: 'interface',
        getElements: x => Object.values(x.properties),
    }),
    changed_interface_property_type: createInterfacePropsTypeChangeChecker({
        changeCode: 'changed_interface_property_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_interface_property_type_less_strict: createInterfacePropsTypeChangeChecker({
        changeCode: 'changed_interface_property_type_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    added_interface_callable_type: createAddedComparator({
        changeCode: 'added_interface_callable_type',
        elementsName: 'Interface callable type',
        memberType: 'interface',
        getElements: x =>
            x.callableTypes.map(callable => ({
                ...callable,
                name: Comparator.Utils.Functions.ToString.toFullName(callable),
            })),
    }),
    removed_interface_callable_type: createRemovedComparator({
        changeCode: 'removed_interface_callable_type',
        elementsName: 'Interface callable type',
        memberType: 'interface',
        getElements: x =>
            x.callableTypes.map(callable => ({
                ...callable,
                name: Comparator.Utils.Functions.ToString.toFullName(callable),
            })),
    }),
    changed_callable_type_return_type: createInterfaceCallableTypeChangeChecker({
        changeCode: 'changed_callable_type_return_type',
        compareTypes: Comparator.Utils.Types.areNotCompatible,
    }),
    changed_callable_type_return_type_to_less_strict: createInterfaceCallableTypeChangeChecker({
        changeCode: 'changed_callable_type_return_type_to_less_strict',
        compareTypes: Comparator.Utils.Types.areMoreApplicable,
    }),
    changed_callable_type_parameter_modifier_to_optional: createInterfaceCallbleOptReqModifierChangeComparator(
        {
            changeCode: 'changed_callable_type_parameter_modifier_to_optional',
            compare: Comparator.Utils.Parameters.getChangedToOptional,
            modifierName: 'optional',
        }
    ),
    changed_callable_type_parameter_modifier_to_required: createInterfaceCallbleOptReqModifierChangeComparator(
        {
            changeCode: 'changed_callable_type_parameter_modifier_to_required',
            compare: Comparator.Utils.Parameters.getChangedToRequired,
            modifierName: 'required',
        }
    ),
}
