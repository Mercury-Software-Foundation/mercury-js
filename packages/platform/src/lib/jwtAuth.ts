import { IAuth, IAuthConfig, ISession, TPasswordPolicyError } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mercury, { Mercury } from '@mercury-js/core';
import speakeasy from 'speakeasy';
import { error } from 'console';
// import { TPluginInit, TPluginRun } from './platform';
const JWT_SECRET = 'vithi';
const TOKEN_EXPIRATION = '1h';
export class JwtAuth implements IAuth {
  private config: IAuthConfig;
  private core: Mercury;
  constructor(config: IAuthConfig) {
    this.config = config;
    this.core = config.mercury;
  }
  //   async init(initParams: TPluginInit): Promise<void> {
  //     console.log('Initializing Auth plugin with params:', initParams);
  //   }
  //   async run(runParams: TPluginRun): Promise<void> {
  //     console.log('Running Auth plugin with params:', runParams);
  //   }
  async register<T, K>(user: T): Promise<K> {
    try {
      const validation = await this.validatePasswordPolicy(
        (user as any).password
      );
      console.log(validation,"validation");
      
      if (validation !== true)
         return validation as K;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash((user as any).password, salt);
      console.log('Hashed password:', hashedPassword); 

      const newUser = await this.core.db['User'].mongoModel.create({
        ...user,
        password: hashedPassword,
      });
      console.log(newUser,"newUser");
      return newUser;
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }  
  async login<T>(username: string, password: string): Promise<T> {
    try {
      const user = await this.core.db['User'].mongoModel.findOne({ username });
      console.log(user,"user",username,password);
      if (!user) {
        throw new Error('User not found');
      }
      console.log(user.password,password,"kjhc");
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Provided password:', password);
      console.log('Stored hash:', user.password);
      console.log('Password comparison result:', isValidPassword);    
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      if (this.config.force2FA && user.twoFactorEnabled) {
        return {
          require2FA: true,
          tempToken: this.generateTempToken(username),
        } as T;
      }
      const token = this.createToken(user);
      return { token } as T;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  async logout(token: string): Promise<boolean> {
    try {
      return true;
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
  async verify<T>(token: string): Promise<T> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      });
      console.log(user,"verfiyuser");
      
      if (!user) {
        throw new Error('Invalid token');
      }
      return user as T;
    } catch (error: any) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
  async changePassword(
    token: string,
    password: string
  ): Promise<true | TPasswordPolicyError> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      console.log('Decoded Token:', decoded); 
  
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      })
      console.log('Retrieved User:', user); 
      if (!user) {
        throw new Error('User not found');
      }
      const passwordPolicyError = await this.validatePasswordPolicy(password);
      console.log('Password Policy Error:', passwordPolicyError); 
      if (passwordPolicyError !== true) {
        return passwordPolicyError;
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log('Updated User Password:', user.password); 
      await user.save();
      return true;
    } catch (error: any) {
      console.error('Error in changePassword:', error);
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
  
  async forgotPassword(username: string): Promise<string> {
    try {
      const user = await this.core.db['User'].mongoModel.findOne({ username });
      console.log(user);
      
      if (!user) {
        throw new Error('User not found');
      }
      console.log(this.generateTempToken(username));
      
      return this.generateTempToken(username);
    } catch (error: any) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }
  async resetPassword(
    tempToken: string,
    password: string
  ): Promise<true | TPasswordPolicyError> {
    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET);
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      });
      console.log(user,"user");
      
      if (!user) {
        throw new Error('User not found');
      }
      const passwordPolicyError = await this.validatePasswordPolicy(password);
      if (passwordPolicyError !== true) {
        return passwordPolicyError;
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      return true;
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }
  async validatePasswordPolicy(
    password: string
  ): Promise<true | TPasswordPolicyError> {
    if (password.length < 8) {
      return {
        policyType: 'length',
        errorMsg: 'Password must be at least 8 characters long',
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        policyType: 'uppercase',
        errorMsg: 'Password must contain at least one uppercase letter',
      };
    }
    return true;
  }
  async enable2FA(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      });
      if (!user) {
        throw new Error('User not found');
      }

      user.twoFactorEnabled = true;
      user.twoFASecret = await this.generate2FASecret();
      await user.save();
    } catch (error: any) {
      throw new Error(`Enable 2FA failed: ${error.message}`);
    }
  }
  async disable2FA(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      });
      if (!user) {
        throw new Error('User not found');
      }

      user.twoFactorEnabled = false;
      user.twoFASecret = undefined;
      await user.save();
    } catch (error: any) {
      throw new Error(`Disable 2FA failed: ${error.message}`);
    }
  }
  async verify2FA<T>(token: string, code: string): Promise<ISession<T>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await this.core.db['User'].mongoModel.findOne({
        username: (decoded as any).username,
      });

      if (!user || !this.verify2FACode(user.twoFASecret, code)) {
        throw new Error('Invalid 2FA code');
      }

      const newToken = this.createToken(user);
      return {
        token: newToken,
        expires: Date.now() + Number(TOKEN_EXPIRATION),
        ...user,
      };
    } catch (error: any) {
      throw new Error(`2FA verification failed: ${error.message}`);
    }
  }
  async generate2FASecret(): Promise<string> {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }
  public generateTempToken(username: string): string {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: '10m' });
  }
  public createToken(user: any): string {
    return jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });
  }
  private verify2FACode(secret: string, code: string): boolean {
    return code === '123456';
  }
}
