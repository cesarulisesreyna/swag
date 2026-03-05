import { Attendance } from '../../models/Attendance';
import { Enrollment } from '../../models/Enrollment';
import { IAttendance, AttendanceStatus } from '../../models/Attendance';
import { FilterQuery, Types } from 'mongoose';

export interface AttendanceFilters {
    groupId?: string;
    studentId?: string;
    from?: string;
    to?: string;
}

// Bulk mark attendance for a whole group on a given date
export interface AttendanceRecord {
    studentId: string;
    enrollmentId: string;
    status: AttendanceStatus;
    notes?: string;
}

export const markAttendance = async (
    groupId: string,
    date: string,
    records: AttendanceRecord[],
    markedBy: string
) => {
    const parsedDate = new Date(date);

    const ops = records.map((r) => ({
        updateOne: {
            filter: {
                studentId: new Types.ObjectId(r.studentId),
                groupId: new Types.ObjectId(groupId),
                date: parsedDate,
            },
            update: {
                $set: {
                    enrollmentId: new Types.ObjectId(r.enrollmentId),
                    status: r.status,
                    markedBy: new Types.ObjectId(markedBy),
                    notes: r.notes,
                },
            },
            upsert: true,
        },
    }));

    return Attendance.bulkWrite(ops);
};

export const getAttendance = async (filters: AttendanceFilters) => {
    const query: FilterQuery<IAttendance> = {};
    if (filters.groupId) query.groupId = filters.groupId;
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.from || filters.to) {
        query.date = {};
        if (filters.from) query.date.$gte = new Date(filters.from);
        if (filters.to) query.date.$lte = new Date(filters.to);
    }

    return Attendance.find(query)
        .populate('studentId', 'nombre apellido matricula')
        .populate('groupId', 'groupCode')
        .populate('markedBy', 'nombre apellido')
        .sort({ date: -1 })
        .select('-__v');
};

export const updateAttendanceRecord = async (id: string, status: AttendanceStatus, notes?: string) =>
    Attendance.findByIdAndUpdate(id, { status, notes }, { new: true });
