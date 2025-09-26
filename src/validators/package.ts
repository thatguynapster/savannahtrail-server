
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const createPackageSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  base_price: Joi.number().required(),
  guest_limit: Joi.number().integer().min(1).required(),
  extra_guest_fee: Joi.number().min(0),
  duration_hours: Joi.number().integer().min(1),
  addons: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
    })
  ),
});

const updatePackageSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  base_price: Joi.number(),
  guest_limit: Joi.number().integer().min(1),
  extra_guest_fee: Joi.number().min(0),
  duration_hours: Joi.number().integer().min(1),
  status: Joi.string().valid('active', 'inactive', 'draft'),
  // addons: Joi.array().items(
  //   Joi.object({
  //     name: Joi.string().required(),
  //     price: Joi.number().min(0).required(),
  //   })
  // ),
});

export const createPackage = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createPackageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const updatePackage = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updatePackageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
