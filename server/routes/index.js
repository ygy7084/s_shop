import express from 'express';

import account from './account';
import order from './order';
import point from './point';
import customer from './customer';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);
router.use('/point', point);
router.use('/customer', customer);

export default router;
