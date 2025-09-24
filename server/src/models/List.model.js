import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Board',
  },
  // We will add card ordering later
});

const List = mongoose.model('List', listSchema);

export default List;