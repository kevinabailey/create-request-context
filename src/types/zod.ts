import type * as z3 from 'zod/v3'
import type * as z4 from 'zod/v4/core'

/**
 * Base event object for Zod schema parsing failures.
 * @see {@link ZodParseErrorEventHandler}
 */
export type ZodParseErrorEventBase = {
	/** The Zod error details. */
	error: ZodError
}

/**
 * A callback for when Zod schema parsing fails.
 * @param event The error event details.
 */
export type ZodParseErrorEventHandler<
	TEvent extends ZodParseErrorEventBase = ZodParseErrorEventBase,
> = (event: TEvent) => Promise<void> | void

/**
 * Infers the type based on a Zod v3 or v4 schema
 */
export type ZodInferred<TSchema> = TSchema extends z3.ZodTypeAny
	? z3.infer<TSchema>
	: TSchema extends z4.$ZodType
		? z4.infer<TSchema>
		: never

/**
 * Zod v3 or v4 schema
 */
export type ZodSchema = z3.ZodTypeAny | z4.$ZodType

/**
 * Zod v3 or v4 error
 */
export type ZodError = z3.ZodError | z4.$ZodError

export type ZodUnknown = z3.ZodUnknown | z4.$ZodUnknown
