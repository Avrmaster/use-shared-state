import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react'

import { Context } from '#context/index.ts'
import { SharedKeys } from '#store/index.ts'

import { useSharedStateDispatch } from './useSharedStateDispatch.ts'

export function useSharedState<Key extends keyof SharedKeys & string>(key: Key) {
	type S = SharedKeys[Key]

	function useStateValueRaw(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
	function useStateValueRaw(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
	function useStateValueRaw(initialState?: S): [any, Dispatch<any>] {
		const store = useContext(Context)
		const [, rerender] = useState(0)
		const dispatch = useSharedStateDispatch(key)

		const valueRef = useRef<S>(
			store.get(key) ?? (typeof initialState === 'function' ? initialState() : initialState),
		)

		useEffect(() => {
			const onChange = (newValue: S) => {
				valueRef.current = newValue // immediately change value in ref
				rerender((s) => s + 1) // trigger rerender
			}

			if (store.get(key) === undefined && initialState !== undefined) {
				store.dispatch(key, initialState)
			}

			store.subscribe(key, onChange)
			return () => store.unsubscribe(key, onChange)
		}, [store, key, valueRef, initialState, rerender])

		return [valueRef.current, dispatch]
	}

	return useStateValueRaw
}
