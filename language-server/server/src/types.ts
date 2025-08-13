export type Relation = {
    key: string,
    suggestions: Suggestion[]
};

export type Suggestion = {
    key: string,
    type: string
};

export type GamefaceModelDefinition = {
    name: string,
    content: object
}

export type Position = {
    line: number,
    character: number,
}

export type GamefaceModel = {
    [key: string]: any
}

export class ExtHostDocumentLine {

    private readonly _line: number;
    private readonly _text: string;
    private readonly _isLastLine: boolean;

    constructor(line: number, text: string, isLastLine: boolean) {
        this._line = line;
        this._text = text;
        this._isLastLine = isLastLine;
    }

    public get lineNumber(): number {
        return this._line;
    }

    public get text(): string {
        return this._text;
    }
}

// The example settings
export interface ExampleSettings {
    maxNumberOfProblems: number;
}