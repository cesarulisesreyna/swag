import { Response } from 'express';
import { IRequestWithUser } from '../../middlewares/interfaces';
import * as service from './service';
import { CreateStudentBody } from '../../interfaces/students';

// ── Helpers ───────────────────────────────────────────────────────────────────
const notFound = (res: Response) =>
    res.status(404).json({ message: 'Alumno no encontrado.' });

const forbidden = (res: Response) =>
    res.status(403).json({ message: 'Acceso denegado.' });

// Verifica que un alumno autenticado solo consulte sus propios datos por matrícula
const alumnoEsPropietario = (req: IRequestWithUser, matricula: string): boolean => {
    if (req.userData?.role !== 'student') return true; // coordinadores y maestros pasan
    return req.userData?.matricula?.toUpperCase() === matricula.toUpperCase();
};

// ── Por ObjectId ──────────────────────────────────────────────────────────────
export const getStudents = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { carrera, cuatrimestre, search, page, limit } = req.query as Record<string, string>;
        const result = await service.getStudents({
            carrera,
            cuatrimestre: cuatrimestre ? Number(cuatrimestre) : undefined,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentById = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const alumno = await service.getStudentById(req.params.id);
        if (!alumno) return void notFound(res);
        // Alumno solo puede ver su propio perfil
        if (req.userData?.role === 'student' && String(alumno.userId) !== req.userData.userId)
            return void forbidden(res);
        res.json(alumno);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const createStudent = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const result = await service.createStudent(req.body as CreateStudentBody);
        res.status(201).json(result);
    } catch (err: any) {
        if (err.code === 11000)
            return void res.status(409).json({ message: 'El email o la matrícula ya existen.' });
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const updateStudent = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const alumno = await service.updateStudent(req.params.id, req.body);
        if (!alumno) return void notFound(res);
        res.json(alumno);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const deleteStudent = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const alumno = await service.deactivateStudent(req.params.id);
        if (!alumno) return void notFound(res);
        res.json({ message: 'Alumno desactivado correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentGroups = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        res.json(await service.getStudentGroups(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentAttendance = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { groupId, from, to } = req.query as Record<string, string>;
        res.json(await service.getStudentAttendance(req.params.id, { groupId, from, to }));
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentSchedule = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        res.json(await service.getStudentSchedule(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

// ── Por Matrícula (identificador principal) ───────────────────────────────────
export const getStudentByMatricula = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { matricula } = req.params;
        if (!alumnoEsPropietario(req, matricula)) return void forbidden(res);
        const alumno = await service.getStudentByMatricula(matricula);
        if (!alumno) return void notFound(res);
        res.json(alumno);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentGroupsByMatricula = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { matricula } = req.params;
        if (!alumnoEsPropietario(req, matricula)) return void forbidden(res);
        const grupos = await service.getStudentGroupsByMatricula(matricula);
        if (grupos === null) return void notFound(res);
        res.json(grupos);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentAttendanceByMatricula = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { matricula } = req.params;
        if (!alumnoEsPropietario(req, matricula)) return void forbidden(res);
        const { groupId, from, to } = req.query as Record<string, string>;
        const registros = await service.getStudentAttendanceByMatricula(matricula, { groupId, from, to });
        if (registros === null) return void notFound(res);
        res.json(registros);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

export const getStudentScheduleByMatricula = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { matricula } = req.params;
        if (!alumnoEsPropietario(req, matricula)) return void forbidden(res);
        const horario = await service.getStudentScheduleByMatricula(matricula);
        if (horario === null) return void notFound(res);
        res.json(horario);
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};
