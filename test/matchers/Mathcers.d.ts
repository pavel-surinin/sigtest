import { Comparator } from '../../src/App.types'

declare global {
    namespace jest {
        interface Matchers<R> {
            toFailComparison(message: string): R
            toPassComparison(): R
        }
    }
}
