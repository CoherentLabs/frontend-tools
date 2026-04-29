export default async function fetchDataFromFontServer(method: string, data?: unknown): Promise<unknown> {
    const response = await fetch(`https://coherent-labs.com/google-fonts/api/${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
}
