import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodSchema,
} from '../types'
import { get } from './get'
import { set } from './set'
import { zodSafeParse } from './zod-safe-parse'

/**
 * If a queryStringSchema was given, it then parses the query string from the request
 * @param dataArgs the original request data args
 * @param queryStringSchema the query string schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the query string
 * @returns a type safe object of the query string
 */
export async function parseQueryString<
	TSchema extends ZodSchema,
	TContext extends {},
>(
	dataArgs: DataFunctionArgs,
	queryStringSchema: TSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	const iterator = new URL(dataArgs.request.url).searchParams.entries()
	const obj = {}
	for (const [key, value] of iterator) {
		const check = get(obj, key, undefined)
		if (check !== undefined) {
			if (Array.isArray(check)) {
				check.push(value)
			} else {
				set(obj, key, [check, value])
			}
		} else {
			set(obj, key, value)
		}
	}

	const result = zodSafeParse(queryStringSchema, obj)
	if (result.success) {
		return result.data
	}
	if (onParseError) {
		await onParseError({ error: result.error, context, dataArgs })
	}
	throw new Error(
		'Several issues were found while trying to parse the query string.',
	)
}
