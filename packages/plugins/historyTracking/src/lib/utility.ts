import { TFields } from "@mercury-js/core";

export const historySchema = (name: string): TFields => {
  return {
    recordId: {
      type: 'relationship',
      ref: name,
    },
    operationType: {
      type: 'enum',
      enum: ['UPDATE', 'DELETE'],
      enumType: 'string',
      required: true,
    },
    instanceId: {
      type: 'string',
      required: true,
    },
    dataType: {
      type: 'string',
      required: true,
    },
    fieldName: {
      type: 'string',
      required: true,
    },
    newValue: {
      type: 'mixed',
      required: true,
    },
    oldValue: {
      type: 'mixed', // Mixed
      required: true,
    },
  };
};