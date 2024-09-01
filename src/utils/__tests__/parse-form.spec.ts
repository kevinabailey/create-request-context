import { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextFormDataParserArgs,
	RequestContextZodParseErrorEventHandler,
} from '../../types'
import { parseForm } from '../parse-form'

describe('parseForm', () => {
	test('should return undefined if given no schema', async () => {
		const result = await parseForm(
			{ request: new Request('http://localhost/'), params: {} },
			undefined,
			{},
		)

		expect(result).toBeUndefined()
	})

	test('should parse the form data', async () => {
		const formData = new FormData()
		formData.append('name', 'Jimmy')
		formData.append('age', '5')

		const request = {
			formData: async () => formData,
		} as Request

		const result = await parseForm(
			{ request, params: {} },
			z.object({ name: z.string(), age: z.coerce.number() }),
			{},
		)

		expect(result.name).toBe('Jimmy')
		expect(result.age).toBe(5)
	})

	test(`should error when it can't parse`, async () => {
		const formData = new FormData()

		const request = {
			formData: async () => formData,
		} as Request

		await expect(() =>
			parseForm(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the form data.]`,
		)
	})

	test(`should error when it can't parse and call onParseError function`, async () => {
		const formData = new FormData()

		const request = {
			formData: async () => formData,
		} as Request

		const onParseError = vi.fn()

		await expect(() =>
			parseForm(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the form data.]`,
		)

		expect(onParseError).toBeCalled()
	})

	test(`should when it fails to parse, any error thrown in the onParseError shouldn't throw default error`, async () => {
		const formData = new FormData()

		const request = {
			formData: async () => formData,
		} as Request

		const onParseError = () => {
			throw new Error('custom error')
		}

		await expect(() =>
			parseForm(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: custom error]`)
	})

	test(`should use onParseError and receive the given context and dataArgs`, async () => {
		const formData = new FormData()

		const mockedDataArgs: DataFunctionArgs = {
			request: {
				formData: async () => formData,
			} as Request,
			params: {},
		}

		const context = {
			test: vi.fn(),
		}

		const onParseError: RequestContextZodParseErrorEventHandler<
			typeof context
		> = ({ context, dataArgs }) => {
			context.test(dataArgs)
		}

		await expect(() =>
			parseForm(
				mockedDataArgs,
				z.object({ name: z.string(), age: z.coerce.number() }),
				context,
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the form data.]`,
		)

		expect(context.test).toBeCalled()
		expect(context.test.mock.calls[0]![0]).toBe(mockedDataArgs)
	})

	test(`should use our custom form parser function`, async () => {
		const formData = new FormData()
		formData.append('name', 'Jimmy')
		formData.append('age', '5')

		const request = {
			formData: async () => formData,
		} as Request

		const customParser = vi.fn(
			async ({
				dataArgs: { request },
			}: RequestContextFormDataParserArgs<{}>) => {
				return await request.formData()
			},
		)

		const result = await parseForm(
			{ request, params: {} },
			z.object({ name: z.string(), age: z.coerce.number() }),
			{},
			undefined,
			customParser,
		)

		expect(customParser).toBeCalled()
		expect(result.name).toBe('Jimmy')
		expect(result.age).toBe(5)
	})
})
