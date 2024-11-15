import { isEmpty, has, map, mapKeys } from 'lodash';
import { fieldTypeMap } from './graphql';
import { TFields } from '../types';

import {
  DateTimeResolver,
  EmailAddressResolver,
  NegativeFloatResolver,
  NegativeIntResolver,
  NonNegativeFloatResolver,
  NonNegativeIntResolver,
  NonPositiveFloatResolver,
  NonPositiveIntResolver,
  PhoneNumberResolver,
  PositiveFloatResolver,
  PositiveIntResolver,
  PostalCodeResolver,
  UnsignedFloatResolver,
  UnsignedIntResolver,
  URLResolver,
  BigIntResolver,
  LongResolver,
  GUIDResolver,
  HexColorCodeResolver,
  HSLResolver,
  HSLAResolver,
  IPv4Resolver,
  IPv6Resolver,
  ISBNResolver,
  MACResolver,
  PortResolver,
  RGBResolver,
  RGBAResolver,
  USCurrencyResolver,
  JSONResolver,
  JSONObjectResolver,
} from 'graphql-scalars';

export const defaultResolvers = {
  DateTime: DateTimeResolver,
  NonPositiveInt: NonPositiveIntResolver,
  PositiveInt: PositiveIntResolver,
  NonNegativeInt: NonNegativeIntResolver,
  NegativeInt: NegativeIntResolver,
  NonPositiveFloat: NonPositiveFloatResolver,
  PositiveFloat: PositiveFloatResolver,
  NonNegativeFloat: NonNegativeFloatResolver,
  NegativeFloat: NegativeFloatResolver,
  UnsignedFloat: UnsignedFloatResolver,
  UnsignedInt: UnsignedIntResolver,
  BigInt: BigIntResolver,
  Long: LongResolver,

  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  PhoneNumber: PhoneNumberResolver,
  PostalCode: PostalCodeResolver,

  GUID: GUIDResolver,

  HexColorCode: HexColorCodeResolver,
  HSL: HSLResolver,
  HSLA: HSLAResolver,
  RGB: RGBResolver,
  RGBA: RGBAResolver,

  IPv4: IPv4Resolver,
  IPv6: IPv6Resolver,
  MAC: MACResolver,
  Port: PortResolver,

  ISBN: ISBNResolver,

  USCurrency: USCurrencyResolver,
  JSON: JSONResolver,
  JSONObject: JSONObjectResolver,
};

// No need of name
export const historySchema = (name: string): TFields => {
  return {
    recordId: {
      type: 'relationship',
      ref: name,
    },
    operationType: {
      type: 'enum',
      enum: ['UPDATE', 'DELETE'],
      enumType: 'string',
      required: true,
    },
    instanceId: {
      type: 'string',
      required: true,
    },
    dataType: {
      type: 'string',
      required: true,
    },
    fieldName: {
      type: 'string',
      required: true,
    },
    newValue: {
      type: 'mixed',
      required: true,
    },
    oldValue: {
      type: 'mixed', // Mixed
      required: true,
    },
  };
};

export const defaultTypeDefs = `
scalar DateTime
scalar EncryptString
scalar IntString
scalar EmailAddress
scalar NegativeFloat
scalar NegativeInt
scalar NonNegativeFloat
scalar NonNegativeInt
scalar NonPositiveFloat
scalar NonPositiveInt
scalar PhoneNumber
scalar PositiveFloat
scalar PositiveInt
scalar PostalCode
scalar UnsignedFloat
scalar UnsignedInt
scalar URL
scalar BigInt
scalar Long
scalar GUID
scalar HexColorCode
scalar HSL
scalar HSLA
scalar IPv4
scalar IPv6
scalar ISBN
scalar MAC
scalar Port
scalar RGB
scalar RGBA
scalar USCurrency
scalar JSON
scalar JSONObject
input whereID {
  is: ID
  isNot: ID
  in: [ID!]
  notIn: [ID!]
}

input whereString {
  is: String
  isNot: String
  contains: String
  notContains: String
  startsWith: String
  notStartWith: String
  endsWith: String
  notEndsWith: String
  in: [String]
  notIn: [String]
}

input whereInt {
  is: Int
  isNot: Int
  lt: Int
  lte: Int
  gt: Int
  gte: Int
  in: [Int]
  notIn: [Int]
}

input whereDateTime {
  is: String
  isNot: String
  lt: String
  lte: String
  gt: String
  gte: String
  in: [String]
  notIn: [String]
}

enum sort {
  asc
  desc
}
`;

export const whereInputCompose = (input: any, modelFields: TFields) => {
  let querySchema: any = {};
  mapKeys(input, (fieldReq: any, field: string) => {
    switch (field) {
      case 'AND':
        querySchema = {
          $and: map(fieldReq, (item) => whereInputCompose(item, modelFields)),
        };
        break;
      case 'OR':
        querySchema = {
          $or: map(fieldReq, (item) => whereInputCompose(item, modelFields)),
        };
        break;
      default:
        querySchema = whereInputMap(input, modelFields);
        break;
    }
  });
  return querySchema;
};

export const whereInputMap = (input: any, modelFields: TFields) => {
  const querySchema: any = {};
  mapKeys(input, (fieldReq: { [x: string]: any }, field: string) => {
    let key: string | undefined | any;
    if (field !== 'id') {
      key = fieldTypeMap[modelFields[field].type];
    } else {
      key = 'ID';
    }
    switch (key) {
      case 'ID':
        querySchema._id = has(fieldReq, 'is')
          ? { $eq: fieldReq.is }
          : has(fieldReq, 'isNot')
          ? { $ne: fieldReq.isNot }
          : has(fieldReq, 'in')
          ? { $in: fieldReq.in }
          : has(fieldReq, 'notIn')
          ? { $nin: fieldReq.notIn }
          : null;
        break;
      case 'relationship':
        querySchema[field] = has(fieldReq, 'is')
          ? { $eq: fieldReq.is }
          : has(fieldReq, 'isNot')
          ? { $ne: fieldReq.isNot }
          : has(fieldReq, 'in')
          ? { $in: fieldReq.in }
          : has(fieldReq, 'notIn')
          ? { $nin: fieldReq.notIn }
          : null;
        break;
      case 'String':
        querySchema[field] = has(fieldReq, 'is')
          ? { $eq: fieldReq.is }
          : has(fieldReq, 'isNot')
          ? { $ne: fieldReq.isNot }
          : has(fieldReq, 'contains')
          ? { $regex: `${fieldReq.contains}`, $options: 'i' }
          : has(fieldReq, 'notContains')
          ? { $regex: `^((?!${fieldReq.notContains}).)*$`, $options: 'i' }
          : has(fieldReq, 'startsWith')
          ? { $regex: `^${fieldReq.startsWith}`, $options: 'i' }
          : has(fieldReq, 'notStartWith')
          ? { $not: { $regex: `^${fieldReq.notStartWith}.*`, $options: 'i' } }
          : has(fieldReq, 'endsWith')
          ? { $regex: `.*${fieldReq.endsWith}$`, $options: 'i' }
          : has(fieldReq, 'notEndsWith')
          ? { $not: { $regex: `.*${fieldReq.notEndsWith}$`, $options: 'i' } }
          : has(fieldReq, 'in')
          ? { $in: fieldReq.in }
          : has(fieldReq, 'notIn')
          ? { $nin: fieldReq.notIn }
          : null;
        break;
      case 'enum':
        querySchema[field] = { $eq: fieldReq };
        break;
      case 'Boolean':
        querySchema[field] = { $eq: fieldReq };
        break;
      case 'Int':
      case 'DateTime':
        querySchema[field] = has(fieldReq, 'is')
          ? { $eq: fieldReq.is }
          : has(fieldReq, 'isNot')
          ? { $ne: fieldReq.isNot }
          : has(fieldReq, 'lt')
          ? { $lt: fieldReq.lt }
          : has(fieldReq, 'lte')
          ? { $lte: fieldReq.lte }
          : has(fieldReq, 'gt')
          ? { $gt: fieldReq.gt }
          : has(fieldReq, 'gte')
          ? { $gte: fieldReq.gte }
          : has(fieldReq, 'in')
          ? { $in: fieldReq.in }
          : has(fieldReq, 'notIn')
          ? { $nin: fieldReq.notIn }
          : null;
        break;
      default:
        break;
    }
  });
  return querySchema;
};

export const allowedSortFieldTypes = [
  'string',
  'number',
  'date',
  'enum',
  'boolean',
];

export const composePopulateQuery = (
  fields: any,
  deep: number,
  max: number
): any => {
  deep++;
  if (deep >= max) {
    return [];
  }
  return Object.keys(fields)
    .map((key) => {
      if (!isEmpty(fields[key])) {
        return {
          path: key,
          select: Object.keys(fields[key]),
          populate: composePopulateQuery(fields[key], deep, max),
        };
      }
      return null;
    })
    .filter((item) => item != null);
};
// export class MercuryLogger<T> extends Logger<T> {
//   constructor(settings?: ISettingsParam<T>, logObj?: T) {
//     super(settings, logObj);
//   }
//   public start(...args: unknown[]): (T & ILogObjMeta) | undefined {
//     return super.log(8, "START", ...args);
//   }
//   public end(...args: unknown[]): (T & ILogObjMeta) | undefined {
//     return super.log(9, "END", ...args);
//   }
// }
// export const loggerConfig = {
//   name: "MercuryCore",
//   prettyLogStyles: {
//     logLevelName: {
//       "*": ["bold", "black", "bgWhiteBright", "dim"],
//       START: ["bold", "green", "dim"],
//       END: ["bold", "red", "dim"],
//       SILLY: ["bold", "white"],
//       TRACE: ["bold", "whiteBright"],
//       DEBUG: ["bold", "green"],
//       INFO: ["bold", "blue"],
//       WARN: ["bold", "yellow"],
//       ERROR: ["bold", "red"],
//       FATAL: ["bold", "redBright"],
//     },
//   }
// }
// export let log = new MercuryLogger(loggerConfig);

// export const setLogger = (logger: any) => {
//   log = logger;
// }
