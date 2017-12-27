import express from 'express';

import account from './account';
import order from './order';
import point from './point';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);
router.use('/point', point);

export default router;
