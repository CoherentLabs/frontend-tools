import { Relation, GamefaceModel } from './types';

function generateRelations(model: GamefaceModel, current: string, relations: Relation[] = []): Relation[] {
    const relation: Relation = {
        key: current,
        suggestions: []
    };

    // get only the first item of an array
    if (model instanceof Array) model = [model[0]];

    for (let prop in model) {
        const currentProperty = model[prop];
        let relationStr = '';
        let type: string = typeof currentProperty;

        if (typeof currentProperty === 'string' && currentProperty.match('function')) {
            type = 'function';
        }

        if (currentProperty instanceof Array) {
            type = 'any[]';
        }

        if (model instanceof Array) {
            // use double backslash to escape it
            relationStr = `${current}\\[\\d+\\]`;
            const suggestion = {
                key: relationStr,
                type: type
            }
            relation.suggestions.push(suggestion);
        } else {
            // will generate string like this:
            // (model.prop|model[prop])
            relationStr = `(${current}.${prop}|${current}\\[${prop}\\])`;
            relation.suggestions.push({
                key: prop,
                type: type
            });
        }

        // loop the GamefaceModel recursively
        if (typeof currentProperty === 'object') {
            generateRelations(currentProperty as GamefaceModel, relationStr, relations);
        }
    }

    relations.push(relation);

    return relations;
}

export default generateRelations;