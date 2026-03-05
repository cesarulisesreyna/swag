import { Group } from '../../models/Group';
import { Enrollment } from '../../models/Enrollment';
import { FilterQuery } from 'mongoose';
import { IGroup } from '../../models/Group';

export interface GroupFilters {
    subjectId?: string;
    teacherId?: string;
    period?: string;
    page?: number;
    limit?: number;
}

export const getGroups = async (filters: GroupFilters) => {
    const { subjectId, teacherId, period, page = 1, limit = 20 } = filters;
    const query: FilterQuery<IGroup> = { isActive: true };

    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;
    if (period) query.period = period;

    const [data, total] = await Promise.all([
        Group.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('subjectId', 'nombre codigo carrera cuatrimestre')
            .populate('teacherId', 'nombre apellido especialidad')
            .select('-__v'),
        Group.countDocuments(query),
    ]);

    return { data, total, page, limit };
};

export const getGroupById = async (id: string) =>
    Group.findById(id)
        .populate('subjectId', 'nombre codigo carrera cuatrimestre')
        .populate('teacherId', 'nombre apellido especialidad')
        .select('-__v');

export const createGroup = async (body: Partial<IGroup>) =>
    Group.create(body);

export const updateGroup = async (id: string, body: Partial<IGroup>) =>
    Group.findByIdAndUpdate(id, body, { new: true, runValidators: true });

export const deleteGroup = async (id: string) =>
    Group.findByIdAndUpdate(id, { isActive: false }, { new: true });

export const enrollStudent = async (groupId: string, studentId: string) =>
    Enrollment.create({ groupId, studentId });

export const unenrollStudent = async (groupId: string, studentId: string) =>
    Enrollment.findOneAndUpdate(
        { groupId, studentId },
        { status: 'baja' },
        { new: true }
    );

export const getGroupStudents = async (groupId: string) =>
    Enrollment.find({ groupId, status: 'activo' })
        .populate('studentId', 'nombre apellido matricula carrera cuatrimestre')
        .select('-__v');
