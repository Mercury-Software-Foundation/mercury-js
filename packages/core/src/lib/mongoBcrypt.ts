/* eslint-disable */
// @ts-nocheck - This file is a direct copy of the original mongoose-bcrypt file and is not intended to be type checked
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import semver from 'semver';

const mongooseBcrypt = (schema: mongoose.Schema, options: any) => {
  options = options || {};

  // Get array of encrypted field(s)
  var fields = options.fields || options.field || [];
  if (typeof fields === 'string') {
    fields = [fields];
  }

  // Scan schema for fields marked as encrypted
  schema.eachPath(function (name, type) {
    if (type.options.bcrypt && fields.indexOf(name) < 0) {
      fields.push(name);
    }
  });

  // Use default 'password' field if no fields specified
  if (fields.length === 0) fields.push('password');

  // Get encryption rounds or use defaults
  var rounds = options.rounds || 0;

  // Add properties and verifier functions to schema for each encrypted field
  fields.forEach(function (field: string) {
    // Setup field name for camelcasing
    var path = field.split('.');
    var fieldName = path
      .map(function (word) {
        return word[0].toUpperCase() + word.slice(1);
      })
      .join('');

    // Define encryption function
    schema.statics['encrypt' + fieldName] = function (value, cb) {
      return encrypt(field, value, cb);
    };

    // Define async verification function
    schema.methods['verify' + fieldName] = function (
      value: string,
      cb: (err: Error | null, valid: boolean) => void
    ) {
      if (Promise) {
        var self = this;
        return new Promise(function (resolve, reject) {
          bcrypt.compare(value, self.get(field), function (err, valid) {
            if (cb) {
              cb(err, valid);
            }
            if (err) {
              reject(err);
            } else {
              resolve(valid);
            }
          });
        });
      } else {
        return bcrypt.compare(value, this.get(field), cb);
      }
    };

    // Define sync verification function
    schema.methods['verify' + fieldName + 'Sync'] = function (value: string) {
      return bcrypt.compareSync(value, this.get(field));
    };

    // Add field to schema if not already defined
    if (!schema.path(field)) {
      var pwd: { [key: string]: any } = {}; // Add index signature
      var nested: { [key: string]: any } = pwd; // Add index signature
      for (var i = 0; i < path.length - 1; ++i) {
        nested[path[i]] = {};
        nested = nested[path[i]];
      }
      nested[path[path.length - 1]] = { type: String };
      schema.add(pwd);
    }
  });

  // Hash all modified encrypted fields upon saving the model
  schema.pre('save', function (next) {
    var model = this;
    var changed: string[] = [];

    // Determine list of encrypted fields that have been modified
    fields.forEach(function (field: string) {
      if (model.isModified(field)) {
        changed.push(field);
      }
    });

    // Create/update hash for each modified encrypted field
    var count = changed.length;
    if (count > 0) {
      changed.forEach(function (field) {
        var value = model.get(field);
        if (typeof value === 'string') {
          encrypt(field, value, function (err: Error | null, hash: string) {
            if (err) return next(err);
            model.set(field, hash);
            if (--count === 0) next();
          });
        } else {
          model.set(field, '');
          if (--count === 0) next();
        }
      });
    } else {
      next();
    }
  });

  function getUpdateField(update: any, name: string) {
    if (update.hasOwnProperty(name)) {
      return update[name];
    }
    if (update.$set && update.$set.hasOwnProperty(name)) {
      return update.$set[name];
    }
    return undefined;
  }

  function setUpdateField(update: any, name: string, value: any) {
    if (update.hasOwnProperty(name)) {
      update[name] = value;
    } else if (update.$set && update.$set.hasOwnProperty(name)) {
      update.$set[name] = value;
    }
  }

  function preUpdate(this: any, next: Function) {
    var query = this;
    var update = query.getUpdate();
    var changed: string[] = [];
    fields.forEach(function (field: string) {
      if (getUpdateField(update, field) !== undefined) {
        changed.push(field);
      }
    });
    var count = changed.length;
    if (count > 0) {
      changed.forEach(function (field) {
        var value = getUpdateField(update, field);
        if (typeof value === 'string') {
          encrypt(field, value, function (err: Error | null, hash: string) {
            if (err) return next(err);
            setUpdateField(update, field, hash);
            if (--count === 0) {
              next();
            }
          });
        } else {
          setUpdateField(update, field, '');
          if (--count === 0) {
            next();
          }
        }
      });
    } else {
      next();
    }
  }

  if (semver.gte(mongoose.version, '4.1.3')) {
    schema.pre(/^(update|updateOne|updateMany|findOneAndUpdate)$/, preUpdate);
  }

  function encrypt(field: string, value: any, cb: Function) {
    if (Promise) {
      return new Promise(function (resolve, reject) {
        bcrypt.genSalt(
          schema.path(field).options.rounds || rounds,
          function (err, salt) {
            if (cb && err) {
              cb(err, salt);
            }
            if (err) {
              reject(err);
            } else {
              bcrypt.hash(value, salt, function (err, result) {
                if (cb) {
                  cb(err, result);
                }
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            }
          }
        );
      });
    } else {
      bcrypt.genSalt(
        schema.path(field).options.rounds || rounds,
        function (err, salt) {
          if (err) {
            cb(err);
          } else {
            bcrypt.hash(
              value,
              salt,
              function (err: Error | null, hash: string) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, hash);
                }
              }
            );
          }
        }
      );
    }
  }
};

export default mongooseBcrypt;
