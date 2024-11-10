import hook from '../src/hooks';

describe('hook', () => {
  it('should trigger before hook', () => {
    const mockFn = jest.fn();
    const mockExpFn = jest.fn();
    hook.before('CREATE_MODEL', (callback: Function) => {
      mockFn();
      callback();
    });
    //@ts-ignore
    hook.execBefore('CREATE_MODEL', null, mockExpFn);
    expect(mockFn).toHaveBeenCalled();
  });
  it('should trigger after hook', () => {
    const mockFn = jest.fn();
    const mockExpFn = jest.fn();
    hook.after('CREATE_MODEL', mockFn);
    //@ts-ignore
    hook.execAfter('CREATE_MODEL', null, [1], () => {
      mockExpFn();
    });
    expect(mockFn).toHaveBeenCalled();
    expect(mockExpFn).toHaveBeenCalled();
  });
});
