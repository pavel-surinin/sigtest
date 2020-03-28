import { SerializationError } from '../src/SerializerError'

describe('SerializerError', () => {
    it('should construct error message', () => {
        const error = new SerializationError({
            code: 'S001',
            file: 'path',
            line: 1,
            column: 1,
            text: 'const a = b',
        })
        expect(error.message).toBe(`Error occurred during serialization:
  text:        const a = b
  file:        path
  line:        1
  column:      1
  error code:  S001
  description: Not supported exported constant initializer. Only primitive initializers are supported. Try using primitive initializer or define explicit type.`)
    })
})
