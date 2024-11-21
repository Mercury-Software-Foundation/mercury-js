---
sidebar_position: 8
title: Profiles
---

## Mercury.js: Defining Access Control for Models and Fields

Mercury.js provides a powerful mechanism for defining access control rules for your application's data models. This feature allows you to specify what actions users can perform on a particular model or individual fields within a model. Access control is managed through profiles, which can be assigned to actors in your system, thus governing their permissions.

### Access Control Levels

Mercury.js offers access control at two levels:
- **`Model Level`**: Controls access to an entire model, specifying permissions like creating, reading, updating, or deleting records.
- **`Field Level`**: Allows for more granular control by specifying access permissions for individual fields within a model.

Each model or field can have the following access permissions:
- **`Create`**: Permission to add new records or values.
- **`Read`**: Permission to view existing records or values.
- **`Update`**: Permission to modify existing records or values.
- **`Delete`**: Permission to remove records or values.

### Profile Syntax

To define access control rules, use the `mercury.access.createProfile` method. This method takes two parameters:
1. **Profile Name**: The name of the profile (e.g., `ADMIN`, `USER`, `ANONYMOUS`).
2. **Rules**: A list of access rules for each model.

### Creating a Profile

#### Syntax

```typescript
export const Profile = mercury.access.createProfile(profileName: string, rules: Rule[]);
```

### Rule Structure

Each rule in the `rules` array should follow this structure:

```typescript
type TAction = 'create' | 'read' | 'update' | 'delete';

type Rule = {
  modelName: string;
  access: {
    [TAction: string]: boolean; // Uses TAction as keys (create, read, update, delete)
  };
  fieldLevelAccess?: boolean;
  fields?: {
    [fieldName: string]: {
      [TAction: string]: boolean; // Also uses TAction as keys for field-level control
    };
  };
  sharingRules?: 'PRIVATE' | 'PUBLIC_READ' | 'PUBLIC_READ_WRITE';
};
```

- `modelName`: The name of the model this rule applies to.
- `access`: An object defining model-level access permissions. The keys are from the `TAction` type, representing create, read, update, and delete actions.
- `fieldLevelAccess` (optional): A boolean indicating if field-level access control is enabled.
- `fields` (optional): An object defining field-level access permissions. For each field, the permissions use the same `TAction` keys as the model-level access.
- `sharingRules` (optional): Defines the sharing behavior for the model.

### Access Control Actions

The `TAction` type defines the possible actions for access control:

- `create`: Permission to add new records or values.
- `read`: Permission to view existing records or values.
- `update`: Permission to modify existing records or values.
- `delete`: Permission to remove records or values.

These actions are used as keys in both the `access` object for model-level permissions and in each field's permission object for field-level access control. This allows for consistent and granular control over data operations at both levels.

### Model-Level Access Example

Here's an example of how to define different profiles with access control for a model level:

```typescript
import mercury from "@mercury-js/core";

const rules = [
  {
    modelName: "Document",
    access: {
      create: true,
      read: true,
      update: false,
      delete: false,
    },
    fields: {
      title: {
        create: true,
        read: true,
        update: false,
      },
      content: {
        create: true,
        read: true,
        update: false,
      },
    },
  },
];

// Create profiles
export const AdminProfile = mercury.access.createProfile("ADMIN", [
  {
    modelName: "Document",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
]);

export const UserProfile = mercury.access.createProfile("USER", rules);

export const AnonymousProfile = mercury.access.createProfile("ANONYMOUS", [
  {
    modelName: "Document",
    access: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
]);
```

### Updating an Existing Profile
To update the rules of an existing profile, use the updateProfile method. This method takes two parameters:

- ***`Profile Name`***: The name of the profile you want to update.
- ***`Rules`***: The new list of access rules for the profile.

```typescript
updateProfile(name: string, rules: Rule[]): void;

```
### Example
```typescript
// Update the AdminProfile with new rules
mercury.access.updateProfile("ADMIN", [
  {
    modelName: "Document",
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    fields: {
      title: {
        create: true,
        read: true,
        update: true,
      },
      content: {
        create: true,
        read: true,
        update: true,
      },
    },
  },
]);

```

### Extending an Existing Profile
To extend the rules of an existing profile, use the extendProfile method. This method takes two parameters:

- ***`Profile Name`***: The name of the profile you want to extend.
- ***`Rules`***: The additional rules you want to add to the profile.
```typescript
extendProfile(name: string, rules: Rule[]): void;

```
### Example
```typescript
// Extend the UserProfile with additional rules
mercury.access.extendProfile("USER", [
  {
    modelName: "Document",
    fields: {
      summary: {
        create: false,
        read: true,
        update: false,
      },
    },
  },
]);

```

### Default Access Behavior
If field-level access is not specified for a model, the default permissions applied are those defined at the model level. This means that any permissions not explicitly set at the field level will inherit the model-level permissions.

For example, if the `Document` model has permissions set for `create`, `read`, `update`, and `delete`, but no specific field-level permissions are defined for `title` or `content`, the model-level permissions will apply to these fields by default.

### Explanation of Access Permissions

- **`Create`**: Allows the creation of new records or fields.
- **`Read`**: Allows the viewing of records or fields.
- **`Update`**: Allows the modification of existing records or fields.
- **`Delete`**: Allows the removal of records or fields.

### Flexible Access Control
Mercury.js provides flexibility to:

- ***`Control Access at the Model Level`***: Define access for entire models.
- ***`Control Access at the Field Level`***: Specify permissions for individual fields within a model.

<!-- ### Sharing Rules

The `sharingRules` property in a rule allows you to define the sharing behavior for a model:

- `'PRIVATE'`: The model is only accessible to the owner or users with explicit permissions.
- `'PUBLIC_READ'`: The model can be read by anyone, but only modified by the owner or users with explicit permissions.
- `'PUBLIC_READ_WRITE'`: The model can be read and modified by anyone. -->

### Field-Level Access Control

To enable field-level access control, set `fieldLevelAccess` to `true` in your rule. Then, you can specify permissions for individual fields using the `fields` property.

```typescript
const rule: Rule = {
  modelName: "Document",
  access: {
    create: true,
    read: true,
    update: true,
    delete: false,
  },
  fieldLevelAccess: true,
  fields: {
    title: {
      create: true,
      read: true,
      update: true,
    },
    content: {
      create: true,
      read: true,
      update: false,
    },
  },
};
```

In this example, users can update the `title` field but not the `content` field of the `Document` model.
