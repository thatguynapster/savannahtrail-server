import {
  Schema,
  Types,
  Model,
  SchemaOptions,
  model,
  Document,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export type UserRole = 'admin' | 'operations' | 'finance' | 'support' | 'guide';

export interface User extends Document {
  email: string;
  name?: string;
  role: UserRole;
  permissions: string[];
  password_hash: string;
  tokenVersion: number; // for invalidating refresh tokens
  created_at: Date;
}

const schemaOptions: SchemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: false }, // only track created_at as per schema
};

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  role: { type: String, enum: ['admin','operations','finance','support','guide'], required: true, default: 'admin' },
  permissions: [{ type: String, default: [] }],
  password_hash: { type: String, required: true },
  tokenVersion: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

// Attach plugins
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

const UserModel = model<User>("User", UserSchema, "Users");

export default UserModel;
