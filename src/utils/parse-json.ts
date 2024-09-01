import type { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodInferredOrDefault,
} from '../types'

/**
 * If a jsonSchema is given, it then parses the json that was posted, and converts it into a nice javascript object (ignores files)
 * @param dataArgs the original request data args
 * @param jsonSchema the json schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the json
 * @returns a type safe object
 */
export async function parseJson<
	TJsonSchema extends z.ZodTypeAny | undefined = undefined,
	TContext extends {} = {},
>(
	dataArgs: DataFunctionArgs,
	jsonSchema: TJsonSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	if (jsonSchema) {
		const obj = await dataArgs.request.json()

		const result = jsonSchema.safeParse(obj)
		if (result.success) {
			return result.data as ZodInferredOrDefault<TJsonSchema>
		}
		if (onParseError) {
			await onParseError({ error: result.error, context, dataArgs })
		}
		throw new Error(
			'Several issues were found while trying to parse the json data.',
		)
	}
	return undefined as ZodInferredOrDefault<TJsonSchema>
}
