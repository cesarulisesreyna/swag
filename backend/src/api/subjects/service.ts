import { Subject, ISubject } from '../../models/Subject';
import { FilterQuery } from 'mongoose';

export interface SubjectFilters {
    carrera?: string;
    cuatrimestre?: number;
    search?: string;
    page?: number;
    limit?: number;
}

export const getSubjects = async (filters: SubjectFilters) => {
    const { carrera, cuatrimestre, search, page = 1, limit = 50 } = filters;
    const query: FilterQuery<ISubject> = { isActive: true };

    if (carrera) query.carrera = carrera;
    if (cuatrimestre) query.cuatrimestre = cuatrimestre;
    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nombre: regex }, { codigo: regex }];
    }

    const [data, total] = await Promise.all([
        Subject.find(query).skip((page - 1) * limit).limit(limit).select('-__v'),
        Subject.countDocuments(query),
    ]);

    return { data, total, page, limit };
};

export const getSubjectById = async (id: string) =>
    Subject.findById(id).select('-__v');

export const createSubject = async (body: Partial<ISubject>) =>
    Subject.create(body);

export const updateSubject = async (id: string, body: Partial<ISubject>) =>
    Subject.findByIdAndUpdate(id, body, { new: true, runValidators: true });

export const deleteSubject = async (id: string) =>
    Subject.findByIdAndUpdate(id, { isActive: false }, { new: true });
