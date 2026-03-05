import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'student' | 'teacher' | 'coordinator';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['student', 'teacher', 'coordinator'], required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
