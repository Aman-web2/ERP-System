const Joi = require('joi');

const validatePayload = (schema, payload) => {
  const { value, error } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    const validationError = new Error(message);
    validationError.statusCode = 400;
    throw validationError;
  }

  return value;
};

module.exports = {
  Joi,
  validatePayload
};

