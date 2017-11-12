import express from 'express';
import passport from 'passport';
import promise from 'es6-promise';
const Strategy = require('passport-http-bearer').Strategy;
import socket from '../server';
promise.polyfill();
import {
  Order,
} from '../models';

const router = express.Router();
//주문 생성
router.post('/', (req, res) => {
  socket.emit('create', req.body.data);
  res.json({ data: true });
});

//order 리스트 조회
router.get('/', (req, res) => {
  Order.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "주문 리스트 조회 오류 "});
      }
      return res.json({
        data: result,
      });
    });
});

//order 단일 조회
router.get('/:_id',
  (req, res) => {
  Order.findOne({ _id: req.params._id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '주문 조회 오류'});
      }
      return res.json({
        data: result,
      });
    });
});

router.post('/deliver', (req, resp) => {
  if(!req.body.data._id){
    return resp.status(500).json({ message : '주문 수정 오류: _id가 전송되지 않았습니다.'});
  }

  Order.findOneAndUpdate(
    { _id : req.body.data._id },
    { delivered: { $set: true } },
    (err, result) => {
      if(err) {
        return resp.status(500).json({ message: "주문 수정 오류 "});
      }
      return fetch('http://localhost:4000/api/order/delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { _id: req.body.data._id },
        }),
      })
        .then((res) => {
          if (res.ok) { return res.json(); }
          return res.json().then((error) => {
            throw error;
          });
        })
        .then((res) => {
          return resp.json({
            data: result,
          });
        });
    },
  );
  return null;
});

//주문 수정
router.put('/', (req, res) => {
  if(!req.body.data._id){
    return res.status(500).json({ message : '주문 수정 오류: _id가 전송되지 않았습니다.'});
  }

  const properties = [
    'shop',
    'products',
    'customer',
    'nfc',
    'place',
    'orderedWay',
    'datetime',
    'payment',
    'message',
    'status',
  ];
  const update = { $set: {} };
  for (const property of properties){
    if(Object.prototype.hasOwnProperty.call(req.body.data, property)){
      update.$set[property] = req.body.data[property];
    }
  }
  Order.findOneAndUpdate(
    { _id : req.body.data._id },
    update,
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "주문 수정 오류 "});
      }
      return res.json({
        data: result,
      });
    },
  );
  return null;
});

//주문 삭제
/*
router.delete('/:_id', (req, res) => {
  if (!req.params._id) {
    return res.status(500).json({ message: '주문 삭제 오류: _id가 전송되지 않았습니다.' });
  }
  Order.findOneAndRemove(
    { _id: req.params._id },
    (err, result) =>
      res.json({
        data: result,
      }),
  );
  return null;
});
*/

// order 여러개 삭제
router.delete('/', (req, res) => {
  if(Array.isArray(req.body.data)) {
    const _ids = req.body.data.map(o => o._id);
    Order.deleteMany({_id: { $in: _ids } }, (err) => {
      if (err) {
        return res.status(500).json({message: 'order 삭제 오류: DB 삭제에 문제가 있습니다.'});
      }
      res.json({
        data: { message: '삭제완료' },
      });
    });
  }
  else {
    if (!req.body.data._id) {
      return res.status(500).json({message: 'order 삭제 오류: _id가 전송되지 않았습니다.'});
    }
    Order.findOneAndRemove(
      { _id: req.body.data._id },
      (err, result) =>
        res.json({
          data: result,
        }),
    );
  }
  return null;
});

// 주문 전체 삭제
router.delete('/all', (req, res) => {
  Order.deleteMany(
    {},
    (err) => {
      if (err) {
        return res.status(500).json({ message: '주문 삭제 오류: DB 삭제에 문제가 있습니다.' });
      }
      res.json({
        message: '삭제완료',
      });
    },
  );
  return null;
});


export default router;