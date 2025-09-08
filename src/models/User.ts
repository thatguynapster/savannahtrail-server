import {
  Schema,
  Types,
  Model,
  SchemaOptions,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface User {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: "admin" | "operations" | "finance" | "support" | "guide";
  permissions: string[];
  created_at: Date;
}

const schemaOptions: SchemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: false }, // only track created_at as per schema
};

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "operations", "finance", "support", "guide"],
      required: true,
    },
    permissions: { type: [String], default: [] },
  },
  schemaOptions
);

// Attach plugins
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

const UserModel: Model<User> = model<User>("User", UserSchema, "Users");

export default UserModel;
