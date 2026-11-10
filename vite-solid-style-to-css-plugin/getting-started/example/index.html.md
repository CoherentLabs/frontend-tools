# Example

Source: https://frontend-tools.coherent-labs.com/vite-solid-style-to-css-plugin/getting-started/example/

Consider the following source code:

```jsx
const Component = () => {
    return <div style={{ width: '50%', height: '50%' }} />
}
```

The plugin will automatically transform the div element into:

```html
<div class="_div_12345"></div>
```

The generated `_div_12345` class will contain the following CSS:

```css
._div_12345 {
    width: 50%;
    height: 50%;
}
```
