/**
 * Seed Script — npm run seed
 * Datos de demostración completos en español.
 * Escenario: Universidad Tecnológica del Centro (UTC)
 * Safe to re-run: omite si el coordinador ya existe.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from './models/User';
import { Student } from './models/Student';
import { Teacher } from './models/Teacher';
import { Subject } from './models/Subject';
import { Group } from './models/Group';
import { Schedule } from './models/Schedule';
import { Enrollment } from './models/Enrollment';
import { Attendance } from './models/Attendance';

const SALT = 10;
const PASS = 'swag1234';
const hash = (p: string) => bcrypt.hash(p, SALT);

async function seed() {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅  Conectado a MongoDB');

    // ── Guard ─────────────────────────────────────────────────────────────────
    const existe = await User.findOne({ email: 'coordinador@utc.edu.mx' });
    if (existe) {
        console.log('ℹ️   La base de datos ya tiene datos. Omitiendo seed.');
        await mongoose.disconnect();
        return;
    }

    // ── 1. Coordinador ────────────────────────────────────────────────────────
    await User.create({
        email: 'coordinador@utc.edu.mx',
        passwordHash: await hash(PASS),
        role: 'coordinator',
    });
    console.log('✔  Coordinador creado');

    // ── 2. Maestros ───────────────────────────────────────────────────────────
    const datosMaestros = [
        { email: 'garcia@utc.edu.mx', nombre: 'Luis', apellido: 'García Moreno', numeroEmpleado: 'EMP001', especialidad: 'Matemáticas' },
        { email: 'lopez@utc.edu.mx', nombre: 'Ana', apellido: 'López Ramírez', numeroEmpleado: 'EMP002', especialidad: 'Programación' },
        { email: 'reyes@utc.edu.mx', nombre: 'Juan', apellido: 'Reyes Castillo', numeroEmpleado: 'EMP003', especialidad: 'Redes y Comunicaciones' },
        { email: 'hernandez@utc.edu.mx', nombre: 'Sofía', apellido: 'Hernández Vega', numeroEmpleado: 'EMP004', especialidad: 'Bases de Datos' },
        { email: 'martinez@utc.edu.mx', nombre: 'Carlos', apellido: 'Martínez Soto', numeroEmpleado: 'EMP005', especialidad: 'Administración' },
    ];

    const maestros = await Promise.all(
        datosMaestros.map(async (m) => {
            const user = await User.create({ email: m.email, passwordHash: await hash(PASS), role: 'teacher' });
            return Teacher.create({ userId: user._id, numeroEmpleado: m.numeroEmpleado, nombre: m.nombre, apellido: m.apellido, especialidad: m.especialidad });
        })
    );
    console.log(`✔  ${maestros.length} maestros creados`);

    // ── 3. Alumnos ────────────────────────────────────────────────────────────
    const datosAlumnos = [
        // Ingeniería en Sistemas Computacionales — Cuatrimestre 3
        { email: 'a220001@utc.edu.mx', nombre: 'María', apellido: 'Torres Fuentes', matricula: 'A220001', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3 },
        { email: 'a220002@utc.edu.mx', nombre: 'Carlos', apellido: 'Mendoza Peña', matricula: 'A220002', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3 },
        { email: 'a220003@utc.edu.mx', nombre: 'Sofía', apellido: 'Ruiz Ángeles', matricula: 'A220003', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3 },
        { email: 'a220004@utc.edu.mx', nombre: 'Diego', apellido: 'Herrera Salinas', matricula: 'A220004', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3 },
        { email: 'a220005@utc.edu.mx', nombre: 'Valeria', apellido: 'Castro Domínguez', matricula: 'A220005', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3 },
        // Ingeniería en Sistemas Computacionales — Cuatrimestre 6
        { email: 'a200001@utc.edu.mx', nombre: 'Miguel', apellido: 'Flores Jiménez', matricula: 'A200001', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 6 },
        { email: 'a200002@utc.edu.mx', nombre: 'Lucía', apellido: 'Morales Vela', matricula: 'A200002', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 6 },
        // Administración de Empresas — Cuatrimestre 2
        { email: 'a230001@utc.edu.mx', nombre: 'Andrés', apellido: 'Jiménez Ríos', matricula: 'A230001', carrera: 'Administración de Empresas', cuatrimestre: 2 },
        { email: 'a230002@utc.edu.mx', nombre: 'Camila', apellido: 'Vargas Mendoza', matricula: 'A230002', carrera: 'Administración de Empresas', cuatrimestre: 2 },
        { email: 'a230003@utc.edu.mx', nombre: 'Pablo', apellido: 'Gutiérrez Leal', matricula: 'A230003', carrera: 'Administración de Empresas', cuatrimestre: 2 },
    ];

    const alumnos = await Promise.all(
        datosAlumnos.map(async (a) => {
            const user = await User.create({ email: a.email, passwordHash: await hash(PASS), role: 'student' });
            return Student.create({ userId: user._id, matricula: a.matricula, nombre: a.nombre, apellido: a.apellido, carrera: a.carrera, cuatrimestre: a.cuatrimestre });
        })
    );
    console.log(`✔  ${alumnos.length} alumnos creados`);

    // ── 4. Materias ─────────────────────────────────────────────────────────
    // Ingeniería en Sistemas Computacionales
    const materias = await Subject.insertMany([
        { nombre: 'Cálculo Diferencial', codigo: 'MAT101', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 1, creditos: 6 },
        { nombre: 'Fundamentos de Programación', codigo: 'PRG101', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 1, creditos: 6 },
        { nombre: 'Programación Orientada a Objetos', codigo: 'PRG201', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3, creditos: 6 },
        { nombre: 'Estructuras de Datos', codigo: 'PRG202', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 3, creditos: 5 },
        { nombre: 'Bases de Datos', codigo: 'BD301', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 5, creditos: 5 },
        { nombre: 'Redes de Computadoras', codigo: 'RED401', carrera: 'Ingeniería en Sistemas Computacionales', cuatrimestre: 6, creditos: 4 },
        // Administración de Empresas
        { nombre: 'Fundamentos de Administración', codigo: 'ADM101', carrera: 'Administración de Empresas', cuatrimestre: 1, creditos: 5 },
        { nombre: 'Contabilidad General', codigo: 'CON101', carrera: 'Administración de Empresas', cuatrimestre: 2, creditos: 5 },
        { nombre: 'Mercadotecnia', codigo: 'MKT201', carrera: 'Administración de Empresas', cuatrimestre: 3, creditos: 4 },
    ]);
    console.log(`✔  ${materias.length} materias creadas`);

    // ── 5. Grupos ────────────────────────────────────────────────────────────
    // Período actual: 2026-1
    const PERIODO = '2026-1';

    const grupos = await Group.insertMany([
        // ISC 3er cuatrimestre
        { subjectId: materias[2]._id, teacherId: maestros[1]._id, period: PERIODO, groupCode: 'PRG201-A', capacity: 30, classroom: 'Aula B-205' },
        { subjectId: materias[3]._id, teacherId: maestros[1]._id, period: PERIODO, groupCode: 'PRG202-A', capacity: 30, classroom: 'Laboratorio B-210' },
        { subjectId: materias[0]._id, teacherId: maestros[0]._id, period: PERIODO, groupCode: 'MAT101-A', capacity: 35, classroom: 'Aula A-101' },
        // ISC 6to cuatrimestre
        { subjectId: materias[4]._id, teacherId: maestros[3]._id, period: PERIODO, groupCode: 'BD301-A', capacity: 25, classroom: 'Laboratorio C-301' },
        { subjectId: materias[5]._id, teacherId: maestros[2]._id, period: PERIODO, groupCode: 'RED401-A', capacity: 25, classroom: 'Aula C-305' },
        // Administración de Empresas
        { subjectId: materias[7]._id, teacherId: maestros[4]._id, period: PERIODO, groupCode: 'CON101-A', capacity: 30, classroom: 'Aula D-101' },
        { subjectId: materias[6]._id, teacherId: maestros[4]._id, period: PERIODO, groupCode: 'ADM101-A', capacity: 30, classroom: 'Aula D-102' },
    ]);
    console.log(`✔  ${grupos.length} grupos creados`);

    // ── 6. Horarios ──────────────────────────────────────────────────────────
    // dias: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
    await Schedule.insertMany([
        // POO — Lunes y Miércoles 8:00-10:00
        { groupId: grupos[0]._id, dayOfWeek: 1, startTime: '08:00', endTime: '10:00', classroom: 'Aula B-205' },
        { groupId: grupos[0]._id, dayOfWeek: 3, startTime: '08:00', endTime: '10:00', classroom: 'Aula B-205' },
        // Estructuras de Datos — Martes y Jueves 08:00-10:00
        { groupId: grupos[1]._id, dayOfWeek: 2, startTime: '08:00', endTime: '10:00', classroom: 'Laboratorio B-210' },
        { groupId: grupos[1]._id, dayOfWeek: 4, startTime: '08:00', endTime: '10:00', classroom: 'Laboratorio B-210' },
        // Cálculo — Lunes y Viernes 10:00-12:00
        { groupId: grupos[2]._id, dayOfWeek: 1, startTime: '10:00', endTime: '12:00', classroom: 'Aula A-101' },
        { groupId: grupos[2]._id, dayOfWeek: 5, startTime: '10:00', endTime: '12:00', classroom: 'Aula A-101' },
        // Bases de Datos — Miércoles y Viernes 12:00-14:00
        { groupId: grupos[3]._id, dayOfWeek: 3, startTime: '12:00', endTime: '14:00', classroom: 'Laboratorio C-301' },
        { groupId: grupos[3]._id, dayOfWeek: 5, startTime: '12:00', endTime: '14:00', classroom: 'Laboratorio C-301' },
        // Redes — Martes y Jueves 14:00-16:00
        { groupId: grupos[4]._id, dayOfWeek: 2, startTime: '14:00', endTime: '16:00', classroom: 'Aula C-305' },
        { groupId: grupos[4]._id, dayOfWeek: 4, startTime: '14:00', endTime: '16:00', classroom: 'Aula C-305' },
        // Contabilidad — Lunes y Miércoles 10:00-12:00
        { groupId: grupos[5]._id, dayOfWeek: 1, startTime: '10:00', endTime: '12:00', classroom: 'Aula D-101' },
        { groupId: grupos[5]._id, dayOfWeek: 3, startTime: '10:00', endTime: '12:00', classroom: 'Aula D-101' },
        // Fundamentos de Administración — Martes y Jueves 10:00-12:00
        { groupId: grupos[6]._id, dayOfWeek: 2, startTime: '10:00', endTime: '12:00', classroom: 'Aula D-102' },
        { groupId: grupos[6]._id, dayOfWeek: 4, startTime: '10:00', endTime: '12:00', classroom: 'Aula D-102' },
    ]);
    console.log('✔  Horarios creados');

    // ── 7. Inscripciones ─────────────────────────────────────────────────────
    // ISC 3er cuatrimestre → grupos 0(POO), 1(Estructuras), 2(Cálculo)
    // ISC 6to cuatrimestre → grupos 3(BD), 4(Redes)
    // Administración → grupos 5(Contabilidad), 6(Fundamentos)
    const pares: [number, number][] = [
        [0, 0], [0, 1], [0, 2],   // María
        [1, 0], [1, 1], [1, 2],   // Carlos
        [2, 0], [2, 1], [2, 2],   // Sofía
        [3, 0], [3, 1],         // Diego (solo POO y Estructuras)
        [4, 0], [4, 2],         // Valeria (POO y Cálculo)
        [5, 3], [5, 4],         // Miguel (6to)
        [6, 3], [6, 4],         // Lucía (6to)
        [7, 5], [7, 6],         // Andrés (Admin)
        [8, 5], [8, 6],         // Camila (Admin)
        [9, 5], [9, 6],         // Pablo (Admin)
    ];

    const inscripciones = await Enrollment.insertMany(
        pares.map(([ai, gi]) => ({ studentId: alumnos[ai]._id, groupId: grupos[gi]._id }))
    );
    console.log(`✔  ${inscripciones.length} inscripciones creadas`);

    // ── 8. Asistencias de muestra (últimos 10 días hábiles — grupo POO) ──────
    const hoy = new Date();
    const diasHabiles: Date[] = [];
    let dia = new Date(hoy);
    while (diasHabiles.length < 10) {
        dia = new Date(dia.getTime() - 86400000);
        if (dia.getDay() !== 0 && dia.getDay() !== 6) diasHabiles.push(new Date(dia));
    }

    // Solo marcar asistencia en las clases de POO (grupo 0, lunes y miércoles)
    const diasPOO = diasHabiles.filter((d) => d.getDay() === 1 || d.getDay() === 3);

    const inscrPOO = inscripciones.filter(
        (i) => String(i.groupId) === String(grupos[0]._id)
    );

    const estatusPool: ('presente' | 'ausente' | 'retardo')[] = [
        'presente', 'presente', 'presente', 'presente', 'retardo', 'ausente',
    ];

    const asistencias = [];
    for (const fecha of diasPOO) {
        for (const ins of inscrPOO) {
            asistencias.push({
                enrollmentId: ins._id,
                groupId: grupos[0]._id,
                studentId: ins.studentId,
                date: fecha,
                status: estatusPool[Math.floor(Math.random() * estatusPool.length)],
                markedBy: maestros[1]._id,
            });
        }
    }

    await Attendance.insertMany(asistencias, { ordered: false }).catch(() => null);
    console.log(`✔  ${asistencias.length} registros de asistencia creados`);

    // ── Resumen ───────────────────────────────────────────────────────────────
    console.log('\n🎉  ¡Seed completado!\n');
    console.log('─── Credenciales de acceso (contraseña: swag1234) ────────────');
    console.log('  Coordinador  : coordinador@utc.edu.mx');
    console.log('  Maestro 1    : garcia@utc.edu.mx       (Matemáticas)');
    console.log('  Maestro 2    : lopez@utc.edu.mx        (Programación)');
    console.log('  Maestro 3    : hernandez@utc.edu.mx    (Bases de Datos)');
    console.log('  Alumno ISC   : a220001@utc.edu.mx      (María Torres)');
    console.log('  Alumno Admin : a230001@utc.edu.mx      (Andrés Jiménez)');
    console.log('──────────────────────────────────────────────────────────────\n');

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
});
