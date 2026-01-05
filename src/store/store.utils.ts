import { KeyPersistOptionStorage } from './store.types.ts'

export function isKeyPersistOptionStorage(
	keyPersistOption: any,
): keyPersistOption is KeyPersistOptionStorage {
	return typeof keyPersistOption === 'boolean' || !!keyPersistOption.setItem
}
