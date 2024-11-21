import mercury from '@mercury-js/core';

const rules = [
  {
    modelName: 'User',
    access: {
      create: true,
      read: true,
      update: true,
      delete: true,
    }
  },
];
export const UserProfile = mercury.access.createProfile('USER', rules);
