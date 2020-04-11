import { Comparator } from '../App.types'
import { changed_member_type } from './changed-member-type'
import { member_removal } from './member_removal'
import { changed_required_constructor_parameters_count } from './changed_required_constructor_parameters_count'
export type ComparatorRegistry = Record<
    Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>,
    Comparator.Comparator<Comparator.ChangeCode>
>

export const COMPARATOR_REGISTRY: ComparatorRegistry = {
    changed_member_type,
    member_removal,
    changed_required_constructor_parameters_count,
}
