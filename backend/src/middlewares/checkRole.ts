import { Response, NextFunction } from 'express';
import { IRequestWithUser } from './interfaces';
import { UserRole } from '../models/User';

export const checkRole = (allowedRoles: UserRole[]) =>
    (req: IRequestWithUser, res: Response, next: NextFunction): void => {
        if (!req.userData) {
            res.status(403).json({ message: 'Unauthorized.' });
            return;
        }

        if (!allowedRoles.includes(req.userData.role)) {
            res.status(403).json({
                message: `Access restricted to: ${allowedRoles.join(', ')}.`,
            });
            return;
        }

        next();
    };