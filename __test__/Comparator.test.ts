import { isComputedPropertyName, ScriptTarget, ModuleKind } from 'typescript'
import { compareSnapshots } from '../src/SnapshotComparator'
import { generateSignatures } from '../src/TypeVisitor'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { CHANGE_REGISTRY } from '../src/ComparatorChangeRegistry'
import { COMPARATOR_REGISTRY } from '../src/comparator/ComparatorRegistry'
import { Comparator } from '../src/App.types'

describe('Comparator', () => {
    describe('C001', () => {
        it('should compare by member type and fail', () => {
            expectCompare({
                v1: `export const a = 1`,
                v2: `export function a() {}`,
                code: 'C001',
                fails: true,
                message: "Member type changed from 'constant' to 'function'",
            })
        })
        it('should compare by member type and succeed', () => {
            expectCompare({
                v1: `export const a = 1`,
                v2: `export const a = 'string'`,
                code: 'C001',
                fails: false,
            })
        })
        it('should compare by member type and succeed when no after is present', () => {
            expectCompare({
                v1: `export const a = 1`,
                v2: ``,
                code: 'C001',
                fails: false,
            })
        })
    })
})

class SignatureProvider {
    constructor(private folder: string) {}

    provide(v1: string, v2: string) {
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
}

const provider = new SignatureProvider('__test__/__testFiles__/')

function expectCompare(opts: {
    v1: string
    v2: string
    code: Exclude<Comparator.ChangeCode, 'C000'>
    fails: boolean
    message?: string
}) {
    const [v1meta, v2meta] = provider.provide(opts.v1, opts.v2)
    const result = compareSnapshots(
        {
            before: { version: '0.0.1', signatures: v1meta },
            after: { version: '0.0.2', signatures: v2meta },
        },
        [COMPARATOR_REGISTRY[opts.code]]
    )
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0].info).toMatchObject(
        opts.fails ? CHANGE_REGISTRY[opts.code] : CHANGE_REGISTRY.C000
    )
    if (opts.message) {
        expect(result.changes[0].message).toBe(opts.message)
    }
}
