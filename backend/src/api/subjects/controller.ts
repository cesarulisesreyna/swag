import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';

export const getSubjects = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { career, semester, search, page, limit } = req.query as Record<string, string>;
        const result = await service.getSubjects({
            career,
            semester: semester ? Number(semester) : undefined,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const getSubjectById = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const subject = await service.getSubjectById(req.params.id);
        if (!subject) { res.status(404).json({ message: 'Subject not found.' }); return; }
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const createSubject = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const subject = await service.createSubject(req.body);
        res.status(201).json(subject);
    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Subject code already exists.' });
            return;
        }
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateSubject = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const subject = await service.updateSubject(req.params.id, req.body);
        if (!subject) { res.status(404).json({ message: 'Subject not found.' }); return; }
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const deleteSubject = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const subject = await service.deleteSubject(req.params.id);
        if (!subject) { res.status(404).json({ message: 'Subject not found.' }); return; }
        res.json({ message: 'Subject deactivated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
