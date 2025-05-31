import * as z3 from 'zod/v3'
import { unwrapSchema } from '../unwrap-schema'

describe('unwrapSchema', () => {
	test(`unwraps the schema if it's a function`, () => {
		const schema = unwrapSchema(() => z3.object({}))

		expect(typeof schema).toBe('object')
	})
	test(`returns the schema if its not a schema`, () => {
		const schema = z3.object({})
		const unwrappedSchema = unwrapSchema(schema)

		expect(schema).toBe(unwrappedSchema)
	})
})
