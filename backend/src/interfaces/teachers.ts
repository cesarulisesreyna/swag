// Interfaces de maestros (no son modelos Mongoose)

export interface CreateTeacherBody {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    numeroEmpleado: string;
    especialidad: string;
}

export interface UpdateTeacherBody {
    nombre?: string;
    apellido?: string;
    especialidad?: string;
}

export interface TeacherFilters {
    especialidad?: string;
    search?: string;
    page?: number;
    limit?: number;
}