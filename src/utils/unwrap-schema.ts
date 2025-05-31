import type { ZodSchema } from '../types'

/**
 * Utility function to unwrap a schema from a function
 * @param schema the schema or function that returns a schema
 * @returns the schema
 */
export function unwrapSchema<TSchema extends ZodSchema>(
	schema?: TSchema | (() => TSchema | undefined),
) {
	return typeof schema === 'function' ? schema() : schema
}
