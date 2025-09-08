import {
  Schema,
  Types,
  Model,
  FilterQuery,
  PaginateOptions,
  CallbackError,
  PaginateResult,
  SchemaOptions,
  model,
} from "mongoose";
import moment from "moment";

import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface RefreshToken {
  _id: Types.ObjectId;
  token: string;
  user_id: string;
  expires: number;
  timestamp: number;
}

const schemaOptions: SchemaOptions = {
  timestamps: true,
};

const RefreshTokenSchema = new Schema<RefreshToken>(
  {
    token: { type: String, required: true },
    user_id: { type: String, required: true },
    expires: { type: Number, default: moment().add(90, 'days').valueOf() },
    timestamp: { type: Number,  default: moment().valueOf() },
  },
  schemaOptions
);

RefreshTokenSchema.plugin(mongoosePaginate);
RefreshTokenSchema.plugin(mongooseAggregatePaginate);

const RefreshTokenModel: Model<RefreshToken> = model<RefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
  "Tokens"
);

export default RefreshTokenModel;
