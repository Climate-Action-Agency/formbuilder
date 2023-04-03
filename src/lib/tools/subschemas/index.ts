import validationSubschema from "../schema/subschemas/validation.form.json";
import labelSubschema from "../schema/subschemas/label.form.json";
import labelDescOnlySubschema from "../schema/subschemas/label.descriptionOnly.form.json";
import labelNoDescSubschema from "../schema/subschemas/label.noDescription.form.json";
import stylesSubschema from "../schema/subschemas/styles.form.json";
import constSubschema from "../schema/subschemas/const.form.json";
import ruleSubschema from "../schema/subschemas/rule.form.json";
import conditionalSubschema from "../schema/subschemas/conditional.form.json";
import definitionsSubschema from "../schema/subschemas/definitions.form.json";

export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './label'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './validation'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'
export { prepareOptionData as prepareOptionDataStyles, setOptionData as setOptionDataStyles } from './styles'
export { prepareOptionData as prepareOptionDataConst, setOptionData as setOptionDataConst } from './const'
export { prepareOptionData as prepareOptionDataconditional, setOptionData as setOptionDataconditional } from './conditional'
export { prepareOptionData as prepareOptionDataDefinitions, setOptionData as setOptionDataDefinitions } from './definitions'

export const subschemaMap = {
    'validation.schema': validationSubschema.schema,
    'validation.uischema': validationSubschema.uischema,
    'rule.schema': ruleSubschema.schema,
    'rule.uischema': ruleSubschema.uischema,
    'labelAndI18n.schema': labelSubschema.schema,
    'labelAndI18n.uischema': labelSubschema.uischema,
    'labelAndI18n.descriptionOnly.uischema': labelDescOnlySubschema.uischema,
    'labelAndI18n.noDescription.uischema': labelNoDescSubschema.uischema,
    'styles.schema': stylesSubschema.schema,
    'styles.uischema': stylesSubschema.uischema,
    'const.schema': constSubschema.schema,
    'const.uischema': constSubschema.uischema,
    'conditional.schema': conditionalSubschema.schema,
    'conditional.uischema': conditionalSubschema.uischema,
    'definitions.schema': definitionsSubschema.schema,
    'definitions.uischema': definitionsSubschema.uischema,
} as Record<string, any>
