import Joi from "joi";
import { Booking } from "../models/Bookings";

export const CreatereateBookingValidate = async (
    body: unknown
  ): Promise<Booking & {redirect_url : string}> => {
    const schema = Joi.object({
      package_id: Joi.string().required(),
      guest_name: Joi.string().required(),
      guest_phone: Joi.string().required(),
      guest_email: Joi.string().email().required(),
      tour_date: Joi.date().iso().required(),
      num_guests: Joi.number().integer().min(1).required(),
      addons: Joi.array().items(Joi.object({
        name: Joi.string().default("").failover(""),
        price: Joi.number().min(0).default(0).failover(0),
      })).default([]),
      redirect_url: Joi.string().uri(),
    });
  
    return (await schema.validateAsync(body, {
      abortEarly: false,
    })) as Booking & {redirect_url : string};
  };


  export const UpdateBookingValidate = async (
    body: unknown
  ): Promise<Booking> => {
    const schema = Joi.object({
      package_id: Joi.string(),
      guest_name: Joi.string(),
      guest_phone: Joi.string(),
      guest_email: Joi.string().email(),
      tour_date: Joi.date().iso(),
      num_guests: Joi.number().integer().min(1),
      payment_status: Joi.string().valid("pending","success","failed","refunded"),
      booking_status: Joi.string().valid("pending","confirmed","cancelled","completed"),
      assigned_guide_id: Joi.string(),
      assigned_guide_name: Joi.string(),
      addons: Joi.array().items(Joi.object({
        name: Joi.string().default("").failover(""),
        price: Joi.number().min(0).default(0).failover(0),
      })).default([]),    });
  
    return (await schema.validateAsync(body, {
      abortEarly: false,
    })) as Booking;
  };