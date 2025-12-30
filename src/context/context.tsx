import { createContext, PropsWithChildren, useMemo } from 'react'

import { Store, StoreConfig } from '#store/index.ts'

// by default, it's one for the whole browser.
// But we could also create local sub-copies if this ever needed
export const Context = createContext<Store>(new Store())
export const Provider = ({
	children,
	storeConfig,
}: PropsWithChildren<{ storeConfig?: StoreConfig }>) => (
	<Context.Provider value={useMemo(() => new Store(storeConfig), [storeConfig])}>
		{children}
	</Context.Provider>
)
