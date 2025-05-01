import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document<string> {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
}

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},
    { timestamps: true });

export const User = mongoose.model<IUser>("User", userSchema);
export default User;