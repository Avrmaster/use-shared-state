import { Dispatch, SetStateAction, useCallback, useContext } from 'react'

import { Context } from '#context/context.tsx'
import { SharedKeys } from '#store/index.ts'

export function useSharedStateDispatch(key: keyof SharedKeys & string) {
	type S = SharedKeys[typeof key]

	function useStateDispatchRaw(): Dispatch<SetStateAction<S>> {
		const store = useContext(Context)

		return useCallback(
			(valueOrOnChange: SetStateAction<S>) => {
				const newValue =
					typeof valueOrOnChange === 'function'
						? (valueOrOnChange as (prevState: S) => S)(store.get(key))
						: valueOrOnChange
				store.dispatch(key, newValue)
			},
			[key, store],
		)
	}

	return useStateDispatchRaw
}
