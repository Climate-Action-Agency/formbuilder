# JSON Forms Editor

https://jsonformseditor.io/

## Routing in App.vue

- `/`: shows `AppFormbuilder` → `FormBuilderDetails`
- `/jsonforms`: shows `AppJsonforms`
- `/formbuilder-renderer`: shows `AppFormbuilderRenderer`

## Events

updateSchemaTree
→ handelUiEventOnAdded
→ ToolEdge.addChild()

FormBuilder.vue has:

- emitSchemaUpdated
- @schemaUpdated

BuilderEvent.ts
