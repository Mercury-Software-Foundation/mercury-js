import { JwtAuth } from './jwtAuth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthConfig, TPasswordPolicyError } from '../types';
import { Mercury } from '@mercury-js/core';
import assert from 'assert';
const JWT_SECRET = 'vithi';

describe('JwtAuth', () => {
  let jwtAuth: JwtAuth;
  let mockMercury: Mercury;

  beforeEach(async () => {
    mockMercury = {
      db: {
        User: {
          mongoModel: {
            create: async (user: any) => user,
            findOne: async (query: any) => {
              const users = [
                {
                  username: 'testuser',
                  password: await bcrypt.hash('Password', 10),
                  twoFactorEnabled: false,
                  save: async function () {
                    return this;
                  },
                },
                {
                  username: '2fauser',
                  password: await bcrypt.hash('Password456', 10),
                  twoFactorEnabled: true,
                  save: async function () {
                    return this;
                  },
                },
              ];
              return (
                users.find((user) => user.username === query.username) || null
              );
            },
          },
        },
      },
    } as unknown as Mercury;
    const config: IAuthConfig = {
      mercury: mockMercury,
      force2FA: true,
      sessionDuration: 123,
    };
    jwtAuth = new JwtAuth(config);
  });
  it('should register a new user successfully', async () => {
    const user = { username: 'testuser', password: 'Password' };
    const result = await jwtAuth.register<typeof user, typeof user>(user);
    assert.strictEqual(result.username, user.username);
    assert.notStrictEqual(result.password, user.password);
  });
  it('should fail registration with weak password', async () => {
    const user = { username: 'testuser', password: 'weak' };
    const result = await jwtAuth.register<
      typeof user,
      TPasswordPolicyError | typeof user
    >(user);
    assert.deepStrictEqual(result, {
      policyType: 'length',
      errorMsg: 'Password must be at least 8 characters long',
    });
  });
  it('should fail registration with a password lacking an uppercase letter', async () => {
    const user = { username: 'testuser', password: 'password' };
    const result = await jwtAuth.register<
      typeof user,
      TPasswordPolicyError | typeof user
    >(user);
    assert.deepStrictEqual(result, {
      policyType: 'uppercase',
      errorMsg: 'Password must contain at least one uppercase letter',
    });
  });
  it('should fail to log in with a non-existent user', async () => {
    mockMercury.db['User'].mongoModel.findOne = async () => null;
    await assert.rejects(
      async () => await jwtAuth.login<any>('unknownuser', 'Password'),
      { message: 'Login failed: User not found' }
    );
  });
  it('should fail to log in with an invalid password', async () => {
    const user = {
      username: 'testuser',
      password: await bcrypt.hash('Password', 10),
    };
    await assert.rejects(
      async () => await jwtAuth.login<any>('testuser', 'wrongPassword'),
      { message: 'Login failed: Invalid password' }
    );
  });
  it('should require 2FA if enabled', async () => {
    const user = {
      username: '2fauser',
      password: await bcrypt.hash('Password456', 10),
      twoFactorEnabled: true,
    };
    const result = await jwtAuth.login<{
      require2FA: boolean;
      tempToken: string;
    }>('2fauser', 'Password456');
    assert(result.require2FA);
    assert('tempToken' in result);
  });
  it('should verify a valid token', async () => {
    const user = { username: 'testuser' };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    const result = await jwtAuth.verify<typeof user>(token);
    assert.deepStrictEqual(result, user);
  });
  it('should fail to verify an invalid token', async () => {
    await assert.rejects(
      async () => await jwtAuth.verify<any>('invalid.token'),
      /Token verification failed/
    );
  });
  it('should change password successfully', async () => {
    const user = { username: 'testuser', save: async () => {} };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    const result = await jwtAuth.changePassword(token, 'NewPassword123!');
    console.log(result);
    assert.strictEqual(result, true);
  });
  it('should enable 2FA', async () => {
    const user = {
      username: 'testuser',
      save: async () => {},
      twoFactorEnabled: false,
      twoFASecret: undefined,
    };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    await jwtAuth.enable2FA(token);
    assert.strictEqual(user.twoFactorEnabled, true);
    assert(user.twoFASecret !== undefined);
  });
  it('should disable 2FA', async () => {
    const user = {
      username: 'testuser',
      save: async () => {},
      twoFactorEnabled: true,
      twoFASecret: 'secret',
    };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    await jwtAuth.disable2FA(token);
    assert.strictEqual(user.twoFactorEnabled, false);
    assert.strictEqual(user.twoFASecret, undefined);
  });
  it('should verify 2FA successfully', async () => {
    const user = { username: 'testuser', twoFASecret: 'secret' };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    const result = await jwtAuth.verify2FA<{ token: string; expires: number }>(
      token,
      '123456'
    );
    assert('token' in result);
    assert('expires' in result);
  });
  it('should fail 2FA verification with incorrect code', async () => {
    const user = { username: 'testuser', twoFASecret: 'secret' };
    mockMercury.db['User'].mongoModel.findOne = async () => user;
    const token = jwtAuth.createToken(user);
    await assert.rejects(
      async () => await jwtAuth.verify2FA<any>(token, 'wrongcode'),
      /2FA verification failed/
    );
  });
  it('should generate a temp token for an existing user', async () => {
    const username = 'testuser';
    const result = await jwtAuth.forgotPassword(username);
    assert(typeof result === 'string');
  });
  it('should fail to generate a temp token for a non-existing user', async () => {
    mockMercury.db['User'].mongoModel.findOne = async () => null;
    const username = 'unknownuser';
    await assert.rejects(async () => await jwtAuth.forgotPassword(username), {
      message: 'Forgot password failed: User not found',
    });
  });
  it('should reset the password successfully', async () => {
    const username = 'testuser';
    const tempToken = jwtAuth.generateTempToken(username);
    const newPassword = 'NewPassword123!';
    const result = await jwtAuth.resetPassword(tempToken, newPassword);
    assert.strictEqual(result, true);
  });
  it('should fail to reset the password with a weak password', async () => {
    const username = 'testuser';
    const tempToken = jwtAuth.generateTempToken(username);
    const weakPassword = 'weak';
    const result = await jwtAuth.resetPassword(tempToken, weakPassword);
    assert.deepStrictEqual(result, {
      policyType: 'length',
      errorMsg: 'Password must be at least 8 characters long',
    });
  });
  it('should generate a temp token for an existing user', async () => {
    const username = 'testuser';
    const result = await jwtAuth.forgotPassword(username);
    assert(typeof result === 'string');
  });
  it('should fail to generate a temp token for a non-existing user', async () => {
    mockMercury.db['User'].mongoModel.findOne = async () => null;
    const username = 'unknownuser';
    await assert.rejects(async () => await jwtAuth.forgotPassword(username), {
      message: 'Forgot password failed: User not found',
    });
  });
  it('should reset the password successfully', async () => {
    const username = 'testuser';
    const tempToken = jwt.sign({ username }, JWT_SECRET); // Generate a valid token
    const newPassword = 'NewPassword123!';

    mockMercury.db['User'].mongoModel.findOne = async () => ({
      username,
      password: await bcrypt.hash('Password', 10),
      save: async function () {
        return this;
      },
    });

    const result = await jwtAuth.resetPassword(tempToken, newPassword);
    assert.strictEqual(result, true);
  });
  it('should fail to reset the password with a weak password', async () => {
    const username = 'testuser';
    const tempToken = jwt.sign({ username }, JWT_SECRET);
    const weakPassword = 'weak';

    mockMercury.db['User'].mongoModel.findOne = async () => ({
      username,
      password: await bcrypt.hash('Password', 10),
      save: async function () {
        return this;
      },
    });

    const result = await jwtAuth.resetPassword(tempToken, weakPassword);
    assert.deepStrictEqual(result, {
      policyType: 'length',
      errorMsg: 'Password must be at least 8 characters long',
    });
  });
  it('should fail to reset password for a non-existent user', async () => {
    const tempToken = jwt.sign({ username: 'unknownuser' }, JWT_SECRET);

    await assert.rejects(
      async () => await jwtAuth.resetPassword(tempToken, 'NewPassword123!'),
      { message: 'Password reset failed: User not found' }
    );
  });
});
