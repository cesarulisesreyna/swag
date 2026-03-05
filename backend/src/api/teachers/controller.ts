import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';
import { CreateTeacherBody } from '../../interfaces/teachers';

export const getTeachers = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { especialidad, search, page, limit } = req.query as Record<string, string>;
        const result = await service.getTeachers({
            especialidad,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getTeacherById = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        // Teachers can only view their own profile
        if (req.userData?.role === 'teacher') {
            const teacher = await service.getTeacherById(req.params.id);
            if (!teacher || String(teacher.userId) !== req.userData.userId) {
                res.status(403).json({ message: 'Access denied.' });
                return;
            }
        }
        const teacher = await service.getTeacherById(req.params.id);
        if (!teacher) { res.status(404).json({ message: 'Teacher not found.' }); return; }
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const createTeacher = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const result = await service.createTeacher(req.body as CreateTeacherBody);
        res.status(201).json(result);
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Email or employee ID already exists.' });
            return;
        }
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateTeacher = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const teacher = await service.updateTeacher(req.params.id, req.body);
        if (!teacher) { res.status(404).json({ message: 'Teacher not found.' }); return; }
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const deleteTeacher = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const teacher = await service.deactivateTeacher(req.params.id);
        if (!teacher) { res.status(404).json({ message: 'Teacher not found.' }); return; }
        res.json({ message: 'Teacher deactivated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getTeacherGroups = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const groups = await service.getTeacherGroups(req.params.id);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
