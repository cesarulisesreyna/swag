import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';

export const getEnrollments = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { studentId, groupId, status } = req.query as Record<string, string>;
        const result = await service.getEnrollments({
            studentId,
            groupId,
            status: status as 'active' | 'dropped' | undefined,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getEnrollmentById = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const enrollment = await service.getEnrollmentById(req.params.id);
        if (!enrollment) { res.status(404).json({ message: 'Enrollment not found.' }); return; }
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const createEnrollment = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { studentId, groupId } = req.body;
        const enrollment = await service.createEnrollment({ studentId, groupId });
        res.status(201).json(enrollment);
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Student is already enrolled in this group.' });
            return;
        }
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateEnrollmentStatus = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { status } = req.body as { status: 'active' | 'dropped' };
        const enrollment = await service.updateEnrollmentStatus(req.params.id, status);
        if (!enrollment) { res.status(404).json({ message: 'Enrollment not found.' }); return; }
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
