/**
 * This is a simple useful general-purpose hook for containers that need
 * to share a common property without "callback-hell" ideology.
 * once given an entityName constant, this hooks has similar api to React's useState.
 * however, once you update the value with set'Something" callback, it's going to propagate
 * to all components, that are using this hook with identical entityName.
 */

export * from './store/index.ts'
export * from './context/index.ts'
export * from './hooks/index.ts'
