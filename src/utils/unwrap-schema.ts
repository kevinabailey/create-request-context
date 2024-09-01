import type { z } from 'zod'
import type { ZodInferredOrDefault } from '../types'

/**
 * Utility function to unwrap a schema from a function
 * @param schema the schema or function that returns a schema
 * @returns the schema
 */
export function unwrapSchema<
	TSchema extends z.ZodTypeAny | undefined = undefined,
>(schema?: TSchema | (() => TSchema)) {
	return typeof schema === 'function'
		? schema()
		: (schema as ZodInferredOrDefault<TSchema>)
}
