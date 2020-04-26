| Code | Action | Status | Description |
| --- | --- | --- | --- |
| **COMMON**
|  member_removal | removed | breaking | Signature member removed from package
|  changed_member_type | changed | breaking | Signature member type changed
|  no_change | none | compatible | Nothing is changed
| **CLASS**
|  removed_method | removed | breaking | Method removed from class
|  removed_generic | removed | breaking | Class generic type was removed
|  changed_required_constructor_parameters_count | changed | breaking | Required parameters count in constructor has changed
|  changed_constructor_parameter_modifier_to_required | changed | breaking | Constructor paramter became required
|  changed_constructor_parameter_type | changed | breaking | Constructor parameter type changed
|  changed_method_return_type | changed | breaking | Method return type changed
|  changed_method_parameter_modifier_to_required | changed | breaking | Method parameter changed from optional to required
|  changed_method_parameter_required_count | changed | breaking | Changed required parameters count in class method
|  changed_method_modifier_less_visible | changed | breaking | Method access modifier changed, to be more restrictive.
|  changed_property_modifier_less_visible | changed | breaking | Property access modifier changed, to be more restrictive.
|  removed_class_property | changed | breaking | Property was removed from class.
|  changed_class_property_type | changed | breaking | Property type was changed
|  changed_class_property_to_readonly | changed | breaking | Property write access was changed to more strict
|  changed_generic_extends_type | changed | breaking | Class generic type constraint was changed
|  added_required_generic | added | breaking | Class generic type was added
|  changed_constructor_parameter_modifier_to_optional | changed | compatible | Constructor parameter became optional
|  changed_constructor_parameter_type_union | changed | compatible | Constructor parameter type changed to union type
|  changed_method_return_type_union | changed | compatible | Method return type changed to union type
|  changed_method_parameter_modifier_to_optional | changed | compatible | Method parameter changed from required to optional
|  changed_method_modifier_more_visible | changed | compatible | Method access modifier changed, to be less restrictive.
|  changed_property_modifier_more_visible | changed | compatible | Property access modifier changed, to be less restrictive.
|  changed_class_property_type_union | changed | compatible | Property type was changed to less strict
|  changed_class_property_type_union | changed | compatible | Property write access was changed to less strict
|  changed_generic_extends_type_to_less_strict | changed | compatible | Class generic constraint type was changed to less strict
|  added_method | added | compatible | Method added to class
|  added_class_property | added | compatible | Property was added to class.
|  added_optional_generic | added | compatible | Class optional generic type was added
| **CONSTANT**
|  changed_constant_type | changed | breaking | Variable constraint type was changed
|  changed_constant_type_to_less_strict | changed | compatible | Variable constraint type was changed to less strict
| **ENUM**
|  removed_enum | removed | breaking | Enum value removed
|  changed_enum_value | changed | breaking | Enum changed value, serialized to json values will be different
|  added_enum | added | compatible | Enum value added
| **FUNCTION**
|  changed_function_return_type | changed | breaking | Function return type changed
|  changed_function_parameter_modifier_to_required | changed | breaking | Function parameter became required
|  changed_function_parameter_required_count | changed | breaking | Function required parameters count changed
|  changed_function_parameter_type | changed | breaking | Function paramter type changed
|  changed_function_return_type_to_less_strict | changed | compatible | Function return type changed to less strict
|  changed_function_parameter_modifier_to_optional | changed | compatible | Function parameter became optional
|  changed_function_parameter_type_to_less_strict | changed | compatible | Function paramter type changed to less strict