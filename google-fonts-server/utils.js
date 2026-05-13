module.exports.getFontWidthSuffix = function (width) {
    return width ? `-${width.toLowerCase()}` : '';
}

module.exports.parseStyle = function(style) {
    const s = style.toLowerCase();

    const italic = isItalicStyle(s);
    const width = getFontWidth(s);

    return { italic, width };
}

function isItalicStyle(style) {
    return style.toLowerCase().includes('italic');
}

function getFontWidth(style) {
    const s = style.toLowerCase();
    if (s.includes('condensed')) return 'Condensed';
    if (s.includes('expanded')) return 'Expanded';
    return null;
}

module.exports.sanitizeFontName = function(fontName) {
    return fontName.replace(/[^a-z0-9]/gi, '-').toLowerCase(); // Replace non-alphanumeric characters with hyphens and convert to lowercase
}

module.exports.loadDefaultFonts = function (
    fontWeights,
    subsets
) {
    return {
        family: 'noto-sans',
        subsets: subsets,
        weights: fontWeights,
    };
}

module.exports.getSubsetFromCharacters = function(characters) {
    const subsets = new Set();

    for (const char of characters) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) continue;
        const subset = getUnicodeSubset(codePoint);
        subsets.add(subset);
    }

    return Array.from(subsets);
}

function getUnicodeSubset(codePoint) {
    if (codePoint >= 0x0000 && codePoint <= 0x00FF) {
        return 'latin';
    } else if (codePoint >= 0x0100 && codePoint <= 0x017F) {
        return 'latin-ext';
    } else if (codePoint >= 0x0400 && codePoint <= 0x04FF) {
        return 'cyrillic';
    } else if (codePoint >= 0x0500 && codePoint <= 0x052F) {
        return 'cyrillic-ext';
    } else if (codePoint >= 0x0370 && codePoint <= 0x03FF) {
        return 'greek';
    } else if (codePoint >= 0x1F00 && codePoint <= 0x1FFF) {
        return 'greek-ext';
    } else if (codePoint >= 0x0590 && codePoint <= 0x05FF) {
        return 'hebrew';
    } else if (codePoint >= 0x0600 && codePoint <= 0x06FF) {
        return 'arabic';
    } else if (codePoint >= 0x0900 && codePoint <= 0x097F) {
        return 'devanagari';
    } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
        return 'chinese-simplified';
    } else if (codePoint >= 0x3400 && codePoint <= 0x4DBF) {
        return 'chinese-traditional';
    } else {
        return 'latin'; // default subset
    } 
}