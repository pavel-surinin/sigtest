import { ScriptTarget, ModuleKind, isExportDeclaration } from 'typescript'
import { compareSnapshots } from '../../src/SnapshotComparator'
import { generateSignatures } from '../../src/TypeVisitor'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { CHANGE_REGISTRY } from '../../src/ComparatorChangeRegistry'
import { COMPARATOR_REGISTRY } from '../../src/comparator/ComparatorRegistry'
import { Comparator } from '../../src/App.types'
import { CreateOnce, CallOnceBy } from 'auto-memoize'

@CreateOnce
class SignatureProvider {
    constructor(private folder: string) {}

    @CallOnceBy('string')
    private provide(v1: string, v2: string) {
        const doProvide = (code: string, version: string) => {
            const path = join(this.folder, `temp${version}.ts`)
            writeFileSync(path, code)

            const s = generateSignatures([path], {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS,
            })
            unlinkSync(path)
            return s.map(s => s.signature!)
        }
        return [doProvide(v1, 'V1'), doProvide(v2, 'V2')]
    }

    compare(options: {
        v1: string
        v2: string
        code: Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>
    }): Comparator.ComparisonResult {
        const [v1meta, v2meta] = this.provide(options.v1, options.v2)
        const result = compareSnapshots(
            {
                before: { version: '0.0.1', signatures: v1meta },
                after: { version: '0.0.2', signatures: v2meta },
            },
            [COMPARATOR_REGISTRY[options.code]]
        )
        return result
    }
}

function toFailComparison(
    this: jest.MatcherContext,
    received: {
        v1: string
        v2: string
        code: Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>
    },
    actual: string
): jest.CustomMatcherResult {
    const result = new SignatureProvider('test/src/__testFiles__/').compare(received)
    if (result.changes.length !== 1) {
        throw new Error('One comparison result must be present in "toFailComparison" matcher')
    }

    const expected: Comparator.Change<Comparator.ChangeCode> = {
        info: CHANGE_REGISTRY[received.code],
        message: actual,
        signatures: result.changes[0].signatures,
    }

    if (!this.equals(expected.info.code, result.changes[0].info.code)) {
        return {
            pass: false,
            message: () =>
                this.utils.matcherHint('toFailComparison', undefined, undefined, undefined) +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expected.info.code)}\n` +
                `Received: ${this.utils.printReceived(result.changes[0].info.code)}`,
        }
    }
    if (!this.equals(expected.info, result.changes[0].info)) {
        return {
            pass: false,
            message: () =>
                this.utils.matcherHint('toFailComparison', undefined, undefined, undefined) +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expected.info)}\n` +
                `Received: ${this.utils.printReceived(result.changes[0].info)}`,
        }
    }
    if (!this.equals(expected.message, result.changes[0].message)) {
        return {
            pass: false,
            message: () =>
                this.utils.matcherHint('toFailComparison', undefined, undefined, undefined) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(expected.message)}\n` +
                `Received: ${this.utils.printReceived(result.changes[0].message)}`,
        }
    }
    return {
        pass: true,
        message: () => '',
    }
}

expect.extend({
    toFailComparison,
    toPassComparison() {
        return {
            pass: true,
            message: () => '',
        }
    },
})