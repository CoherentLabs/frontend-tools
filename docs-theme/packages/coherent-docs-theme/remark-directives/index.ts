import remarkDirective from 'remark-directive';
import { remarkIfDirective } from "./if";
import { remarkIncludeSnippets } from "./includeSnippets";
import { remarkReleaseDirective } from './release';
import { remarkInternalDirective } from './internal';

export const directives = [
    remarkDirective,
    remarkIfDirective,
    remarkInternalDirective,
    remarkReleaseDirective,
    remarkIncludeSnippets
];