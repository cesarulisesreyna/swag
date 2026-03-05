import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';

export const getSchedules = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { groupId, dayOfWeek } = req.query as Record<string, string>;
        const result = await service.getSchedules({
            groupId,
            dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const createSchedule = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const schedule = await service.createSchedule(req.body);
        res.status(201).json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const updateSchedule = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const schedule = await service.updateSchedule(req.params.id, req.body);
        if (!schedule) { res.status(404).json({ message: 'Schedule not found.' }); return; }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};

export const deleteSchedule = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const schedule = await service.deleteSchedule(req.params.id);
        if (!schedule) { res.status(404).json({ message: 'Schedule not found.' }); return; }
        res.json({ message: 'Schedule deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err });
    }
};
