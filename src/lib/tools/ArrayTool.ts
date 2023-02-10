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


        const data = {
            propertyName: tool.propertyName,
            type: this.schema.type,
            singleChild: 'object' !== itemsType,
            options: this.uischema?.options ?? {}
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

        const isSingleChild = data?.singleChild ?? false;

        if (isSingleChild) {
            if (getItemsType(this.schema)) {
                /** @ts-ignore **/
                delete this.schema.items.type;
            }
        } else {
            _.set(this.schema, 'items.type', 'object');
        }

        this.uischema.options = data.options ?? {};

        setOptionDataValidation(this.schema, this.uischema, data);
        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);

        console.log("data",this.schema);
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
