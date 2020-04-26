import { Comparator } from '../../src/comparator/Comparators'

declare global {
    namespace jest {
        interface Matchers<R> {
            toFindChanges(message: string): R
            toFindNoChanges(): R
        }
    }
}
