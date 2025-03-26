import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { GroupController } from '../../controllers/groups.controller';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = Router();
router.post('/',
    [
        authMiddleware,
        adminMiddleware,
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware
    ],
    GroupController.create);

router.put('/:id', 
    [
        authMiddleware,
        adminMiddleware,
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware,
    ],
    GroupController.update);

router.patch('/:id', 
    [
        authMiddleware,
        adminMiddleware,
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware,
    ],
    GroupController.update);
export default router