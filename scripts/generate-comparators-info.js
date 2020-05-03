const changes = require('../out/src/comparator/ComparatorChangeRegistry').CHANGE_REGISTRY
const fs = require('fs')

const djs = require('declarative-js')
const groupBy = djs.Reducer.groupBy
const Map = djs.Reducer.Map
const flat = djs.Reducer.flat
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
const li = s => `- ${s}`
const formatChange = c => `**${c.code}**: ${c.description}`

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
            lines.push(li(formatChange(change)))
        }
    }
}

fs.writeFileSync(
    './docs/comparators-table.md',
    ['# Change Comparators', tocLines.join('\n'), ...lines].join('\n\n')
)
