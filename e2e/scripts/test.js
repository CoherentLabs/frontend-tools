const http = require('http-server');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 54321;
const serverDir = path.resolve(__dirname, '../examples');
const server = http.createServer({ root: serverDir });

let testProcess;

function shutdown() {
    server.close();

    if (testProcess && testProcess.pid) {
        testProcess.kill('SIGTERM');
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    const extraArgs = process.argv.slice(2);

    testProcess = spawn(
        'node',
        ['./bin/run.js', '--config=./examples/gameface-e2e-config.js', ...extraArgs],
        { stdio: 'inherit' }
    );

    testProcess.on('exit', (code) => {
        console.log(`Tests exited with code ${code}`);
        process.exit(code);
    });

    testProcess.on('error', (err) => {
        console.error('Test process error:', err);
        process.exit(1);
    });
});
