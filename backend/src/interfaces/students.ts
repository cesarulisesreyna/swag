// Interfaces de estudiantes (no son modelos Mongoose)

export interface CreateStudentBody {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    matricula: string;
    carrera: string;
    cuatrimestre: number;
}

export interface UpdateStudentBody {
    nombre?: string;
    apellido?: string;
    carrera?: string;
    cuatrimestre?: number;
}

export interface StudentFilters {
    carrera?: string;
    cuatrimestre?: number;
    search?: string;
    page?: number;
    limit?: number;
}