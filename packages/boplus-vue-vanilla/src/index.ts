import CategorizationRenderer from "./components/CategorizationRenderer.vue";
import AllOfRenderer from "./components/AllOfRenderer.vue";
import AnyOfRenderer from "./components/AnyOfRenderer.vue";
import OneOfRenderer from "./components/OneOfRenderer.vue";
import ObjectRenderer from "./components/ObjectRenderer.vue";
import EnumArrayRenderer from "./components/EnumArrayRenderer.vue";

//:TODO
//import {entry as arrayControlRenderer} from "./components/ArrayControlRenderer.vue";

import {
    and,
    categorizationHasCategory, hasType,
    isAllOfControl,
    isObjectControl,
    isOneOfControl,
    rankWith, schemaMatches, schemaSubPathMatches
} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

export const categorizationRendererEntry = {
    renderer: CategorizationRenderer,
    tester: rankWith(2, and(uiTypeIs('Categorization'), categorizationHasCategory))
};

export const objectRendererEntry = {
    renderer: ObjectRenderer,
    tester: rankWith(3, isObjectControl)
};

export const allOfRendererEntry = {
    renderer: AllOfRenderer,
    tester: rankWith(3, isAllOfControl)
};
export const anyOfRendererEntry = {
    renderer: AnyOfRenderer,
    tester: rankWith(3, isAllOfControl)
};
export const OneOfRendererEntry = {
    renderer: OneOfRenderer,
    tester: rankWith(2, isOneOfControl)
};

const hasOneOfItems = (schema: JsonSchema): boolean => (schema?.oneOf ?? [] as JsonSchema[]).every((entry: JsonSchema) => entry.const !== undefined);
const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;

export const enumArrayRendererEntry = {
    renderer: EnumArrayRenderer,
    tester: rankWith(5,
        and(
            uiTypeIs('Control'),
            and(
                schemaMatches((schema) => hasType(schema, 'array') && !Array.isArray(schema.items) && schema.uniqueItems === true),
                schemaSubPathMatches('items', (schema) => hasOneOfItems(schema) || hasEnumItems(schema))
            )
        ))
};

export const boplusVueVanillaRenderers = [
    categorizationRendererEntry,
    OneOfRendererEntry,
    allOfRendererEntry,
    anyOfRendererEntry,
    objectRendererEntry,
    //arrayControlRenderer,
    enumArrayRendererEntry,
];
