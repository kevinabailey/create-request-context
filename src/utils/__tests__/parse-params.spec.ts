import { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
} from '../../types'
import { parseParams } from '../parse-params'

describe('parseParams', () => {
	test('should return params if given no schema', async () => {
		const result = await parseParams(
			{ request: {} as Request, params: { page: '5' } },
			undefined,
			{},
		)

		expect(result.page).toBe('5')
	})

	test('should parse the params data', async () => {
		const result = await parseParams(
			{ request: {} as Request, params: { page: '5' } },
			z.object({
				page: z.coerce.number(),
			}),
			{},
		)

		expect(result.page).toBe(5)
	})

	test(`should error when it can't parse`, async () => {
		await expect(() =>
			parseParams(
				{ request: {} as Request, params: { foo: 'bar' } },
				z.object({
					page: z.coerce.number(),
				}),
				{},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the params.]`,
		)
	})

	test(`should error when it can't parse and call onParseError function`, async () => {
		const onParseError = vi.fn()

		await expect(() =>
			parseParams(
				{ request: {} as Request, params: { foo: 'bar' } },
				z.object({
					page: z.coerce.number(),
				}),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the params.]`,
		)

		expect(onParseError).toBeCalled()
	})

	test(`should when it fails to parse, any error thrown in the onParseError shouldn't throw default error`, async () => {
		const onParseError = () => {
			throw new Error('custom error')
		}

		await expect(() =>
			parseParams(
				{ request: {} as Request, params: { foo: 'bar' } },
				z.object({
					page: z.coerce.number(),
				}),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: custom error]`)
	})

	test(`should use onParseError and receive the given context and dataArgs`, async () => {
		const context = {
			test: vi.fn(),
		}

		const mockedDataArgs: DataFunctionArgs = {
			request: {} as Request,
			params: { foo: 'bar' },
		}

		const onParseError: RequestContextZodParseErrorEventHandler<
			typeof context
		> = ({ context, dataArgs }) => {
			context.test(dataArgs)
		}

		await expect(() =>
			parseParams(
				mockedDataArgs,
				z.object({
					page: z.coerce.number(),
				}),
				context,
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the params.]`,
		)

		expect(context.test).toBeCalled()
		expect(context.test.mock.calls[0]![0]).toBe(mockedDataArgs)
	})
})
