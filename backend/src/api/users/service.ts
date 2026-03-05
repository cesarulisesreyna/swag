import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { Student } from '../../models/Student';
import { Teacher } from '../../models/Teacher';
import { CreateStudentBody } from '../../interfaces/students';
import { CreateTeacherBody } from '../../interfaces/teachers';

const SALT_ROUNDS = 10;

export const hashPassword = (plain: string): Promise<string> =>
    bcrypt.hash(plain, SALT_ROUNDS);

// Crea un User + perfil de Estudiante en una sola operación
export const createUserWithStudent = async (data: CreateStudentBody) => {
    const passwordHash = await hashPassword(data.password);
    const user = await User.create({ email: data.email, passwordHash, role: 'student' });

    const student = await Student.create({
        userId: user._id,
        matricula: data.matricula,
        nombre: data.nombre,
        apellido: data.apellido,
        carrera: data.carrera,
        cuatrimestre: data.cuatrimestre,
    });

    return { user, student };
};

// Crea un User + perfil de Maestro en una sola operación
export const createUserWithTeacher = async (data: CreateTeacherBody) => {
    const passwordHash = await hashPassword(data.password);
    const user = await User.create({ email: data.email, passwordHash, role: 'teacher' });

    const teacher = await Teacher.create({
        userId: user._id,
        numeroEmpleado: data.numeroEmpleado,
        nombre: data.nombre,
        apellido: data.apellido,
        especialidad: data.especialidad,
    });

    return { user, teacher };
};
