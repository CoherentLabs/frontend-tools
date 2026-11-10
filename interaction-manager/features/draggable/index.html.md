# Draggable

Source: https://frontend-tools.coherent-labs.com/interaction-manager/features/draggable/

Allows you to drag around elements on the screen.

## Usage

```ts
new draggable(draggableOptions);
```

## Basic implementation

```ts
const square = new draggable({ element: '.square' });
```

## draggableOptions

### element

Type:

```ts
type element = string
```

The element selector.

### restrictTo

Type:

```ts
type restrictTo = string;
```

Restricts the dragged element to another element. That way the dragged element won’t go out of the other element bounds.

**Example**

```ts
const square = new draggable({ element: '.square', restrictTo: '.container' });
```

### dragClass

Type:

```ts
type dragClass = string
```

Class to be added to the dragged element.

### lockAxis

Type:

```ts
type lockAxis = 'x' | 'y'
```

Locks the dragged element to either the x or y axis.

**Example**

```ts
const square1 = new draggable({ element: '.square1', lockAxis: 'x' });
const square2 = new draggable({ element: '.square2', lockAxis: 'y' });
```

### onDragStart

Type:

```ts
type onDragStart = (element: HTMLElement) => void;
```

Executes when you start dragging the element.

### onDragMove

Type:

```ts
type onDragMove = (position: { x: number; y: number }) => void;
```

Executes when you move the dragged element.

### onDragEnd

Type:

```ts
type onDragEnd = (element: HTMLElement) => void;
```

Executes when you stop dragging the element.

## Properties

### actionName readonly

Type:

```ts
type actionName = string
```

The name of the action that can be used to programmatically drag the element.

### touchEnabled

Type:

```ts
type touchEnabled = boolean
```

Enables or disables touch events. Default is `false`.

## Methods

### deinit()

Removes the event listeners and disables the draggable functionality.

## Actions

You are able to drag elements using actions. Since every draggable action is unique you can do the following:

```ts
const element = new draggable({ element: '.square'});

actions.execute(element.actionName, {x: 100, y: 100, index: 0});
```

You will need to pass the x and y coordinates where you want the element to go and the index of the element.
