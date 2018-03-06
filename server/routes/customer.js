/* global fetch */
import express from 'express';
import { Customer } from '../models';

const router = express.Router();

// 고객이 번호를 입력하고 포인트 적립 요청
router.put('/memo', (req, res) => {
  const { id, memo } = req.body;
  Customer.updateOne({
    _id: id,
  }, {
    $set: {
      memo,
    },
  })
    .then((r) => {
      res.json({ data: true });
    })
    .catch(() => {
      res.status.json({ message: '에러' });
    });
});
export default router;
