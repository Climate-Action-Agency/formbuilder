import {rankWith} from '@jsonforms/core';
import type {JsonFormsInterface, ToolInterface} from "./index";
import toolComponent from "../../components/tools/array.component.vue";
import {schema, uischema} from "./schema/array.schema";
import {getItemsType, resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";
import {AbstractTool} from "./AbstractTool";
import {
    prepareOptionDataLabel,
    prepareOptionDataRule,
    prepareOptionDataValidation, setOptionDataLabel, setOptionDataRule,
    setOptionDataValidation
} from "./schema/toolControl";

export class ArrayTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    //tester = rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl));//not working for $ref (we want unresolved schema)
    tester = rankWith(3, (uischema, schema, rootSchema) => 'array' === schema?.type && 'object' === typeof schema?.items);

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        //default schema
        this.schema.type ??= 'array';

        if (undefined === this.schema.items) {
            this.schema.items = {type: 'object'}
        }

        // let items = {...this.schema?.items};
        //
        // const hasRef = undefined !== items?.$ref
        const hasItemType = undefined !== getItemsType(this.schema)
        const itemsType = getItemsType(this.schema)

        console.log("ArrayTool optionDataPrepare","itemsType", itemsType);


        // const canHaveChilds = true;//:TODO need new "canHaveObject"
        //
        // if(canHaveChilds && !hasItemType && !hasRef) {
        //     if(undefined === items) {
        //         items = {};
        //     }
        //     items.type = this.schema.items?.type ?? 'object'
        // }
        //
        // if (hasRef) {
        //     items._reference = items.$ref;
        //     delete items.$ref;//must be delete otherwise oneOf will not work
        // }


        //convert option.detail.elements
        const options = {...this.uischema?.options ?? {}}
        if(options?.detail?.elements) {
            options.detail.elements = JSON.stringify(options.detail.elements);
        }

        const data = {
            propertyName: tool.propertyName,
            type: this.schema.type,
            asInlineType: 'object' !== itemsType,
            options: options
        } as any;


        _.merge(
            data,
            prepareOptionDataValidation(this.schema, this.uischema),
            prepareOptionDataLabel(this.schema, this.uischema),
            prepareOptionDataRule(this.schema, this.uischema),
        )

        return data;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        const asInlineType = data?.asInlineType ?? false;

        let inlineType = getItemsType(this.schema);
        if (asInlineType) {
            if('object' === inlineType || !inlineType) {
                inlineType = 'string'
            }
        } else {
            inlineType = 'object';
        }
        _.set(this.schema, 'items.type', inlineType);

        const options = {...data.options ?? {}};

        //convert option.detail.elements
        if(options?.detail?.elements) {
            let parsed =[];
            try {
                parsed = JSON.parse(options.detail.elements);
            }
            catch (e) {
                parsed = [];
            }
            options.detail.elements = parsed;
        }

        this.uischema.options = options;

        setOptionDataValidation(this.schema, this.uischema, data);
        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);

        //this.isRequired = data.required;
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new ArrayTool(this.uischema.type, this.toolType);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Array',
            icon: 'mdi:code-array',

        }
    }
}

export const arrayTool = new ArrayTool('Control', 'array')
