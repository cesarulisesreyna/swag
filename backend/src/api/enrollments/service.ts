import { Enrollment } from '../../models/Enrollment';
import { FilterQuery } from 'mongoose';
import { IEnrollment } from '../../models/Enrollment';

export type EnrollmentStatusFilter = 'activo' | 'baja';

export interface EnrollmentFilters {
    studentId?: string;
    groupId?: string;
    status?: EnrollmentStatusFilter;
}

export const getEnrollments = async (filters: EnrollmentFilters) => {
    const query: FilterQuery<IEnrollment> = {};
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.groupId) query.groupId = filters.groupId;
    if (filters.status) query.status = filters.status;

    return Enrollment.find(query)
        .populate('studentId', 'nombre apellido matricula carrera cuatrimestre')
        .populate({
            path: 'groupId',
            populate: { path: 'subjectId', select: 'nombre codigo' },
        })
        .select('-__v');
};

export const getEnrollmentById = async (id: string) =>
    Enrollment.findById(id)
        .populate('studentId', 'nombre apellido matricula')
        .populate('groupId')
        .select('-__v');

export const createEnrollment = async (body: Pick<IEnrollment, 'studentId' | 'groupId'>) =>
    Enrollment.create(body);

export const updateEnrollmentStatus = async (id: string, status: 'activo' | 'baja') =>
    Enrollment.findByIdAndUpdate(id, { status }, { new: true });
