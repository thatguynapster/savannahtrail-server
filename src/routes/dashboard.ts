import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard';

const router = Router();

router.get('/kpis', dashboardController.getKpis);

export default router;