import { IPlugin, Mercury, TModel } from "@mercury-js/core";
import { IHistoryConfig } from "../types/historyTracking";
import mongoose from "mongoose";
import { historySchema } from "./utility";
import { isEqual } from 'lodash';

export class HistoryTracking implements IPlugin {
  public _mercury?: Mercury;
  private installed: boolean;
  private skipModels: string[];
  constructor(options?: IHistoryConfig) {
    this.installed = false;
    this.skipModels = options?.skipModels ?? [];
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
    // Running history tracking plugin and add a logger step for not installed
    if (!this.installed || !this.mercury) throw new Error('History Tracking package is not installed!!');
    this.createHistory();
  }

  private createHistory() {
    this.subscribeHistoryTrackingEvent();
    const models: TModel[] = this.mercury.list.filter(
      (model: TModel) =>
        model.options?.historyTracking === true &&
        !this.skipModels?.includes(model.name)
    );

    models.forEach((model: TModel) => {
      this.attachHistoryHooks(model);
    });
  }


  private subscribeHistoryTrackingEvent() {
    const _self = this;
    this.mercury.hook.after("CREATE_HISTORYTRACKING_MODEL", function (this: any) {
      const model = this;
      _self.attachHistoryHooks(model);
    });
  }


  private attachHistoryHooks(model: TModel) {
    const _self = this;
    const modelName = model.name;

    this.mercury.createModel(`${modelName}History`, historySchema(model.name), {
      historyTracking: false,
    });

    this.mercury.hook.after(
      `UPDATE_${modelName.toUpperCase()}_RECORD`,
      function (this: any) {
        const instanceId = _self.getInstanceId();
        Object.entries(this.data).map(async ([key, value]: [string, any]) => {
          if (
            !isEqual(
              _self.ifStringAndNotNull(this.prevRecord[key]),
              _self.ifStringAndNotNull(value)
            )
          ) {
            await _self.createHistoryRecord(
              _self.mercury,
              `${modelName}History`,
              this.prevRecord[key],
              value,
              instanceId,
              'UPDATE',
              _self.getDataType(model, key),
              this.prevRecord._id,
              key,
              this.user
            );
          }
        });
      }
    );

    this.mercury.hook.after(
      `DELETE_${modelName.toUpperCase()}_RECORD`,
      function (this: any) {
        const instanceId = _self.getInstanceId();
        const skipFields = ['id', '_id', 'createdOn', 'updatedOn', '__v'];
        Object.entries(this.deletedRecord['_doc']).map(
          async ([key, value]: [string, any]) => {
            if (skipFields.includes(key)) return;
            await _self.createHistoryRecord(
              _self.mercury,
              `${modelName}History`,
              value,
              'UNKNOWN',
              instanceId,
              'DELETE',
              _self.getDataType(model, key),
              this.deletedRecord._id,
              key,
              this.user
            );
          }
        );
      }
    );
  }


  getDataType(model: TModel, key: string) {
    return ['relationship', 'virtual'].includes(model.fields[key]?.type)
      ? model.fields[key].ref
      : model.fields[key].type;
  }

  getInstanceId() {
    return new mongoose.Types.ObjectId();
  }

  async createHistoryRecord(
    mercury: Mercury,
    model: string,
    oldValue: any,
    newValue: any,
    instanceId: any,
    operationType: string,
    dataType: any,
    recordId: string,
    fieldName: string,
    ctx: any
  ) {

    // setting context
    // Type can be mixed instead of string
    await mercury.db[model].mongoModel.create(
      {
        recordId: recordId,
        operationType: operationType,
        instanceId: instanceId,
        dataType: dataType,
        fieldName: fieldName,
        newValue: this.ifStringAndNotNull(newValue),
        oldValue: this.ifStringAndNotNull(oldValue),
      }
    );
  }

  ifStringAndNotNull(value: any) {
    if (value == null || value.length == 0 || value == undefined) {
      value = 'UNKNOWN';
    }
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value;
  }
}