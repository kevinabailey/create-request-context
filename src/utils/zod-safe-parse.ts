import { safeParse } from 'zod/v4/core'
import type { ZodSchema } from '../types'

/**
 * Performs a safe parse on the given Zod Schema (supports v4)
 * @param schema the v4 zod schema
 * @param value value to parse
 * @returns returns the result from the parsing
 */
export function zodSafeParse<TSchema extends ZodSchema>(
	schema: TSchema,
	value: unknown,
) {
	return safeParse(schema, value)
}
