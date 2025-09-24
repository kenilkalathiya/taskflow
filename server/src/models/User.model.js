import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'], // Basic email regex validation
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// --- Password Hashing Middleware ---
// This pre-save hook will hash the password before saving a new user or updating a password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // Only hash if the password field is new or modified
    next();
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// --- Method to Compare Passwords ---
// This method will be available on user documents to check if a provided password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;