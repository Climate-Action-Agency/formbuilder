import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
    type: "object",
    properties: {
        orders: {
            type: "array",
            items:
                {
                    type: "object",
                    properties: {
                        customer: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string"
                                },
                                name: {
                                    type: "string",
                                    format: "email"
                                },
                                department: {
                                    type: "string"
                                }
                            }
                        },
                        title: {
                            type: "string",
                            minLength: 5,
                            title: "Official Title"
                        },
                        ordered: {
                            type: "boolean"
                        },
                        processId: {
                            type: "number",
                            minimum: 0
                        },
                        assignee: {
                            type: "string"
                        },
                        startDate: {
                            type: "string",
                            format: "date"
                        },
                        endDate: {
                            type: "string",
                            format: "date"
                        },
                        status: {
                            type: "string",
                            enum: [
                                "unordered",
                                "planned",
                                "ordered"
                            ]
                        }
                    },
                    required: [
                        "title"
                    ]
                }

        }
    }
}
const uischema = {
    type: "ListWithDetail",
    scope: "#/properties/orders",
    options: {
        labelRef: "#/items/properties/customer/properties/name",
        detail: {
            type: "VerticalLayout",
            elements: [
                {
                    type: "HorizontalLayout",
                    elements: [
                        {
                            type: "Control",
                            scope: "#/properties/title"
                        },
                        {
                            type: "Control",
                            scope: "#/properties/processId"
                        }
                    ]
                },
                {
                    type: "Group",
                    label: "Customer",
                    elements: [
                        {
                            type: "Control",
                            label: "ID",
                            scope: "#/properties/customer/properties/id"
                        },
                        {
                            type: "Control",
                            label: "Name",
                            scope: "#/properties/customer/properties/name"
                        },
                        {
                            type: "Control",
                            label: "Department",
                            scope: "#/properties/customer/properties/department"
                        }
                    ]
                },
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            type: "VerticalLayout",
                            elements: [
                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        {
                                            type: "Control",
                                            scope: "#/properties/ordered",
                                            options: {
                                                toggle: true
                                            }
                                        },
                                        {
                                            type: "Control",
                                            scope: "#/properties/assignee"
                                        }
                                    ]
                                },
                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        {
                                            type: "Control",
                                            scope: "#/properties/startDate"
                                        },
                                        {
                                            type: "Control",
                                            scope: "#/properties/endDate"
                                        }
                                    ]
                                },
                                {
                                    type: "Control",
                                    scope: "#/properties/status"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
}

export const data = {};

registerExamples([
    {
        name: 'fb-listwithdetail',
        label: 'FormBuilder - ListWithDetail',
        data,
        schema,
        uischema
    }
]);
