import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import mongoose from 'mongoose';
import MongoConnect from 'connect-mongo';
import cors from 'cors';
import http from 'http';
import socket from 'socket.io';
import configure from './configure';
import { Account } from './models';

// 서버사이드 ajax를 위한 fetch
import 'isomorphic-fetch';

// api 라우트 로드
import api from './routes';
// 인증
import auth from './auth';
// 서버와 포트 초기화

const app = express();
const port = configure.PORT;

// 정적 파일 라우트 (CORS 밑에 두면 안된다 - 일반적으로 브라우저로 조회하기 때문)
app.use('/', express.static(path.join(__dirname, './../public')));

// 몽고디비 연결 설정
const db = mongoose.connection;
mongoose.connect(configure.MONGO_URL, {
  useMongoClient: true,
});

// Mongoose 모듈의 Promise 변경 - 모듈 권고사항 (deprecated)
mongoose.Promise = global.Promise;

// 몽고디비 연결
db.on('error', console.error);
db.once('open', () => {
  console.log(`[MONGO DB URL] : ${configure.MONGO_URL}`);
  Account.find({}).lean().exec((err, result) => {
    if (err) {
      console.log('DB ERROR', err);
    } else if (result.length === 0) {
      const account = new Account({ username: '0', password: '0', level: 'manager' });
      account.save((err) => {
        if (err) {
          console.log('Error while inserting First Manager', err);
        }
        console.log('[First Manager Account Inserted] username: 0, password: 0');
        return null;
      });
    } else {
      return null;
    }
  });
});

// 쿠키 사용
app.use(cookieParser());

// POST 연결을 위한 설정
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.enable('trust proxy');

//====Passport 사용 === dh//
import passport from 'passport';
import flash from 'connect-flash';

const MongoStore = MongoConnect(session);
const sessionConfig = {
  secret: configure.SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(auth);

// API 라우트
app.use('/api', api);

// 404 에러
app.use((req, res) => {
  res.status(404).send('NOT FOUND');
});

// 서버 시작
const httpApp = http.Server(app);
const io = socket(httpApp);
io.on('connection', (socket) => {

});
httpApp.listen(port, () => {
  console.log(`Server is listening on this port : ${port}`);
});
export default io;
