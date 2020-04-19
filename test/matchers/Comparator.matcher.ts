import { ScriptTarget, ModuleKind } from 'typescript'
import { compareSnapshots } from '../../src/SnapshotComparator'
import { generateSignatures } from '../../src/TypeVisitor'
import { writeFileSync, unlinkSync, existsSync, mkdirSync, fstat, readdirSync } from 'fs'
import { join } from 'path'
import { CHANGE_REGISTRY } from '../../src/comparator/ComparatorChangeRegistry'
import { COMPARATOR_REGISTRY } from '../../src/comparator/ComparatorRegistry'
import { CreateOnce, CallOnceBy } from 'auto-memoize'
import { Comparator } from '../../src/comparator/Comparators'
import { format } from 'prettier'
import toml from '@iarna/toml'
import { Reducer } from 'declarative-js'

const TEST_FILES_FOLDER = 'test/src/__testFiles__/'

@CreateOnce
class SignatureProvider {
    constructor(private folder: string) {}

    @CallOnceBy('string')
    private provide(v1: string, v2: string) {
        const doProvide = (code: string, version: string) => {
            const { currentTestName } = expect.getState()

            const path = join(
                this.folder,
                'checkers',
                `${currentTestName}-${version}.checker.data.ts`
            )
            const dir = join(this.folder, 'checkers')
            if (!existsSync(dir)) {
                mkdirSync(dir)
            }
            writeFileSync(path, format(code, { parser: 'typescript' }))
            const s = generateSignatures([path], {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS,
            })
            // unlinkSync(path)
            const tomlPath = join(
                this.folder,
                'checkers',
                `${currentTestName}-${version}.checker.data.toml`
            )
            writeFileSync(
                tomlPath,
                toml.stringify(
                    s
                        .map(s => s.signature!)
                        .reduce(
                            Reducer.toObject(x => `${x.memberName}`),
                            {}
                        ) as any
                )
            )
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

export type ComparatorTestPayload = {
    v1: string
    v2: string
    code: Exclude<Comparator.ChangeCode, Comparator.NothingChangedCode>
}

function toFailComparison(
    this: jest.MatcherContext,
    received: ComparatorTestPayload,
    actual: string
): jest.CustomMatcherResult {
    const result = new SignatureProvider(TEST_FILES_FOLDER).compare(received)
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
                this.utils.matcherHint('toFailComparison', undefined, undefined, {
                    comment: 'change code',
                }) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(expected.info.code)}\n` +
                `Received: ${this.utils.printReceived(result.changes[0].info.code)}`,
        }
    }
    if (!this.equals(expected.info, result.changes[0].info)) {
        return {
            pass: false,
            message: () =>
                this.utils.matcherHint('toFailComparison', undefined, undefined, {
                    comment: 'change info',
                }) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(expected.info)}\n` +
                `Received: ${this.utils.printReceived(result.changes[0].info)}`,
        }
    }
    if (expected.message !== result.changes[0].message) {
        return {
            pass: false,
            message: () =>
                this.utils.matcherHint('toFailComparison', undefined, undefined, {
                    comment: 'message',
                }) +
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

function toPassComparison(
    this: jest.MatcherContext,
    received: ComparatorTestPayload
): jest.CustomMatcherResult {
    const result = new SignatureProvider(TEST_FILES_FOLDER).compare(received)
    if (result.changes.length !== 1) {
        throw new Error('One comparison result must be present in "toFailComparison" matcher')
    }

    return {
        pass: CHANGE_REGISTRY.no_change.code === result.changes[0].info.code,
        message: () =>
            this.utils.matcherHint('toPassComparison', undefined, undefined, undefined) +
            '\n\n' +
            `Expected: ${this.utils.printExpected(CHANGE_REGISTRY.no_change.code)}\n` +
            `Received: ${this.utils.printReceived(result.changes[0].info.code)}`,
    }
}

expect.extend({
    toFailComparison,
    toPassComparison,
})

export const comparatorMatcher = {
    cleanGenerated: () => {
        const checkersPath = join(TEST_FILES_FOLDER, 'checkers')
        if (existsSync(checkersPath)) {
            readdirSync(checkersPath).forEach(x => unlinkSync(join(checkersPath, x)))
        }
    },
}
