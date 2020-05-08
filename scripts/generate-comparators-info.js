const changes = require('../out/src/comparator/ComparatorChangeRegistry').CHANGE_REGISTRY
const fs = require('fs')
const path = require('path')

const djs = require('declarative-js')
const groupBy = djs.Reducer.groupBy
const Map = djs.Reducer.Map
const by = djs.Sort.by

// ## COMMON Comparators
// ### Breaking
//    - code: description
//    - code: description
// ### Compatible
//    - code: description

//         status: Status;
//         action: Action;
//         code: C;
//         description: string;
//         memberType: MemberType;

const tocLines = []
const capitalize = s => s[0].toUpperCase() + s.slice(1, s.length)
const h1 = s => {
    s = capitalize(s)
    tocLines.push(` - [${s}](#${s})`)
    return `## ${s}`
}
const h2 = s => {
    return `### ${capitalize(s)}`
}
const h4 = s => `#### ${s}`
const formatChange = c => `${c.code}: ${c.description}`

const toMemberType = c => c.memberType
const grouped = Object.values(changes)
    .sort(by('status', ['breaking', 'compatible']))
    .reduce(groupBy(toMemberType), Map())

const lines = []

for (const entry of grouped.entries()) {
    lines.push(h1(entry.key))
    const toStatus = c => c.status
    const groupedChanges = entry.value.reduce(groupBy(toStatus), Map())
    for (const grEntry of groupedChanges.entries()) {
        lines.push(h2(grEntry.key))
        for (const change of grEntry.value) {
            lines.push(h4(formatChange(change)))

            // examples
            const vfileName = version =>
                `Comparator ${entry.key} ${change.code} should find changes-V${version}.checker.data.ts`
            const v1Path = path.join('test/src/__testFiles__/checkers/', vfileName(1))
            if (fs.existsSync(v1Path)) {
                const v2Path = path.join('test/src/__testFiles__/checkers/', vfileName(2))
                const v1Example = fs.readFileSync(v1Path, { encoding: 'UTF-8' })
                const v2Example = fs.readFileSync(v2Path, { encoding: 'UTF-8' })
                lines.push('```typescript\n' + '// version 0.0.1\n' + v1Example + '```')
                lines.push('```typescript\n' + '// version 0.0.2\n' + v2Example + '```')
            }
        }
    }
}

fs.writeFileSync(
    './docs/comparators-table.md',
    ['# Change Comparators', tocLines.join('\n'), ...lines].join('\n\n')
)
