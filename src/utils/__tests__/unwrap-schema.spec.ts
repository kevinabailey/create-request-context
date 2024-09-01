import { z } from 'zod'
import { unwrapSchema } from '../unwrap-schema'

describe('unwrapSchema', () => {
	test(`unwraps the schema if it's a function`, () => {
		const schema = unwrapSchema(() => z.object({}))

		expect(typeof schema).toBe('object')
	})
	test(`returns the schema if its not a schema`, () => {
		const schema = z.object({})
		const unwrappedSchema = unwrapSchema(schema)

		expect(schema).toBe(unwrappedSchema)
	})
})
