import { compact } from './compact'
import { isNullOrUndefined } from './is-null-or-undefined'
import { isObject } from './is-object.js'
import { isUndefined } from './is-undefined'

export const get = <T>(
	object: T,
	path?: string,
	defaultValue?: unknown,
): any => {
	if (!path || !isObject(object)) {
		return defaultValue
	}

	const result = compact(path.split(/[,[\].]+?/)).reduce(
		(result, key) =>
			isNullOrUndefined(result) ? result : result[key as keyof {}],
		object,
	)

	return isUndefined(result) || result === object
		? isUndefined(object[path as keyof T])
			? defaultValue
			: object[path as keyof T]
		: result
}
