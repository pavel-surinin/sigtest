 - [Common](#Common)
 - [Class](#Class)
 - [Constant](#Constant)
 - [Enum](#Enum)
 - [Function](#Function)
 - [Interface](#Interface)
# Common

## Breaking

- **changed_member_type**: Signature member type changed

- **member_removal**: Signature member removed from package

## Compatible

- **no_change**: Nothing is changed

# Class

## Breaking

- **changed_required_constructor_parameters_count**: Required parameters count in constructor has changed

- **changed_constructor_parameter_modifier_to_required**: Constructor paramter became required

- **changed_constructor_parameter_type**: Constructor parameter type changed

- **changed_method_return_type**: Method return type changed

- **changed_method_parameter_modifier_to_required**: Method parameter changed from optional to required

- **changed_method_parameter_required_count**: Changed required parameters count in class method

- **removed_method**: Method removed from class

- **changed_method_modifier_less_visible**: Method access modifier changed, to be more restrictive.

- **changed_property_modifier_less_visible**: Property access modifier changed, to be more restrictive.

- **removed_class_property**: Property was removed from class.

- **changed_class_property_type**: Property type was changed

- **changed_class_property_to_readonly**: Property write access was changed to more strict

- **removed_generic**: Class generic type was removed

- **added_required_generic**: Class generic type was added

- **changed_generic_extends_type**: Class generic type constraint was changed

## Compatible

- **changed_constructor_parameter_modifier_to_optional**: Constructor parameter became optional

- **changed_constructor_parameter_type_union**: Constructor parameter type changed to union type

- **changed_method_return_type_union**: Method return type changed to union type

- **changed_method_parameter_modifier_to_optional**: Method parameter changed from required to optional

- **added_method**: Method added to class

- **changed_method_modifier_more_visible**: Method access modifier changed, to be less restrictive.

- **changed_property_modifier_more_visible**: Property access modifier changed, to be less restrictive.

- **added_class_property**: Property was added to class.

- **changed_class_property_type_union**: Property type was changed to less strict

- **changed_class_property_type_union**: Property write access was changed to less strict

- **added_optional_generic**: Class optional generic type was added

- **changed_generic_extends_type_to_less_strict**: Class generic constraint type was changed to less strict

# Constant

## Breaking

- **changed_constant_type**: Variable constraint type was changed

## Compatible

- **changed_constant_type_to_less_strict**: Variable constraint type was changed to less strict

# Enum

## Breaking

- **removed_enum**: Enum value removed

- **changed_enum_value**: Enum changed value, serialized to json values will be different

## Compatible

- **added_enum**: Enum value added

# Function

## Breaking

- **changed_function_return_type**: Function return type changed

- **changed_function_parameter_modifier_to_required**: Function parameter became required

- **changed_function_parameter_required_count**: Function required parameters count changed

- **changed_function_parameter_type**: Function paramter type changed

- **removed_function_generic**: Function generic type is removed

- **added_function_required_generic**: Added required generic type to function

- **changed_function_generic_extends_type**: Changed function generic type constraint

## Compatible

- **changed_function_return_type_to_less_strict**: Function return type changed to less strict

- **changed_function_parameter_modifier_to_optional**: Function parameter became optional

- **changed_function_parameter_type_to_less_strict**: Function paramter type changed to less strict

- **added_function_optional_generic**: Added optional generic type to function

- **changed_function_generic_extends_type_to_less_strict**: Changed function generic type constraint to be less restrictive

# Interface

## Breaking

- **removed_interface_generic**: Removed interface generic type

- **added_interface_required_generic**: Added interface required generic type

- **changed_interface_generic_extends_type**: Changed interface generic type constraint

## Compatible

- **added_interface_optional_generic**: Added interface optional generic type

- **changed_interface_generic_extends_type_to_less_strict**: Changed interface generic type constraint to be less strict