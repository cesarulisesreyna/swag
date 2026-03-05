import { Schema, model, Document, Types } from 'mongoose';

export interface ITeacher extends Document {
    userId: Types.ObjectId;
    numeroEmpleado: string;   // número de empleado único
    nombre: string;
    apellido: string;
    especialidad: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        numeroEmpleado: { type: String, required: true, unique: true, trim: true, uppercase: true },
        nombre: { type: String, required: true, trim: true },
        apellido: { type: String, required: true, trim: true },
        especialidad: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
