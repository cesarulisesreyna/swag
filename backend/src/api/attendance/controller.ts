import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';
import { Teacher } from '../../models/Teacher';

export const markAttendance = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { groupId, date, records } = req.body as {
            groupId: string;
            date: string;
            records: service.AttendanceRecord[];
        };

        // Get the Teacher document for this user
        const teacher = await Teacher.findOne({ userId: req.userData!.userId });
        if (!teacher) {
            res.status(403).json({ message: 'Only teachers can mark attendance.' });
            return;
        }

        const result = await service.markAttendance(groupId, date, records, String(teacher._id));
        res.status(201).json({ message: 'Attendance marked.', result });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getAttendance = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { groupId, studentId, from, to } = req.query as Record<string, string>;
        const records = await service.getAttendance({ groupId, studentId, from, to });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateAttendance = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { status, notes } = req.body as { status: 'present' | 'absent' | 'late'; notes?: string };
        const record = await service.updateAttendanceRecord(req.params.id, status, notes);
        if (!record) { res.status(404).json({ message: 'Attendance record not found.' }); return; }
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
