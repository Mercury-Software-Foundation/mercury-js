import mercury from '../src/mercury';
import { TFields } from '../types';

describe('Mercury', () => {
  it('should create a model', () => {
    const mockBeforeFn = jest.fn();
    const name = 'User';
    const fields: TFields = {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'number',
        required: true,
      },
    };
    const options = {
      historyTracking: true,
    };
    mercury.hook.before('CREATE_MODEL', mockBeforeFn);
    mercury.createModel(name, fields, options);
    expect(mercury.list.length).toBe(1);
    expect(mercury.list[0].name).toBe('User');
    expect(mockBeforeFn).toBeCalledTimes(1);
  });

  it('should create a model without history', () => {
    const mockBeforeFn = jest.fn();
    const name = 'Customer';
    const fields: TFields = {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'number',
        required: true,
      },
    };
    const options = {
      historyTracking: false,
    };
    mercury.hook.before('CREATE_MODEL', function (this: any) {
      this.fields.isActive = {
        type: 'boolean',
        default: true,
      };
      mockBeforeFn();
    });
    mercury.createModel(name, fields, options);
    expect(mercury.list[1].name).toBe('Customer');
    expect(mercury.list[1].fields.isActive).toBeDefined();
    expect(
      mercury.list.find((model) => model.name === 'CustomerHistory')
    ).toBeUndefined();
    expect(mockBeforeFn).toBeCalledTimes(1);
  });

  it('should add db instance', () => {
    const name = 'Test';
    const fields: TFields = {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'number',
        required: true,
      },
    };
    const options = {
      historyTracking: false,
    };
    mercury.createModel(name, fields, options);
    expect(mercury.db[name]).toBeDefined();
    expect(mercury.db[name].create).toBeDefined();
  });
  it('should add to list if set as private but no graphql typeDefs are generated', () => {
    const name = 'Private';
    const fields: TFields = {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'number',
        required: true,
      },
    };
    const options = {
      historyTracking: false,
      private: true,
    };
    mercury.createModel<{ name: string; fields: typeof fields }>(
      name,
      fields,
      options
    );
    expect(mercury.list.length).toBe(4);
    expect(mercury.db[name]).toBeDefined();
  });
});
