import { Schema, model, Document } from 'mongoose';

export interface ISubject extends Document {
    nombre: string;
    codigo: string;       // clave única, ej. "MAT101"
    carrera: string;
    cuatrimestre: number;
    creditos: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
    {
        nombre: { type: String, required: true, trim: true },
        codigo: { type: String, required: true, unique: true, trim: true, uppercase: true },
        carrera: { type: String, required: true, trim: true },
        cuatrimestre: { type: Number, required: true, min: 1, max: 12 },
        creditos: { type: Number, required: true, min: 1 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

subjectSchema.index({ carrera: 1, cuatrimestre: 1 });

export const Subject = model<ISubject>('Subject', subjectSchema);
