import { Comparator } from '../App.types'
import { C001 } from './C001'

export type ComparatorRegistry = Record<
    Exclude<Comparator.ChangeCode, 'C000'>,
    Comparator.Comparator<Comparator.ChangeCode>
>

export const COMPARATOR_REGISTRY: ComparatorRegistry = {
    C001,
}
