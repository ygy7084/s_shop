import express from 'express';

import {
  Customer,
} from '../models';

const router = express.Router();


//고객 생성
router.post('/', (req, res) => {
  const customerTemp = {
    phone: req.body.data.phone,
    point : 0,
  };

  const customer = new Customer(customerTemp);
  customer.save((err,result) => {
    if(err){
      return res.status(500).json({ message : '고객 생성 오류:'});
    }
    return res.json({
      data: result,
    });
  });
  return null;
});


router.post('/PointSave', (req, res) => {
  //let phone = req.body.data.phone;
  let id_check;
  Customer.findOne({ phone: req.body.data.phone })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '고객 조회 오류'});
      }
      console.log(result);
      if(!result){
        console.log("등록된 고객이 아닙니다. 신규 등록후 포인트 적립 진행");
        const customerTemp ={
          phone: req.body.data.phone,
          point : 1,
        };
        const customer = new Customer(customerTemp);
        customer.save((err,resultc) => {
          if(err){
            return res.status(500).json({ message : '고객 생성 오류 '});
          }
          console.log(resultc);
          return res.json({
            data: resultc,
          });
        });
      }
      else{
        console.log('포인트 추가');
        /*
        const properties = [
          'point',
        ];

        const update = {$set: {}};
        for (const property of properties) {
          if (Object.prototype.hasOwnProperty.call(req.body.data, property)) {
            update.$set[property] = req.body.data[property] + 1;
          }
        }*/
        Customer.findOneAndUpdate(
          {phone: req.body.data.phone},
          {$inc: {point: 1}},
          (err, result) => {
            if (err) {
              return res.status(500).json({message: "포인트 적립 오류 "});
            }
            return res.json({
              data: result,
            });
          },
        );
      }

    });


  /*
  if(!req.body.data.phone){
    // 번호로 저장된 id가 없는경우 customer 등록 후 pointSave
    const customerTemp = {

    }

  }
  else {
    const properties = [
      'point',
    ];

    const update = {$set: {}};
    for (const property of properties) {
      if (Object.prototype.hasOwnProperty.call(req.body.data, property)) {
        update.$set[property] = req.body.data[property] + 1;
      }
    }
    Customer.findOneAndUpdate(
      {phone: req.body.data.phone},
      update,
      (err, result) => {
        if (err) {
          return res.status(500).json({message: "포인트 적립 오류 "});
        }
        return res.json({
          data: result,
        });
      },
    );
  }
  */

  return null;

});



//고객 리스트 반환
router.get('/', (req, res) => {
  Customer.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "고객 리스트 조회 오류 "});
      }
      return res.json({
        data: result,
      });
    });
});

//고객 반환
router.get('/:id', (req, res) => {
  Customer.findOne({ _id: req.params.id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '고객 조회 오류'});
      }
      return res.json({
        data: result,
      });
    });
});

//고객 수정
router.put('/', (req, res) => {
  if(!req.body.data._id){
    return res.status(500).json({ message : '고객 수정 오류: _id가 전송되지 않았습니다.'});
  }

  const properties = [
    'phone',
  ];
  const update = { $set: {} };
  for (const property of properties){
    if(Object.prototype.hasOwnProperty.call(req.body.data, property)){
      update.$set[property] = req.body.data[property];
    }
  }
  Customer.findOneAndUpdate(
    { _id : req.body.data._id },
    update,
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "고객 수정 오류 "});
      }
      return res.json({
        data: result,
      });
    },
  );
  return null;
});

//고객 삭제
router.delete('/', (req, res) => {
  if (!req.body.data._id) {
    return res.status(500).json({ message: '고객 삭제 오류: _id가 전송되지 않았습니다.' });
  }
  Customer.findOneAndRemove(
    { _id: req.body.data._id },
    (err, result) =>
      res.json({
        data: result,
      }),
  );
  return null;
});

// 계정 전체 삭제
router.delete('/all', (req, res) => {
  Customer.deleteMany(
    {},
    (err) => {
      if (err) {
        return res.status(500).json({ message: '고객 전체 삭제 오류: DB 삭제에 문제가 있습니다.' });
      }
      res.json({
        message: '삭제완료',
      });
    },
  );
  return null;
});


export default router;