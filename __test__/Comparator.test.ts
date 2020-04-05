import { isComputedPropertyName, ScriptTarget, ModuleKind } from 'typescript'
import { compareSnapshots } from '../src/SnapshotComparator'
import { generateSignatures } from '../src/TypeVisitor'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { comparators } from '../src/SignatureComparator'
import { CHANGE_REGISTRY } from '../src/ComparatorChangeMessage'

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

describe('Comparator', () => {
    it('should compare by member type ad fail', () => {
        const [v1, v2] = provider.provide(`export const a = 1`, `export function a() {}`)
        const result = compareSnapshots(
            {
                before: { version: '0.0.1', signatures: v1 },
                after: { version: '0.0.2', signatures: v2 },
            },
            comparators
        )
        expect(result.changes).toHaveLength(1)
        expect(result.changes[0].info).toMatchObject(CHANGE_REGISTRY.C001)
        expect(result.changes[0].message).toBe("Member type changed from 'constant' to 'function'")
    })
    it('should compare by member type and succeed', () => {
        const [v1, v2] = provider.provide(`export const a = 1`, `export const a = 'string'`)
        const result = compareSnapshots(
            {
                before: { version: '0.0.1', signatures: v1 },
                after: { version: '0.0.2', signatures: v2 },
            },
            comparators
        )
        expect(result.changes).toHaveLength(1)
        expect(result.changes[0].info).toMatchObject(CHANGE_REGISTRY.C000)
    })
    it('should compare by member type and succeed when no after is present', () => {
        const [v1, v2] = provider.provide(`export const a = 1`, ``)
        const result = compareSnapshots(
            {
                before: { version: '0.0.1', signatures: v1 },
                after: { version: '0.0.2', signatures: v2 },
            },
            comparators
        )
        expect(result.changes).toHaveLength(1)
        expect(result.changes[0].info).toMatchObject(CHANGE_REGISTRY.C000)
    })
})
