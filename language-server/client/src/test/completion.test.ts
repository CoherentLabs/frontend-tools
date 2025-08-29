/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite('Should do completion', () => {
    const docUri = getDocUri('completion.html');

    test('Completes Model. properties in html file', async () => {
        await testCompletion(docUri, new vscode.Position(0, 6), {
            items: [
                { label: 'gameId', detail: '(property) type: number' },
                { label: 'gameModes', detail: '(property) type: any[]' },
                { label: 'getPlayer', detail: '(property) type: function' },
                { label: 'maximumPlayersAllowed', detail: '(property) type: number' },
                { label: 'players', detail: '(property) type: any[]' },
            ]
        });
    });

    test('Completes Model.players[0]. properties in html file', async () => {
        await testCompletion(docUri, new vscode.Position(1, 17), {
            items: [
                { label: 'friends', detail: '(property) type: any[]' },
                { label: 'id', detail: '(property) type: number' },
                { label: 'items', detail: '(property) type: object' },
                { label: 'mounts', detail: '(property) type: object' },
                { label: 'name', detail: '(property) type: string' },
                { label: 'rank', detail: '(property) type: number' },
                { label: 'type', detail: '(property) type: string' },
            ]
        });
    });

    test('Completes Model.[players][0]. properties in html file', async () => {
        await testCompletion(docUri, new vscode.Position(2, 19), {
            items: [
                { label: 'friends', detail: '(property) type: any[]' },
                { label: 'id', detail: '(property) type: number' },
                { label: 'items', detail: '(property) type: object' },
                { label: 'mounts', detail: '(property) type: object' },
                { label: 'name', detail: '(property) type: string' },
                { label: 'rank', detail: '(property) type: number' },
                { label: 'type', detail: '(property) type: string' },
            ]
        });
    });

    test('Completes Model.players[0].mounts.air.dragons. properties in html file', async () => {
        await testCompletion(docUri, new vscode.Position(3, 36), {
            items: [
                { label: 'black', detail: '(property) type: object' },
                { label: 'white', detail: '(property) type: object' },
                { label: 'blue', detail: '(property) type: object' },
            ]
        });
    });

    test('Completes Model[players][0][mounts][air][dragons]. properties in html file', async () => {
        await testCompletion(docUri, new vscode.Position(4, 40), {
            items: [
                { label: 'black', detail: '(property) type: object' },
                { label: 'white', detail: '(property) type: object' },
                { label: 'blue', detail: '(property) type: object' },
            ]
        });
    });

    test('Completes data-bind-* properties in html file', async () => {
        await dataBindingTestCompletion(docUri, new vscode.Position(5, 10), {
            items: [
                 { label: 'data-bind-value', insertText: 'data-bind-value="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-left', insertText: 'data-bind-style-left="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-top', insertText: 'data-bind-style-top="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-opacity', insertText: 'data-bind-style-opacity="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-width', insertText: 'data-bind-style-width="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-height', insertText: 'data-bind-style-height="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-color', insertText: 'data-bind-style-color="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-background-color', insertText: 'data-bind-style-background-color="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-background-image-url', insertText: 'data-bind-style-background-image-url="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-transform2d', insertText: 'data-bind-style-transform2d="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-transform-rotate', insertText: 'data-bind-style-transform-rotate="{{}}"', kind: vscode.CompletionItemKind.Property},
            ]
        });
    });

    test('Completes data-bind- properties in <div data-bind-value={{Model.players[0].name}} data-bind- > expression in html file', async () => {
        await dataBindingTestCompletion(docUri, new vscode.Position(6, 59), {
            items: [
                 { label: 'data-bind-value', insertText: 'data-bind-value="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-left', insertText: 'data-bind-style-left="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-top', insertText: 'data-bind-style-top="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-opacity', insertText: 'data-bind-style-opacity="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-width', insertText: 'data-bind-style-width="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-height', insertText: 'data-bind-style-height="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-color', insertText: 'data-bind-style-color="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-background-color', insertText: 'data-bind-style-background-color="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-background-image-url', insertText: 'data-bind-style-background-image-url="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-transform2d', insertText: 'data-bind-style-transform2d="{{}}"', kind: vscode.CompletionItemKind.Property},
                 { label: 'data-bind-style-transform-rotate', insertText: 'data-bind-style-transform-rotate="{{}}"', kind: vscode.CompletionItemKind.Property},
            ]
        });
    });

    test('Completes Model. properties in <div data-bind-value={{Model.}}> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(7, 30), {
            items: [
                { label: 'gameId', detail: '(property) type: number' },
                { label: 'gameModes', detail: '(property) type: any[]' },
                { label: 'getPlayer', detail: '(property) type: function' },
                { label: 'maximumPlayersAllowed', detail: '(property) type: number' },
                { label: 'players', detail: '(property) type: any[]' },
            ]
        });
    });

    test('Completes Game. properties in <div data-bind-value={{Model.players[0].name}} data-bind-value={{Game.}}> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(8, 58), {
            items: [
                { label: 'activeCard', detail: '(property) type: object' },
                { label: 'collections', detail: '(property) type: any[]' },
                { label: 'Model', detail: '(property) type: object' },
            ]
        });
    });

    test('Completes Model. properties in <div data-bind-style-color="{{Model.getPlayer(Model., Game.)}}"></div> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(9, 52), {
            items: [
                { label: 'gameId', detail: '(property) type: number' },
                { label: 'gameModes', detail: '(property) type: any[]' },
                { label: 'getPlayer', detail: '(property) type: function' },
                { label: 'maximumPlayersAllowed', detail: '(property) type: number' },
                { label: 'players', detail: '(property) type: any[]' },
            ]
        });
    });

    test('Completes Game. properties in <div data-bind-style-color="{{Model.getPlayer(Model., Game.)}}"></div> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(9, 59), {
            items: [
                { label: 'activeCard', detail: '(property) type: object' },
                { label: 'collections', detail: '(property) type: any[]' },
                { label: 'Model', detail: '(property) type: object' },
            ]
        });
    });

    test('Completes Game.Model. properties in <div data-bind-style-opacity="{{Game.Model.}}"></div> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(10, 43), {
            items: [
                { label: 'animals', detail: '(property) type: object' },
                { label: 'players', detail: '(property) type: any[]' },
            ]
        });
    });

    test('Completes Game[Model][players][0]. properties in <div data-bind-style-opacity="{{Game[Model][players][0].}}"></div> expression in html file', async () => {
        await testCompletion(docUri, new vscode.Position(11, 56), {
            items: [
                { label: 'name', detail: '(property) type: string' },
            ]
        });
    });
});

function findOccurrencesBy(list: vscode.CompletionItem[], fields: string[], values:any[]): number {
    return list.filter(element => {
        let matchCount = 0;

        for (let i = 0; i < fields.length; i++) {
            if (element[fields[i]] === values[i]) matchCount += 1;
        }

        if (matchCount === fields.length) return element;
    }).length;
}

function findCompletionItemBy(list: vscode.CompletionItem[], field: string, value: string | vscode.CompletionItemLabel): vscode.CompletionItem {
    return list.filter(element => element[field] === value)[0];
}

async function testCompletion(
    docUri: vscode.Uri,
    position: vscode.Position,
    expectedCompletionList: vscode.CompletionList
) {
    await activate(docUri);

    // Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
    const actualCompletionList = (await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider',
        docUri,
        position,
    )) as vscode.CompletionList;

    expectedCompletionList.items.forEach((expectedItem, i) => {
        assert.equal(findOccurrencesBy(actualCompletionList.items, ['label'], [expectedItem.label]), 1);
        const actualItem = findCompletionItemBy(actualCompletionList.items, 'label', expectedItem.label);
        assert.equal(actualItem.detail, expectedItem.detail);
    });
}

async function dataBindingTestCompletion(
    docUri: vscode.Uri,
    position: vscode.Position,
    expectedCompletionList: vscode.CompletionList
) {
    await activate(docUri);

    // Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
    const actualCompletionList = (await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider',
        docUri,
        position,
    )) as vscode.CompletionList;

    expectedCompletionList.items.forEach((expectedItem, i) => {
        assert.equal(findOccurrencesBy(actualCompletionList.items, ['label', 'kind'], [expectedItem.label, expectedItem.kind]), 1);
        const actualItem = findCompletionItemBy(actualCompletionList.items, 'label', expectedItem.label);
        assert.equal(actualItem.insertText, expectedItem.insertText);
        assert.equal(actualItem.kind, expectedItem.kind);
    });
}
