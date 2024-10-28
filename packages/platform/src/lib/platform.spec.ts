import { Platform } from './platform';
import { Logger } from './logger';

describe('platform', () => {
  it('should work create two instances on mercury', () => {
    const platform = new Platform();
    expect(platform).toBeDefined();
  });

  it('should be able access core', async () => {
    let coreAsPromise: any;
    const platform = new Platform({
      uri: 'mongodb://localhost:27017',
      logger: new Logger({
        name: 'test',
        namespace: ['test'],
        level: ['info', 'warn'],
      }),
      plugins: [
        {
          name: 'pos',
          init: async ({ core }) => {
            coreAsPromise = core;
          },
          run: () => {
            console.log('run');
            return Promise.resolve();
          },
        },
      ],
    });
    platform.permissions = { pos: { core: true } };
    platform.init();
    expect(coreAsPromise).toBeDefined();
  });
  it('should be able access core only if permitted', async () => {
    let coreAsPromise: any;
    const platform = new Platform({
      uri: 'mongodb://localhost:27017',
      logger: new Logger({
        name: 'test',
        namespace: ['test'],
        level: ['info', 'warn'],
      }),
      plugins: [
        {
          name: 'pos',
          init: async ({ core }) => {
            coreAsPromise = core;
          },
          run: () => {
            console.log('run');
            return Promise.resolve();
          },
        },
      ],
    });
    platform.permissions = { pos: { core: false } };
    platform.init();
    console.log(coreAsPromise);
    expect(coreAsPromise).rejects.toThrowError('Access Denied');
  });
});
