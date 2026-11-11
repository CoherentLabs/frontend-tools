# Actions

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/interaction-manager/features/actions/

Allows to register actions that can be reused throughout your code.

## register(action, callback)

Registers an action. If the action is already registered, it will log an error to the console.

```ts
actions.register('action-to-register', (value: any) => {
    console.log(`The value is ${value}`);
});
```

### action

Type:

```ts
type action = string
```

The name of the action you want to register.

### callback

Type:

```ts
type callback = (value: any) => void;
```

The callback to be executed on this action. The arguments for the callback are provided from the `execute` method.

## execute(action, value)

Executes an action. If the action is not registered, it will log an error to the console.

```ts
actions.execute('action-to-register', 'Hello World!');
```

### action

Type:

```ts
type action = string
```

The name of the action you want to execute.

### value (optional)

Type:

```ts
type value = any
```

Provides a value to the callback.

## remove(action)

Removes the action. If the action is not registered, it will log an error to the console.

```ts
actions.remove('action-to-register');
```

### action

Type:

```ts
type action = string
```

The name of the action you want to remove.
