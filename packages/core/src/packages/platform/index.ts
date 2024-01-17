import type { Mercury } from '../../mercury';
import createMetaModels from "./model";
// import { Redis } from '../redisCache';
import _ from "lodash";

type PlatformConfig = {
	prefix?: string;
};

declare module '../../mercury' {
	interface Mercury {
		platform: Platform;
		// redis: Redis;
	}
}

export default (config?: PlatformConfig) => {
	return (mercury: Mercury) => {
		mercury.platform = new Platform(mercury, config);
		mercury.platform.initialize();
		mercury.platform.start();
		// mercury.redis = new Redis();
		// initialize here
	};
};

export class Platform {
	protected mercury: Mercury;
	public config: PlatformConfig;
	public skipFields: string[];
	constructor(mercury: Mercury, config?: PlatformConfig) {
		this.mercury = mercury;
		this.config = config || {};
		this.skipFields = ["default", "rounds", "unique", "foreignField", "required", "ref", "localField", "enumType", "enumValues", "managed"];
	}
	public async start() {
		// Get all the models from Model table and generate model schema and pass it to mercury.createModel
		// Store all the model schemas as Redis Cache with search capability (Make sure redis is enabled)
		// await this.subscribeHooks();
		await this.mercury.cache.set("ping", "pong");
		console.log("Redis", await this.mercury.cache.get("ping"));
	}
	public initialize() {
		// console.log("INITIALIZATION DONE");
		// if (!_.isEmpty(this.mercury.db['Model'])) {
		// 	// compose schema and set in redis 
		// 	// doubt - already present redis or not --> clear redis keys of these models and reset?
		// 	// this.composeAllRedisSchemas();
		// } else {
		// 	console.log("Inside else")
		// 	createMetaModels(this.mercury);
		// }
	}

	public async composeAllRedisSchemas() {
		const models: any[] = await this.mercury.db['Model'].mongoModel.find({});
		const allModels: string[] = [];
		models.map(async (model: any) => {
			allModels.push(model.name);
			this.composeRedisObject(model);
		});
		await this.mercury.cache.set("ALL_MODELS", JSON.stringify(allModels));
	}

	public async composeRedisObject(model: any) {
		const modelFields = await this.mercury.db['ModelField'].get({ model: model._id }, { id: "khsd", profile: "Admin" });
		const fieldOptions = await this.mercury.db['FieldOption'].get({ model: model._id }, { id: "khsd", profile: "Admin" });
		const modelOptions = await this.mercury.db['ModelOption'].get({ model: model._id }, { id: "khsd", profile: "Admin" });
		const schema = this.composeSchema(modelFields, fieldOptions);
		const options = this.composeOptions(modelOptions);
		this.mercury.createModel(model.name, schema, options);
		const redisObj = {
			name: model.name,
			fields: schema,
			options: options
		}
		await this.mercury.cache.set(`${model.name.toUpperCase()}`, JSON.stringify(redisObj));
	}
	public composeSchema(modelFields: any, fieldOptions?: any): any {
		const skipFields = ["id", "_id", "fieldName", "model", "name", "createdBy", "updatedBy", "managed", "fieldOptions", "createdOn", "updatedOn", "__v"];
		const schema: any = {};
		modelFields.map((modelField: any) => {
			const fieldName = modelField['fieldName'];
			const fieldObj: any = {};
			Object.keys(modelField['_doc']).map((key: string) => {
				// Return for some fields
				if (skipFields.includes(key)) return;
				fieldObj[key] = modelField[key];
			})
			const fieldOption = fieldOptions.filter((fieldOption: any) => fieldOption.modelField.equals(modelField._id));
			fieldOption.map((option: any) => {
				let type = option.type;
				let value = option.value;
				fieldObj[option.keyName] = (type == "number" ? Number(value) : (type == "string" ? String(value) : Boolean(value)));
			}),
				schema[fieldName] = fieldObj;
		})
		return schema;
	}

	public composeOptions(modelOptions: any): any {
		const options: any = {};
		modelOptions.map((modelOption: any) => {
			let type = modelOption.type;
			let value = modelOption.value;
			options[modelOption.keyName] = (type == "number" ? Number(value) : (type == "string" ? String(value) : (type == "boolean" ? Boolean(value) : JSON.parse(value))));
		});
		return options;
	}

	public async listModels() {
		return await this.mercury.cache.get("ALL_MODELS");
	}

	public async getModel(modelName: string) {
		return await this.mercury.cache.get(modelName);
	}

	private async subscribeHooks() {
		// Model create and update hooks has to be triggered
		// Record update also has to be triggered -> here we will update in the db and redis.
		await this.subscribeToModelHooks();
		// this.subscribeToRecordHooks();
	}

	private async subscribeToModelHooks() {
		// Before the server starts and restart in middle
		// if already present in redis and schema is equal -> return
		// if redis absent try to fetch from db if present or not , if present pull it from there instead of creating 
		// present in redis and schema not equal , build new schema adn store it
		const _self = this;
		this.mercury.hook.before('CREATE_MODEL', async function (this: any) {
			if(['Model', 'ModelField','FieldOption', 'ModelOption'].includes(this.name)) return;
			console.log('CREATE_MODEL HOOK', this.name);
			let redisObj: any = await _self.mercury.cache.get(this.name.toUpperCase());
			redisObj = JSON.parse(redisObj);
			console.log("redisObj: " , redisObj)
			if (!_.isEmpty(redisObj)) {
				console.log("models lis", _self.mercury.list);
				console.log("new models", await _self.mercury.db['Model'].mongoModel.find({}))
				if (_self.isSchemaSame(this, redisObj)) return;
				console.log("schema")
				await _self.mercury.cache.set(this.name.toUpperCase(), JSON.stringify(this));
				!_.isEqual(redisObj.fields, this.fields) ? await _self.modifyModelFields(this, redisObj) : await _self.modifyModelOptions(redisObj, this);
			} else {
				// first set inside redis
				await _self.mercury.cache.set(this.name.toUpperCase(), JSON.stringify(this));
				await _self.createRecords(this);
			}
		});
	}

	private isSchemaSame(model: any, redisObj: any) {
		return _.isEqual(redisObj.fields, model.fields) && _.isEqual(redisObj.options, model.options);
	}

	private async createModelFields(model: any, remFields: any) {
		return await this.createMetaRecords('ModelField', {
			model: model._id,
			name: model.name,
			...remFields
		});
	}

	private async createFieldOptions(modelField: any, fieldOptions: any) {
		Object.entries(fieldOptions).forEach(async ([fkey, fvalue]: any) => {
			await this.createMetaRecords('FieldOption', {
				model: modelField.model,
				modelField: modelField._id,
				fieldName: modelField.fieldName,
				keyName: fkey,
				value: fvalue
			})
		})
	}

	private async updateModelFields(modelField: any, fieldOptions: any, redisObj: any, modelObj: any) {
		let updateData: any = {};
		Object.entries(fieldOptions).forEach(async ([vkey, vvalue]: any) => {
			if (this.skipFields.includes(vkey) && modelField[vkey] == vvalue) return;
			if (this.skipFields.includes(vkey) && modelField[vkey] !== vvalue) {
				updateData[vkey] = vvalue;
			} else {
				// field option create or update
				await this.createOrUpdateFieldOptions(modelField, vkey, vvalue);
			}
		})
		const data = await this.deleteFieldOptions(redisObj, modelObj, modelField.keyName, modelField);
		updateData = { ...updateData, ...data };
		if (!_.isEmpty(updateData)) await this.mercury.db['ModelField'].update(modelField._id, { ...updateData }, { id: "qwe", profile: "Admin" });
	}

	private async deleteModelFields(redisObj: any, modelObj: any, modelData: any) {
		// delete field and field options associated to it
		const deleteFields = Object.keys(_.omit(redisObj.fields, Object.keys(modelObj.fields)));
		deleteFields.map(async (deleteField: string) => {
			const modelField = await this.mercury.db['ModelField'].get({ model: modelData._id, name: modelData.name, fieldName: deleteField }, { id: "sdf", profile: "Admin" });
			await this.mercury.db['FieldOption'].mongoModel.deleteMany({ model: modelData._id, modelField: modelField._id });
			await this.mercury.db['ModelField'].mongoModel.deleteOne({ _id: modelField._id });
		});
	}

	private async createOrUpdateFieldOptions(modelField: any, keyName: string, value: any) {
		const fieldOption = await this.mercury.db['FieldOption'].get({ modelField: modelField._id, fieldName: modelField.fieldName, keyName: keyName }, { id: "qe34", profile: "Admin" });
		if (_.isEmpty(fieldOption)) {
			// create field option
			await this.createMetaRecords('FieldOption', {
				model: modelField.model,
				modelField: modelField._id,
				fieldName: modelField.fieldName,
				keyName: keyName,
				value: value
			})
		} else {
			// update
			if (fieldOption.value == value) return;
			await this.mercury.db['FieldOption'].update(fieldOption._id, { value: value }, { id: "123", profile: "Admin" });
		}
	}

	private async deleteFieldOptions(redisObj: any, modelObj: any, key: string, modelField: any) {
		const updateData: any = {};
		const deleteFieldOptions = Object.keys(_.omit(redisObj.fields[key], Object.keys(modelObj.fields)));
		deleteFieldOptions.map(async (fieldOption: string) => {
			updateData[fieldOption] = undefined; // setting value undefined in model field data and deleting field option
			if (!this.skipFields.includes(fieldOption)) await this.mercury.db['FieldOption'].mongoModel.deleteOne({ model: modelField.model, modelField: modelField._id, fieldName: key, keyName: fieldOption });
		})
		return updateData;
	}

	private async modifyModelFields(modelObj: any, redisObj: any) {
		const modelData = await this.mercury.db['Model'].get({ name: modelObj.name }, { id: "af", profile: "Admin" });
		const diffFieldObj = this.getDiffFieldObj(redisObj, modelObj);
		Object.entries(diffFieldObj).forEach(async ([key, value]: any) => {
			const modelField = await this.mercury.db['ModelField'].get({ model: modelData._id, fieldName: key }, { id: "saf", profile: "Admin" });
			if (_.isEmpty(modelField)) {
				const newModelField = await this.createModelFields(modelData, value); // create new model fields
				this.createFieldOptions(newModelField, _.omit(value, this.skipFields)); // create field options
			} else {
				this.updateModelFields(modelField, value, redisObj, modelObj);
			}
		}
		)
		// here delete functionality
		this.deleteModelFields(redisObj, modelObj, modelData);
	}

	private getDiffFieldObj(redisObj: any, model: any) {
		return _.omitBy(model.fields, (value, key) => {
			return _.isEqual(value, redisObj.fields[key]);
		});
	}

	private async createMetaRecords(modelName: string, data: any) {
		return await this.mercury.db[modelName].create(data, { id: "q2", profile: "Admin" });
	}

	private async createRecords(modelObj: any) {
		// create model, model fields and etc
		const model = await this.createMetaRecords('Model', {
			name: modelObj.name,
			prefix: modelObj.prefix,
			managed: modelObj.managed,
			createdBy: modelObj?.ctx?.id,
			updatedBy: modelObj?.ctx?.id,
		})
		console.log("Model record", model);
		// model fields and model options creation
		await Promise.all([...Object.entries(modelObj.fields).map(async ([key, value]: any) => {
			const modelField = await this.createMetaRecords('ModelField', {
				model: model._id,
				name: model.name,
				fieldName: key,
				type: value.type,
				createdBy: modelObj.ctx?.id,
				updatedBy: modelObj.ctx?.id,
				default: value.default,
				rounds: value.rounds,
				unique: value.unique,
				ref: value.ref,
				localField: value.localField,
				foreignField: value.foreignField,
				enumType: value.enumType,
				enumValues: value.enumValues,
				managed: value.managed
			});
			console.log("Inside field entries");
			await Promise.all(Object.entries(value).map(async ([fkey, fvalue]: any) => {
				// skip field options
				if (this.skipFields.includes(fkey)) return;
				await this.createMetaRecords('FieldOption', {
					model: model._id,
					modelField: modelField._id,
					fieldName: key,
					keyName: fkey,
					type: typeof fvalue,
					value: fvalue,
					managed: modelField.managed,
					prefix: modelField.prefix
				});
				console.log("Inside field option entries");
			}))
		}), ...Object.entries(modelObj.options).map(async ([key, value]: any) => {
			await this.createMetaRecords('ModelOption', {
				model: model._id,
				name: model.name,
				managed: model.managed,
				keyName: key,
				value: value.value,
				type: value.type
			})
			console.log("Inside model option entries");
		})])
		// model options creation
		console.log("all entries are created");
	}

	private async modifyModelOptions(redisObj: any, modelObj: any) {
		const modelData = await this.mercury.db['Model'].get({ name: modelObj.name }, { id: "af", profile: "Admin" });
		const diffOptionObj = _.omitBy(modelObj.options, (value, key) => {
			return _.isEqual(value, redisObj.options[key]);
		});
		// Create and Update
		Object.entries(diffOptionObj).forEach(async ([key, value]: any) => {
			await this.createOrUpdateModelOptions(modelData, key, value);
		})
		// Delete - omitted
		await this.deleteModelOptions(Object.keys(_.omit(redisObj.options, Object.keys(modelObj.options))), modelData._id);
	}

	private async createOrUpdateModelOptions(modelData: any, keyName: string, value: any) {
		const modelOption = await this.mercury.db['Model'].get({ model: modelData._id, name: modelData.name, keyName: keyName }, { id: "aer", profile: "Admin" });
		if (_.isEmpty(modelOption)) {
			await this.mercury.db['ModelOption'].create({
				model: modelData._id,
				name: modelData.name,
				keyName: keyName,
				value: value,
				type: typeof value
			}, { id: "123", profile: "Admin" });
		} else {
			if (modelOption.value == value) return;
			await this.mercury.db['ModelOption'].update(modelOption._id, { keyName: keyName, value: value, type: typeof value }, { id: "123", profile: "Admin" });
		}
	}

	private async deleteModelOptions(deleteKeys: string[], model: string) {
		deleteKeys.map(async (deleteKey: string) => {
			await this.mercury.db['ModelOption'].mongoModel.deleteOne({ model: model, keyName: deleteKey });
		})
	}

	private subscribeToRecordHooks() {
		// After the server is started these hooks will be executed
		this.mercury.hook.after('CREATE_MODELFIELD_RECORD', async function (this: any) {
			// create field options fi required
			if (this.options.skipHooks) return;
			this.syncModelFields(this);
		});
		this.mercury.hook.after('UPDATE_MODELFIELD_RECORD', async function (this: any) {
			// create field options fi required
			if (this.options.skipHooks) return;
			this.syncModelFields(this);
		})
		this.mercury.hook.before('DELETE_MODELFIELD_RECORD', async function (this: any) {
			// deletre field options for modelfields
			if (this.options.skipHooks) return;
			const redisObj = await this.mercury.cache.get(this.modelField.name);
			delete redisObj.fields[this.data.fieldName];
			const newRedisObj = {
				name: redisObj.name,
				fields: redisObj.fields,
				options: redisObj.options
			}
			await this.mercury.cache.set(`${redisObj.name.toUpperCase()}`, JSON.stringify(newRedisObj));
		})
		this.mercury.hook.after('CREATE_MODELOPTION_RECORD', async (data: any) => {
			if (data.options.skipHooks) return;
			this.syncModelOptions(data);
		})
		this.mercury.hook.after('UPDATE_MODELOPTION_RECORD', async (data: any) => {
			if (data.options.skipHooks) return;
			this.syncModelOptions(data);
		})
		this.mercury.hook.before('DELETE_MODELOPTION_RECORD', async (data: any) => {
			if (data.options.skipHooks) return;
			const redisObj: any = await this.mercury.cache.get(data.modelField.name);
			delete redisObj.options[data.data.fieldName];
			const newRedisObj = {
				name: redisObj.name,
				fields: redisObj.fields,
				options: redisObj.options
			}
			await this.mercury.cache.set(`${redisObj.name.toUpperCase()}`, JSON.stringify(newRedisObj));
		})
		this.mercury.hook.after('CREATE_FIELDOPTION_RECORD', async (data: any) => {
			if (data.options.skipHooks) return;
			this.syncFieldOptions(data);
		})

	}

	private async syncModelFields(this: any) {
		const redisObj = await this.mercury.cache.get(this.modelField.name);
		const fieldSchema = this.composeSchema([this.data]);
		redisObj.fields[this.data.fieldName] = fieldSchema;
		const newRedisObj = {
			name: redisObj.name,
			fields: redisObj.fields,
			options: redisObj.options
		}
		await this.mercury.cache.set(`${redisObj.name.toUpperCase()}`, JSON.stringify(newRedisObj));
	}

	private async syncModelOptions(data: any) {
		const redisObj: any = await this.mercury.cache.get(data.modelField.name);
		const options = this.composeOptions([data.data]);
		redisObj.options[data.data.key] = options;
		const newRedisObj = {
			name: redisObj.name,
			fields: redisObj.fields,
			options: redisObj.options
		}
		await this.mercury.cache.set(`${redisObj.name.toUpperCase()}`, JSON.stringify(newRedisObj));
	}

	private async syncFieldOptions(data: any) {

	}

	// methods:
	// listModels (Redis cache)
	// getModel (Redis cache)
	// create/update/deleteModel (store the schema to DB and update the redis cache)

}