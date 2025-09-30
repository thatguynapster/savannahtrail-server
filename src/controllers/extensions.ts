import { NextFunction, Request, Response } from "express";
import { uploadImageToS3 } from "../functions/uploader";
import { uploadFileValidator } from "../validators/extension";
import InvoiceCollections from "../models/Invoice";
import { Paystack } from "../functions/payment";
import { payment_app_config } from "../config/config";

export const uploadfileControler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file as Express.Multer.File;

        const { folder, file_name } = await uploadFileValidator(req.body);

        if (!file) {
            return res.status(400).send({
                success: false,
                code: 400,
                message: "No files uploaded",
            });
        }

        const uploadDetails = await uploadImageToS3({
            file: file.buffer,
            filename: file_name,
            folder: folder ? folder : "others",
        });

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Files uploaded successfully",
            responses: uploadDetails,
        });
    } catch (err) {
        next(err);
    }
};

export const uploadMultipleFilesControler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];

        const { file_name, folder } = await uploadFileValidator(req.body);

        if (!files || files.length === 0) {
            return res.status(400).send({
                success: false,
                code: 400,
                message: "No files uploaded",
            });
        }

        const uploadDetails = await Promise.all(
            files.map(async (file) => {
                const details = await uploadImageToS3({
                    file: file.buffer,
                    filename: file_name ? file_name : file.originalname,
                    folder: folder ? folder : "others",
                });
                return details;
            })
        );

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Files uploaded successfully",
            responses: uploadDetails,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const paystackPaymentWebhookController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reference } = req.query as unknown as { reference: string; trxref: string };

        if (!reference) {
            return res.status(200).send("Reference Not Submitted");
        }

        const invoice = await InvoiceCollections.findOne({ paystack_reference: reference });

        if (!invoice) {
            return res.status(200).send("Invoice Not Found");
        }

        if (invoice.status === "paid") {
            return res.status(200).send("Invoice Already Paid");
        }

        // Check Paystack Payment
        const paystack = new Paystack(payment_app_config.token);

        const { status, data } = await paystack.transactions.verify(reference);

        if (status === false) {
            const e = new Error("Failed to verify payment");
            e.name = "ValidationError";
            throw e;
        }

        const { status: pay_status, channel, amount } = data;

        if (pay_status !== "success") {
            const e = new Error("Payment Not Successful");
            e.name = "ValidationError";
            throw e;
        }

        invoice.status = "paid";
        // invoice.channel = channel.toUpperCase();

        if (amount / 100 !== invoice.amount) {
            const e = new Error("Amount Paid Does Not Match Invoice Price");
            e.name = "ValidationError";
            throw e;
        }


        await invoice.save();
        if (invoice.redirect_url) {
            return res.redirect(invoice.redirect_url);
        }

        return res.status(200).send("Payment Successful");
        // Return a 200 response to acknowledge receipt of the event
        res.status(200).send({
            received: true,
        });
    } catch (err) {
        next(err);
    }
};
