import { Comparator } from '../../src/comparator/Comparators'

declare global {
    namespace jest {
        interface Matchers<R> {
            toFailComparison(message: string): R
            toPassComparison(): R
        }
    }
}
