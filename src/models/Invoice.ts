import { Schema, Types, Model, model, SchemaOptions, PaginateOptions, PaginateResult, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export type InvoiceStatus = "pending" | "paid" | "failed";

export interface Invoice extends Document {
    booking_id?: string;
    customer_email: string;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    paystack_reference?: string;
    paystack_authorization_url?: string;
    paystack_access_code?: string;
    paid_at?: Date;
    redirect_url?: string;
    is_requested?: boolean;
    extra?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvoiceModel extends Model<Invoice> {
    [x: string]: any;
    paginate(query?: any, options?: PaginateOptions, callback?: (err: any, result: PaginateResult<Invoice>) => void): Promise<PaginateResult<Invoice>>;
    aggregatePaginate(query?: any, options?: PaginateOptions, callback?: (err: any, result: PaginateResult<Invoice>) => void): Promise<PaginateResult<Invoice>>;
}

const schemaOptions: SchemaOptions = {
    timestamps: true,
};

const InvoiceSchema = new Schema<Invoice>(
    {
        booking_id: { type: String, required: true, index: true },
        customer_email: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: "NGN" },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
        paystack_reference: { type: String },
        paystack_authorization_url: { type: String },
        paystack_access_code: { type: String },
        paid_at: { type: Date },
        redirect_url: { type: String },
        is_requested: { type: Boolean, default: false },
        extra: { type: Schema.Types.Mixed },
    },
    schemaOptions
);

InvoiceSchema.plugin(mongoosePaginate);
InvoiceSchema.plugin(mongooseAggregatePaginate);

const InvoiceModel = model<Invoice, InvoiceModel>("Invoice", InvoiceSchema, "invoices");

export default InvoiceModel;
