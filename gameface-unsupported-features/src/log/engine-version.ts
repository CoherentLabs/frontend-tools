/**
 * Resolves the Gameface/Cohtml engine version being probed, straight from the
 * Player's own startup line in its log ("Info: Initializing COHTML ver. X",
 * parsed by log-parser.ts into `LogParseResults.engineVersion`).
 *
 * The log is the ONLY source trusted for this. The Player path is not a
 * reliable substitute: it may not contain a version at all (a custom or
 * renamed install folder), or — worse — contain a STALE one (a copied/renamed
 * folder whose name no longer matches what's actually installed there). A
 * silently-wrong version stamped into gameface-features/versions/ would be
 * far harder to catch later than a loud failure right here.
 */
export function resolveEngineVersion(logEngineVersion: string | null | undefined): string {
    if (logEngineVersion) {
        return logEngineVersion;
    }
    throw new Error(
        'Could not determine the Gameface engine version: not found in the Player log ' +
            '("Initializing COHTML ver. ..."). Results were NOT written — an unversioned catalog ' +
            'cannot be safely merged into gameface-features/versions/. Check that the correct log ' +
            "file was found (see findActiveLogPath in log-parser.ts) and that it actually contains " +
            "the Player's startup banner.",
    );
}
