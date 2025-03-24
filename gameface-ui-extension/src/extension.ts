import * as vscode from "vscode";
import logger from "./logger";
const path = require('path');
const fs = require('fs');
const { parse } = require('svg-parser');
// In your VS Code extension
async function getTsConfigPath(): Promise<string | undefined> {
	const files = await vscode.workspace.findFiles("**/tsconfig.json", "**/node_modules/**");
	return files.length > 0 ? files[0].fsPath : undefined;
}

const SVGFilesTypes = new Map<string, string>();

function getSVGTypeName(fileUri: string) {
	return path.basename(fileUri).replace(/ /g, '_').replace('.svg', '').toUpperCase();
}

function updateTypeIndex() {
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		return;
	}

	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const typesDir = path.join(workspaceRoot, 'node_modules', '.gameface-ui-types');
	const typesFile = path.join(typesDir, 'index.d.ts');

	try {
		fs.mkdirSync(typesDir, { recursive: true });
	} catch (e) {
		console.error('Failed to create types directory:', e);
		return;
	}

	const files = fs.readdirSync(typesDir).filter((file: string) => file.endsWith('.d.ts') && !file.endsWith('index.d.ts') && !file.endsWith('svg-components.d.ts'));
	const references = files.map((file: string) => `import "./${file}";`).join('\n');

	fs.writeFileSync(typesFile, references);
}

async function writeTypings(content: string, fileName = 'index.d.ts') {
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		return;
	}

	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const typesDir = path.join(workspaceRoot, 'node_modules', '.gameface-ui-types');
	const typesFile = path.join(typesDir, fileName);

	try {
		await fs.promises.mkdir(typesDir, { recursive: true });
	} catch (e) {
		console.error('Failed to create types directory:', e);
		return;
	}

	try {
		await fs.promises.writeFile(typesFile, content);
	} catch (e) {
		console.error('Failed to write typings file:', e);
	}

	updateTypeIndex();
}

async function resolveAlias(filePath: string): Promise<string> {
	const assetsAlias = '@assets';
	const tsConfigPath = await getTsConfigPath();
	if (!tsConfigPath && !fs.existsSync(tsConfigPath) && filePath.includes(assetsAlias)) return filePath;

	// TODO: Check if parsing is successful
	const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath as string, 'utf8'));
	const realDirectory = tsConfig.compilerOptions.paths[assetsAlias + '/*'][0].replace("/*", "");

	if (filePath.startsWith(assetsAlias)) {
		const root = path.resolve(path.dirname(tsConfigPath), realDirectory);
		return path.join(root, filePath.slice(assetsAlias.length));
	}
	return filePath;
}

async function getSolidSVGComponents(documentContent: string): Promise<{ name: string, componentPath: string }[]> {
	const regex = /import\s+(\w+)\s+from\s+['"](.+\.svg\?component-solid)['"];/g;
	const matches = [];
	let match;
	while ((match = regex.exec(documentContent)) !== null) {
		if (match[2] && match[1]) {
			const filePath = match[2].replace('?component-solid', '');
			const resolvedPath = await resolveAlias(filePath);
			matches.push({ name: match[1], componentPath: resolvedPath });
		}
	}
	return matches;
}

type SVGElementsWithIds = { id: string, type: string }[];

async function getSVGStructure(file: vscode.TextDocument | string): Promise<SVGElementsWithIds> {
	const nodes: SVGElementsWithIds = [];
	const content = await getFileContent(file);
	const ast = parse(content);

	traverseSvg(ast, node => {
		if (node.properties?.id) {
			nodes.push({ id: node.properties.id, type: node.tagName });
		}
	});

	return nodes;
}

function traverseSvg(node: any, callback: (node: any) => void) {
	callback(node);
	if (node.children) {
		node.children.forEach((child: any) => traverseSvg(child, callback));
	}
}

async function getUsedSVGRefVariables(documentContent: string): Promise<{ [key: string]: string[] }> {
	const regex = /<(\w+)(?:\s+\w+=(?:{[^}]*}|".*?"|'.*?'))*\s+ref=\{(\w+)\!?\}/g;
	const refVariables: { [key: string]: string[] } = {};
	let match;
	while ((match = regex.exec(documentContent)) !== null) {
		const SVGComponent = match[1];
		const refVar = match[2];
		if (refVariables[SVGComponent] === undefined) refVariables[SVGComponent] = [];
		refVariables[SVGComponent].push(refVar);
	}
	return refVariables;
}

function getType(type: string) {
	switch (type) {
		case 'path': return 'SVGPathElement & JSX.PathSVGAttributes<SVGPathElement>';
		case 'mask': return 'SVGMaskElement & JSX.MaskSVGAttributes<SVGMaskElement>';
		default: return 'SVGElement';
	}
}

async function getFileContent(file: vscode.TextDocument | string) {
	if (typeof file === 'string') {
		const uri = vscode.Uri.file(file);
		const isOpened = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());

		// Get the text of the document if opened because it may be unsaved and the content be newer from the real one
		if (isOpened) return isOpened.getText();
		if (!fs.existsSync(file)) return;
		return fs.readFileSync(file, 'utf8');
	}

	return (file as vscode.TextDocument).getText();
}

async function addTemporaryTypesForRefs(document: vscode.TextDocument | string) {
	const content = await getFileContent(document);
	const documentPath = typeof document === 'string' ? document : (document as vscode.TextDocument).fileName;
	const refVariablesMap = await getUsedSVGRefVariables(content);
	if (!Object.keys(refVariablesMap).length) return;

	const SVGComponents = await getSolidSVGComponents(content);
	const tempTypes: string[] = [];

	for (const { componentPath, name } of SVGComponents) {
		if (!SVGFilesTypes.has(componentPath)) continue;

		for (const refVar of refVariablesMap[name] || []) {
			const tempType = `	var ${refVar}: ${getSVGTypeName(componentPath)};`;
			tempTypes.push(tempType);
		}
	}

	if (tempTypes.length === 0) return;

	const tempTypesContent = `import "./svg-components.d.ts"

export { };
declare global {
${tempTypes.join('\n')}
}
`;
	await writeTypings(tempTypesContent, path.basename(documentPath) + '.d.ts');
}

async function getSVGTypes(svgFile: vscode.TextDocument | string) {
	const nodes = await getSVGStructure(svgFile);
	return nodes.map(({ id, type }) => `		"#${id}": ${getType(type)}`).join(';\n');
}

function triggerError(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
	const text = document.getText();
	const diagnostics: vscode.Diagnostic[] = [];

	// Example: Trigger error for the 'ref' variable
	const regex = /\bref\b/g;
	let match;
	while ((match = regex.exec(text)) !== null) {
		const range = new vscode.Range(
			document.positionAt(match.index),
			document.positionAt(match.index + match[0].length)
		);

		const diagnostic = new vscode.Diagnostic(
			range,
			"Custom Error: 'ref' is not allowed here.",
			vscode.DiagnosticSeverity.Error
		);

		diagnostics.push(diagnostic);
	}

	collection.set(document.uri, diagnostics);
}

async function updateSVGTypings(svgFile: vscode.TextDocument | string) {
	const svgIdTypes = await getSVGTypes(svgFile);
	const svgFilePath = typeof svgFile === 'string' ? svgFile : svgFile.uri.fsPath;
	SVGFilesTypes.set(svgFilePath, svgIdTypes);
}

async function rebuildAllSVGTypings(rebuildTsxFilesTypes = true) {
	SVGFilesTypes.clear();

	const svgFiles = await vscode.workspace.findFiles('**/*.svg', '**/node_modules/**');

	for (const svgFile of svgFiles) {
		await updateSVGTypings(svgFile.fsPath);
	}

	await reGenerateSVGTypes();
	if (rebuildTsxFilesTypes) await rebuildAllTSXRefsTypings();
}

async function rebuildAllTSXRefsTypings() {
	const tsxFiles = await vscode.workspace.findFiles('**/*.tsx', '**/node_modules/**');

	for (const tsxFile of tsxFiles) {
		await addTemporaryTypesForRefs(tsxFile.fsPath);
	}
}

async function reGenerateSVGTypes() {
	const customSVGTypes: string[] = ['import { JSX } from "solid-js";\n', 'declare global {'];

	SVGFilesTypes.forEach((types, svgPath) => {
		customSVGTypes.push(`	type ${getSVGTypeName(svgPath)} = SVGSVGElement & {\n${types}\n	};\n`);
	});

	customSVGTypes.push('}\n');
	customSVGTypes.push('export { };\n');
	await writeTypings(customSVGTypes.join('\n'), 'svg-components.d.ts');
}

async function whenSVGFileChanged(file: vscode.TextDocument | string) {
	await updateSVGTypings(file);
	await reGenerateSVGTypes();
	await rebuildAllTSXRefsTypings();
}

async function initSVGFilesWatcher(context: vscode.ExtensionContext) {
	const svgWatcher = vscode.workspace.createFileSystemWatcher('**/*.svg');

	svgWatcher.onDidChange((uri) => whenSVGFileChanged(uri.fsPath));
	svgWatcher.onDidCreate((uri) => whenSVGFileChanged(uri.fsPath));
	svgWatcher.onDidDelete(() => rebuildAllSVGTypings());

	vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
		if (event && path.extname(event.document.fileName) === '.svg') {
			await whenSVGFileChanged(event.document);
		}
	});

	await rebuildAllSVGTypings(false);

	context.subscriptions.push(svgWatcher);
}

async function tsxFileDeleted(uri: vscode.Uri) {
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		return;
	}

	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const typesDir = path.join(workspaceRoot, 'node_modules', '.gameface-ui-types');
	const tsxTypeFilePath = path.join(typesDir, path.basename(uri) + '.d.ts');
	if (fs.existsSync(tsxTypeFilePath)) {
		fs.unlinkSynk(tsxTypeFilePath);
		updateTypeIndex();
	}
}

async function initTSXFilesWatcher(context: vscode.ExtensionContext) {
	const tsxWatcher = vscode.workspace.createFileSystemWatcher('**/*.tsx');

	tsxWatcher.onDidChange(async (uri) => {
		await addTemporaryTypesForRefs(uri.fsPath);
	});
	tsxWatcher.onDidCreate(async (uri) => {
		await addTemporaryTypesForRefs(uri.fsPath);
	});
	tsxWatcher.onDidDelete(tsxFileDeleted);

	vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
		if (event && path.extname(event.document.fileName) === '.tsx') {
			await addTemporaryTypesForRefs(event.document);
		}
	});

	await rebuildAllTSXRefsTypings();

	context.subscriptions.push(tsxWatcher);
}

export async function activate(context: vscode.ExtensionContext) {
	// Get the TS extension
	// const tsExtension = vscode.extensions.getExtension('vscode.typescript-language-features');
	// if (!tsExtension) {
	// 	return;
	// }

	// await tsExtension.activate();

	// // Get the API from the TS extension
	// if (!tsExtension.exports || !tsExtension.exports.getAPI) {
	// 	return;
	// }

	// const api = tsExtension.exports.getAPI(0);
	// if (!api) {
	// 	return;
	// }
	// // vscode.window.createOutputChannel("Gameface UI").appendLine('test')
	// // Configure the 'my-typescript-plugin-id' plugin
	// api.configurePlugin('svg-refs', {
	// 	someValue: process.env['SOME_VALUE']
	// });
	await initSVGFilesWatcher(context);
	await initTSXFilesWatcher(context);

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('customErrors');
	context.subscriptions.push(diagnosticCollection);

	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		return;
	}

	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const typesDir = path.join(workspaceRoot, 'node_modules', '.gameface-ui-types');

	// Watch for changes in .gameface-ui-types folder
	const watcher = vscode.workspace.createFileSystemWatcher(`${typesDir}/**/*.d.ts`);

	watcher.onDidChange(async (uri) => {
		// console.log(`Detected change in: ${uri.fsPath}`);

		// Open the file in a hidden editor to refresh TypeScript types
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.languages.setTextDocumentLanguage(document, 'typescript');

		// console.log(`Forced VSCode to reload: ${uri.fsPath}`);
	});

	// watcher.onDidCreate(uri => console.log(`New .d.ts file created: ${uri.fsPath}`));
	// watcher.onDidDelete(uri => console.log(`.d.ts file deleted: ${uri.fsPath}`));

	context.subscriptions.push(watcher);
}
