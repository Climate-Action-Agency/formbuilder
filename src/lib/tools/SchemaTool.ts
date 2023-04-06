import {and, rankWith} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/schema.form.json";
import _ from "lodash";

//export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

export class SchemaTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(-1, () => {});
    clone = (): ToolInterface => new SchemaTool();


    constructor() {
        super()
        this.uischema = false;
        this.propertyName = '';
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        const isBaseTool = context.baseSchemaTool === this;

        const data = {
            type: this.schema.type,
            _isBaseTool: isBaseTool,
            //...(this.schema ?? {})
        } as any;

        if(this.propertyName) {
            data.propertyName = this.propertyName;
        }

        console.log("schematool","data", data)

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)
        //
        // const keyword = data?.keyword;
        // const keywordOld = this.keyword;
        //
        // if(keyword && keywordOld && keyword !== keywordOld) {
        //     // // /** @ts-ignore **/
        //     // this.schema[keyword] = undefined;//this.schema[keywordOld] ?? [];
        //     // /** @ts-ignore **/
        //     // this.schema[keywordOld] = undefined;
        //     this.keyword = keyword;
        // }

        const schema = {...data}
        delete schema.propertyName;
        delete schema._isBaseTool;

        console.log("schemaTool","set schema",this.schema)

        this.schema = schema
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }


    toolbarOptions(): Record<string, any> {
        return {
            title: 'Schema',
            icon: 'mdi:code-not-equal',
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            //hideToolAtBar: true,

        }
    }
}

// @ts-ignore
export const schemaTool = new SchemaTool();
