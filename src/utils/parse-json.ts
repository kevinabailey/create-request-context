import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodSchema,
} from '../types'
import { zodSafeParse } from './zod-safe-parse'

/**
 * If a jsonSchema is given, it then parses the json that was posted, and converts it into a nice javascript object
 * @param dataArgs the original request data args
 * @param jsonSchema the json schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the json
 * @returns a type safe object
 */
export async function parseJson<TContext extends {}>(
	dataArgs: DataFunctionArgs,
	jsonSchema: ZodSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	const obj = await dataArgs.request.json()

	const result = zodSafeParse(jsonSchema, obj)
	if (result.success) {
		return result.data
	}
	if (onParseError) {
		await onParseError({ error: result.error, context, dataArgs })
	}
	throw new Error(
		'Several issues were found while trying to parse the json data.',
	)
}
