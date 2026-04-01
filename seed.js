const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Nguyễn Văn An',
        email: 'an.nguyen@st.ueh.edu.vn',
        studentId: '31211020001',
        phone: '0901234567',
        department: 'Khoa Công nghệ thông tin kinh doanh',
        year: 'Khóa 49',
        password: '123456',
        role: 'admin'
      },
      {
        name: 'Trần Thị Bảo',
        email: 'bao.tran@st.ueh.edu.vn',
        studentId: '31211020002',
        phone: '0912345678',
        department: 'Khoa Kinh tế',
        year: 'Khóa 48',
        password: '123456'
      },
      {
        name: 'Lê Minh Châu',
        email: 'chau.le@st.ueh.edu.vn',
        studentId: '31211020003',
        phone: '0923456789',
        department: 'Khoa Tài chính',
        year: 'Khóa 49',
        password: '123456'
      },
      {
        name: 'Phạm Hoàng Duy',
        email: 'duy.pham@st.ueh.edu.vn',
        studentId: '31211020004',
        phone: '0934567890',
        department: 'Khoa Quản trị kinh doanh',
        year: 'Khóa 48',
        password: '123456'
      },
      {
        name: 'Võ Thanh Hà',
        email: 'ha.vo@st.ueh.edu.vn',
        studentId: '31211020005',
        phone: '0945678901',
        department: 'Khoa Kế toán',
        year: 'Khóa 49',
        password: '123456'
      }
    ]);
    console.log(`👥 Created ${users.length} users`);

    // Create products
    const products = await Product.create([
      // ═══════════════════════════════════════
      // SÁCH & TÀI LIỆU (chủ lực)
      // ═══════════════════════════════════════
      {
        title: 'Giáo trình Kinh tế Vi mô - N. Gregory Mankiw (bản dịch UEH)',
        price: 120000,
        category: 'sach',
        condition: 'used',
        description: 'Sách đã sử dụng 1 học kỳ, còn mới 90%. Có highlight vài chỗ quan trọng bằng bút dạ quang. Giáo trình chính thức dùng cho môn Kinh tế Vi mô tại UEH, do Khoa Kinh tế biên dịch. NXB Hồng Đức.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[0]._id
      },
      {
        title: 'Giáo trình Kinh tế Vĩ mô - Mankiw (Macroeconomics)',
        price: 130000,
        category: 'sach',
        condition: 'used',
        description: 'Sách Kinh tế Vĩ mô bản dịch chính thức UEH. Đã học xong học phần, sách còn đẹp, không rách, có ghi chú bên lề bằng bút chì. Phù hợp cho sinh viên K49, K50.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'Nguyên lý Kế toán - TS. Phan Đức Dũng (tái bản lần 5)',
        price: 85000,
        category: 'sach',
        condition: 'used',
        description: 'Sách Nguyên lý Kế toán dùng cho sinh viên năm nhất tất cả các khoa. Sách còn mới 85%, có đánh dấu một số bài tập quan trọng. Mua mới 145.000đ.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[4]._id
      },
      {
        title: 'Bộ sách CFA Level 1 – Schweser Notes 2024 (5 quyển)',
        price: 800000,
        category: 'sach',
        condition: 'used',
        description: 'Bộ 5 quyển Schweser Notes cho CFA Level 1 năm 2024. Sách in màu rõ nét, có highlight những phần trọng tâm. Thích hợp cho sinh viên Tài chính - Ngân hàng chuẩn bị thi CFA.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[2]._id
      },
      {
        title: 'Giáo trình Marketing căn bản - Philip Kotler (bản dịch)',
        price: 95000,
        category: 'sach',
        condition: 'used',
        description: 'Giáo trình Marketing căn bản của Philip Kotler, bản dịch tiếng Việt. Dùng cho môn Marketing căn bản K48, K49. Sách còn tốt, bìa hơi xước nhẹ.',
        location: 'Cơ sở N - Nguyễn Hữu Thọ',
        images: [],
        seller: users[3]._id
      },
      {
        title: 'Giáo trình Quản trị học - TS. Nguyễn Hải Sản',
        price: 75000,
        category: 'sach',
        condition: 'used',
        description: 'Sách Quản trị học dùng cho sinh viên Quản trị Kinh doanh. Học xong rồi pass lại. Còn mới 80%, có vài trang bị gấp góc đánh dấu.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[3]._id
      },
      {
        title: 'Slide bài giảng + Đề thi Toán Kinh tế (file in, 320 trang)',
        price: 65000,
        category: 'sach',
        condition: 'used',
        description: 'Tổng hợp toàn bộ slide bài giảng môn Toán Kinh tế + 10 đề thi kèm đáp án chi tiết. Đã in sẵn, đóng cuốn bìa cứng. Rất tiện ôn thi cuối kỳ.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[0]._id
      },
      {
        title: 'Giáo trình Luật Kinh tế (NXB Đại học Quốc gia)',
        price: 90000,
        category: 'sach',
        condition: 'used',
        description: 'Giáo trình Luật Kinh tế mới nhất, dùng cho môn Pháp luật đại cương và Luật kinh doanh. Sách còn rất đẹp, chỉ đọc 1 lần.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'Combo 3 cuốn: Xác suất Thống kê + Toán cao cấp 1 + Toán cao cấp 2',
        price: 200000,
        category: 'sach',
        condition: 'used',
        description: 'Bán combo 3 cuốn sách Toán dùng cho năm nhất UEH. Sách đã qua sử dụng nhưng còn nguyên vẹn, có giải bài tập mẫu viết bút chì. Mua lẻ giá cao hơn nhé.',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[2]._id
      },
      {
        title: 'Sách Tiếng Anh thương mại - Business English (Oxford)',
        price: 110000,
        category: 'sach',
        condition: 'used',
        description: 'Market Leader 3rd Edition – Upper Intermediate. Sách tiếng Anh thương mại dùng cho môn Anh văn chuyên ngành. Kèm workbook. Còn mới 90%.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[4]._id
      },
      {
        title: 'Giáo trình Tài chính Doanh nghiệp - PGS.TS Nguyễn Thu Hiền',
        price: 100000,
        category: 'sach',
        condition: 'used',
        description: 'Giáo trình chính thức môn Tài chính Doanh nghiệp tại UEH. Sách hay, trình bày rõ ràng. Đã học xong pass lại cho các bạn K50.',
        location: 'Cơ sở N - Nguyễn Hữu Thọ',
        images: [],
        seller: users[2]._id
      },
      {
        title: 'Tài liệu ôn thi TOEIC 650+ (bộ 4 cuốn Barron\'s + ETS)',
        price: 250000,
        category: 'sach',
        condition: 'used',
        description: 'Bộ tài liệu ôn thi TOEIC gồm Barron\'s TOEIC 7th + ETS 2024 (2 cuốn LC + RC) + sổ tay từ vựng tự tổng hợp. Đủ để đạt 650+. Thi xong bán lại.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[0]._id
      },
      {
        title: 'Giáo trình Kinh tế lượng - Nguyễn Quang Dong',
        price: 80000,
        category: 'sach',
        condition: 'used',
        description: 'Giáo trình Kinh tế lượng ứng dụng, có hướng dẫn sử dụng Eviews, SPSS. Sách kèm bài tập và dữ liệu mẫu. Phù hợp cho SV năm 3.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'Sách Kế toán quản trị - Garrison (bản dịch lần 16)',
        price: 140000,
        category: 'sach',
        condition: 'new',
        description: 'Sách Kế toán quản trị Garrison bản mới nhất, mua về chưa dùng vì đổi chuyên ngành. Nguyên seal, giá gốc 220.000đ. Bán lỗ cho bạn nào cần.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[4]._id
      },
      {
        title: 'Bộ đề thi Nguyên lý Thống kê (5 năm gần nhất) - có đáp án',
        price: 45000,
        category: 'sach',
        condition: 'used',
        description: 'Tổng hợp đề thi Nguyên lý Thống kê 5 năm gần nhất (2019-2024) có lời giải chi tiết. In A4 đóng cuốn gọn gàng. Ôn là đậu!',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[0]._id
      },

      // ═══════════════════════════════════════
      // ĐIỆN TỬ
      // ═══════════════════════════════════════
      {
        title: 'Laptop Dell Inspiron 15 – Core i5 Gen 11, 8GB RAM, SSD 256GB',
        price: 8500000,
        category: 'dien-tu',
        condition: 'used',
        description: 'Laptop dùng 2 năm, pin trâu 6-7 tiếng, chạy mượt Word/Excel/PowerPoint và các phần mềm lập trình cơ bản. Tặng kèm túi chống sốc và chuột không dây Logitech.',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'Máy tính Casio fx-580VN X còn mới 99%',
        price: 350000,
        category: 'dien-tu',
        condition: 'new',
        description: 'Mua về chưa dùng được mấy lần. Còn hộp, còn bảo hành 1 năm tại Casio VN. Máy tính được phép sử dụng trong thi đại học và HSG.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[2]._id
      },
      {
        title: 'Tai nghe Sony WH-1000XM4 – Chống ồn chủ động',
        price: 3200000,
        category: 'dien-tu',
        condition: 'used',
        description: 'Tai nghe chống ồn chủ động Sony WH-1000XM4. Pin 30 tiếng, chống ồn cực tốt cho thư viện và quán cà phê. Đầy đủ phụ kiện, hộp zin, cáp sạc.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'iPad Gen 9 Wifi 64GB – Màn hình 10.2 inch',
        price: 5500000,
        category: 'dien-tu',
        condition: 'used',
        description: 'iPad Gen 9 dùng để ghi chú bài giảng và đọc tài liệu PDF. Pin tốt, màn hình không xước. Tặng kèm bao da và bút cảm ứng. Lý do bán: lên đời iPad Air.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[3]._id
      },
      {
        title: 'Chuột không dây Logitech M331 Silent Plus',
        price: 180000,
        category: 'dien-tu',
        condition: 'used',
        description: 'Chuột không dây Logitech M331, click êm không gây tiếng ồn, phù hợp dùng ở thư viện. Pin AA dùng 24 tháng. Còn mới 90%.',
        location: 'Cơ sở N - Nguyễn Hữu Thọ',
        images: [],
        seller: users[4]._id
      },

      // ═══════════════════════════════════════
      // ĐỒ DÙNG PHÒNG TRỌ
      // ═══════════════════════════════════════
      {
        title: 'Bàn học gấp gọn kèm ghế xếp – chất liệu gỗ MDF',
        price: 450000,
        category: 'do-dung',
        condition: 'used',
        description: 'Bàn học gấp gọn chất liệu gỗ MDF, kèm ghế xếp kim loại có đệm lưng. Chắc chắn, tiết kiệm diện tích phòng trọ. Dọn phòng nên bán lại.',
        location: 'Cơ sở N - Nguyễn Hữu Thọ',
        images: [],
        seller: users[2]._id
      },
      {
        title: 'Đèn bàn LED chống cận Rạng Đông – 3 chế độ sáng',
        price: 120000,
        category: 'do-dung',
        condition: 'used',
        description: 'Đèn bàn LED Rạng Đông RL-26, 3 chế độ ánh sáng (trắng/vàng/tự nhiên), chống cận thị. Dùng 6 tháng, còn tốt. Có kẹp bàn tiện lợi.',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[0]._id
      },
      {
        title: 'Quạt mini để bàn sạc USB – Có pin 4000mAh',
        price: 85000,
        category: 'do-dung',
        condition: 'used',
        description: 'Quạt mini để bàn có pin sạc USB, 3 tốc độ gió, chạy 6-8 tiếng. Nhỏ gọn mang đi học được. Bán vì sắp ra trường.',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[1]._id
      },

      // ═══════════════════════════════════════
      // THỜI TRANG
      // ═══════════════════════════════════════
      {
        title: 'Áo khoác hoodie UEH limited edition – UEH Fest 2024',
        price: 180000,
        category: 'thoi-trang',
        condition: 'new',
        description: 'Áo hoodie UEH phiên bản giới hạn từ sự kiện UEH Fest 2024. Size L, chưa mặc lần nào. Chất vải nỉ bông dày dặn, in logo UEH sắc nét.',
        location: 'Cơ sở A - 59C Nguyễn Đình Chiểu',
        images: [],
        seller: users[0]._id
      },
      {
        title: 'Áo thun UEH Orientation Week K49 – Size M',
        price: 60000,
        category: 'thoi-trang',
        condition: 'used',
        description: 'Áo thun tuần sinh hoạt đầu khóa K49, màu xanh navy, chất cotton 100%. Giặt không phai. Mặc 2 lần, pass lại cho bạn nào sưu tầm.',
        location: 'Cơ sở B - 279 Nguyễn Tri Phương',
        images: [],
        seller: users[3]._id
      },

      // ═══════════════════════════════════════
      // XE & PHƯƠNG TIỆN
      // ═══════════════════════════════════════
      {
        title: 'Xe đạp Fixed Gear – Khung nhôm nhẹ, bánh 700c',
        price: 1200000,
        category: 'xe',
        condition: 'used',
        description: 'Xe đạp Fixed Gear khung nhôm, bánh 700c, phanh đĩa cơ, yên Velo. Đi lại từ KTX đến trường rất tiện, khoảng 15 phút. Lý do bán: sắp ra trường về quê.',
        location: 'Ký túc xá 43-45 Nguyễn Chí Thanh',
        images: [],
        seller: users[1]._id
      },
      {
        title: 'Xe đạp gấp Hahoo – Bánh 20 inch, 6 tốc độ',
        price: 1800000,
        category: 'xe',
        condition: 'used',
        description: 'Xe đạp gấp Hahoo 20 inch, 6 tốc độ Shimano. Gấp gọn bỏ trong phòng trọ được. Dùng 1 năm, bảo dưỡng thường xuyên. Tặng kèm khóa dây.',
        location: 'Cơ sở N - Nguyễn Hữu Thọ',
        images: [],
        seller: users[3]._id
      }
    ]);
    console.log(`📦 Created ${products.length} products`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('---');
    console.log('Demo accounts (password: 123456):');
    users.forEach(u => console.log(`  📧 ${u.email} | MSSV: ${u.studentId} | Role: ${u.role || 'user'}`));
    console.log(`\n📊 Total: ${users.length} users, ${products.length} products`);
    console.log(`   Sách & TL: ${products.filter(p => p.category === 'sach').length}`);
    console.log(`   Điện tử: ${products.filter(p => p.category === 'dien-tu').length}`);
    console.log(`   Đồ dùng: ${products.filter(p => p.category === 'do-dung').length}`);
    console.log(`   Thời trang: ${products.filter(p => p.category === 'thoi-trang').length}`);
    console.log(`   Xe: ${products.filter(p => p.category === 'xe').length}`);
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
