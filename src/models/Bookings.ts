import {
  Schema,
  Types,
  Model,
  model,
  SchemaOptions,
  PaginateOptions,
  PaginateResult,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Addon {
  name?: string;
  price?: number;
}

export interface Booking {
  _id: Types.ObjectId;
  reference?: string;
  package_id?: string;
  package_title?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  tour_date?: Date;
  num_guests?: number;
  total_amount?: number;
  payment_status?: PaymentStatus;
  booking_status?: BookingStatus;
  assigned_guide_id?: string;
  assigned_guide_name?: string;
  addons?: Addon[];
  created_at?: Date;
}

export interface BookingModel extends Model<Booking> {
  [x: string]: any;
  paginate(
    query?: any,
    options?: PaginateOptions,
    callback?: (err: any, result: PaginateResult<Booking>) => void
  ): Promise<PaginateResult<Booking>>;
  aggregatePaginate(
    query?: any,
    options?: PaginateOptions,
    callback?: (err: any, result: PaginateResult<Booking>) => void
  ): Promise<PaginateResult<Booking>>;
}

const schemaOptions: SchemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: false },
};

const AddonSchema = new Schema<Addon>(
  {
    name: { type: String },
    price: { type: Number },
  },
  { _id: false }
);

const BookingSchema = new Schema<Booking, BookingModel>(
  {
    reference: { type: String, index: true },
    package_id: { type: String, index: true },
    package_title: { type: String },
    guest_name: { type: String, index: true },
    guest_phone: { type: String },
    guest_email: { type: String, lowercase: true, trim: true, index: true },
    tour_date: { type: Date, index: true },
    num_guests: { type: Number, min: 1 },
    total_amount: { type: Number },
    payment_status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      index: true,
    },
    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      index: true,
    },
    assigned_guide_id: { type: String },
    assigned_guide_name: { type: String },
    addons: { type: [AddonSchema], default: [] },
  },
  schemaOptions
);

BookingSchema.plugin(mongoosePaginate);
BookingSchema.plugin(mongooseAggregatePaginate);

const BookingModels = model<Booking, BookingModel>(
  "Booking",
  BookingSchema,
  "Bookings"
);

export default BookingModels;
