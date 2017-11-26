import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import { Account } from '../server/models/index';
import { Shop } from '../server/models/index';

const router = express.Router();
const LocalStrategy = passportLocal.Strategy;

passport.use('account',new LocalStrategy((username, password, done) => {
  Account.findOne({ username }, (err, account) => {
    console.log(account.shop._id);
    if (err) { return done(err); }
    if (!account) {
      return done(null, false, { message: 'Incorrect Username.' });
    }
    if (account.password !== password) {
      return done(null, false, { message: 'Incorrect Password.' });
    }
    if(!account.shop._id){
      console.log('no related shop');
      return done(null, false, { message: 'No related Shop.'});
    }
    return done(null, {
      kind: 'account',
      account: {
        _id: account._id,
        username,
        level: account.level,
        shop_id: account.shop._id,
      }
    });
  });
}));
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
// [END setup]

// [START authorize]
router.post('/auth/login', (req, res, next) => {
  console.log('/auth/login 요청됨');
  passport.authenticate('account', (err, account, info) => {
    if (err) res.status(500).json(err);
    if (!account) { return res.status(400).json(info.message); }
    req.logIn(account, (err) => {
      if (err) { return next(err); }
      return res.json({
        data: account,
      });
    });
  })(req, res, next);
});
router.get('/auth/logout', (req, res) => {
  console.log('logout 호출됨');
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.send({
      data: true,
    });
  });
});

router.get('/auth', (req, res) => {
  console.log('/auth 요청됨');
  // If user is not stored in session, it will return undefined.
  if (!req.user) {
    return res.status(400).json({ message: '로그인하십시요.', behavior: 'redirectToLogin' });
  }
  req.user.cookie = req.headers.cookie;
  // If user connect again within 5min from last connection,
  // the expiration time is renewed.
  return res.json({ data: req.user });
});
router.use((req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }
  next();
});
export default router;
