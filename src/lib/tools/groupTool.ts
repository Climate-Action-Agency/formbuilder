import type {JsonFormsInterface, ToolInterface} from "./index";
import {resolveSchema} from "../formbuilder";
import {
    prepareOptionDataLabel,
    prepareOptionDataRule,
    schema,
    setOptionDataLabel,
    setOptionDataRule,
    uischema
} from "./schema/toolGroup";
import _ from "lodash";
import {VerticalLayout} from "./layoutTool";


export class GroupTool extends VerticalLayout {

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        const data = {};

        _.merge(
            data,
            prepareOptionDataLabel(this.schema, this.uischema),
            prepareOptionDataRule(this.schema, this.uischema),
        )
        return data;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        this.uischema.options = data.options ?? {};

        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new GroupTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: this.uischema.label,
            icon: 'mdi:application-outline',
        }
    }
}

export const groupTool = new GroupTool('Group');
