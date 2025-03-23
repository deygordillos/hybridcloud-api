import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { createGroup, updateGroup } from '../../controllers/groups.controller';

const router = Router();
router.post('/',
    [
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
    ],
    validatorRequestMiddleware,
    authMiddleware,
    createGroup);

router.put('/:id', [
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
    ],
    validatorRequestMiddleware,
    authMiddleware, 
    updateGroup);

export default router