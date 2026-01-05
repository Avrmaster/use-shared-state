# use-shared-state

Fully-typed shared state for React with `useState` semantics.

* * *

[![version](https://img.shields.io/npm/v/use-shared-state.svg?style=flat-square)](https://www.npmjs.com/package/use-shared-state)
[![MIT License](https://img.shields.io/npm/l/use-shared-state.svg?style=flat-square)](./LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-included-blue?style=flat-square)](#typescript-experience)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## What is this?

`use-shared-state` is a small React-only hook library that lets you share state
between unrelated components with the same API and mental model as React’s
`useState`.

State is shared by **globally typed keys**, ensuring that:
- every key has exactly one type across the entire app
- all consumers stay automatically synchronized
- no reducers, actions, or selectors are needed

## Quick example

Define a shared key once:

```ts
declare module 'use-shared-state' {
    export interface SharedKeys {
        apiToken: string | null
    }
}
```

Update shared state in one component:

```tsx
import { useSharedState } from 'use-shared-state'

function LoginScreen() {
  const [, setApiToken] = useSharedState('apiToken')(null)

  return (
    <button onClick={() => setApiToken('secret-token')}>
      Login
    </button>
  )
}
```

Consume the same state somewhere else:

```tsx
function UserProfile() {
  const [apiToken] = useSharedState('apiToken')()

  return apiToken
    ? <span>Authenticated</span>
    : <span>Not authenticated</span>
}
```

## Table of Contents

- [What it gives you](#what-it-gives-you)
- [Installation](#installation)
- [Usage](#usage)
    - [Initialization and synchronization rules](#initialization-and-synchronization-rules)
    - [Provider scopes](#provider-scopes)
    - [Persistence](#persistence)
    - [Dispatch-only hook](#dispatch-only-hook)
- [TypeScript experience](#typescript-experience)
- [Update semantics](#update-semantics)
- [Limitations](#limitations)
- [Motivation and comparison](#motivation-and-comparison)
- [FAQ](#faq)
- [License](#license)

## What it gives you

- `useState`-compatible API (`useSharedState(key)` returns the same tuple)
- Fully typed shared keys via TypeScript module augmentation
- Automatic synchronization across components using the same key
- Optional scoping via `Provider`
- Optional persistence per key (localStorage / sessionStorage / custom storage)
- Dispatch-only hook to avoid rerenders when you only need to update state

## Installation

```sh
npm install use-shared-state
```

```sh
pnpm add use-shared-state
```

```sh
yarn add use-shared-state
```

## Usage

```ts
import { useSharedState } from 'use-shared-state'
```

`useSharedState(key)` returns a `useState`-like hook. It accepts:
- a default value: `useSharedState('key')(defaultValue)`
- an initializer function: `useSharedState('key')(() => defaultValue)`
- nothing: `useSharedState('key')()` (value will be `T | undefined`)

### Initialization and synchronization rules

For each key, the first component to render decides the initial value:

1. If persistence is enabled and a stored value exists, it is restored.
2. Otherwise, if a default value / initializer was provided, it is used.
3. Otherwise, the value remains `undefined`.

If the first usage results in `undefined`, a later usage may still provide a
default and initialize the key. Once initialized, the value is shared and kept
in sync for all consumers.

### Provider scopes

By default, shared state is global to the application.

Wrap a subtree in `Provider` to create an isolated store:

```tsx
import { Provider } from 'use-shared-state'

function App() {
  return (
    <Provider>
      <Feature />
    </Provider>
  )
}
```

Nested providers create independent stores.

### Persistence

Persistence is configured per key via the `Provider`'s `storeConfig` prop.

The simplest form enables persistence for a key using `localStorage`:

```tsx
<Provider
  storeConfig={{
    persist: {
      apiToken: true,
    },
  }}
>
  <Root />
</Provider>
```

You can also specify a custom storage, such as `sessionStorage`:

```tsx
<Provider
  storeConfig={{
    persist: {
      apiToken: sessionStorage,
    },
  }}
>
  <Root />
</Provider>
```

For advanced use cases, you can provide a full configuration object per key:

```tsx
<Provider
  storeConfig={{
    persist: {
      apiToken: {
        storage: sessionStorage,
        customEncoding: {
          encode: value => value.accessToken,
          decode: stored => ({ accessToken: stored }),
        },
      },
    },
  }}
>
  <Root />
</Provider>
```

Rules:
- `true` uses `localStorage`
- a `Storage`-like object uses that storage
- `false` or missing keys disable persistence
- values are JSON-encoded by default
- `customEncoding` allows full control over serialization



### Dispatch-only hook

Use `useSharedStateDispatch` if you only need to update state and want to avoid
rerenders:

```tsx
import { useSharedStateDispatch } from 'use-shared-state'

function LogoutButton() {
  const setApiToken = useSharedStateDispatch('apiToken')

  return <button onClick={() => setApiToken(null)}>Logout</button>
}
```

## TypeScript experience

This library is designed to be TypeScript-first.

- Keys must exist in `SharedKeys`
- Each key has exactly one type across the entire app
- Autocomplete works for keys and values
- Using an unknown key or wrong type is a compile-time error

Example error cases:
- using a key that is not declared
- setting a value of the wrong type
- attempting to use generics to override a key’s type

This design intentionally prevents subtle runtime bugs caused by inconsistent
shared state shapes.

## Update semantics

`setState` behaves exactly like React’s `useState` setter:
- accepts a value or an updater function
- no automatic merging (merge manually if needed)
- updates always notify all subscribers, even if the value is unchanged

## Limitations

- React-only (not framework-agnostic)
- Uses browser storage APIs for persistence
- Not SSR-safe by default (client-only usage recommended)

## Motivation and comparison

`use-shared-state` is for cases where you want shared state without introducing
reducers, actions, selectors, or a large state-management abstraction.

Compared to React Context:
- no provider wiring per piece of state
- no memoization boilerplate

Compared to larger state managers:
- intentionally minimal API
- strong guarantees around shared key types

## FAQ

### Why are generics not supported?
To ensure the same key cannot be used with different types in different parts of
the application.

### Why is my value `undefined`?
Because no persisted value exists and no default value has been provided yet.

### Why didn’t my default value apply?
Once a key is initialized, later defaults are ignored.

## License

MIT