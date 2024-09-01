import { z } from 'zod'
import type {
	DataFunctionArgs,
	RequestContextZodParseErrorEventHandler,
} from '../../types'
import { parseQueryString } from '../parse-query-string'

describe('parseQueryString', () => {
	test('should return undefined if given no schema', async () => {
		const result = await parseQueryString(
			{
				request: new Request(
					'http://localhost/?page=1&size=25&sort=asc',
				),
				params: {},
			},
			undefined,
			{},
		)

		expect(result).toBeUndefined()
	})

	test('should parse the params data', async () => {
		const result = await parseQueryString(
			{
				request: new Request(
					'http://localhost/?page=1&size=25&sort=asc',
				),
				params: {},
			},
			z.object({
				page: z.coerce.number(),
				size: z.coerce.number(),
				sort: z.enum(['asc', 'desc']),
			}),
			{},
		)

		expect(result.page).toBe(1)
		expect(result.size).toBe(25)
		expect(result.sort).toBe('asc')
	})

	test(`should error when it can't parse`, async () => {
		await expect(() =>
			parseQueryString(
				{
					request: new Request(
						'http://localhost/?page=1&size=25&sort=asc',
					),
					params: {},
				},
				z.object({
					id: z.coerce.number(),
				}),
				{},
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the query string.]`,
		)
	})

	test(`should error when it can't parse and call onParseError function`, async () => {
		const onParseError = vi.fn()

		await expect(() =>
			parseQueryString(
				{
					request: new Request(
						'http://localhost/?page=1&size=25&sort=asc',
					),
					params: {},
				},
				z.object({
					id: z.coerce.number(),
				}),
				{},
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the query string.]`,
		)

		expect(onParseError).toBeCalled()
	})

	test(`should when it fails to parse, any error thrown in the onParseError shouldn't throw default error`, async () => {
		const onParseError = () => {
			throw new Error('custom error')
		}

		await expect(() =>
			parseQueryString(
				{
					request: new Request(
						'http://localhost/?page=1&size=25&sort=asc',
					),
					params: {},
				},
				z.object({
					id: z.coerce.number(),
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
			request: new Request('http://localhost/?page=1&size=25&sort=asc'),
			params: {},
		}

		const onParseError: RequestContextZodParseErrorEventHandler<
			typeof context
		> = ({ context, dataArgs }) => {
			context.test(dataArgs)
		}

		await expect(() =>
			parseQueryString(
				mockedDataArgs,
				z.object({
					id: z.coerce.number(),
				}),
				context,
				onParseError,
			),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: Several issues were found while trying to parse the query string.]`,
		)

		expect(context.test).toBeCalled()
		expect(context.test.mock.calls[0]![0]).toBe(mockedDataArgs)
	})
})
