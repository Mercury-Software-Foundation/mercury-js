export type CtxUser = {
  id: string;
  profile: string;
};

export type TAction = 'create' | 'read' | 'update' | 'delete';

export type Rule = {
  modelName: string;
  access: {
    [TAction: string]: boolean;
  };
  fieldLevelAccess?: boolean;
  fields?: {
    [fieldName: string]: {
      [TAction: string]: boolean;
    };
  };
  sharingRules?: 'PRIVATE' | 'PUBLIC_READ' | 'PUBLIC_READ_WRITE';
};

export type Profile = {
  name: string;
  rules: Rule[];
};

export type PopulateSchema = Array<{
  path: string;
  select: string[];
  populate?: PopulateSchema;
}>;
