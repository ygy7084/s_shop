/* global fetch */
import express from 'express';
import { Types } from 'mongoose';
import socket from '../server';
import configure from '../configure';
import { Point, Customer } from '../models';

const router = express.Router();

// 매장으로부터 포인트 적립 화면 요청
router.post('/request', (req, res) => {
  const { point } = req.body.data;
  if (!point) {
    return res.status(500).json({ message: '포인트가 입력되지 않았습니다.' });
  }
  // 매장의 포인트 적립 페이지로 포인트 적립 화면 띄우기
  socket.emit('point', {
    view: 'SavingPoint',
    pointForSave: point,
  });
  return res.json({ data: { success: true } });
});
// 고객이 번호를 입력하고 포인트 적립 요청
router.post('/save', (req, res) => {
  if (!req.body.data) {
    // 매장에 포인트 실패 알림
    socket.emit('pointSaved', {
      status: 'failure',
    });
    return res.status(500).json({ message: '서버로 POST data가 넘어오지 않았습니다.' });
  }
  if (
    !Object.prototype.hasOwnProperty.call(req.body.data, 'shopId') ||
    !Object.prototype.hasOwnProperty.call(req.body.data, 'phone') ||
    !Object.prototype.hasOwnProperty.call(req.body.data, 'point') ||
    req.body.data.phone.length < 4
  ) {
    // 매장에 포인트 실패 알림
    socket.emit('pointSaved', {
      status: 'failure',
    });
    return res.status(500).json({ message: '적절한 데이터가 전송되지 않았습니다.' });
  }
  // 기존 고객 정보가 있는지 확인
  return Customer
    .findOne({ phone: req.body.data.phone })
    .lean()
    .exec((error, result) => {
      if (error) {
        return res.status(500).json({ message: 'DB 에러가 있습니다.', error });
      }
      // Promise 프로세스
      // 고객 정보 확인 -> 포인트 적립 -> 전체 포인트 확인 , 에러 체크
      return new Promise((resolve, reject) => {
        // 고객 정보 확인
        if (result) {
          // 기존 고객 정보 있음
          return resolve(result);
        }
        // 기존 고객 정보 없어, 저장 후 고객 정보 전달
        const newCustomer = new Customer({ phone: req.body.data.phone });
        return newCustomer.save((error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        });
      })
        .then((customer) => {
          // 포인트 적립
          const newPoint = new Point({
            shop: {
              _id: req.body.data.shopId,
            },
            customer: {
              _id: customer._id,
            },
            pointChange: req.body.data.point,
            datetime: new Date(),
          });
          return new Promise((resolve, reject) => {
            newPoint.save((error) => {
              if (error) {
                return reject(error);
              }
              // 포인트 저장 결과는 필요 없다.
              return resolve(customer);
            });
          });
        })
        .then((customer) => {
          // 적립된 총 포인트 확인
          return Point.aggregate([
            {
              $match: { 'customer._id': Types.ObjectId(customer._id) },
            },
            {
              $group: {
                _id: customer._id,
                point: { $sum: '$pointChange' },
              },
            },
          ])
            .then((result) => {
              if (!result || !result.length) {
                throw new Error('DB 에러가 있습니다.');
              }
              // 매장에 포인트 성공 알림
              socket.emit('pointSaved', {
                status: 'success',
                customer,
                point: result[0].point,
              });
              fetch(`${configure.PUSH_SERVER_URL}/api/push/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: {
                    to: `82${req.body.data.phone.slice(1, req.body.data.phone.length)}`,
                    message: `적립 포인트: ${req.body.data.point}, 적립 총 포인트는 ${result[0].point}점입니다. - 마므레`,
                  },
                }),
              });
              return res.json({
                data: {
                  customer,
                  point: result[0].point,
                },
              });
            })
            .catch((error) => {
              throw error;
            });
        })
        .catch((error) => {
          // 매장에 포인트 실패 알림
          socket.emit('pointSaved', {
            status: 'failure',
          });
          return res.status(500).json({
            message: 'DB 에러가 있습니다.',
            error,
          });
        });
    });
});
export default router;
