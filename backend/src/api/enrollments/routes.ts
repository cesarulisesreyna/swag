import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.get('/', checkRole(['coordinator', 'teacher']), ctrl.getEnrollments);
router.get('/:id', checkRole(['coordinator', 'teacher']), ctrl.getEnrollmentById);
router.post('/', checkRole(['coordinator']), ctrl.createEnrollment);
router.patch('/:id/status', checkRole(['coordinator']), ctrl.updateEnrollmentStatus);

export default router;
