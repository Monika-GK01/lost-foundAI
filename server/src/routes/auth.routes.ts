import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller';
import { validate, authenticate, authRateLimiter } from '../middlewares';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);

export default router;
