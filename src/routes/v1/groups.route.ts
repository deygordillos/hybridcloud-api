import { Router } from 'express'
import { body, query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { checkJwtMiddleware } from '../../middlewares/check-jwt';
import { createGroup, updateGroup } from '../../controllers/groups.controller';

const router = Router();
router.post('/',
    [
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware,
    createGroup);

router.put('/:id', [
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware, 
    updateGroup);

export default router