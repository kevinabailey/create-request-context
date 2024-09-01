import { z } from 'zod'

/**
 * Helper type to get the inferred type from a zod schema, if no schema is provided, it uses a default, which defaults to undefined.
 */
export type ZodInferredOrDefault<
	TSchema extends z.ZodTypeAny | undefined = undefined,
	TDefault = undefined,
> = TSchema extends undefined
	? TDefault
	: TSchema extends z.ZodTypeAny
		? z.infer<TSchema>
		: never

/**
 * Base event object for Zod schema parsing failures.
 * @see {@link ZodParseErrorEventHandler}
 */
export type ZodParseErrorEventBase = {
	/** The Zod error details. */
	error: z.ZodError
}

/**
 * A callback for when Zod schema parsing fails.
 * @param event The error event details.
 */
export type ZodParseErrorEventHandler<
	TEvent extends ZodParseErrorEventBase = ZodParseErrorEventBase,
> = (event: TEvent) => Promise<void> | void
