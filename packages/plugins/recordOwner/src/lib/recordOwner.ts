import { IPlugin, Mercury, TOptions } from "@mercury-js/core";




declare module "@mercury-js/core" {
  export interface TOptions {
    recordOwner: boolean;
  }
}


export class RecordOwner implements IPlugin {
  public _mercury?: Mercury;
  private installed: boolean;
  constructor() {
    this.installed = false;
  }

  init(mercury: Mercury) {
    // Add a debugger that history tracking package is added
    this.installed = true;
    this._mercury = mercury;
  }

  private get mercury(): Mercury {
    if (!this._mercury) throw new Error("Mercury instance is not initialized!");
    return this._mercury;
  }

  run() {
    if (!this.installed || !this.mercury) throw new Error('Record Owner package is not installed!!');
    const mercury = this.mercury;
    mercury.hook.before('CREATE_MODEL', function (this: any) {
      if (this.options.recordOwner) {
        this.fields = {
          ...this.fields,
          createdBy: {
            type: 'relationship',
            ref: 'User',
          },
          updatedBy: {
            type: 'relationship',
            ref: 'User',
          },
          owner: {
            type: 'relationship',
            ref: 'User',
          },
        };

        mercury.hook.before(
          `CREATE_${this.name.toUpperCase()}_RECORD`,
          function (this: any) {
            this.data['createdBy'] = this.user.id;
            this.data['updatedBy'] = this.user.id;
            this.data['owner'] = this.user.id;
          }
        );

        mercury.hook.before(
          `UPDATE_${this.name.toUpperCase()}_RECORD`,
          function (this: any) {
            this.data['updatedBy'] = this.user.id;
          }
        );
      }
    });
  }
}