import { Schema, model, Document, Types } from 'mongoose';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun … 6=Sat

export interface ISchedule extends Document {
    groupId: Types.ObjectId;
    dayOfWeek: DayOfWeek;
    startTime: string;  // "HH:MM"
    endTime: string;    // "HH:MM"
    classroom: string;
    createdAt: Date;
    updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
    {
        groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        classroom: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

scheduleSchema.index({ groupId: 1, dayOfWeek: 1 });

export const Schedule = model<ISchedule>('Schedule', scheduleSchema);
