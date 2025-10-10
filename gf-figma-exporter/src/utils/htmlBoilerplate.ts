import sanitizeNames from "./sanitizeNames";

function generateHTMLBoilerplate(bodyContent: string, title: string): string {
    return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>${title}</title>
                    <link rel="stylesheet" href="./${sanitizeNames(title)}.css">
                </head>
                <body>
                    ${bodyContent}
                </body>
            </html>
    `;
}

export default generateHTMLBoilerplate;