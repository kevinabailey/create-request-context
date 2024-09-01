import type { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
	ZodInferredOrDefault,
} from '../types'
import { set } from './set'
import { get } from './get'

/**
 * If a queryStringSchema was given, it then parses the query string from the request
 * @param dataArgs the original request data args
 * @param queryStringSchema the query string schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the query string
 * @returns a type safe object of the query string
 */
export async function parseQueryString<
	TQueryStringSchema extends z.ZodTypeAny | undefined = undefined,
	TContext extends {} = {},
>(
	dataArgs: DataFunctionArgs,
	queryStringSchema: TQueryStringSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
) {
	if (queryStringSchema) {
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

		const result = queryStringSchema.safeParse(obj)
		if (result.success) {
			return result.data as ZodInferredOrDefault<TQueryStringSchema>
		}
		if (onParseError) {
			await onParseError({ error: result.error, context, dataArgs })
		}
		throw new Error(
			'Several issues were found while trying to parse the query string.',
		)
	}
	return undefined as ZodInferredOrDefault<TQueryStringSchema>
}
