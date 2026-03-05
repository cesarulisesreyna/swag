import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();
router.use(checkAuth);

// ── Por ObjectId ──────────────────────────────────────────────────────────────
router.get('/', checkRole(['coordinator']), ctrl.getStudents);
router.post('/', checkRole(['coordinator']), ctrl.createStudent);

router.get('/:id', checkRole(['coordinator', 'student']), ctrl.getStudentById);
router.put('/:id', checkRole(['coordinator']), ctrl.updateStudent);
router.delete('/:id', checkRole(['coordinator']), ctrl.deleteStudent);

router.get('/:id/grupos', checkRole(['coordinator', 'student']), ctrl.getStudentGroups);
router.get('/:id/asistencia', checkRole(['coordinator', 'student']), ctrl.getStudentAttendance);
router.get('/:id/horario', checkRole(['coordinator', 'student']), ctrl.getStudentSchedule);

// ── Por Matrícula (identificador principal) ───────────────────────────────────
// IMPORTANTE: esta ruta debe ir ANTES de /:id para que Express no lo confunda
router.get('/matricula/:matricula', checkRole(['coordinator', 'student']), ctrl.getStudentByMatricula);
router.get('/matricula/:matricula/grupos', checkRole(['coordinator', 'student']), ctrl.getStudentGroupsByMatricula);
router.get('/matricula/:matricula/asistencia', checkRole(['coordinator', 'student']), ctrl.getStudentAttendanceByMatricula);
router.get('/matricula/:matricula/horario', checkRole(['coordinator', 'student']), ctrl.getStudentScheduleByMatricula);

export default router;
