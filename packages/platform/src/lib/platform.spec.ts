import { Mercury } from '@mercury-js/core';
import { platform } from './platform';

describe('platform', () => {
  it('should work', () => {
    expect(platform(Mercury)).toEqual('platform 1.0.0 Mercury run');
  });
});
