import type {
	ZodInferred,
	ZodParseErrorEventBase,
	ZodParseErrorEventHandler,
	ZodSchema,
} from './zod'

/**
 * The parameters that were parsed from the URL path.
 */
export type Params<Key extends string = string> = {
	readonly [key in Key]: string | undefined
}

/**
 * Minimum DataFunctionArgs in order for our context helper to work. A request and params. Similar to Remix or React Router.
 */
export interface DataFunctionArgs {
	request: Request
	params: Params
}

/**
 * A base RequestContext containing parsed params, queryString and/or form depending on what schemas were given.
 */
export interface RequestContext<
	TFormSchema extends ZodSchema | undefined = undefined,
	TParamsSchema extends ZodSchema | undefined = undefined,
	TQueryStringSchema extends ZodSchema | undefined = undefined,
	TJsonSchema extends ZodSchema | undefined = undefined,
> {
	form: TFormSchema extends undefined ? undefined : ZodInferred<TFormSchema>
	params: TParamsSchema extends undefined
		? DataFunctionArgs['params']
		: ZodInferred<TParamsSchema>
	queryString: TQueryStringSchema extends undefined
		? undefined
		: ZodInferred<TQueryStringSchema>
	json: TJsonSchema extends undefined ? undefined : ZodInferred<TJsonSchema>
}

/**
 * FormData Parsers arguments that are useful for when you need a custom way to parse your form data.
 */
export interface RequestContextFormDataParserArgs<TContext extends {}> {
	dataArgs: DataFunctionArgs
	context: TContext
}

/**
 * A base RequestContextOptions asking for zod schemas for params, queryString and/or form data.
 */
export type RequestContextOptions<
	TContext extends {},
	TFormSchema extends ZodSchema | undefined = undefined,
	TParamsSchema extends ZodSchema | undefined = undefined,
	TQueryStringSchema extends ZodSchema | undefined = undefined,
	TJsonSchema extends ZodSchema | undefined = undefined,
> = {
	/**
	 * Zod Schema to parse and enforce for a submitted form
	 */
	formSchema?: TFormSchema | (() => TFormSchema)
	/**
	 * Zod Schema to parse and enforce for route parameters
	 */
	paramsSchema?: TParamsSchema | (() => TParamsSchema)
	/**
	 * Zod Schema to parse and enforce for query string parameters
	 */
	queryStringSchema?: TQueryStringSchema | (() => TQueryStringSchema)
	/**
	 * Zod Schema to parse and enforce for posted json
	 */
	jsonSchema?: TJsonSchema | (() => TJsonSchema)
	/**
	 * A custom formData parser.
	 * Defaults to `await request.formData()`
	 * @param args helpful information to allow you to parse your formData.
	 * @returns the parsed form data.
	 */
	formDataParser?: (
		args: RequestContextFormDataParserArgs<TContext>,
	) => Promise<FormData>
}

/**
 * Event object for Zod schema parsing failures.
 */
export type RequestContextZodParseErrorEvent<TContext extends {}> =
	ZodParseErrorEventBase & {
		/** The custom context from the configurator. */
		context: TContext
		/** The original request data args. */
		dataArgs: DataFunctionArgs
	}

/**
 * A callback for when Zod schema parsing fails.
 * @param event The error event details.
 */
export type RequestContextZodParseErrorEventHandler<TContext extends {}> =
	ZodParseErrorEventHandler<RequestContextZodParseErrorEvent<TContext>>

/**
 * The main configurator function for the requestContextFactory. This functions allows you to add additional checks and objects to the context.
 */
export type RequestContextConfiguratorFunction<
	TContext extends {},
	TOptions extends {},
> = (
	dataArgs: DataFunctionArgs,
	options?: TOptions,
) => Promise<TContext> | TContext

/**
 * Options for the requestContextFactory.
 */
export type RequestContextConfiguratorOptions<
	TContext extends {},
	TOptions extends {},
> = {
	/**
	 * The main configurator function for the requestContextFactory.
	 */
	configurator: RequestContextConfiguratorFunction<TContext, TOptions>
	/**
	 * Handler for when the zod parser fails to parse the form data.
	 */
	onFormError?: RequestContextZodParseErrorEventHandler<TContext>
	/**
	 * Handler for when the zod parser fails to parse the params.
	 */
	onParamsError?: RequestContextZodParseErrorEventHandler<TContext>
	/**
	 * Handler for when the zod parser fails to parse the query string.
	 */
	onQueryStringError?: RequestContextZodParseErrorEventHandler<TContext>
	/**
	 * Handler for when the zod parser fails to parse the json data.
	 */
	onJsonError?: RequestContextZodParseErrorEventHandler<TContext>
}

/**
 * Options for creating a `createRequestContext` function from the factory. Can either be the configurator function or an object with additional options.
 */
export type RequestContextFactoryOptions<
	TContext extends {},
	TOptions extends {},
> =
	| RequestContextConfiguratorFunction<TContext, TOptions>
	| RequestContextConfiguratorOptions<TContext, TOptions>
