import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTestMatrix } from "./extract-catalog-test-matrix.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const committedPath = join(__dirname, "..", "tests", "generated", "test-matrix.json");

/**
 * @param {object} matrix
 */
function stablePayload(matrix) {
  const { generatedAt: _g, ...rest } = matrix;
  return JSON.stringify(rest);
}

function main() {
  let committed;
  try {
    committed = JSON.parse(readFileSync(committedPath, "utf8"));
  } catch {
    console.error(`Missing ${committedPath}. Run: npm run test:extract-matrix`);
    process.exit(1);
  }

  const fresh = buildTestMatrix();
  if (stablePayload(committed) !== stablePayload(fresh)) {
    console.error(
      "test-matrix.json is out of date. Run: npm run test:extract-matrix",
    );
    process.exit(1);
  }

  console.log(`test-matrix freshness: ok (${committed.rowCount} rows)`);
}

main();
