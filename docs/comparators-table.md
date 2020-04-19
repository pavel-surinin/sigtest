| Code | Action | Status | Description |
| --- | --- | --- | --- |
| **COMMON**
|  member_removal | removed | breaking | Signature member removed from package
|  changed_member_type | changed | breaking | Signature member type changed
|  no_change | none | compatible | Nothing is changed
| **CLASS**
|  removed_method | removed | breaking | Method removed from class
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
|  changed_constructor_parameter_modifier_to_optional | changed | compatible | Constructor parameter became optional
|  changed_constructor_parameter_type_union | changed | compatible | Constructor parameter type changed to union type
|  changed_method_return_type_union | changed | compatible | Method return type changed to union type
|  changed_method_parameter_modifier_to_optional | changed | compatible | Method parameter changed from required to optional
|  changed_method_modifier_more_visible | changed | compatible | Method access modifier changed, to be less restrictive.
|  changed_property_modifier_more_visible | changed | compatible | Property access modifier changed, to be less restrictive.
|  added_method | added | compatible | Method added to class
|  added_class_property | added | compatible | Property was added to class.