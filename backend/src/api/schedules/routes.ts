import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { checkRole } from '../../middlewares/checkRole';
import * as ctrl from './controller';

const router = Router();

router.use(checkAuth);

router.get('/', ctrl.getSchedules);                          // all roles
router.post('/', checkRole(['coordinator']), ctrl.createSchedule);
router.put('/:id', checkRole(['coordinator']), ctrl.updateSchedule);
router.delete('/:id', checkRole(['coordinator']), ctrl.deleteSchedule);

export default router;
