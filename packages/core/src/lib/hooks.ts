import Kareem from 'kareem';
import { THookParams, THookType } from '../types';

// Define a class for a hook
export class Hook {
  // Create a new instance of Kareem for handling hooks
  private kareemHookInstance = new Kareem();

  // Add a function to be executed before a hook
  public before = (type: THookType, fn: () => void) => {
    this.kareemHookInstance.pre(type, fn);
  };

  // Add a function to be executed after a hook
  public after = (type: THookType, fn: () => void) => {
    this.kareemHookInstance.post(type, fn);
  };

  // Execute all functions added to be executed before a hook
  public execBefore = (
    type: THookType,
    params: THookParams,
    context: Array<any> = [],
    cb: (err: any) => void
  ) => {
    this.kareemHookInstance.execPre(type, params, context, cb);
  };

  // Execute all functions added to be executed after a hook
  public execAfter = (
    type: THookType,
    params: THookParams,
    context: Array<any>,
    cb: (err: any) => void
  ) => {
    this.kareemHookInstance.execPost(type, params, context, cb);
  };
}

// Export an instance of the Hook class
const hook = new Hook();
export default hook;
