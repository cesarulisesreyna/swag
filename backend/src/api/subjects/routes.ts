import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.get('/', ctrl.getSubjects);               // all roles
router.get('/:id', ctrl.getSubjectById);          // all roles
router.post('/', checkRole(['coordinator']), ctrl.createSubject);
router.put('/:id', checkRole(['coordinator']), ctrl.updateSubject);
router.delete('/:id', checkRole(['coordinator']), ctrl.deleteSubject);

export default router;
