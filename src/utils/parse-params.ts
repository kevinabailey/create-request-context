import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodSchema,
} from '../types'
import { zodSafeParse } from './zod-safe-parse'

/**
 * If a paramsSchema was given, it then parses the params
 * @param dataArgs the original request data args
 * @param paramsSchema the params schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the params
 * @returns a type safe object of params
 */
export async function parseParams<
	TSchema extends ZodSchema,
	TContext extends {},
>(
	dataArgs: DataFunctionArgs,
	paramsSchema: TSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	const result = zodSafeParse(paramsSchema, dataArgs.params)
	if (result.success) {
		return result.data
	}
	if (onParseError) {
		await onParseError({ error: result.error, context, dataArgs })
	}
	throw new Error(
		'Several issues were found while trying to parse the params.',
	)
}
