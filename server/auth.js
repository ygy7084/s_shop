import express from 'express';
import passport from 'passport';

const Strategy = require('passport-http-bearer').Strategy;

import { Account } from './models';
import { Shop } from './models';

const router = express.Router();

passport.use(new Strategy(
  ((token, cb) => {
    Account.findOne({ _id: token }).lean().exec((err, result) => {
      if (err) {
        return cb(null, false);
      }
      if (!result) { return cb(null, false); }
      if (!result.shop || !result.shop._id) {
        return done(null, false, { message: 'No related Shop.' });
      }
      return cb(null, {
        shop: result.shop,
      });
    });
  })));
// [END setup]
// [START authorize]
router.post('/auth/login', (req, res) => {
  Account.findOne({
    username: req.body.data.username,
    password: req.body.data.password,
  }).lean().exec((err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '로그인 실패' });
    }
    if (!result) {
      return res.status(500).json({ message: '로그인 실패' });
    }
    if (!result.shop || !result.shop._id) {
      return res.status(500).json({ message: '로그인 실패' });
    }
    res.cookie('account', String(result._id), { expires: new Date(Date.now() + 90000000), signed: false });
    return res.json({
      data: {
        shop: result.shop,
      }
    });
  });
});
router.get('/auth',
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
  // If user is not stored in session, it will return undefined.
    if (!req.user) {
      return res.status(400).json({ message: '로그인하십시요.', behavior: 'redirectToLogin' });
    }
    // If user connect again within 5min from last connection,
    // the expiration time is renewed.
    return res.json({ data: req.user });
  });
export default router;
