import { z } from 'zod/v4'
import { createRequestContextFactory } from '../factory'

describe('Zod v4: createRequestContextFactory', () => {
	test('should parse query strings and params', async () => {
		const createRequestContext = createRequestContextFactory(() => ({}))

		expect(typeof createRequestContext).toBe('function')

		const context = await createRequestContext(
			{
				params: { id: '5' },
				request: new Request(
					'http://localhost/test/?page=1&size=25&sort=asc',
				),
			},
			{
				queryStringSchema: z.object({
					page: z.coerce.number(),
					size: z.coerce.number(),
					sort: z.string(),
				}),
				paramsSchema: z.object({ id: z.coerce.number() }),
			},
		)

		expect(context.form).toBeUndefined()
		expect(context.params.id).toBe(5)
		expect(context.queryString.page).toBe(1)
		expect(context.queryString.size).toBe(25)
		expect(context.queryString.sort).toBe('asc')
	})

	test('should call onParseError handler for params', async () => {
		const onParamsError = vi.fn()
		const createRequestContext = createRequestContextFactory({
			configurator: () => ({}),
			onParamsError,
		})

		expect(typeof createRequestContext).toBe('function')

		await expect(() =>
			createRequestContext(
				{
					params: { thing: '5' },
					request: new Request(
						'http://localhost/test/?page=1&size=25&sort=asc',
					),
				},
				{
					paramsSchema: z.object({ id: z.coerce.number() }),
				},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the params.]`,
		)

		expect(onParamsError).toBeCalled()
	})

	test('should call onParseError handler for query string', async () => {
		const onQueryStringError = vi.fn()
		const createRequestContext = createRequestContextFactory({
			configurator: () => ({}),
			onQueryStringError,
		})

		expect(typeof createRequestContext).toBe('function')

		await expect(() =>
			createRequestContext(
				{
					params: {},
					request: new Request(
						'http://localhost/test/?page=1&size=25&sort=asc',
					),
				},
				{
					queryStringSchema: z.object({ id: z.coerce.number() }),
				},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the query string.]`,
		)

		expect(onQueryStringError).toBeCalled()
	})

	test('should parse form data', async () => {
		const createRequestContext = createRequestContextFactory(() => ({}))

		expect(typeof createRequestContext).toBe('function')

		const formData = new FormData()
		formData.append('name', 'Jimmy')
		formData.append('age', '5')

		const request = {
			formData: async () => formData,
		} as Request

		const context = await createRequestContext(
			{
				params: {},
				request,
			},
			{
				formSchema: z.object({
					name: z.string(),
					age: z.coerce.number(),
				}),
			},
		)

		expect(context.form.age).toBe(5)
		expect(context.form.name).toBe('Jimmy')
	})

	test('should call onParseError handler for form data', async () => {
		const onFormError = vi.fn()
		const createRequestContext = createRequestContextFactory({
			configurator: () => ({}),
			onFormError,
		})

		expect(typeof createRequestContext).toBe('function')

		const formData = new FormData()
		formData.append('name', 'Jimmy')
		formData.append('age', '5')

		const request = {
			formData: async () => formData,
		} as Request

		await expect(() =>
			createRequestContext(
				{
					params: {},
					request,
				},
				{
					formSchema: z.object({ id: z.coerce.number() }),
				},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the form data.]`,
		)

		expect(onFormError).toBeCalled()
	})

	test('should parse json data', async () => {
		const createRequestContext = createRequestContextFactory(() => ({}))

		expect(typeof createRequestContext).toBe('function')

		const data = { name: 'Jimmy', age: 5 }

		const request = {
			json: async () => data,
		} as Request

		const context = await createRequestContext(
			{
				params: {},
				request,
			},
			{
				jsonSchema: z.object({
					name: z.string(),
					age: z.coerce.number(),
				}),
			},
		)

		expect(context.json.age).toBe(5)
		expect(context.json.name).toBe('Jimmy')
	})

	test('should call onParseError handler for json data', async () => {
		const onJsonError = vi.fn()
		const createRequestContext = createRequestContextFactory({
			configurator: () => ({}),
			onJsonError,
		})

		expect(typeof createRequestContext).toBe('function')

		const data = { name: 'Jimmy', age: 5 }

		const request = {
			json: async () => data,
		} as Request

		await expect(() =>
			createRequestContext(
				{
					params: {},
					request,
				},
				{
					jsonSchema: z.object({ id: z.coerce.number() }),
				},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the json data.]`,
		)

		expect(onJsonError).toBeCalled()
	})
})
