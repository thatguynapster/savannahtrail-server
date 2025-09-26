import Joi from "joi";

import { Guide } from "../models/Guide";

export const CreateGuideValidate = async (
  body: unknown
): Promise<Guide> => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    bio: Joi.string().required(),
    photo_url: Joi.string().uri(),
    languages: Joi.array().items(Joi.string()).default([]),
    specialties: Joi.array().items(Joi.string()).default([]),
    status: Joi.string().valid("active", "inactive").default("inactive"),
    availability: Joi.array()
      .items(
        Joi.object({
          date: Joi.date().iso().required(),
          available: Joi.boolean().required(),
          blocked_reason: Joi.string().allow("", null),
        })
      )
      .default([]),
  });

  return (await schema.validateAsync(body, {
    abortEarly: false,
  })) as Guide;
};

export const UpdateGuideValidate = async (
  body: unknown
): Promise<Guide> => {
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    bio: Joi.string(),
    photo_url: Joi.string().uri(),
    languages: Joi.array().items(Joi.string()),
    specialties: Joi.array().items(Joi.string()),
    status: Joi.string().valid("active", "inactive"),
    availability: Joi.array().items(
      Joi.object({
        date: Joi.date().iso().required(),
        available: Joi.boolean().required(),
        blocked_reason: Joi.string().allow("", null),
      })
    ),
  });

  return (await schema.validateAsync(body, {
    abortEarly: false,
  })) as Guide;
};