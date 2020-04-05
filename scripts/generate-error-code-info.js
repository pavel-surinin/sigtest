const errors = require('../out/src/serializer/SerializerError').ERROR_CODE_REGISTRY
const fs = require('fs')

const header = '| Error Code | Error Description |'
const lineDelimiter = '| --- | --- |'

const codes = Object.values(errors).map(error => `| ${error.code} | ${error.description} |`)

const errorTable = [].concat(header).concat(lineDelimiter).concat(codes).join('\n')

fs.writeFileSync('./docs/error-code-table.md', errorTable)
