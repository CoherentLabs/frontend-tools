const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/**
 * Deletes every Cohtml/Player log file in the scraper's working directory
 * before a fresh probe run.
 *
 * Cohtml's log filename is not stable across launches — observed as both
 * "CohtmlApplication.log" and "TestApp.log" in this same directory,
 * apparently depending on an app-identifier baked into the specific Player
 * build/sample (outside this project's control). If a stale log from a
 * PREVIOUS run (possibly a different engine version entirely) is still
 * sitting here under a name the current run doesn't happen to reuse, there
 * is no reliable way to tell it apart from a genuinely fresh one after the
 * fact — the Player path itself isn't a trustworthy source of the version
 * either (it can point anywhere, with no guarantee the folder name reflects
 * what's actually installed there).
 *
 * Deleting everything first sidesteps the whole problem: whatever log(s)
 * exist after this run's Player launches must have been written by THIS
 * run, whatever they're named.
 */
function main() {
    const entries = fs.readdirSync(ROOT);
    let deleted = 0;
    for (const entry of entries) {
        if (!/\.log$/i.test(entry)) continue;
        fs.unlinkSync(path.join(ROOT, entry));
        deleted++;
    }
    console.log(`[clean-cohtml-logs] Deleted ${deleted} stale log file(s).`);
}

main();
