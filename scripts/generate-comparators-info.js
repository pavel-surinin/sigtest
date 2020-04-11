const changes = require('../out/src/ComparatorChangeRegistry').CHANGE_REGISTRY
const fs = require('fs')
const by = require('declarative-js').Sort.by

// status: Status;
//         action: Action;
//         code: C;
//         description: string;
//         memberType: MemberType;
const header = '| Member Type | Code | Action | Status | description |'
const lineDelimiter = '| --- | --- | --- | --- | --- |'

const codes = Object.values(changes)
    .sort(c => c.memberType)
    .map(c => `| ${c.memberType} | ${c.code} | ${c.action} | ${c.status} | ${c.description}`)

const comparatorsTable = [].concat(header).concat(lineDelimiter).concat(codes).join('\n')

fs.writeFileSync('./docs/comparators-table.md', comparatorsTable)
