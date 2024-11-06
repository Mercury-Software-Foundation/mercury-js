import { createRateLimitRule, RedisStore } from 'graphql-rate-limit';
import { shield } from 'graphql-shield';
import _ from 'lodash';

export const Redis = RedisStore;
export const createRateLimitRuleContext = createRateLimitRule;
// Creating a rate limit rule function using graphql-rate-limit package
export const rateLimitRule: Function = createRateLimitRule({
  identifyContext: (ctx) => ctx?.request?.ipAddress || ctx?.id,
});

// Defining a rate limiter function that takes in a permission map and options object
export const rateLimiter = (
  permissionMap: {} = {},
  {
    window = '30s',
    max = 5,
    rateLimitRuleFunc = rateLimitRule,
    ignoreDefault = false,
  }: {
    window?: string;
    max?: number;
    rateLimitRuleFunc?: typeof rateLimitRule | Function;
    ignoreDefault?: boolean;
  }
) => {
  // Defining default permissions for Query and Mutation
  const defaultPermissions = {
    Query: {
      '*': rateLimitRuleFunc({ window, max }),
    },
    Mutation: {
      '*': rateLimitRuleFunc({ window, max }),
    },
  };

  // Merging default permissions with the permission map passed in
  const permissionMapOutput = ignoreDefault
    ? permissionMap
    : _.merge(defaultPermissions, permissionMap);

  // Returning a shield middleware with the final permission map
  return shield(permissionMapOutput as any, { allowExternalErrors: true });
};