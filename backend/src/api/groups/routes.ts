import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.get('/', ctrl.getGroups);                          // all roles
router.get('/:id', ctrl.getGroupById);                    // all roles
router.post('/', checkRole(['coordinator']), ctrl.createGroup);
router.put('/:id', checkRole(['coordinator']), ctrl.updateGroup);
router.delete('/:id', checkRole(['coordinator']), ctrl.deleteGroup);

// Student enrollment management
router.post('/:id/enroll', checkRole(['coordinator']), ctrl.enrollStudent);
router.delete('/:id/enroll/:studentId', checkRole(['coordinator']), ctrl.unenrollStudent);
router.get('/:id/students', checkRole(['coordinator', 'teacher']), ctrl.getGroupStudents);

export default router;
