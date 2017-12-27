import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Account = new mongoose.Schema({
  username: String,
  password: String,
  shop:
  {
    _id: { type: Schema.Types.ObjectId, ref: 'shop' },
    name: String,
  },
  level : String,
});

Account.index({ username: 1 }, { unique: true });

const model = mongoose.model('account', Account);

export default model;
