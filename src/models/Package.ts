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
  
  export type PackageStatus = "active" | "inactive" | "draft";
  
  export interface Addon {
    name?: string;
    price?: number;
  }
  
  export interface Package {
    _id: Types.ObjectId;
    title?: string;
    slug?: string;
    description?: string;
    base_price?: number;
    guest_limit?: number;
    extra_guest_fee?: number;
    duration_hours?: number;
    images?: string[];
    addons?: Addon[];
    available_dates?: Date[];   // ISO dates
    status?: PackageStatus;
    created_at?: Date;
  }

  export interface PackageModel extends Model<Package> {
    [x: string]: any;
    paginate(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<Package>) => void
    ): Promise<PaginateResult<Package>>;
    aggregatePaginate?(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<Package>) => void
    ): Promise<PaginateResult<Package>>;
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
  
  const PackageSchema = new Schema<Package, PackageModel>(
    {
      title: { type: String },
      slug: { type: String, index: true },
      description: { type: String },
      base_price: { type: Number },
      guest_limit: { type: Number },
      extra_guest_fee: { type: Number },
      duration_hours: { type: Number },
      images: { type: [String], default: [] },
      addons: { type: [AddonSchema], default: [] },
      available_dates: { type: [Date], default: [] },
      status: { type: String, enum: ["active", "inactive", "draft"], index: true },
    },
    schemaOptions
  );
  
  PackageSchema.plugin(mongoosePaginate);
  PackageSchema.plugin(mongooseAggregatePaginate);
  
  export const PackageModels = model<Package, PackageModel>(
    "Package",
    PackageSchema,
    "Packages"
  );
  
  export default PackageModels;
  