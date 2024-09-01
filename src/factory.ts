import type { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContext,
	RequestContextConfiguratorOptions,
	RequestContextFactoryOptions,
	RequestContextOptions,
} from './types'
import { parseForm } from './utils/parse-form'
import { parseJson } from './utils/parse-json'
import { parseParams } from './utils/parse-params'
import { parseQueryString } from './utils/parse-query-string'
import { set } from './utils/set'
import { unwrapSchema } from './utils/unwrap-schema'

/**
 * Factory to create a `createRequestContext`.
 * The created functions includes options to parse form data, params, the query string and anything extra you configure it to do.
 * @param configuratorOrOptions the configurator function or options
 * @returns a `createRequestContext` function to be used in your `loader` and `action` functions for routes.
 */
export function createRequestContextFactory<
	TContext extends {} = {},
	TOptions extends {} = {},
>(configuratorOrOptions: RequestContextFactoryOptions<TContext, TOptions>) {
	const factoryOptions: RequestContextConfiguratorOptions<
		TContext,
		TOptions
	> =
		typeof configuratorOrOptions === 'function'
			? {
					configurator: configuratorOrOptions,
				}
			: configuratorOrOptions

	return async <
		TFormSchema extends z.ZodTypeAny | undefined = undefined,
		TParamsSchema extends z.ZodTypeAny | undefined = undefined,
		TQueryStringSchema extends z.ZodTypeAny | undefined = undefined,
		TJsonSchema extends z.ZodTypeAny | undefined = undefined,
	>(
		args: DataFunctionArgs,
		options?: RequestContextOptions<
			TContext,
			TFormSchema,
			TParamsSchema,
			TQueryStringSchema,
			TJsonSchema
		> &
			TOptions,
	) => {
		const customContext = await factoryOptions.configurator(args, options)

		const context: RequestContext<
			TFormSchema,
			TParamsSchema,
			TQueryStringSchema,
			TJsonSchema
		> = {
			params: await parseParams(
				args,
				unwrapSchema(options?.paramsSchema),
				customContext,
				factoryOptions.onParamsError,
			),
			queryString: await parseQueryString(
				args,
				unwrapSchema(options?.queryStringSchema),
				customContext,
				factoryOptions.onQueryStringError,
			),
			form: await parseForm(
				args,
				unwrapSchema(options?.formSchema),
				customContext,
				factoryOptions.onFormError,
				options?.formDataParser,
			),
			json: await parseJson(
				args,
				unwrapSchema(options?.jsonSchema),
				customContext,
				factoryOptions.onJsonError,
			),
		}

		set(customContext, 'form', context.form)
		set(customContext, 'params', context.params)
		set(customContext, 'queryString', context.queryString)
		set(customContext, 'json', context.json)

		return customContext as TContext &
			RequestContext<
				TFormSchema,
				TParamsSchema,
				TQueryStringSchema,
				TJsonSchema
			>
	}
}
