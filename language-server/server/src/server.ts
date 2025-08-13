/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    WorkspaceFoldersRequest,
} from 'vscode-languageserver/node';
import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import generateRelations from './generateRelations';
import {
    Relation,
    Suggestion,
    GamefaceModelDefinition,
    Position,
    GamefaceModel,
    ExtHostDocumentLine,
    ExampleSettings,
} from './types';

let modelDefinitions:GamefaceModelDefinition[] = [];
const modelDefinitionsFolder = 'gameface-models';
const customBindingsFolder = 'custom-bindings';
const customBindingsFile = 'bindings.json';
const dataBindings = [
    'data-bind-value',
    'data-bind-style-left',
    'data-bind-style-top',
    'data-bind-style-opacity',
    'data-bind-style-value',
    'data-bind-style-width',
    'data-bind-style-height',
    'data-bind-style-color',
    'data-bind-style-background-color',
    'data-bind-style-background-image-url',
    'data-bind-style-transform2d',
    'data-bind-style-transform-rotate',
    'data-bind-class-toggle',
    'data-bind-class',
    'data-bind-if',
];


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
    let capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.']
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});

// Read all files in a folder and creates the model definitions objects from them
function readFiles(root: string): GamefaceModelDefinition[] {
    const modelsDefinitions: GamefaceModelDefinition[] = [];
    const files = fs.readdirSync(root, { encoding: 'utf-8'});

    for (let file of files) {
        const content = fs.readFileSync(path.join(root, file), {encoding: 'utf-8'});

        try {
            let contentObj = JSON.parse(content);
            modelsDefinitions.push({name: file.replace('.json', ''), content: contentObj});
        } catch(err) {
            connection.console.error(`${err}
            File ${file} contains is not a valid JSON, located in ${path.join(root, file)}.`);
        }
    }

    return modelsDefinitions;
}

function readCustomBindings(filePath: string) {
    const file = fs.readFileSync(filePath, { encoding: 'utf-8'});
    // match all symbols between the braces of registerBindingAttribute(will match here)
    const bindings = file.match(/(?<=(registerBindingAttribute\("))([a-z\-0-9]+)(?=\'|\")+/g);

    if (bindings?.length) dataBindings.push(...(bindings.map(bindingDefinition => `data-bind-${bindingDefinition}`)));
}

// Read all files in the workspace and search for the modelDefinitionsFolder
function readWorkspace(root: string) {
    const files = fs.readdirSync(root, { encoding: 'utf-8', withFileTypes: true });

    for (let file of files) {
        if (file.name === modelDefinitionsFolder) {
            modelDefinitions.push(...readFiles(path.join(root, file.name)));
        } else if(file.name === customBindingsFolder) {
            readCustomBindings(path.join(root, file.name, customBindingsFile));
        } else if (file.isDirectory()) {
            readWorkspace(path.join(root, file.name));
        }
    }
}

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            setupModelDefinitions();
            connection.console.log('Workspace folder change event received.');
        });
    }

    setupModelDefinitions();
});

async function setupModelDefinitions () {
    const workspaceFolders = await connection.sendRequest(WorkspaceFoldersRequest.type);

    if (workspaceFolders === null) return;

    for (let workspaceFolder of workspaceFolders) {
        const root = url.fileURLToPath(workspaceFolder.uri);
        readWorkspace(path.join(root));
    }
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = <ExampleSettings>(
            (change.settings.languageServerExample || defaultSettings)
        );
    }
});

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});

connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
});

function getDocumentLines(document: TextDocument): string[] {
    return document.getText().split(/[\r\n]+/);
}

function lineAt(lineOrPosition: number | Position, document: TextDocument) {
    let line: number | undefined;
    if (typeof lineOrPosition !== 'number') {
        line = lineOrPosition.line;
    } else if (typeof lineOrPosition === 'number') {
        line = lineOrPosition;
    }

    if (typeof line !== 'number' || line < 0 || line >= document.lineCount || Math.floor(line) !== line) {
        throw new Error('Illegal value for `line`');
    }

    const lines: string[] = getDocumentLines(document);
    return new ExtHostDocumentLine(line, lines[line], line === document.lineCount - 1);
}

function generateDataBindingCompletions(): CompletionItem[] {
    const dataBindingCompletions: CompletionItem[] = [];

    for (let dataBinding of dataBindings) {
        const completionItem = CompletionItem.create(`${dataBinding}`);
        completionItem.kind = CompletionItemKind.Property;
        completionItem.label = `${dataBinding}`;
        completionItem.insertText = `${dataBinding}="{{}}"`;

        dataBindingCompletions.push(completionItem);
    }

    return dataBindingCompletions;
}

function generateCompletionsItems(suggestions: Suggestion[]): CompletionItem[] {
    const completions = [];

    for (let a = 0; a < suggestions.length; a++) {
        // these are used only for matching, don't add them to the completion suggestions
        if (suggestions[a].key.indexOf('\\[\\d+\\]') > -1) continue;

        const completionItem = CompletionItem.create(suggestions[a].key);
        completionItem.kind = CompletionItemKind.Property;
        completionItem.detail = `(property) type: ${suggestions[a].type}`;

        completions.push(completionItem);
    }

    return completions;
}

//This handler provides the initial list of the completion items.
connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        const document:TextDocument|undefined = documents.get(_textDocumentPosition.textDocument.uri);

        if(!document) return [];
        
        const linePrefix = lineAt(_textDocumentPosition.position, document).text.substring(0, _textDocumentPosition.position.character);
        const dataBindingCompletions = generateDataBindingCompletions();

        let modelCompletions:CompletionItem[] = [];
        if (modelDefinitions.length) {
            const modelRelations: Relation[][] = [];
            // generate the relations for each model
            for(let model of modelDefinitions) {
                modelRelations.push(generateRelations(model.content as GamefaceModel, model.name));
            }

            for(let relations of modelRelations) {
                for(let relation of relations) {
                    const regex = new RegExp(`(?<!\\.)${relation.key}\.$`, 'g');
                    if (!linePrefix.match(regex)) continue;
                    modelCompletions = generateCompletionsItems(relation.suggestions);
                }
            }
        };

        if (modelCompletions.length > 0) return [...modelCompletions];
        return [...dataBindingCompletions];
    }
);

// // This handler resolves additional information for the item selected in
// // the completion list.
connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        return item;
    }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);


// Listen on the connection
connection.listen();
