const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UEH_EMAIL_REGEX = /(@student\.ueh\.edu\.vn|@ueh\.edu\.vn)$/i;
const UEH_STUDENT_ID_REGEX = /^31\d{9}$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [100, 'Tên không quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    validate: {
      validator: (value) => UEH_EMAIL_REGEX.test(value),
      message: 'Email phải là email UEH (@student.ueh.edu.vn)'
    }
  },
  studentId: {
    type: String,
    required: [true, 'Vui lòng nhập MSSV'],
    unique: true,
    trim: true,
    validate: {
      validator: (value) => UEH_STUDENT_ID_REGEX.test(value),
      message: 'MSSV không hợp lệ'
    }
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    default: 'Khoa Kinh tế'
  },
  year: {
    type: String,
    default: 'Khóa 49'
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu ít nhất 6 ký tự'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Giới thiệu không quá 500 ký tự']
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
