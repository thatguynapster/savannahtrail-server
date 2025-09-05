import { Schema, model, Model } from "mongoose";

export interface User {
  _id: string;
  email: string;
  password?: string;
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel: Model<User> = model<User>("User", UserSchema, "Users");

export default UserModel;
