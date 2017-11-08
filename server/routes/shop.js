import express from 'express';

import {
  Shop,
} from '../models';

const router = express.Router();


//매장 생성
router.post('/', (req, res) => {
  const shopTemp = {
    name: req.body.data.name,
    phone: req.body.data.phone,
  };

  const shop = new Shop(shopTemp);
  shop.save((err,result) => {
    if(err){
      return res.status(500).json({ message : '매장 생성 오류:'});
    }
    return res.json({
      data: result,
    });
  });

  return null;
});

//매장 리스트 반환
router.get('/', (req, res) => {
  Shop.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "매장 리스트 조회 오류 "});
      }
      return res.json({
        data: result,
      });
    });
});

//매장 반환
router.get('/:id', (req, res) => {
  Shop.findOne({ _id: req.params.id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '매장 조회 오류'});
      }
      return res.json({
        data: result,
      });
    });
});

//매장 수정
router.put('/:_id', (req, res) => {
  if(!req.params._id){
    return res.status(500).json({ message : '매장 수정 오류: _id가 전송되지 않았습니다.'});
  }

  const properties = [
    'name',
    'phone',
  ];
  const update = { $set: {} };
  for (const property of properties){
    if(Object.prototype.hasOwnProperty.call(req.body.data, property)){
      update.$set[property] = req.body.data[property];
    }
  }
  Shop.findOneAndUpdate(
    { _id : req.params._id },
    update,
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "매장 수정 오류 "});
      }
      return res.json({
        data: result,
      });
    },
  );
  return null;
});

//매장 삭제
/*
router.delete('/:_id', (req, res) => {
  if (!req.params._id) {
    return res.status(500).json({ message: '매장 삭제 오류: _id가 전송되지 않았습니다.' });
  }
  Shop.findOneAndRemove(
    { _id: req.params._id },
    (err, result) =>
      res.json({
        data: result,
      }),
  );
  return null;
});
*/
router.delete('/', (req, res) => {


  if (!req.body.data._id) {
    return res.status(500).json({ message: 'shop 삭제 오류: _id가 전송되지 않았습니다.' });
  }
  if(Array.isArray(req.body.data._id)) {
    // id 배열이 들어오면
    Shop.deleteMany({_id: req.body.data._id}, (err) => {
      if (err) {
        return res.status(500).json({message: 'shop 삭제 오류: DB 삭제에 문제가 있습니다.'});
      }
      res.json({
        message: '삭제완료',
      });
    });
  }
  else{
    Shop.findOneAndRemove(
      { _id: req.body.data._id },
      (err, result) =>
        res.json({
          data: result,
        }),
    );
  }
  return null;
});

// 매장 전체 삭제
router.delete('/all', (req, res) => {
  Shop.deleteMany(
    {},
    (err) => {
      if (err) {
        return res.status(500).json({ message: '매장 삭제 오류: DB 삭제에 문제가 있습니다.' });
      }
      res.json({
        message: '삭제완료',
      });
    },
  );
  return null;
});


export default router;