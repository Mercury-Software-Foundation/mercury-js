import { PModel } from '../../../../types';

export const File: PModel = {
  info: {
    name: 'File',
    label: 'File',
    description: 'File model',
    managed: true,
    prefix: 'File',
    key: 'name',
  },
  fields: {
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    mimeType: {
      type: 'string',
    },
    extension: {
      type: 'string',
    },
    size: {
      type: 'float',
    },
    location: {
      type: 'string',
    },
    mediaId: {
      type: 'string'
    }
  },
  options: {
    historyTracking: false,
  },
};
