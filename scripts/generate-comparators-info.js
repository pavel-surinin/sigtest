const changes = require('../out/src/comparator/ComparatorChangeRegistry').CHANGE_REGISTRY
const fs = require('fs')

const djs = require('declarative-js')
const groupBy = djs.Reducer.groupBy
const Map = djs.Reducer.Map
const flat = djs.Reducer.flat
const by = djs.Sort.by

//         status: Status;
//         action: Action;
//         code: C;
//         description: string;
//         memberType: MemberType;
const header = '| Code | Action | Status | Description |'
const lineDelimiter = '| --- | --- | --- | --- |'

const grouped = Object.values(changes)
    .sort(c => c.memberType)
    .reduce(
        groupBy(g => g.memberType),
        Map()
    )

const codes = grouped
    .keys()
    .map(key =>
        [].concat(`| **${key.toUpperCase()}**`).concat(
            grouped
                .get(key)
                .sort(by('action', ['none', 'removed', 'changed', 'added']))
                .sort(by('status', ['breaking', 'compatible']))
                .map(c => `|  ${c.code} | ${c.action} | ${c.status} | ${c.description}`)
        )
    )
    .reduce(flat, [])

const comparatorsTable = [].concat(header).concat(lineDelimiter).concat(codes).join('\n')

fs.writeFileSync('./docs/comparators-table.md', comparatorsTable)
