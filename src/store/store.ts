import { Dispatch } from 'react'

import { PersistConfig, SharedStateStorage } from './store.types.ts'

export interface StoreConfig {
	persist?: PersistConfig
}

/** Notice: Store is NOT supposed to be used outside the library */
export class Store {
	// private readonly _keyProps: { [k: string]: KeyProps } = {}
	private readonly _state: { [k: string]: any } = {}
	private readonly _listeners: { [k: string]: Dispatch<any>[] } = {}

	public constructor(private readonly config: StoreConfig = {}) {}

	public subscribe = (key: string, listener: Dispatch<any>) => {
		this._listeners[key] = [...new Set([...(this._listeners[key] || []), listener])]
	}
	public unsubscribe = (key: string, listener: Dispatch<any>) => {
		this._listeners[key] = this._listeners[key]?.filter((cl) => cl !== listener)
		if (this._listeners[key]?.length === 0) delete this._listeners[key]
	}

	public dispatch = (key: string, newValue: any, mode?: 'normal' | 'restored') => {
		this._state[key] = newValue
		if (this._listeners[key]) {
			for (const listener of this._listeners[key]) {
				listener(newValue)
			}
		}

		const keyProps = this.config.persist?.[key]
		// save to storage only if it was not dispatched using storage
		if (keyProps?.persist && mode !== 'restored' && newValue !== undefined) {
			if (newValue === null) {
				Store.getStorage(keyProps.persist).removeItem(Store.getStorageKey(key))
			} else {
				try {
					Store.getStorage(keyProps.persist).setItem(
						Store.getStorageKey(key),
						(keyProps.customEncoding?.encode ?? JSON.stringify)(newValue),
					)
				} catch (error) {
					console.error(`Couldn't encode storage value [key: ${key}, value: ${newValue}]`, error)
					throw error
				}
			}
		}
	}
	public get = (key: string) => {
		this.invalidateFromPersist(key)
		return this._state[key]
	}

	private invalidateFromPersist(key: string) {
		// if a key wasn't initialised in memory, trigger loading from the persist storage
		if (this._state[key] === undefined) {
			const keyProps = this.config.persist?.[key]
			if (keyProps?.persist) {
				const rawValue = Store.getStorage(keyProps.persist).getItem(Store.getStorageKey(key))

				try {
					const decodedValue =
						rawValue !== null ? (keyProps.customEncoding?.decode ?? JSON.parse)(rawValue) : null
					this.dispatch(key, decodedValue, 'restored')
				} catch (error) {
					console.error(`Couldn't decode storage value [key: ${key}, value: ${rawValue}]`, error)
					throw error
				}
			}
		}
	}

	private static getStorage(persist: true | SharedStateStorage): SharedStateStorage {
		return typeof persist === 'boolean' ? localStorage : persist
	}
	private static getStorageKey(key: string) {
		return `#use-shared-state#${key}`
	}
}
