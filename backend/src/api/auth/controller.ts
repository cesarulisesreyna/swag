import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { Student } from '../../models/Student';
import { Teacher } from '../../models/Teacher';
import { signToken } from '../../config/jwt';
import { IRequestWithUser } from '../../middlewares/interfaces';

// POST /api/auth/login
export const login = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as { email: string; password: string };

        const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
        if (!user) {
            res.status(401).json({ message: 'Credenciales inválidas.' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ message: 'Credenciales inválidas.' });
            return;
        }

        // Enriquecer el token con datos extra según el rol
        let matricula: string | undefined;
        let numeroEmpleado: string | undefined;
        let nombre: string | undefined;
        let apellido: string | undefined;

        if (user.role === 'student') {
            const alumno = await Student.findOne({ userId: user._id }).select('matricula nombre apellido');
            if (alumno) {
                matricula = alumno.matricula;
                nombre = alumno.nombre;
                apellido = alumno.apellido;
            }
        } else if (user.role === 'teacher') {
            const maestro = await Teacher.findOne({ userId: user._id }).select('numeroEmpleado nombre apellido');
            if (maestro) {
                numeroEmpleado = maestro.numeroEmpleado;
                nombre = maestro.nombre;
                apellido = maestro.apellido;
            }
        }

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            matricula,
            numeroEmpleado,
            nombre,
            apellido,
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                matricula,
                numeroEmpleado,
                nombre,
                apellido,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};

// GET /api/auth/me
export const me = async (req: IRequestWithUser, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.userData!;

        let profile = null;
        if (role === 'student') {
            profile = await Student.findOne({ userId }).populate('userId', 'email').select('-__v');
        } else if (role === 'teacher') {
            profile = await Teacher.findOne({ userId }).populate('userId', 'email').select('-__v');
        }

        const user = await User.findById(userId).select('email role isActive');

        res.json({ user, profile });
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor.', error: err });
    }
};
