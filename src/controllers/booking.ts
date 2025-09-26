// controllers/booking.controller.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreatereateBookingValidate, UpdateBookingValidate } from "../validators/booking";
import { aggregatePaginateBookings, createBooking, deleteBooking, getAllBookings, getOneBooking, updateBooking } from "../services/booking";

import { Booking } from "../models/Bookings";
import InvoiceCollection from "../models/Invoice";

import { FilterQuery, PipelineStage } from "mongoose";
import { getOneGuide } from "../services/guide";
import { Paystack } from "../functions/payment";
import { payment_app_config } from "../config/config";
import { randomString } from "../functions/utils";

export const getAllBookingsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;

        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            sort: { _id: -1 },
            lean: true,
            customLabels: {
                totalDocs: "total",
                limit: "limit",
                page: "page",
                totalPages: "pages",
                pagingCounter: false,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: false,
                nextPage: false,
            },
            pagination: false,
        };

        const match_query = {} as FilterQuery<Booking>;
        const query = [] as PipelineStage[];

        if (filters.guest_name) {
            match_query.guest_name = {
                $regex: new RegExp(filters.guest_name as string, "i"),
            };
        }

        if (filters.guest_email) {
            match_query.guest_email = {
                $regex: new RegExp(filters.guest_email as string, "i"),
            };
        }

        if (filters.package_id) {
            match_query.package_id = filters.package_id as string;
        }

        if (filters.payment_status) {
            match_query.payment_status = filters.payment_status as string;
        }

        if (filters.booking_status) {
            match_query.booking_status = filters.booking_status as string;
        }

        if (filters.tour_date) {
            const date = new Date(filters.tour_date as string);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            match_query.tour_date = { $gte: date, $lte: nextDate };
        }

        query.push({ $match: match_query });

        const bookings = await aggregatePaginateBookings(query, options);

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Bookings retrieved successfully",
            responses: bookings,
        });
    } catch (err) {
        next(err);
    }
};

export const paginateBookingsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;

        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            sort: { _id: -1 },
            lean: true,
            customLabels: {
                totalDocs: "total",
                limit: "limit",
                page: "page",
                totalPages: "pages",
                pagingCounter: false,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: false,
                nextPage: false,
            },
        };

        const match_query = {} as FilterQuery<Booking>;
        const query = [] as PipelineStage[];

        if (filters.guest_name) {
            match_query.guest_name = {
                $regex: new RegExp(filters.guest_name as string, "i"),
            };
        }

        if (filters.guest_email) {
            match_query.guest_email = {
                $regex: new RegExp(filters.guest_email as string, "i"),
            };
        }

        if (filters.package_id) {
            match_query.package_id = filters.package_id as string;
        }

        if (filters.payment_status) {
            match_query.payment_status = filters.payment_status as string;
        }

        if (filters.booking_status) {
            match_query.booking_status = filters.booking_status as string;
        }

        if (filters.tour_date) {
            const date = new Date(filters.tour_date as string);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            match_query.tour_date = { $gte: date, $lte: nextDate };
        }

        query.push({ $match: match_query });

        const bookings = await aggregatePaginateBookings(query, options);

        bookings.docs = await Promise.all(
            bookings.docs.map(async (booking) => {
                const guide = await getOneGuide({ _id: booking.assigned_guide_id });
                if (guide) {
                    booking.assigned_guide_name = guide.name;
                }
                return booking;
            })
        );
        return res.status(200).send({
            success: true,
            code: 200,
            message: "Bookings retrieved successfully",
            responses: bookings,
        });
    } catch (err) {
        next(err);
    }
};

export const getBookingByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const booking = await getOneBooking({ _id: bookingId });

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Booking retrieved successfully",
            responses: booking,
        });
    } catch (err) {
        next(err);
    }
};

export const createBookingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = await CreatereateBookingValidate(req.body);
        const booking = await createBooking(payload);

        //create invoice for booking here
        const invoice = await InvoiceCollection.create({
            booking_id: booking._id,
            customer_email: booking.guest_email,
            amount: booking.total_amount,
            currency: "GHS",
            status: "pending",
            paystack_reference: uuidv4(),
            redirect_url: payload.redirect_url,
        });

        // update the booking with invoice id
        booking.invoice_id = invoice._id;
        await booking.save();

        const callback = "https://api.savannahtrail.com/api/v1.0/extensions/callback/check-paystack-payment";

        const paystack = new Paystack(payment_app_config.token);
        const response = await paystack.transactions.initialize({
            amount: invoice.amount,
            email: invoice.customer_email || `${randomString(10, "Aa#")}@gmail.com`,
            reference: invoice.paystack_reference || uuidv4(),
            callback_url: callback,
            currency: invoice.currency || "GHS",
        });

        if (response.status === false) {
            const e = new Error("Failed to initialize payment");
            e.name = "ValidationError";
            throw e;
        }

        invoice.is_requested = true;
        invoice.extra = {
            ...invoice.extra,
            ...response.data,
        };
        invoice.paystack_authorization_url = response.data?.authorization_url;

        await invoice.save();
        return res.status(201).send({
            success: true,
            code: 201,
            message: "Booking created successfully",
            responses: {
                booking,
                invoice,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const updateBookingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const payload = req.body;

        const updatedBooking = await UpdateBookingValidate(payload);

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Booking updated successfully",
            // responses: updatedBooking,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteBookingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        await deleteBooking(bookingId);

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Booking deleted successfully",
            responses: null,
        });
    } catch (err) {
        next(err);
    }
};

export const reassignBookedGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const { guide_id } = req.body as { guide_id: string };

        if (!guide_id) {
            return res.status(400).send({
                success: false,
                code: 400,
                message: "Guide ID is required",
                responses: null,
            });
        }

        const getBooking = await getOneBooking({ _id: bookingId });

        //update booking with new guide_id
        const updatedBooking = await updateBooking(getBooking._id, {
            assigned_guide_id: guide_id,
        });

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Guide reassigned successfully",
            responses: updatedBooking,
        });
    } catch (err) {
        next(err);
    }
};
