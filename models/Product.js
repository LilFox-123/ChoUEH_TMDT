const mongoose = require('mongoose');

const UEH_FACULTIES = [
  'Kế toán',
  'Kinh tế',
  'Kinh doanh quốc tế',
  'Tài chính',
  'Luật',
  'Công nghệ thông tin'
];

const UEH_MEETING_POINTS = [
  'Cơ sở A - 59 Nguyễn Đình Chiểu',
  'Cơ sở B - 279 Nguyễn Tri Phương',
  'Cơ sở N - Nguyễn Văn Linh',
  'Thư viện',
  'Căn tin',
  'Sảnh chính'
];

const PREFERRED_TIME_SLOTS = [
  'Sau tiết 2',
  'Sau tiết 4',
  'Buổi trưa 11h-13h',
  'Buổi chiều 15h-17h'
];

const LISTING_TYPES = ['sell', 'wanted'];
const URGENCY_LEVELS = ['low', 'medium', 'high'];

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề'],
    trim: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự']
  },
  listingType: {
    type: String,
    enum: {
      values: LISTING_TYPES,
      message: 'Loại bài đăng không hợp lệ'
    },
    default: 'sell'
  },
  price: {
    type: Number,
    min: [0, 'Giá không được âm']
  },
  budgetMin: {
    type: Number,
    min: [0, 'Ngân sách tối thiểu không được âm']
  },
  budgetMax: {
    type: Number,
    min: [0, 'Ngân sách tối đa không được âm'],
    validate: {
      validator(value) {
        return value === undefined || this.budgetMin === undefined || value >= this.budgetMin;
      },
      message: 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu'
    }
  },
  urgency: {
    type: String,
    enum: {
      values: URGENCY_LEVELS,
      message: 'Mức độ gấp không hợp lệ'
    },
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: {
      values: ['sach', 'dien-tu', 'do-dung', 'thoi-trang', 'xe', 'khac'],
      message: 'Danh mục không hợp lệ'
    }
  },
  condition: {
    type: String,
    enum: ['new', 'used'],
    default: 'used'
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả'],
    maxlength: [2000, 'Mô tả không quá 2000 ký tự']
  },
  location: {
    type: String,
    default: 'Cơ sở A - 59C Nguyễn Đình Chiểu'
  },
  courseCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Mã môn không quá 20 ký tự']
  },
  courseName: {
    type: String,
    trim: true,
    maxlength: [200, 'Tên môn không quá 200 ký tự']
  },
  faculty: {
    type: String,
    trim: true,
    enum: {
      values: UEH_FACULTIES,
      message: 'Khoa không hợp lệ'
    }
  },
  academicYear: {
    type: String,
    trim: true,
    maxlength: [20, 'Niên khóa không quá 20 ký tự']
  },
  semester: {
    type: Number,
    enum: [1, 2]
  },
  suitableForYear: [{
    type: Number,
    enum: [1, 2, 3, 4]
  }],
  meetingPoints: [{
    type: String,
    enum: {
      values: UEH_MEETING_POINTS,
      message: 'Điểm hẹn không hợp lệ'
    }
  }],
  preferredTimeSlots: [{
    type: String,
    enum: {
      values: PREFERRED_TIME_SLOTS,
      message: 'Khung giờ giao nhận không hợp lệ'
    }
  }],
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  transactionStatus: {
    type: String,
    enum: ['available', 'negotiating', 'deposited', 'sold'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.index({
  title: 'text',
  description: 'text',
  courseCode: 'text',
  courseName: 'text'
});
productSchema.index({ listingType: 1, category: 1, price: 1, createdAt: -1 });
productSchema.index({ listingType: 1, courseCode: 1, faculty: 1 });

productSchema.virtual('timeAgo').get(function timeAgo() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return this.createdAt.toLocaleDateString('vi-VN');
});

productSchema.statics.getCategoryLabel = function getCategoryLabel(category) {
  const labels = {
    sach: 'Sách & Tài liệu',
    'dien-tu': 'Điện tử',
    'do-dung': 'Đồ dùng',
    'thoi-trang': 'Thời trang',
    xe: 'Xe & Phương tiện',
    khac: 'Khác'
  };

  return labels[category] || 'Khác';
};

module.exports = mongoose.model('Product', productSchema);
