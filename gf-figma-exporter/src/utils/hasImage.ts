export default function hasImage(fills: readonly Paint[] | PluginAPI["mixed"]): boolean {
    if (!fills || !Array.isArray(fills)) {
        return false;
    }

    return fills.some((fill) => fill.type === 'IMAGE');
}