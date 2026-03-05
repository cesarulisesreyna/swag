import { Router } from 'express';
import authRouter from './auth/routes';
import studentsRouter from './students/routes';
import teachersRouter from './teachers/routes';
import subjectsRouter from './subjects/routes';
import groupsRouter from './groups/routes';
import schedulesRouter from './schedules/routes';
import enrollmentsRouter from './enrollments/routes';
import attendanceRouter from './attendance/routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/students', studentsRouter);
router.use('/teachers', teachersRouter);
router.use('/subjects', subjectsRouter);
router.use('/groups', groupsRouter);
router.use('/schedules', schedulesRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/attendance', attendanceRouter);

export default router;