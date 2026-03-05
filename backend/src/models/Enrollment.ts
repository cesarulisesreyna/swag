import { Schema, model, Document, Types } from 'mongoose';

export type EnrollmentStatus = 'activo' | 'baja';

export interface IEnrollment extends Document {
    studentId: Types.ObjectId;
    groupId: Types.ObjectId;
    status: EnrollmentStatus;
    enrolledAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        status: { type: String, enum: ['activo', 'baja'], default: 'activo' },
        enrolledAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, groupId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
