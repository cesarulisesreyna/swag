import { Student, IStudent } from '../../models/Student';
import { User } from '../../models/User';
import { Enrollment } from '../../models/Enrollment';
import { Attendance } from '../../models/Attendance';
import { Schedule } from '../../models/Schedule';
import { createUserWithStudent, hashPassword } from '../users/service';
import { StudentFilters, UpdateStudentBody } from '../../interfaces/students';
import { FilterQuery } from 'mongoose';

export const getStudents = async (filters: StudentFilters) => {
    const { carrera, cuatrimestre, search, page = 1, limit = 20 } = filters;
    const query: FilterQuery<IStudent> = { isActive: true };

    if (carrera) query.carrera = carrera;
    if (cuatrimestre) query.cuatrimestre = cuatrimestre;
    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nombre: regex }, { apellido: regex }, { matricula: regex }];
    }

    const [data, total] = await Promise.all([
        Student.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'email')
            .select('-__v'),
        Student.countDocuments(query),
    ]);

    return { data, total, page, limit };
};

export const getStudentById = async (id: string) =>
    Student.findById(id).populate('userId', 'email').select('-__v');

// Buscar alumno por matrícula (identificador principal)
export const getStudentByMatricula = async (matricula: string) =>
    Student.findOne({ matricula: matricula.toUpperCase(), isActive: true })
        .populate('userId', 'email')
        .select('-__v');

// Obtener los grupos de un alumno usando su matrícula
export const getStudentGroupsByMatricula = async (matricula: string) => {
    const alumno = await Student.findOne({ matricula: matricula.toUpperCase(), isActive: true });
    if (!alumno) return null;
    return getStudentGroups(String(alumno._id));
};

// Obtener asistencias de un alumno usando su matrícula
export const getStudentAttendanceByMatricula = async (
    matricula: string,
    filters: { groupId?: string; from?: string; to?: string }
) => {
    const alumno = await Student.findOne({ matricula: matricula.toUpperCase(), isActive: true });
    if (!alumno) return null;
    return getStudentAttendance(String(alumno._id), filters);
};

// Obtener horario de un alumno usando su matrícula
export const getStudentScheduleByMatricula = async (matricula: string) => {
    const alumno = await Student.findOne({ matricula: matricula.toUpperCase(), isActive: true });
    if (!alumno) return null;
    return getStudentSchedule(String(alumno._id));
};

export const createStudent = async (body: Parameters<typeof createUserWithStudent>[0]) =>
    createUserWithStudent(body);

export const updateStudent = async (id: string, body: UpdateStudentBody) =>
    Student.findByIdAndUpdate(id, body, { new: true, runValidators: true });

export const deactivateStudent = async (id: string) => {
    const student = await Student.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (student) await User.findByIdAndUpdate(student.userId, { isActive: false });
    return student;
};

export const getStudentGroups = async (studentId: string) =>
    Enrollment.find({ studentId, status: 'activo' })
        .populate({
            path: 'groupId',
            populate: [
                { path: 'subjectId', select: 'nombre codigo' },
                { path: 'teacherId', select: 'nombre apellido' },
            ],
        })
        .select('-__v');

export const getStudentAttendance = async (
    studentId: string,
    filters: { groupId?: string; from?: string; to?: string }
) => {
    const query: FilterQuery<typeof Attendance> = { studentId };
    if (filters.groupId) query.groupId = filters.groupId;
    if (filters.from || filters.to) {
        query.date = {};
        if (filters.from) query.date.$gte = new Date(filters.from);
        if (filters.to) query.date.$lte = new Date(filters.to);
    }

    return Attendance.find(query)
        .populate('groupId', 'codigo')
        .sort({ date: -1 })
        .select('-__v');
};

export const getStudentSchedule = async (studentId: string) => {
    const enrollments = await Enrollment.find({ studentId, status: 'activo' }).select('groupId');
    const groupIds = enrollments.map((e) => e.groupId);
    return Schedule.find({ groupId: { $in: groupIds } })
        .populate({
            path: 'groupId',
            populate: [
                { path: 'subjectId', select: 'nombre codigo' },
                { path: 'teacherId', select: 'nombre apellido' },
            ],
        })
        .select('-__v');
};
