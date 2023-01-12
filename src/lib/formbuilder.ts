// @ts-ignore
import lodashGet from 'lodash.get';
import lodashTemplate from 'lodash.template';
//const lodashGet = require('lodash/get');
import {
    JsonForms,
    Tool,
    ToolProps, updatableSchemaKeys, updatableUischemaKeys
} from "./models";
import type {
    JsonFormsSchema,
    JsonFormsUISchema,
} from "./models";

export const initElementsByToolProps = (toolProps:ToolProps): Array<any> => {
    //console.log("initElementsByToolProps" , toolProps);

    const jsonFromSchema = toolProps.jsonForms?.schema ?? {};
    const jsonFormUischema = toolProps.jsonForms?.uischema ?? {} as any;

    const pushableElements = [] as any;

    jsonFormUischema?.elements?.forEach((itemUischema:any) => {
        switch (itemUischema.type) {
            case 'Control':
                const propertyPath = itemUischema.scope.replaceAll('#/', '').replaceAll('/', '.');
                const itemSchema = lodashGet(jsonFromSchema, propertyPath);

                let tool = findControlTool(itemSchema, itemUischema);

                if(tool) {
                    //:TODO: support nested elements (#/properties/details/properties/name)
                    tool.props.propertyName = propertyPath.replace('properties.','');

                    pushableElements.push(tool);
                }
                break;

            default:
                const toolLayout = findLayoutTool(jsonFromSchema, itemUischema);
                if(toolLayout) {
                    pushableElements.push(toolLayout);
                }
                break;
        }
    });

    return pushableElements;
};

export const createJsonForms = (rootForm:any) : JsonForms => {
    const schema = {
        type: 'object',
        properties: {},
    } as JsonFormsSchema;

    return new JsonForms(
        schema,
        createJsonUiSchema(rootForm, schema)
    );
}

export const createJsonUiSchema = (refElm:any, schema:JsonFormsSchema) : JsonFormsUISchema => {
    refElm = refElm?.value ?? refElm;

    if(!refElm?.tool.props) {
        throw "refElm has no toolProps.";
    }

    const toolProps = refElm?.tool.props as ToolProps;

    const jsonForms = toolProps?.jsonForms.clone();

    const itemSchema = jsonForms.schema as JsonFormsSchema;
    const uischema = jsonForms.uischema as JsonFormsUISchema;

    switch (uischema.type) {
        case 'Control':
            const propName = toolProps?.propertyName ?? "UNKNOWN";

            if(itemSchema.oneOf !== undefined && !itemSchema.oneOf.length) {
                itemSchema.oneOf = [{}];
            }
            if(itemSchema.enum !== undefined && !itemSchema.enum.length) {
                itemSchema.enum = [''];
            }

            uischema.scope = '#/properties/' + propName;

            if(undefined === schema.properties) {
                schema.properties = {};
            }
            schema.properties[propName] = itemSchema;

            //:TODO fix required
            // //workaround to receive required info from item
            // if(undefined !== itemSchema?.required)  {
            //     if(itemSchema?.required?.includes('true')) {
            //         if(undefined === schema.required) {
            //             schema.required = [];
            //         }
            //         schema.required?.push(propName);
            //     }
            //     delete itemSchema.required;
            // }
            break;

        case 'VerticalLayout':
        case 'HorizontalLayout':
        case 'Categorization':
        case 'Category':
        case 'Group':
            const childComponents = getChildComponents(refElm, null);

            const elements = refElm.elements.map((tool:Tool) => {
                if(!childComponents[tool.uuid]) {
                    throw "no child with uuid "+ tool.uuid +" found";
                }
                return createJsonUiSchema(childComponents[tool.uuid], schema)
            });
            uischema.elements = elements ?? [];
            // if (props?.label) {
            //     uischema.label = props.label;
            // }
            // if(!uischema.label && 'Category' === uischema.type) {
            //     uischema.label = 'Tab';
            // }
            break;


        case 'Label':
            let label = 'Label';
            if(uischema?.label) {
                label = String(uischema.label);
                delete uischema.label;
            }
            uischema.text = label;
            break;
    }

    return uischema;
};

export const getChildComponents = (component:any, namePrefix:string|null) => {
    const childComponents = {} as Record<string, any>;

    const refs = Object.keys(component.$refs)
        .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
        .map(key => {
            let reff = component.$refs[key];
            if(reff.length) {
                reff = reff[0];
                if(1 < reff.length) {
                    throw "there are more then one $refs with key "+ key
                }
            }
            return reff;
        });

    refs.map(reff => {
        if(!reff.tool.uuid)  {
            throw "no uuid in getChildComponents";
        }

        childComponents[reff.tool.uuid] = reff
    })

    return childComponents;
};


export const createI18nTranslate = (localeCatalogue:Record<string, string>) => {
    // $KEY can be propertyName or i18n
    // const translations = {
    //    '$KEY.label': 'TEXT',
    //    '$KEY.description': 'TEXT',
    //    '$KEY.error.minLength': 'ERROR TEXT',
    // }

    return  (key:string, defaultMessage:string, context:any) => {
        //console.log("translate", {key,defaultMessage, context}, localeCatalogue[key]);

        let params = {};

        if(context?.error) {
            console.log("translate error", {key, defaultMessage}, context.error);
            params = {...params, ...context.error?.params};
        }

        return (localeCatalogue[key] && lodashTemplate(localeCatalogue[key])(params)) ?? defaultMessage;
    };
}

export const  findLayoutTool = (schema:JsonFormsSchema|undefined = undefined, itemUischema: JsonFormsUISchema) : Tool|undefined => {
    return [...layoutTools,...[tools.tab]]
        .find(comp => {
            return comp.props.jsonForms.uischema.type === itemUischema.type;
        })?.clone(schema, itemUischema);
}

export const findControlTool = (itemSchema:any, itemUischema:any) : Tool => {

    const elements = controlTools.map((itemForm, index) => {
        const schema = itemForm.props.jsonForms.schema;
        const uischema = itemForm.props.jsonForms.uischema;

        let score = 0;

        const sameType = schema.type === itemSchema?.type;
        const isString = 'string' === schema.type;
        if(sameType) {
            score++;

            const sameOptions = itemUischema?.options && JSON.stringify(uischema?.options) === JSON.stringify(itemUischema?.options);
            //console.log("options",JSON.stringify(uischema?.options) , JSON.stringify(itemUischema?.options),sameOptions);
            if(sameOptions) {
                score++;
            }

            if(isString) {
                if(schema?.enum !== undefined && itemSchema?.enum !== undefined) {
                    score++;
                }
                if(schema?.oneOf !== undefined && itemSchema?.oneOf !== undefined) {
                    score++;
                }
                if(schema?.format !== undefined && schema?.format === itemSchema?.format) {
                    score++;
                }
            }
        }

        return [index, score];
    });

    const sorted = elements.sort((a, b) => b[1] - a[1]);

    if(!controlTools[sorted[0][0]]) {
        throw "unknown tool";
    }

    return controlTools[sorted[0][0]]?.clone(itemSchema, itemUischema);
};



export const guessInputType = (jsonForms:JsonForms) => {
    const type = jsonForms?.schema?.type;
    const format = jsonForms.schema?.format;
    const options = jsonForms.uischema?.options;

    const byType = {
        'number': 'number',
        'integer': 'number',
        'boolean': 'checkbox',
    } as Record<string, string>;
    const stringByFormat = {
        'date': 'date',
        'time': 'time',
        'date-time': 'datetime-local',
    } as Record<string, string>;

    let inputType = 'text';
    switch (type) {
        default:
            if(format && stringByFormat[format]) {
                inputType = stringByFormat[format];
            }
            else if(jsonForms?.schema?.enum || jsonForms?.schema?.oneOf) {
                inputType = 'select'
            }
            else if(options) {
                if(options.multi) {
                    inputType = 'textarea'
                }
            }
            break;

        case 'boolean':
        case 'number':
        case 'integer':
            if(type && byType[type]) {
                inputType = byType[type];
            }
    }

    return inputType;
}


export const buildModalOptions = (tool:Tool) : Object => {

    const jsonForms = tool.props.jsonForms as any;

    const options = {} as any;

    options.inputType = guessInputType(jsonForms);
    options.propertyName = tool.props.propertyName;

    const schema = jsonForms.schema;
    if(schema.oneOf !== undefined && !schema.oneOf.length) {
        jsonForms.schema.oneOf = [{}]
    }
    if(schema.enum !== undefined && !schema.enum.length) {
        jsonForms.schema.enum = ['']
    }

    updatableSchemaKeys.forEach(key => {
        if(jsonForms.schema[key] !== undefined) {
            options[key] = jsonForms.schema[key];
        }
    });
    updatableUischemaKeys.forEach(key => {
        if(jsonForms.uischema[key] !== undefined) {
            options[key] = jsonForms.uischema[key];
        }
    });


    //convert enum to object
    if(options?.enum) {
        options.enum = options.enum.map((name: any) => {return {name: String(name)} });
    }
    if(options?.rule?.condition?.schema) {
        options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
    }

    //:TODO fix required
    // //workaround to check
    // if(undefined !== schema?.required)  {
    //     if(schema?.required?.includes('true')) {
    //         options.required = true;
    //     }
    // }

    return options;
};

export const denormalizeModalOptions = (data:any) => {

    //convert enum to map
    if(data?.enum) {
        data.enum = data.enum?.map((item:any)=>String(item?.name ?? '')) ?? [''];
        data.enum = [...new Set(data.enum)];
    }

    if(typeof data?.rule?.condition?.schema === "string") {
        try {
            //:TODO deep copy
            data.rule = {...data.rule};
            data.rule.condition = {...data.rule.condition};

            data.rule.condition.schema = JSON.parse(data.rule.condition.schema);
        }
        catch(e) {
            console.warn("modal onChange rule has parse errors", e);
            data.rule.condition.schema = {}
        }
    }

    return data;
}

export const tools = {
    tab: new Tool('flexArea', ToolProps.create({
        toolType:'tab',
        jsonForms: {uischema: {type: 'Category'}}
    })),
};

export const layoutTools = [

    new Tool('flexArea', ToolProps.create({
        toolType:'flex',
        jsonForms: {uischema: {type: 'VerticalLayout'}},
        toolName: 'Vertical Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'flexRow',
        jsonForms: {uischema: {type: 'HorizontalLayout'}},
        toolName: 'Horizontal Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'group',
        jsonForms: {uischema: {type: 'Group'}}
    })),

    new Tool('categorization', ToolProps.create({
      toolType:'tabs',
      jsonForms: {uischema: {type: 'Categorization'}},
    })),

    new Tool('label', ToolProps.create({
        toolType:'label',
        jsonForms: {uischema: {type: 'Label'}},
    })),
];

export const controlTools = [

    new Tool('formInputByType', ToolProps.create({
        toolName: 'text',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'textarea',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control', options:{multi:true}}}
    })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'number',
        jsonForms: {schema:{type:'number'}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'date',
        jsonForms: {schema:{type:'string', format: 'date'}, uischema:{type:'Control'}}
    })),

    //via optionModal.format
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'datetime-local',
    //     jsonForms: {schema:{type:'string', format: 'date-time'}, uischema:{type:'Control'}}
    // })),
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'time',
    //     jsonForms: {schema:{type:'string', format: 'time'}, uischema:{type:'Control'}}
    // })),

    //no jsonforms renderer
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'radio',
    //     jsonForms: {schema:{type:'string',enum:[]}, uischema:{type:'Control', options:{format:'radio'}}}
    // })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'select',
        jsonForms: {schema:{type:'string',oneOf:[]}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'checkbox',
        jsonForms: {schema:{type:'boolean'}, uischema:{type:'Control'}}
    })),

    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'file',
    //     jsonForms: {schema:{type:'string', format:'file'}, uischema:{type:'Control'}}
    // })),


    //try to solve with optionmodal
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'number',
    //     jsonForms: {schema:{type:'integer'}, uischema:{type:'Control'}}
    // })),

    //no renderer for slider:true
    // new Tool('formInputByType', ToolProps.create({
    //   inputType: 'range',
    //   jsonForms: {schema:{type:'number'}, uischema:{type:'Control',options:{"slider": true }}}
    //   //{type: 'number',"minimum": 1,"maximum": 5, "default": 2}
    // })),
];
