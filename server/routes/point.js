import express from 'express';
import socket from '../server';

const router = express.Router();

router.post('/', (req, res) => {
  if (req.body) {
    socket.emit('point', {
      view: req.body.view,
      pointForSave: req.body.pointForSave,
    });
  }
  res.end();
});

export default router;
