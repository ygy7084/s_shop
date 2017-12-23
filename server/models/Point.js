import mongoose from 'mongoose';

const { Schema } = mongoose;
const Point = new Schema({
  shop: {
    _id: { type: Schema.Types.ObjectId, ref: 'shop' },
  },
  customer: {
    _id: { type: Schema.Types.ObjectId, ref: 'customer' },
  },
  pointChange: Number,
  datetime: Date,
});
const model = mongoose.model('point', Point);
export default model;
