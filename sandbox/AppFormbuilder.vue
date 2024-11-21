<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="styleA">
      Select Example:
      <select v-model="example" style="width:auto;display:inline" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/jsonforms?example=' + example" v-if="example" class="ml-1 text-sm">[open Jsonforms]</a><br>

      <div>
        Schema Only: <input type="checkbox" v-model="schemaOnly" />
        <template v-if="schemaOnly">
          use schema Tool: <input type="checkbox" v-model="schemaBaseTool" />
          Auto Uischema: <input type="checkbox" v-model="schemaOnlyAutoUischema" /><br>
        </template>
        <br>
        <template v-if="example">
          Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" />
        </template>
      </div>
    </div>

    <button @click="importSchema" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-24">Import Schema</button>

    <FormBuilder
          :key="importedFormHash + example + (schemaOnly?'schemaonly':'') + (schemaReadOnly?'readonly':'') + (schemaBaseTool?'schema':'') + changeKey"
          :jsonForms="jsonForms"
          :jsonFormsRenderers="jsonFormsRenderers"
          :schemaOnly="schemaOnly"
          :schemaReadOnly="schemaReadOnly"
          :tools="tools"
          :uiOptions="uiOptions"
          :schemaTool="schemaBaseTool ? 'schema' : ''"
          @schemaUpdated="onSchemaUpdated"
          ref="fb"
      />
    <!--
          :toolFinder="toolFinder"
       -->

      <details>
          <summary class="cursor-pointer">ToolTree</summary>
          <div class="flex gap-4 text-xs">
              <div>
                  Schema:
                  <IdList :tool="baseSchemaTool" v-if="baseSchemaTool" />
              </div>
              <div>UI:
                  <IdList :tool="baseUiTool" v-if="baseUiTool" />
              </div>
          </div>
      </details>

    <FormBuilderDetails :jsonForms="jsonFormsResolved" :open="'true'" />

    <details v-if="example && !schemaReadOnly">
      <summary class="cursor-pointer">JSON Render Diff</summary>
      <ExampleVsSchemaCode
          :example="latestExampleData"
          :jsonforms="latestSchemaAfterExampleData"
          :key="example + (schemaOnly?'schemaonly':'') + (schemaReadOnly?'readonly':'')"
          v-if="latestSchemaAfterExampleData?.schema"
      />
    </details>

  </div>

</template>

<style>
.formbuilder > nav.toolbar {
 box-shadow: 0px 8px 8px -8px rgb(30, 30, 30, 30%);
  z-index:9;
 @apply
 sticky top-0 pt-2
}

</style>

<script setup lang="ts">
import * as _ from 'lodash-es'
import {computed,  ref, unref, watch} from "vue";
import {Generate, generateDefaultUISchema, generateJsonSchema, type JsonSchema} from "@jsonforms/core";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {getExamples} from '@jsonforms/examples/src'
import * as ownExamples from "./jsonForms/examples";
import {getExampleFromUrl, getKeyFromUrl, getUrl} from "./lib";
import {boplusVueVanillaRenderers, defaultTools, FormBuilder, formbuilderRenderers} from "../src/index.ts";
import  {ToolFinder, type UiOptionsByType} from "../src/index.ts";
import IdList from "./Dev/IdList.vue";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import ExampleVsSchemaCode from "./ExampleVsSchemaCode.vue";

const tools = [
    ...defaultTools,
]
const uiOptions:UiOptionsByType = {
  Categorization: {
    variant: {type:"string",enum:["stepper"],default:''},
    showNavButtons: {type:"boolean",default:false},
  }
}
const toolFinder = new ToolFinder(tools, uiOptions);

const jsonFormsRenderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  ...formbuilderRenderers,
]);

const oe = ownExamples;//import own examples

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a,b)=>a.label.toLowerCase()>b.label.toLowerCase()?1:-1));
const example = ref(getExampleFromUrl());
const schemaReadOnly = ref("1" === getKeyFromUrl('schemaReadOnly'));
const schemaOnly = ref("1" === getKeyFromUrl('schemaOnly'));
const schemaOnlyAutoUischema = ref("1" === getKeyFromUrl('schemaOnlyAutoUischema'));
const schemaBaseTool = ref("1" === getKeyFromUrl('schemaBaseTool'));
const jsonFormsResolved = ref({});
const latestExampleData = ref({});
const latestSchemaAfterExampleData = ref(null);
const changeKey = ref(null);
const jsonFormsExternalChanges = ref();

const fb = ref(null);
const baseUiTool = computed(() => fb.value?.baseUiTool);
const baseSchemaTool = computed(() => fb.value?.baseSchemaTool);

const rootSchema = ref();
const rootUiSchema = ref();

const importedForm = ref();

const DEFAULT_IMPORT = (
  {"schema":{"type":"object","properties":{"requirements":{"type":"object","properties":{"req1":{"type":"boolean","title":"Disclose gross Scope 1 GHG emissions in metric tonnes of CO2eq."},"req2":{"type":"boolean","title":"Report the percentage of Scope 1 emissions regulated under emissions trading schemes."},"req3":{"type":"boolean","title":"Detail gross location-based Scope 2 GHG emissions in metric tonnes of CO2eq."}}},"description":{"type":"string"},"total-ghg-emissions":{"type":"array","items":{"type":"object","properties":{"emission-method":{"type":"string"},"metric-tonnes-co2eq":{"type":"number"}}}}}},
   "uischema":{"type":"VerticalLayout","elements":[{"type":"HorizontalLayout","elements":[{"type":"VerticalLayout","elements":[{"type":"Label","text":"Describe the undertaking’s disclosure of GHG emissions in metric tonnes of CO2eq, separately addressing Scopes 1, 2, 3, and total emissions. Ensure to include disaggregation and any changes in the undertaking’s reporting definition."},{"type":"Control","scope":"#/properties/description","options":{"multi":true}},{"type":"Control","scope":"#/properties/total-ghg-emissions","label":"Table: Total GHG Emissions"}]},{"type":"VerticalLayout","elements":[{"type":"Label","text":"Objective","options":{"styles":{"undefined":{"undefined":"heading"}}}},{"type":"Label","text":"The objective of this Disclosure Requirement is to provide a comprehensive understanding of the undertaking’s gross greenhouse gas emissions, detailing the direct, indirect, and value chain impacts. This includes a breakdown by operational control and analysis of emissions-driven transition risks. Proper documentation is essential for aligning with climate-related targets and EU policy goals."},{"type":"Label","text":"Requirements","options":{"styles":{"undefined":{"undefined":"heading"}}}},{"type":"Label","text":"Make sure you address the following areas:"},{"type":"Control","scope":"#/properties/requirements"}]}]}]}}
);

const importSchema = () => {
  const bothSchemas = window.prompt('Enter schema/uischema JSON', JSON.stringify(DEFAULT_IMPORT));
  if (bothSchemas) {
    importedForm.value = JSON.parse(bothSchemas);
  }
}

function generateShortHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char; // bitwise hash
    hash = hash & hash; // convert to 32-bit integer
  }
  return Math.abs(hash).toString(36); // convert to base36 for a shorter string
}

const importedFormHash = computed(() => {
  return importedForm.value ? generateShortHash(JSON.stringify(importedForm.value)) : null;
})

const onSchemaUpdated = (jsonForms) => {
  rootSchema.value = jsonForms.schema;
  rootUiSchema.value = jsonForms.uischema;

  if(schemaOnly.value && schemaOnlyAutoUischema.value) {
    //jsonForms.uischema = {type:"Control",scope:"#"}
    jsonForms.uischema = Generate.uiSchema(rootSchema.value);
  }

  jsonFormsResolved.value = unref(jsonForms);
}

const jsonForms = computed(() => {
  let newSchemaData = {schema:undefined, uischema:undefined} as any;

  const updateSchemaData = () => {
    if (newSchemaData) {
      if (!newSchemaData?.schema) {
        newSchemaData.schema = generateJsonSchema({});
      }

      if (false === newSchemaData?.uischema) {
        if(!schemaOnly.value) {
          newSchemaData.uischema = generateDefaultUISchema(newSchemaData.schema)
        }
      }
      else {
          //:TODO only clean uischema if option is set (or add "auto" option -> generateDefaultUISchema())
        if (newSchemaData?.uischema && schemaReadOnly.value) {
          newSchemaData.uischema = {
              type:'VerticalLayout'
          };
        }

        if (!newSchemaData?.uischema && !schemaReadOnly.value) {
          console.log("sandbox app","UiSschema generated because example is empty");
          newSchemaData.uischema = generateDefaultUISchema(newSchemaData.schema)
        }
      }
      //:DEV
      // const output = [];
      // const p = newSchemaData.schema.properties;
      // Object.keys(p).map(key => {
      //   output.push([key,p[key].type ?? p[key]['$ref']])
      // })
      // console.table(output)
    }
    else {
      newSchemaData = {schema:undefined,uischema:undefined}
    }
  }

  if (jsonFormsExternalChanges.value) {
    return jsonFormsExternalChanges.value;
  }
  else if (importedForm.value) {
    newSchemaData = importedForm.value;
  }
  else if (example.value) {
    newSchemaData = getExamples().find(item => item.name===example.value) as any;
    newSchemaData = newSchemaData && JSON.parse(JSON.stringify(newSchemaData)); //clone
    updateSchemaData();
    jsonFormsExternalChanges.value = undefined;
  }
  else {
    const schema = schemaOnly.value ? {} : generateJsonSchema({}) as JsonSchema|any;
    const uischema = generateDefaultUISchema(schema);
    if("additionalProperties" in schema) {
      delete schema.additionalProperties;
    }
    newSchemaData = {schema: schema, uischema: uischema};
  }

  latestExampleData.value = unref(newSchemaData);
  latestSchemaAfterExampleData.value = null;

  return newSchemaData
});

const updateJsonFormDebounced = _.debounce((a) => {
  latestSchemaAfterExampleData.value = {schema:rootSchema.value,uischema:rootUiSchema.value};
},300,{leading:false, trailing:true})


watch(() => jsonForms.value, async () => {
  jsonFormsResolved.value = unref(jsonForms.value);
  //jsonFormsResolved.value.schema = await resolveSchema(jsonFormsResolved.value.schema);
})
watch(() => rootSchema.value, async (a,b) => {
  updateJsonFormDebounced(a);
});

const createUrl = () => {
  const params = {
    example: example.value ?? undefined,
    schemaOnly: schemaOnly.value ? "1" : undefined,
    schemaOnlyAutoUischema: schemaOnlyAutoUischema.value ? "1" : undefined,
    schemaReadOnly: schemaReadOnly.value ? "1" : undefined,
    schemaBaseTool: schemaBaseTool.value ? "1" : undefined,
  }
  return new URLSearchParams(_.omitBy(params, _.isEmpty));
};

watch(() => example.value, async () => {
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaOnly.value, async () => {
  if(schemaOnly.value) {
    schemaReadOnly.value = false;
  }
  else {
      schemaBaseTool.value = false;
  }
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaOnlyAutoUischema.value, async () => {
  onSchemaUpdated({schema:rootSchema.value,uischema:rootUiSchema.value})
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaReadOnly.value, async () => {
  if(schemaReadOnly.value) {
    schemaOnly.value = false;
  }
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaBaseTool.value, async () => {
    window.location.hash = "/?"+ createUrl()
})

// emitter.on('afterOptionJsonforms', (event: EventAfterOptionJsonforms) => {
//   const tool = event.tool;
//
//   if('Control' === tool.uischema?.type) {
//     _.merge(event.schema, vuetifySchema);  //merge into schema
//     event.uischema.elements.push(vuetifyUischema); //attach tab
//   }
// })

</script>
