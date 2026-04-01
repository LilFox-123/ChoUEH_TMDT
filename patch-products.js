/**
 * One-time migration script to patch existing products with UEH context fields and images
 * 
 * SETUP: Create a 'scripts' folder and move this file there, OR run directly:
 *   node patch-products.js
 * 
 * With npm script (after moving to scripts/):
 *   npm run patch-products
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const patches = [
  {
    titleMatch: /^Tài liệu ôn thi TOEIC/i,
    update: {
      courseCode: 'ENG401',
      faculty: 'Kinh tế',
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774594647209-574006046.png']
    }
  },
  {
    titleMatch: /^Sách Kế toán quản trị/i,
    update: {
      courseCode: 'ACC301',
      courseName: 'Kế toán quản trị',
      faculty: 'Kế toán',
      academicYear: '2024-2025',
      semester: 1,
      suitableForYear: [3, 4],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 4'],
      listingType: 'sell',
      images: ['/uploads/1774598091814-24016751.jpeg']
    }
  },
  {
    titleMatch: /^Máy tính Casio fx-580VN/i,
    update: {
      faculty: 'Kinh tế',
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương'],
      preferredTimeSlots: ['Sau tiết 2', 'Sau tiết 4'],
      listingType: 'sell',
      images: ['/uploads/1774598168793-693796439.jpg']
    }
  },
  {
    titleMatch: /^Tai nghe Sony WH-1000XM4/i,
    update: {
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương', 'Thư viện'],
      preferredTimeSlots: ['Buổi trưa 11h-13h', 'Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774598200783-621541400.jpg']
    }
  },
  {
    titleMatch: /^iPad Gen 9/i,
    update: {
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 4', 'Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774598338053-627350873.jpg']
    }
  },
  {
    titleMatch: /^Chuột không dây Logitech M331/i,
    update: {
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh', 'Thư viện'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600487489-820781558.jpg']
    }
  },
  {
    titleMatch: /^Bàn học gấp gọn/i,
    update: {
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh'],
      preferredTimeSlots: ['Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600497814-28009726.jpg']
    }
  },
  {
    titleMatch: /^Đèn bàn LED chống cận/i,
    update: {
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Căn tin'],
      preferredTimeSlots: ['Sau tiết 2'],
      listingType: 'sell',
      images: ['/uploads/1774600538601-169117808.jpg']
    }
  },
  {
    titleMatch: /^Quạt mini để bàn/i,
    update: {
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600558709-980154137.jpg']
    }
  },
  {
    titleMatch: /^Áo khoác hoodie UEH/i,
    update: {
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Sảnh chính'],
      preferredTimeSlots: ['Sau tiết 2', 'Sau tiết 4'],
      listingType: 'sell',
      images: ['/uploads/1774600633057-254908033.jpg']
    }
  },
  {
    titleMatch: /^Áo thun UEH Orientation/i,
    update: {
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600671380-202854220.webp']
    }
  },
  {
    titleMatch: /^Xe đạp Fixed Gear/i,
    update: {
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh'],
      preferredTimeSlots: ['Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600695686-495040184.jpg']
    }
  },
  {
    titleMatch: /^Xe đạp gấp Hahoo/i,
    update: {
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh'],
      preferredTimeSlots: ['Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600738261-935517506.webp']
    }
  },
  {
    titleMatch: /^Laptop Dell Inspiron 15/i,
    update: {
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Thư viện'],
      preferredTimeSlots: ['Sau tiết 4', 'Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600784995-110025830.png']
    }
  },
  {
    titleMatch: /^Giáo trình Kinh tế Vi mô/i,
    update: {
      courseCode: 'ECO101',
      courseName: 'Kinh tế Vi mô',
      faculty: 'Kinh tế',
      academicYear: '2024-2025',
      semester: 1,
      suitableForYear: [1, 2],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 2'],
      listingType: 'sell',
      images: ['/uploads/1774600832749-80794204.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Kinh tế Vĩ mô/i,
    update: {
      courseCode: 'ECO102',
      courseName: 'Kinh tế Vĩ mô',
      faculty: 'Kinh tế',
      academicYear: '2024-2025',
      semester: 2,
      suitableForYear: [1, 2],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 2', 'Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600854566-659669832.webp']
    }
  },
  {
    titleMatch: /^Nguyên lý Kế toán/i,
    update: {
      courseCode: 'ACC101',
      courseName: 'Nguyên lý kế toán',
      faculty: 'Kế toán',
      suitableForYear: [1, 2],
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600877992-704124335.jpg']
    }
  },
  {
    titleMatch: /^Bộ sách CFA Level 1/i,
    update: {
      faculty: 'Tài chính',
      suitableForYear: [3, 4],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Thư viện'],
      preferredTimeSlots: ['Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600915902-397728500.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Marketing căn bản/i,
    update: {
      courseCode: 'MKT101',
      courseName: 'Marketing căn bản',
      faculty: 'Kinh doanh quốc tế',
      suitableForYear: [2, 3],
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh'],
      preferredTimeSlots: ['Sau tiết 4'],
      listingType: 'sell',
      images: ['/uploads/1774601047777-597901736.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Quản trị học/i,
    update: {
      courseCode: 'MGT201',
      courseName: 'Quản trị học',
      faculty: 'Kinh doanh quốc tế',
      suitableForYear: [2, 3],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 2'],
      listingType: 'sell',
      images: ['/uploads/1774601108362-575317673.jpg']
    }
  },
  {
    titleMatch: /^Slide bài giảng.*Toán Kinh tế/i,
    update: {
      courseCode: 'MTH201',
      courseName: 'Toán kinh tế',
      faculty: 'Kinh tế',
      suitableForYear: [1, 2],
      meetingPoints: ['Cơ sở B - 279 Nguyễn Tri Phương'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774601170461-69861067.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Luật Kinh tế/i,
    update: {
      courseCode: 'LAW101',
      courseName: 'Luật kinh doanh',
      faculty: 'Luật',
      suitableForYear: [2, 3],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Sau tiết 4'],
      listingType: 'sell',
      images: ['/uploads/1774601213767-100274397.jpg']
    }
  },
  {
    titleMatch: /^Combo 3 cuốn.*Xác suất Thống kê/i,
    update: {
      courseCode: 'MTH101',
      courseName: 'Toán cao cấp',
      faculty: 'Kinh tế',
      suitableForYear: [1],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Căn tin'],
      preferredTimeSlots: ['Sau tiết 2', 'Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774601228923-287544639.jpg']
    }
  },
  {
    titleMatch: /^Sách Tiếng Anh thương mại/i,
    update: {
      courseCode: 'ENG201',
      courseName: 'Tiếng Anh thương mại',
      faculty: 'Kinh doanh quốc tế',
      suitableForYear: [2, 3],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu'],
      preferredTimeSlots: ['Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774601327717-984047135.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Tài chính Doanh nghiệp/i,
    update: {
      courseCode: 'FIN301',
      courseName: 'Tài chính doanh nghiệp',
      faculty: 'Tài chính',
      suitableForYear: [3, 4],
      meetingPoints: ['Cơ sở N - Nguyễn Văn Linh'],
      preferredTimeSlots: ['Sau tiết 4', 'Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774605473930-333128758.jpg']
    }
  },
  {
    titleMatch: /^Giáo trình Kinh tế lượng/i,
    update: {
      courseCode: 'ECO301',
      courseName: 'Kinh tế lượng',
      faculty: 'Kinh tế',
      suitableForYear: [3],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Thư viện'],
      preferredTimeSlots: ['Buổi chiều 15h-17h'],
      listingType: 'sell',
      images: ['/uploads/1774600671380-202854220.webp']
    }
  },
  {
    titleMatch: /^Bộ đề thi Nguyên lý Thống kê/i,
    update: {
      courseCode: 'STA101',
      courseName: 'Nguyên lý thống kê',
      faculty: 'Kinh tế',
      suitableForYear: [1, 2],
      meetingPoints: ['Cơ sở A - 59 Nguyễn Đình Chiểu', 'Căn tin'],
      preferredTimeSlots: ['Sau tiết 2', 'Buổi trưa 11h-13h'],
      listingType: 'sell',
      images: ['/uploads/1774600487489-820781558.jpg']
    }
  }
];

async function patchProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let successCount = 0;
    let failCount = 0;

    for (const patch of patches) {
      try {
        const result = await Product.findOneAndUpdate(
          { title: patch.titleMatch },
          { $set: patch.update },
          { new: true, runValidators: false }
        );

        if (result) {
          console.log(`✅ Patched: "${result.title}"`);
          successCount++;
        } else {
          console.log(`⚠️  Not found: ${patch.titleMatch}`);
          failCount++;
        }
      } catch (err) {
        console.error(`❌ Error patching ${patch.titleMatch}:`, err.message);
        failCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully patched: ${successCount} products`);
    console.log(`   ⚠️  Not found/failed: ${failCount} products`);
    console.log(`   📦 Total patches attempted: ${patches.length}`);

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

patchProducts();
