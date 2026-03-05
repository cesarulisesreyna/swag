import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.get('/', checkRole(['coordinator']), ctrl.getTeachers);
router.post('/', checkRole(['coordinator']), ctrl.createTeacher);

router.get('/:id', checkRole(['coordinator', 'teacher']), ctrl.getTeacherById);
router.put('/:id', checkRole(['coordinator']), ctrl.updateTeacher);
router.delete('/:id', checkRole(['coordinator']), ctrl.deleteTeacher);

router.get('/:id/groups', checkRole(['coordinator', 'teacher']), ctrl.getTeacherGroups);

export default router;
