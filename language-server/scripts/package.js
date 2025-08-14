const { execSync } = require('child_process');

try {
    execSync('vsce --version');
    const result = execSync('vsce package -o downloads', { stdio: 'inherit', encoding: 'utf8' });
    console.log(result);
} catch (err) {
    if (err.message.match('not recognized')) {
        execSync('npm i -g vsce');
        execSync('vsce package -o downloads', { stdio: 'inherit', encoding: 'utf8' });
    } else {
        console.error(err);
    }
}