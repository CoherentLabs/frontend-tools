export function Sample() {
  return (
    <div style={{ 'align-content': "space", test: 'alabala', accentColor: 'test' }}>
      <p style="align-content: space-between;">Example JSX with embedded CSS (supported properties only).</p>
      <p style={{ fontSize: "min(12px, 16px)" }}>unsupported min() in inline style</p>
    </div>
  );
}
