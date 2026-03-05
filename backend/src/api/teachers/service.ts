import { Teacher, ITeacher } from '../../models/Teacher';
import { User } from '../../models/User';
import { Group } from '../../models/Group';
import { createUserWithTeacher } from '../users/service';
import { TeacherFilters, UpdateTeacherBody } from '../../interfaces/teachers';
import { FilterQuery } from 'mongoose';

export const getTeachers = async (filters: TeacherFilters) => {
    const { especialidad, search, page = 1, limit = 20 } = filters;
    const query: FilterQuery<ITeacher> = { isActive: true };

    if (especialidad) query.especialidad = especialidad;
    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nombre: regex }, { apellido: regex }, { numeroEmpleado: regex }];
    }

    const [data, total] = await Promise.all([
        Teacher.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'email')
            .select('-__v'),
        Teacher.countDocuments(query),
    ]);

    return { data, total, page, limit };
};

export const getTeacherById = async (id: string) =>
    Teacher.findById(id).populate('userId', 'email').select('-__v');

export const createTeacher = async (body: Parameters<typeof createUserWithTeacher>[0]) =>
    createUserWithTeacher(body);

export const updateTeacher = async (id: string, body: UpdateTeacherBody) =>
    Teacher.findByIdAndUpdate(id, body, { new: true, runValidators: true });

export const deactivateTeacher = async (id: string) => {
    const teacher = await Teacher.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (teacher) await User.findByIdAndUpdate(teacher.userId, { isActive: false });
    return teacher;
};

export const getTeacherGroups = async (teacherId: string) =>
    Group.find({ teacherId, isActive: true })
        .populate('subjectId', 'nombre codigo carrera cuatrimestre')
        .select('-__v');
