const checkFonts = async () => {
    const fontsIDoHave = ['Roboto', 'Comic Sans MS', 'Open Sans']; // Comic Sans is not a Google Font

    const response = await fetch('http://localhost:3000/api/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textSegments: {}, usedFonts: fontsIDoHave }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('Filtered Data:', result);
};

checkFonts()
    .then(() => {
        console.log('Font check completed.');
    })
    .catch((error) => {
        console.error('Unexpected error:', error);
    });
