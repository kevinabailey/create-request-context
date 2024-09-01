import type { z } from 'zod'

import type {
	DataFunctionArgs,
	RequestContextFormDataParserArgs,
	RequestContextZodParseErrorEventHandler,
	ZodInferredOrDefault,
} from '../types'
import { set } from './set'

/**
 * If a formSchema is given, it then parses the form that was posted, and converts it into a nice javascript object (ignores files)
 * @param dataArgs the original request data args
 * @param formSchema the form schema to parse and verify it matches
 * @param context the custom context created from the factory
 * @param onParseError optional handler for when zod fails to parse the form
 * @returns a type safe object
 */
export async function parseForm<
	TFormSchema extends z.ZodTypeAny | undefined = undefined,
	TContext extends {} = {},
>(
	dataArgs: DataFunctionArgs,
	formSchema: TFormSchema,
	context: TContext,
	onParseError?: RequestContextZodParseErrorEventHandler<TContext>,
	formDataParser?: (
		args: RequestContextFormDataParserArgs<TContext>,
	) => Promise<FormData>,
) {
	if (formSchema) {
		const form = formDataParser
			? await formDataParser({ context, dataArgs })
			: await dataArgs.request.formData()
		const obj = {}
		for (const key of form.keys()) {
			let values = form.getAll(key)

			// strip out non-string values
			values = values.filter(v => typeof v === 'string')

			if (values.length === 0) {
				// Probably should just skip
				continue
			}

			// Unwrap array for single value props
			set(obj, key, values.length === 1 ? values[0] : values)
		}

		const result = formSchema.safeParse(obj)
		if (result.success) {
			return result.data as ZodInferredOrDefault<TFormSchema>
		}
		if (onParseError) {
			await onParseError({ error: result.error, context, dataArgs })
		}
		throw new Error(
			'Several issues were found while trying to parse the form data.',
		)
	}
	return undefined as ZodInferredOrDefault<TFormSchema>
}
