import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = '8h';

export interface JwtPayload {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'coordinator';
    // Datos extras incluidos en el token para evitar queries adicionales
    matricula?: string;         // Solo para alumnos
    numeroEmpleado?: string;    // Solo para maestros
    nombre?: string;
    apellido?: string;
}

export const signToken = (payload: JwtPayload): string =>
    jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

export const verifyToken = (token: string): JwtPayload =>
    jwt.verify(token, SECRET) as JwtPayload;