import Joi from 'joi';

export const analyzeSchema = Joi.object({
  username: Joi.string().trim().required(),
});

export default analyzeSchema;