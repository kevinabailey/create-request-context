import type {
	DataFunctionArgs,
	RequestContext,
	RequestContextConfiguratorOptions,
	RequestContextFactoryOptions,
	RequestContextOptions,
	ZodSchema,
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
		TFormSchema extends ZodSchema | undefined = undefined,
		TParamsSchema extends ZodSchema | undefined = undefined,
		TQueryStringSchema extends ZodSchema | undefined = undefined,
		TJsonSchema extends ZodSchema | undefined = undefined,
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

		// params
		const paramsSchema = unwrapSchema(options?.paramsSchema)
		set(
			customContext,
			'params',
			paramsSchema
				? await parseParams(
						args,
						paramsSchema,
						customContext,
						factoryOptions.onParamsError,
					)
				: args.params,
		)

		// query string
		const queryStringSchema = unwrapSchema(options?.queryStringSchema)
		if (queryStringSchema) {
			set(
				customContext,
				'queryString',
				await parseQueryString(
					args,
					queryStringSchema,
					customContext,
					factoryOptions.onQueryStringError,
				),
			)
		}

		// form
		const formSchema = unwrapSchema(options?.formSchema)
		if (formSchema) {
			set(
				customContext,
				'form',
				await parseForm(
					args,
					formSchema,
					customContext,
					factoryOptions.onFormError,
				),
			)
		}

		// json
		const jsonSchema = unwrapSchema(options?.jsonSchema)
		if (jsonSchema) {
			set(
				customContext,
				'json',
				await parseJson(
					args,
					jsonSchema,
					customContext,
					factoryOptions.onJsonError,
				),
			)
		}

		return customContext as TContext &
			RequestContext<
				TFormSchema,
				TParamsSchema,
				TQueryStringSchema,
				TJsonSchema
			>
	}
}
