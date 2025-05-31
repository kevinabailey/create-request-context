import type {
	DataFunctionArgs,
	RequestContext,
	RequestContextConfiguratorOptions,
	RequestContextFactoryOptions,
	RequestContextOptions,
	ZodSchema,
	ZodUnknown,
} from './types'
import { parseForm } from './utils/parse-form'
import { parseJson } from './utils/parse-json'
import { parseParams } from './utils/parse-params'
import { parseQueryString } from './utils/parse-query-string'
import { set } from './utils/set'
import { unwrapSchema } from './utils/unwrap-schema'

export interface CreateMockedRequestContextOptions<
	TContext extends {} = {},
	TOptions extends {} = {},
> {
	skipParsing?: boolean
	overrideContext: (
		context: RequestContext<
			ZodUnknown,
			ZodUnknown,
			ZodUnknown,
			ZodUnknown
		> &
			TContext,
		options:
			| (RequestContextOptions<
					TContext,
					ZodUnknown,
					ZodUnknown,
					ZodUnknown,
					ZodUnknown
			  > &
					TOptions)
			| undefined,
	) => RequestContext<ZodUnknown, ZodUnknown, ZodUnknown, ZodUnknown> &
		TContext
}

/**
 * Factory to create a utility to mock `createRequestContext`.
 * You should use the same Context and Options type definitions as the `createRequestContext` uses that you plan to mock in testing.
 *
 * How you configure the context and errors here will be the defaults while using this in tests.
 * The returned `createMockedRequestContext` will include tools to modify these defaults for a single test.
 *
 * @param configuratorOrOptions the configurator function or options
 * @returns a `createMockedRequestContext` function to be used in your tests for `loader` and `action` functions for routes.
 */
export function createMockRequestContextFactory<
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

	return (
		options?: CreateMockedRequestContextOptions<TContext, TOptions>,
	) => {
		const skipParsing = options?.skipParsing ?? false
		const overrideContext = options?.overrideContext ?? (context => context)

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
			let customContext = await factoryOptions.configurator(args, options)

			// params
			const paramsSchema = unwrapSchema(
				skipParsing ? undefined : options?.paramsSchema,
			)
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
			const queryStringSchema = unwrapSchema(
				skipParsing ? undefined : options?.queryStringSchema,
			)
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
			const formSchema = unwrapSchema(
				skipParsing ? undefined : options?.formSchema,
			)
			if (formSchema) {
				set(
					customContext,
					'form',
					await parseForm(
						args,
						formSchema,
						customContext,
						factoryOptions.onQueryStringError,
					),
				)
			}

			// json
			const jsonSchema = unwrapSchema(
				skipParsing ? undefined : options?.jsonSchema,
			)
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

			return overrideContext(
				customContext as TContext &
					RequestContext<
						ZodUnknown,
						ZodUnknown,
						ZodUnknown,
						ZodUnknown
					>,
				options,
			)
		}
	}
}
