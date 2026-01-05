import { Dispatch } from 'react'

import { KeyPersistOption, PersistConfig, SharedStateStorage } from './store.types.ts'
import { isKeyPersistOptionStorage } from './store.utils.ts'

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
		if (keyProps && mode !== 'restored' && newValue !== undefined) {
			if (newValue === null) {
				Store.getStorage(keyProps).removeItem(Store.getStorageKey(key))
			} else {
				try {
					Store.getStorage(keyProps).setItem(
						Store.getStorageKey(key),
						Store.getValueEncoder(keyProps)(newValue),
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
			if (keyProps) {
				const rawValue = Store.getStorage(keyProps).getItem(Store.getStorageKey(key))

				try {
					const decodedValue =
						rawValue !== null && rawValue !== undefined
							? Store.getValueDecoder(keyProps)(rawValue)
							: null
					if (decodedValue !== null) {
						this.dispatch(key, decodedValue, 'restored')
					}
				} catch (error) {
					console.error(`Couldn't decode storage value [key: ${key}, value: ${rawValue}]`, error)
					throw error
				}
			}
		}
	}

	private static getStorage(keyPersistOption: KeyPersistOption<any>): SharedStateStorage {
		if (isKeyPersistOptionStorage(keyPersistOption)) {
			return typeof keyPersistOption === 'boolean' ? localStorage : keyPersistOption
		}
		return Store.getStorage(keyPersistOption.storage)
	}
	private static getValueEncoder(keyPersistOption: KeyPersistOption<any>) {
		if (!isKeyPersistOptionStorage(keyPersistOption)) {
			return keyPersistOption.customEncoding?.encode ?? JSON.stringify
		}
		return JSON.stringify
	}
	private static getValueDecoder(keyPersistOption: KeyPersistOption<any>) {
		if (!isKeyPersistOptionStorage(keyPersistOption)) {
			return keyPersistOption.customEncoding?.encode ?? JSON.parse
		}
		return JSON.parse
	}
	private static getStorageKey(key: string) {
		return `#use-shared-state#${key}`
	}
}
