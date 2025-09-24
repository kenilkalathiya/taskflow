import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'List',
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Board',
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model('Card', cardSchema);

export default Card;