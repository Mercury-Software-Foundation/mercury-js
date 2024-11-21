import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const mongooseModel = model;
import { TModel, TField, CtxUser, PopulateSchema, MongoModel } from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mongooseBcrypt from './mongoBcrypt';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mongoosePaginateV2 from 'mongoose-paginate-v2';
import access from './access';
import hook from './hooks';
import { startCase, isEmpty } from 'lodash';
export class Model {
  public model: TModel;
  public mongoSchema: any;
  public mongoModel: any;
  // schema type map
  private fieldMongooseTyepMap: { [type: string]: any } = {
    string: Schema.Types.String,
    number: Schema.Types.Number,
    float: Schema.Types.Number,
    boolean: Schema.Types.Boolean,
    date: Schema.Types.Date,
    relationship: Schema.Types.ObjectId,
    enum: 'enum',
    mixed: Schema.Types.Mixed,
    objectId: Schema.Types.ObjectId,
    decimal: Schema.Types.Decimal128,
  };

  constructor(model: TModel) {
    this.model = model;
    // create mongo schema from fields
    this.mongoSchema = this.createSchema();
    this.addVirtualFields();
    this.addIndexes(); //Add indexes
    this.mongoSchema.plugin(mongooseBcrypt);
    this.mongoSchema.plugin(mongoosePaginateV2);
    this.mongoModel =
      models[this.model.name] ||
      mongooseModel(this.model.name, this.mongoSchema);
    if (this.mongoSchema.indexes && this.mongoSchema.indexes.length > 0) {
      this.mongoModel.ensureIndexes();
    }
  }
  public async create(
    data: any,
    user: CtxUser,
    options: any = { internal: true }
  ) {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'create',
      user,
      Object.keys(data)
    );
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }
    if (options.populate) {
      const hasDeepAccess = access.validateDeepAccess(
        this.model.name,
        options.populate,
        'read',
        user
      );
      if (!hasDeepAccess) {
        throw new Error(
          'You does not have access to perform this action on this record/ field.'
        );
      }
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `CREATE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          data,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    let record = new this.mongoModel(data);
    record = await record.save();
    record = await this.mongoModel
      .findById(record.id)
      .populate(options.populate || [])
      .select(options.select || [])
      .exec();
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `CREATE_${this.model.name.toUpperCase()}_RECORD`,
        { name: this.model.name, record, user, options },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return record;
  }

  public async update(
    id: string,
    data: any,
    user: CtxUser,
    options: any = { internal: true }
  ) {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'update',
      user,
      Object.keys(data)
    );
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }

    if (options.populate) {
      const hasDeepAccess = access.validateDeepAccess(
        this.model.name,
        options.populate,
        'read',
        user
      );
      if (!hasDeepAccess) {
        throw new Error(
          'You does not have access to perform this action on this record/ field.'
        );
      }
    }

    // eslint-disable-next-line prefer-const
    let record = await this.mongoModel.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `UPDATE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          record,
          data,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    const updateRecord = await this.mongoModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate(options.populate || [])
      .select(options.select || [])
      .exec();
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `UPDATE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          prevRecord: record,
          record: updateRecord,
          data,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return updateRecord;
  }

  public async delete(id: string, user: CtxUser, options: any = {}) {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'delete',
      user,
      []
    );
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }

    let record = await this.mongoModel.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `DELETE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          record,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    const deletedRecord = record;
    record = await record.deleteOne();
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `DELETE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          deletedRecord,
          record,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return true;
  }

  public async get<T>(
    query: object,
    user: CtxUser,
    options: any = {}
  ): Promise<MongoModel<T> | undefined> {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'read',
      user,
      options.select || []
    );
    if (options.populate) {
      const hasDeepAccess = access.validateDeepAccess(
        this.model.name,
        options.populate,
        'read',
        user
      );
      if (!hasDeepAccess) {
        throw new Error(
          'You does not have access to perform this action on this record/ field.'
        );
      }
    }
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `GET_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          query,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    // compose query from where input
    // eslint-disable-next-line prefer-const
    let record = await this.mongoModel
      .findOne(query)
      .populate(options.populate || [])
      .select(options.select || [])
      .exec();
    if (isEmpty(record)) {
      return undefined;
    }
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `GET_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          query,
          record,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return record;
  }

  public async list(query: object, user: CtxUser, options: any = {}) {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'read',
      user,
      options.select || []
    );
    if (options.populate) {
      const hasDeepAccess = access.validateDeepAccess(
        this.model.name,
        options.populate,
        'read',
        user
      );
      if (!hasDeepAccess) {
        throw new Error(
          'You do not have access to perform this action on this record/field.'
        );
      }
    }
    if (!hasAccess) {
      throw new Error(
        'You do not have access to perform this action on this record/field.'
      );
    }

    await new Promise((resolve, reject) => {
      hook.execBefore(
        `LIST_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          query,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    // eslint-disable-next-line prefer-const
    let records = await this.mongoModel
      .find(query)
      .populate(options.populate || [])
      .select(options.select || [])
      .exec();
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `LIST_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          query,
          records,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return records;
  }

  public async paginate(
    query: object,
    filters: object,
    user: CtxUser,
    options: {
      [x: string]: any;
      select?: string[];
      populate?: PopulateSchema;
    } = {}
  ) {
    // validate the access
    const hasAccess = access.validateAccess(
      this.model.name,
      'read',
      user,
      options.select || []
    );
    if (options.populate) {
      const hasDeepAccess = access.validateDeepAccess(
        this.model.name,
        options.populate,
        'read',
        user
      );
      if (!hasDeepAccess) {
        throw new Error(
          'You does not have access to perform this action on this record/ field.'
        );
      }
    }
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `PAGINATE_${this.model.name.toUpperCase()}_RECORD`,

        {
          name: this.model.name,
          query,
          filters,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    // eslint-disable-next-line prefer-const
    let records = await this.mongoModel.paginate(query, {
      ...filters,
      populate: options.populate || [],
      select: options.select || [],
    });
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `PAGINATE_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          query,
          filters,
          records,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return records;
  }

  public async count(user: CtxUser, options: any = {}) {
    // validate the access
    const hasAccess = access.validateAccess(this.model.name, 'read', user, []);
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }
    await new Promise((resolve, reject) => {
      hook.execBefore(
        `COUNT_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
    // eslint-disable-next-line prefer-const
    let count = await this.mongoModel.countDocuments();
    await new Promise((resolve, reject) => {
      hook.execAfter(
        `COUNT_${this.model.name.toUpperCase()}_RECORD`,
        {
          name: this.model.name,
          count,
          user,
          options,
        },
        [],
        function (error: any) {
          if (error) {
            // Reject the Promise if there is an error
            reject(error);
          } else {
            // Resolve the Promise if there is no error
            resolve(true);
          }
        }
      );
    });
    return count;
  }

  // Mogoose schema generator
  private createSchema() {
    return new Schema(
      Object.keys(this.model.fields)
        .map((key) => {
          const value = this.model.fields[key];
          // ignore the virtual fields
          if (value.type === 'virtual') {
            return;
          }
          const fieldSchema: {
            type: any;
            ref?: string;
            enum?: Array<string | number>;
            bcrypt?: boolean;
            rounds?: number;
            unique?: boolean;
            required?: boolean;
          } = {
            type: value.many
              ? [this.fieldMongooseTyepMap[value.type]]
              : this.fieldMongooseTyepMap[value.type],
          };
          Object.keys(value).forEach((vKey: string) => {
            if (vKey === 'type') {
              return;
            }
            fieldSchema[vKey as keyof typeof fieldSchema] = value[
              vKey as keyof typeof value
            ] as (typeof fieldSchema)[keyof typeof fieldSchema];
          });
          if ('enum' in value && value.enumType) {
            fieldSchema.type = this.fieldMongooseTyepMap[value.enumType];
            fieldSchema.enum = value.enum;
          }
          return { [key]: fieldSchema };
        })
        .filter((item) => {
          return item;
        }) as any,
      {
        timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
      }
    );
  }

  public verifyBcryptField(
    model: any,
    fieldName: string,
    password: string,
    user: CtxUser
  ) {
    const hasAccess = access.validateAccess(this.model.name, 'read', user, []);
    if (!hasAccess) {
      throw new Error(
        'You does not have access to perform this action on this record/ field.'
      );
    }
    const methodName = `verify${startCase(fieldName)}`.replace(/\s/g, '');
    return model[methodName](password);
  }

  private addVirtualFields() {
    Object.entries(this.model.fields)
      .filter(
        ([fieldName, fieldObj]: [fieldName: string, fieldObj: TField]) =>
          fieldObj.type === 'virtual'
      )
      .forEach(([fieldName, fieldObj]) =>
        this.mongoSchema.virtual(fieldName, {
          ref: fieldObj.ref, // the model to use
          localField: fieldObj.localField, // find children where 'localField'
          foreignField: fieldObj.foreignField, // is equal to foreignField
          justOne: !fieldObj.many,
        })
      );
  }

  private addIndexes() {
    if (this.model.options?.indexes) {
      this.model.options.indexes.forEach((index) => {
        this.mongoSchema.index(index.fields, index.options);
      });
    }
  }
}
