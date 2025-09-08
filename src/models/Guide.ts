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
  
  export type GuideStatus = "active" | "inactive";
  
  export interface Availability {
    date?: Date;
    available?: boolean;
    blocked_reason?: string;
  }
  
  export interface Guide {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    photo_url?: string;
    languages?: string[];
    specialties?: string[];
    status?: GuideStatus;
    availability?: Availability[];
    created_at?: Date;
  }
  
  export interface GuideModel extends Model<Guide> {
    [x: string]: any;
    paginate(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<Guide>) => void
    ): Promise<PaginateResult<Guide>>;
    aggregatePaginate?(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<Guide>) => void
    ): Promise<PaginateResult<Guide>>;
  }
  const schemaOptions: SchemaOptions = {
    timestamps: { createdAt: "created_at", updatedAt: false },
  };
  
  const AvailabilitySchema = new Schema<Availability>(
    {
      date: { type: Date },
      available: { type: Boolean },
      blocked_reason: { type: String },
    },
    { _id: false }
  );
  
  const GuideSchema = new Schema<Guide, GuideModel>(
    {
      name: { type: String },
      email: { type: String, lowercase: true, trim: true, index: true },
      phone: { type: String },
      bio: { type: String },
      photo_url: { type: String },
      languages: { type: [String], default: [] },
      specialties: { type: [String], default: [] },
      status: { type: String, enum: ["active", "inactive"], index: true },
      availability: { type: [AvailabilitySchema], default: [] },
    },
    schemaOptions
  );
  
  GuideSchema.plugin(mongoosePaginate);
  GuideSchema.plugin(mongooseAggregatePaginate);
  
  export const GuideModels = model<Guide, GuideModel>(
    "Guide",
    GuideSchema,
    "Guides"
  );
  
  export default GuideModels;
  