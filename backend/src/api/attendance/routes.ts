import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.post('/', checkRole(['teacher']), ctrl.markAttendance);
router.get('/', checkRole(['coordinator', 'teacher']), ctrl.getAttendance);
router.put('/:id', checkRole(['coordinator', 'teacher']), ctrl.updateAttendance);

export default router;
