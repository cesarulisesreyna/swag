import { Schema, model, Document, Types } from 'mongoose';

export type AttendanceStatus = 'presente' | 'ausente' | 'retardo';

export interface IAttendance extends Document {
    enrollmentId: Types.ObjectId;
    groupId: Types.ObjectId;
    studentId: Types.ObjectId;
    date: Date;
    status: AttendanceStatus;
    markedBy: Types.ObjectId;  // Teacher userId
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
    {
        enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
        groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        date: { type: Date, required: true },
        status: { type: String, enum: ['presente', 'ausente', 'retardo'], required: true },
        markedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

// One attendance record per student per group per day
attendanceSchema.index({ studentId: 1, groupId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ groupId: 1, date: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
