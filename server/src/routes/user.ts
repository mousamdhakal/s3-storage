import express from 'express';
import { changePassword, updateUser } from '../controller/user';

const router = express.Router();

router.put('/password', changePassword);

router.put('/profile', updateUser);

export default router;
