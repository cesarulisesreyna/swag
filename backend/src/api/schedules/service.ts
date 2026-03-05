import { Schedule } from '../../models/Schedule';
import { ISchedule } from '../../models/Schedule';
import { FilterQuery } from 'mongoose';

export interface ScheduleFilters {
    groupId?: string;
    dayOfWeek?: number;
}

export const getSchedules = async (filters: ScheduleFilters) => {
    const query: FilterQuery<ISchedule> = {};
    if (filters.groupId) query.groupId = filters.groupId;
    if (filters.dayOfWeek !== undefined) query.dayOfWeek = filters.dayOfWeek;

    return Schedule.find(query)
        .populate({
            path: 'groupId',
            populate: [
                { path: 'subjectId', select: 'name code' },
                { path: 'teacherId', select: 'firstName lastName' },
            ],
        })
        .select('-__v');
};

export const createSchedule = async (body: Partial<ISchedule>) =>
    Schedule.create(body);

export const getScheduleById = async (id: string) =>
    Schedule.findById(id)
        .populate({
            path: 'scheduleId',
            select: 'name code',
        })
        .select('-__v');

export const updateSchedule = async (id: string, body: Partial<ISchedule>) =>
    Schedule.findByIdAndUpdate(id, body, { new: true, runValidators: true });

export const deleteSchedule = async (id: string) =>
    Schedule.findByIdAndDelete(id);
