import { rateLimiter } from './rateLimiter';

describe('rateLimiter', () => {
  it('should work', () => {
    expect(rateLimiter()).toEqual('rateLimiter');
  });
});
