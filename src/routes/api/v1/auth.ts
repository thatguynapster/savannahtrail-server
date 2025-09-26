import { Router } from 'express';
import { createUserController, loginController, logoutController, refreshTokenController } from '../../../controllers/authController';

const router = Router();

/**
 * POST /auth/login
 * body: { email, password }
 */
router.post('/login', loginController);

/**
 * POST /auth/logout
 * clears refresh cookie and bumps tokenVersion (all devices) if user attached
 */
router.post('/logout', logoutController);

/**
 * POST /auth/refresh
 * uses httpOnly cookie by default, or body.refresh_token for scripts
 */
router.post('/refresh', refreshTokenController);


router.post('/create-user', createUserController);

export { router as authRouter };
