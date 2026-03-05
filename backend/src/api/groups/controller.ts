import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';

export const getGroups = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { subjectId, teacherId, period, page, limit } = req.query as Record<string, string>;
        const result = await service.getGroups({
            subjectId,
            teacherId,
            period,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getGroupById = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const group = await service.getGroupById(req.params.id);
        if (!group) { res.status(404).json({ message: 'Group not found.' }); return; }
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const createGroup = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const group = await service.createGroup(req.body);
        res.status(201).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateGroup = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const group = await service.updateGroup(req.params.id, req.body);
        if (!group) { res.status(404).json({ message: 'Group not found.' }); return; }
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const deleteGroup = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const group = await service.deleteGroup(req.params.id);
        if (!group) { res.status(404).json({ message: 'Group not found.' }); return; }
        res.json({ message: 'Group deactivated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const enrollStudent = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body as { studentId: string };
        const enrollment = await service.enrollStudent(req.params.id, studentId);
        res.status(201).json(enrollment);
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Student is already enrolled in this group.' });
            return;
        }
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const unenrollStudent = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const enrollment = await service.unenrollStudent(req.params.id, req.params.studentId);
        if (!enrollment) { res.status(404).json({ message: 'Enrollment not found.' }); return; }
        res.json({ message: 'Student removed from group.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getGroupStudents = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const students = await service.getGroupStudents(req.params.id);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
