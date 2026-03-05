// eslint-disable-next-line @typescript-eslint/no-require-imports
import type { Request } from 'express';
import type { JwtPayload } from '../config/jwt';

// Extends the Express Request with the decoded JWT payload.
// params / body / query are all inherited from Request.
export interface IRequestWithUser extends Request {
    userData?: JwtPayload;
}
