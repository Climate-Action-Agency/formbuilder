import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../lib/models";

export const schema = {
    "type": "object",
    "properties": {
        "label": {
            "type": "string"
        },
        i18n: {
            type: "string",
        },
        rule: {
            $ref:'toolOptionsSchemaRule.schema#/properties/rule'
        },
    },
}

export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/label",
                            "type": "Control"
                        },
                    ],
                },
                {
                    scope: "#/properties/i18n",
                    type: "Control",
                    label: 'i18n key',
                    description: "alternative lookup key for translation catalogue",
                },
            ]
        },

        {
            "type": "Category",
            "label": "Rule",
            "elements": [
                {
                    $ref:'toolOptionsSchemaRule.uischema'
                },
            ]
        },
    ]
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;
