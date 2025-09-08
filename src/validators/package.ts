import Joi from "joi";
import { Package } from "../models/Package";

export const CreatePackageValidate = async (
    body: unknown
  ): Promise<Package> => {
    const schema = Joi.object({
      title: Joi.string().required(),
      slug: Joi.string().required(),
      description: Joi.string().required(),
      base_price: Joi.number().required(),
      guest_limit: Joi.number().integer().min(1).required(),
      extra_guest_fee: Joi.number().min(0).required(),
      duration_hours: Joi.number().integer().min(1).required(),
      images: Joi.array().items(Joi.string().uri()).default([]),
      addons: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            price: Joi.number().min(0).required(),
          })
        )
        .default([]),
      available_dates: Joi.array().items(Joi.date().iso()).default([]),
      status: Joi.string().valid("active", "inactive", "draft").default("draft"),
    });
  
    return (await schema.validateAsync(body, {
      abortEarly: false,
    })) as Package;
  };

export const UpdatePackageValidate = async (
    body: unknown
  ): Promise<Package> => {
    const schema = Joi.object({
      title: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
      base_price: Joi.number(),
      guest_limit: Joi.number().integer().min(1),
      extra_guest_fee: Joi.number().min(0),
      duration_hours: Joi.number().integer().min(1),
      images: Joi.array().items(Joi.string().uri()),
      addons: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
        })
      ),
      available_dates: Joi.array().items(Joi.date().iso()),
      status: Joi.string().valid("active", "inactive", "draft"),
    });
  
    return (await schema.validateAsync(body, {
      abortEarly: false,
    })) as Package;
  };