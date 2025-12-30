/** should be extended with actual keys */
export interface SharedKeys extends Record<string, any> {}

export type SharedStateStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface KeyPersistOption<T> {
	persist?: boolean | SharedStateStorage
	customEncoding?: {
		encode: (value: T) => string
		decode: (stored: string) => T
	}
}

export type PersistConfig<SK = SharedKeys> = Partial<{
	[K in keyof SK]: KeyPersistOption<SK[K]>
}>
