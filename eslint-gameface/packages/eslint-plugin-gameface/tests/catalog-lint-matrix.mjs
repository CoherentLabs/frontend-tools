import { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import html from "@html-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import gameface from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, "..");
const root = join(pluginRoot, "..", "..");
const matrixPath = join(__dirname, "generated", "test-matrix.json");
const modelsDir = "packages/eslint-plugin-gameface/tests/fixtures/gameface-models";

/** Matrix asserts raw catalog rows; internal whitelist is disabled via env (not ESLint settings). */
process.env.GAMEFACE_INTERNAL_RAW_CATALOG = "1";

const htmlBase = html.configs["flat/recommended"];
const htmlRulesOff = Object.fromEntries(
  Object.keys(htmlBase.rules || {}).map((k) => [k, "off"]),
);

/** @type {Record<string, object>} */
const configCache = new Map();

/**
 * @param {import("../scripts/lib/matrix-builders/css.mjs").MatrixRow} row
 */
function configForRow(row) {
  const key = `${row.language}:${row.ruleId}:${row.expect.severity ?? "error"}`;
  const hit = configCache.get(key);
  if (hit) {
    return hit;
  }

  const severity = row.expect.severity ?? "error";
  const rules = { [row.ruleId]: severity };

  /** @type {object[]} */
  let blocks = [];

  if (row.language === "css") {
    blocks = [
      {
        files: ["**/*"],
        language: "css/css",
        plugins: { gameface },
        rules,
      },
    ];
  } else if (row.language === "html") {
    blocks = [
      {
        files: ["**/*"],
        ...htmlBase,
        plugins: { ...htmlBase.plugins, gameface },
        rules: { ...htmlRulesOff, ...rules },
        settings: {
          gameface: { modelsDir },
        },
      },
    ];
  } else if (row.language === "jsx") {
    blocks = [
      {
        files: ["**/*"],
        languageOptions: {
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { gameface },
        rules,
        settings: {
          gameface: { modelsDir },
        },
      },
    ];
  } else if (row.language === "js") {
    blocks = [
      {
        files: ["**/*"],
        plugins: { gameface },
        rules,
      },
    ];
  } else if (row.language === "ts") {
    blocks = [
      {
        files: ["**/*"],
        languageOptions: {
          parser: tsParser,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { gameface },
        rules,
      },
    ];
  }

  const config = { overrideConfig: blocks };
  configCache.set(key, config);
  return config;
}

function loadMatrix() {
  let raw;
  try {
    raw = readFileSync(matrixPath, "utf8");
  } catch {
    throw new Error(
      `Missing ${matrixPath}. Run: npm run test:extract-matrix`,
    );
  }
  return JSON.parse(raw);
}

async function main() {
  const matrix = loadMatrix();
  const cwd = root;
  /** @type {string[]} */
  const failures = [];

  for (const row of matrix.rows) {
    const eslint = new ESLint({
      cwd,
      ...configForRow(row),
    });
    const filePath = join(cwd, row.filePath.replace(/\//g, "\\"));
    const results = await eslint.lintText(row.snippet, { filePath });
    const msgs = results.flatMap((r) => r.messages).filter((m) => m.ruleId === row.ruleId);
    const shouldReport = row.expect.reports !== false;

    if (shouldReport && msgs.length === 0) {
      failures.push(
        `[MISS] ${row.id}\n  rule: ${row.ruleId}\n  snippet: ${row.snippet.slice(0, 120)}...\n`,
      );
    } else if (!shouldReport && msgs.length > 0) {
      failures.push(
        `[UNEXPECTED] ${row.id}\n  rule: ${row.ruleId}\n  messages: ${msgs.map((m) => m.message).join("; ")}\n`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(`catalog-lint-matrix: ${failures.length} failure(s)\n`);
    for (const f of failures.slice(0, 20)) {
      console.error(f);
    }
    if (failures.length > 20) {
      console.error(`... and ${failures.length - 20} more`);
    }
    process.exit(1);
  }

  console.log(`catalog-lint-matrix: ok (${matrix.rows.length} rows)`);
}

main();
