# Rotate

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/interaction-manager/features/rotate/

Allows you to rotate an element.

## Usage

```ts
new rotate(rotateOptions)
```

## Basic implementation

```ts
const circle = new rotate({ element: '.circle1' });
```

## rotateOptions

```ts
interface RotateOptions {
    element: string;
    snapAngle?: number;
    onRotation?: (angle: number) => void;
}
```

### element

Type:

```ts
type element = string
```

The element selector.

### snapAngle

Type:

```ts
type snapAngle = number
```

`default: 1`

The angle that the rotation snaps to.

### onRotation

Type:

```ts
type onRotation = (angle: number) => void;
```

Executes when the element rotates.

## Properties

### actionName readonly

Type:

```ts
type actionName = string
```

The name of the action that can be used to programmatically rotate the element.

### touchEnabled

Type:

```ts
type touchEnabled = boolean
```

Enables or disables touch events. Default is `false`.

## Methods

### deinit()

Removes the event listeners and disables the rotate functionality.

## Actions

You are able to rotate elements using actions. Since every rotate action is unique you can do the following:

```ts
const element = new rotate({ element: '.circle1' });

actions.execute(element.actionName, 90);
```
