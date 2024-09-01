import type { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodInferredOrDefault,
} from '../types'

/**
 * If a paramsSchema was given, it then parses the params
 * @param dataArgs the original request data args
 * @param paramsSchema the params schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the params
 * @returns a type safe object of params
 */
export async function parseParams<
	TParamsSchema extends z.ZodTypeAny | undefined = undefined,
	TContext extends {} = {},
>(
	dataArgs: DataFunctionArgs,
	paramsSchema: TParamsSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	if (paramsSchema) {
		const result = paramsSchema.safeParse(dataArgs.params)
		if (result.success) {
			return result.data as ZodInferredOrDefault<
				TParamsSchema,
				DataFunctionArgs['params']
			>
		}
		if (onParseError) {
			await onParseError({ error: result.error, context, dataArgs })
		}
		throw new Error(
			'Several issues were found while trying to parse the params.',
		)
	}
	return dataArgs.params as ZodInferredOrDefault<
		TParamsSchema,
		DataFunctionArgs['params']
	>
}
