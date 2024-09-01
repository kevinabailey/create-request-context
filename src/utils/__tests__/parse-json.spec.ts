import { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
} from '../../types'
import { parseJson } from '../parse-json'

describe('parseJson', () => {
	test('should return undefined if given no schema', async () => {
		const result = await parseJson(
			{ request: new Request('http://localhost/'), params: {} },
			undefined,
			{},
		)

		expect(result).toBeUndefined()
	})

	test('should parse the json data', async () => {
		const request = {
			json: async () => ({ name: 'Jimmy', age: 5 }),
		} as Request

		const result = await parseJson(
			{ request, params: {} },
			z.object({ name: z.string(), age: z.coerce.number() }),
			{},
		)

		expect(result.name).toBe('Jimmy')
		expect(result.age).toBe(5)
	})

	test(`should error when it can't parse`, async () => {
		const request = {
			json: async () => ({}),
		} as Request

		await expect(() =>
			parseJson(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the json data.]`,
		)
	})

	test(`should error when it can't parse and call onParseError function`, async () => {
		const request = {
			json: async () => ({}),
		} as Request

		const onParseError = vi.fn()

		await expect(() =>
			parseJson(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the json data.]`,
		)

		expect(onParseError).toBeCalled()
	})

	test(`should when it fails to parse, any error thrown in the onParseError shouldn't throw default error`, async () => {
		const request = {
			json: async () => ({}),
		} as Request

		const onParseError = () => {
			throw new Error('custom error')
		}

		await expect(() =>
			parseJson(
				{ request, params: {} },
				z.object({ name: z.string(), age: z.coerce.number() }),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: custom error]`)
	})

	test(`should use onParseError and receive the given context and dataArgs`, async () => {
		const mockedDataArgs: DataFunctionArgs = {
			request: {
				json: async () => ({}),
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
			parseJson(
				mockedDataArgs,
				z.object({ name: z.string(), age: z.coerce.number() }),
				context,
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the json data.]`,
		)

		expect(context.test).toBeCalled()
		expect(context.test.mock.calls[0]![0]).toBe(mockedDataArgs)
	})
})
