import { Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { IRequestWithUser } from './interfaces';

export const checkAuth = (req: IRequestWithUser, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.status(401).json({ message: 'No token provided.' });
        return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        res.status(401).json({ message: 'Malformed authorization header.' });
        return;
    }

    try {
        req.userData = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
