import mongoose from 'mongoose';
import { Customer, Point } from './server/models';

const { Schema } = mongoose;
const m = new Schema({
  name: String,
  num: Number,
});
const Test = mongoose.model('test', m);

const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/ours', {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;
db.on('error', console.error);
db.once('open', () => {
  // Test.find({})
  //   .then((result) => {
  //     console.log(result);
  //   })
  Point.aggregate([
    {
      $match: { 'customer._id': mongoose.Types.ObjectId("5a3df704efc7a512f8aaa6ab")},
    },
    {
      $group: {
        _id: 'aa',
        point: { $sum: '$pointChange' },
      },
    },
  ])
    .then(console.log)
    .catch(console.error);
});