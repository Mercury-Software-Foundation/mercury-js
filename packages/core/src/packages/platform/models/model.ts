import mercury from "../../../mercury";
import type { Mercury } from '../../../mercury';
import _ from 'lodash';
import { AfterHook, Utility } from "../utility";

export class Model {
  protected mercury: Mercury;
  protected utility;
  constructor(mercury: Mercury) {
    this.mercury = mercury;
    this.utility = new Utility(this.mercury);
    this.createModel();
    this.subscribeHooks();
  }

  private createModel() {
    this.mercury.createModel(
      'Model',
      {
        name: {
          type: 'string',
          unique: true,
          required: true,
        },
        label: {
          type: 'string',
          unique: true,
          required: true,
        },
        prefix: {
          type: 'string',
          required: true,
        },
        managed: {
          type: 'boolean',
          required: true,
          default: true
        },
        createdBy: {
          type: 'relationship',
          ref: 'User',
          // required: true,
        },
        updatedBy: {
          type: 'relationship',
          ref: 'User',
          // required: true,
        },
      },
      {
        historyTracking: false,
        indexes: [
          {
            fields: {
              name: 1,
              prefix: 1,
            },
            options: {
              unique: true,
            },
          },
        ],
      }
    );
  }

  private subscribeHooks() {
    this.createModelHook();
    this.updateModelHook();
    this.deleteModelHook();
  }

  private createModelHook() {
    const _self = this;
    this.mercury.hook.after('CREATE_MODEL_RECORD', async function (this: any) {
      if (this.options.skipHook) return;
      // create options
      const record = await _self.mercury.db.Model.get(
        { _id: this.record._id },
        { id: '1', profile: 'Admin' }
      );
      await _self.utility.createDefaultModelOptions(record);
      _self.syncModel(record);
    });
  }

  private updateModelHook() {
    const _self = this;
    this.mercury.hook.before('UPDATE_MODEL_RECORD', async function (this: any) {
      if (this.record.managed) throw new Error(`This model can't be edited`);
    });
    this.mercury.hook.after('UPDATE_MODEL_RECORD', async function (this: any) {
      if (this.options.skipHook) return;
      const record = await _self.mercury.db.Model.get(
        { _id: this.record._id },
        { id: '1', profile: 'Admin' }
      );
      _self.syncModel(record, this.prevRecord);
    });
  }

  private deleteModelHook() {
    const _self = this;
    this.mercury.hook.before('DELETE_MODEL_RECORD', async function (this: any) {
      if (this.record.managed) throw new Error(`This model can't be deleted!`);
    });
    this.mercury.hook.after('DELETE_MODEL_RECORD', async function (this: any) {
      if (this.options.skipHook) return;
      // _self.this.mercury.deleteModel(this.deletedRecord.name);
      await _self.deleteMetaRecords(this.deletedRecord);
      await _self.delModel(this.deletedRecord.name);
    });
  }

  // after hook 
  @AfterHook
  private async syncModel(model: TMetaModel, prevRecord?: TMetaModel) {
    let redisObj: TModel = {} as TModel;
    if (_.isEmpty(prevRecord)) {
      redisObj = {
        name: model.name,
        fields: {},
        options: { historyTracking: false, private: false },
      };
    } else {
      if (prevRecord.name !== model.name) {
        // handle redis not present
        // name update -> update in associated model fields, model options
        redisObj = JSON.parse((await this.mercury.cache.get(prevRecord.name.toUpperCase())) as string);
        await this.delModel(prevRecord.name);
        redisObj.name = model.name;
        this.updateMetaRecords(model);
      } else return;
    }
    let allModels: string[] = JSON.parse((await this.mercury.cache.get('ALL_MODELS')) as string);
    allModels.push(model.name);
    await this.mercury.cache.set(
      model.name.toUpperCase(),
      JSON.stringify(redisObj)
    );
    await this.mercury.cache.set('ALL_MODELS', JSON.stringify(allModels));
    if (!_.isEmpty(redisObj.fields))
      this.mercury.createModel(redisObj.name, redisObj.fields, redisObj.options);
  }

  @AfterHook
  private async delModel(model: string) {
    let allModels: string[] = JSON.parse(await this.mercury.cache.get('ALL_MODELS') as string);
    allModels = allModels.filter((rmodel: string) => rmodel !== model);
    await this.mercury.cache.delete(model.toUpperCase());
    await this.mercury.cache.set('ALL_MODELS', JSON.stringify(allModels));
  }

  @AfterHook
  private async deleteMetaRecords(model: any) {
    ['ModelField', 'ModelOption', 'FieldOption'].map(async (modelName: string) => {
      await this.mercury.db[modelName].mongoModel.deleteMany({
        model: model._id,
      });
    })
  }

  @AfterHook
  private async updateMetaRecords(model: TMetaModel) {
    ['ModelField', 'ModelOption', 'FieldOption'].map(async (modelName: string) => {
      await this.mercury.db[modelName].mongoModel.updateMany({
        model: model._id,
      }, {
        $set: { modelName: model.name }
      });
    })
  }
}