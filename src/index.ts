export function useSharedState<T>(): [T, (newVal: T) => any] {
	return [null as T, () => null] as const
}
