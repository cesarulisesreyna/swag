import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
    subjectId: Types.ObjectId;
    teacherId: Types.ObjectId;
    period: string;        // e.g. "2026-1"
    groupCode: string;     // e.g. "MAT101-A"
    capacity: number;
    classroom: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
    {
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        period: { type: String, required: true, trim: true },
        groupCode: { type: String, required: true, trim: true, uppercase: true },
        capacity: { type: Number, required: true, min: 1, default: 30 },
        classroom: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

groupSchema.index({ subjectId: 1, period: 1 });
groupSchema.index({ teacherId: 1, period: 1 });

export const Group = model<IGroup>('Group', groupSchema);
