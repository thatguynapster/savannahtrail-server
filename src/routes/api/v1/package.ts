
import { Router } from 'express';
import * as packageController from '../../../controllers/package';
import * as packageValidator from '../../../validators/package';

const router = Router();

router.get('/', packageController.getPackagesController);
router.post('/', packageValidator.createPackage, packageController.createPackageController);
router.get('/:id', packageController.getPackageByIdController);
router.put('/:id', packageValidator.updatePackage, packageController.updatePackageController);
router.delete('/:id', packageController.deletePackageController);

export default router;
