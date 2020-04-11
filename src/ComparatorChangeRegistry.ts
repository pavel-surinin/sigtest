import { Comparator } from './App.types'

export const CHANGE_REGISTRY: Record<
    Comparator.ChangeCode,
    Comparator.ChangeInfo<Comparator.ChangeCode>
> = {
    C000: {
        code: 'C000',
        description: 'Nothing is changed',
        action: 'none',
        status: 'compatible',
    },
    C001: {
        code: 'C001',
        description: 'Signature member type changed',
        action: 'changed',
        status: 'breaking',
    },
}
