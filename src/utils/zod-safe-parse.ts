import { safeParse } from 'zod/v4/core'
import type { ZodError, ZodInferred, ZodSchema } from '../types'

export type ZodSafeParseReturn<TSchema extends ZodSchema> =
	| {
			success: true
			data: ZodInferred<TSchema>
	  }
	| {
			success: false
			error: ZodError
	  }

/**
 * Performs a safe parse on the given Zod Schema (supports v3 and v4)
 * @param schema the v3 or v4 zod schema
 * @param value value to parse
 * @returns returns the result from the parsing
 */
export function zodSafeParse<TSchema extends ZodSchema>(
	schema: TSchema,
	value: unknown,
): ZodSafeParseReturn<TSchema> {
	if ('_zod' in schema) {
		const v4 = safeParse(schema, value)
		if (v4.success) {
			return {
				success: true,
				data: v4.data as ZodInferred<TSchema>,
			}
		} else {
			return {
				success: false,
				error: v4.error,
			}
		}
	} else {
		const v3 = schema.safeParse(value)
		if (v3.success) {
			return {
				success: true,
				data: v3.data,
			}
		} else {
			return {
				success: false,
				error: v3.error,
			}
		}
	}
}
