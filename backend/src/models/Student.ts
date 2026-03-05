import { Schema, model, Document, Types } from 'mongoose';

export interface IStudent extends Document {
    userId: Types.ObjectId;
    matricula: string;       // número de matrícula único
    nombre: string;
    apellido: string;
    carrera: string;
    cuatrimestre: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        matricula: { type: String, required: true, unique: true, trim: true, uppercase: true },
        nombre: { type: String, required: true, trim: true },
        apellido: { type: String, required: true, trim: true },
        carrera: { type: String, required: true, trim: true },
        cuatrimestre: { type: Number, required: true, min: 1, max: 12 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

studentSchema.index({ carrera: 1, cuatrimestre: 1 });

export const Student = model<IStudent>('Student', studentSchema);
