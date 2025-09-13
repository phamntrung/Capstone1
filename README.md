# Spend Schedule - Quản lý chi tiêu định kỳ

Ứng dụng quản lý các khoản chi tiêu định kỳ với giao diện hiện đại, đẹp mắt và đầy đủ tính năng.

## ✨ Tính năng chính

### 🔐 Hệ thống xác thực
- **Đăng ký tài khoản** - Tạo tài khoản mới với validation đầy đủ
- **Đăng nhập/Đăng xuất** - Quản lý phiên đăng nhập an toàn
- **Dữ liệu riêng tư** - Mỗi user có dữ liệu riêng biệt
- **Lưu trữ local** - Dữ liệu được lưu trữ trên máy người dùng

### 📊 Quản lý lịch chi tiêu
- **Tạo lịch mới** - Thêm các khoản chi tiêu định kỳ
- **Chỉnh sửa/Xóa** - Quản lý lịch chi tiêu dễ dàng
- **Tạm dừng/Kích hoạt** - Kiểm soát trạng thái lịch
- **Xem chi tiết** - Thông tin đầy đủ về từng lịch

### 🔍 Tìm kiếm và lọc
- **Tìm kiếm thông minh** - Tìm theo tên và mô tả
- **Bộ lọc đa dạng** - Lọc theo thời gian, danh mục, trạng thái
- **Sắp xếp linh hoạt** - Sắp xếp theo nhiều tiêu chí

### 📈 Thống kê và báo cáo
- **Tổng quan nhanh** - Thống kê tổng số lịch
- **Chi phí hàng tháng** - Tính toán chi phí dự kiến
- **Ngày thanh toán tiếp theo** - Nhắc nhở thời gian

## 🎨 Giao diện hiện đại

### Design System
- **Bootstrap 5.3.2** - Framework CSS hiện đại
- **Bootstrap Icons** - Icon set đẹp và đa dạng
- **Google Fonts (Inter)** - Typography chuyên nghiệp
- **Gradient Backgrounds** - Nền gradient đẹp mắt
- **Glass Morphism** - Hiệu ứng kính mờ hiện đại

### Responsive Design
- **Mobile-First** - Tối ưu cho thiết bị di động
- **Breakpoints** - Hỗ trợ mọi kích thước màn hình
- **Touch-Friendly** - Giao diện thân thiện với cảm ứng
- **Adaptive Layout** - Tự động điều chỉnh layout

### Animations & Effects
- **Smooth Transitions** - Chuyển động mượt mà
- **Hover Effects** - Hiệu ứng tương tác đẹp mắt
- **Loading States** - Trạng thái tải dữ liệu
- **Toast Notifications** - Thông báo thân thiện

## 🚀 Công nghệ sử dụng

### Frontend
- **HTML5** - Cấu trúc trang web semantic
- **CSS3** - Styling hiện đại với custom properties
- **JavaScript ES6+** - Logic ứng dụng hiện đại
- **Bootstrap 5.3.2** - UI framework
- **Local Storage API** - Lưu trữ dữ liệu client-side

### Libraries & CDN
- **Bootstrap Icons** - Icon library
- **Google Fonts** - Web fonts
- **TuDongChat** - Chatbot integration

## 📱 Cách sử dụng

### Lần đầu sử dụng
1. Mở `index.html` trong trình duyệt
2. Click "Đăng ký" để tạo tài khoản mới
3. Điền thông tin đầy đủ và xác nhận
4. Tự động đăng nhập sau khi đăng ký thành công

### Quản lý lịch chi tiêu
1. Click "Add Schedule" để tạo lịch mới
2. Điền thông tin bắt buộc:
   - Tên lịch
   - Danh mục
   - Số tiền
   - Tần suất
   - Ngày bắt đầu
3. Tùy chọn: Ngày kết thúc, ghi chú, trạng thái
4. Click "Save Schedule" để lưu

### Tìm kiếm và lọc
- Sử dụng thanh tìm kiếm để tìm theo tên
- Chọn bộ lọc thời gian (All/Upcoming/Past)
- Lọc theo danh mục và trạng thái
- Kết hợp nhiều bộ lọc để tìm chính xác

## 🛠️ Cài đặt và phát triển

### Yêu cầu hệ thống
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Hỗ trợ JavaScript ES6+
- Kết nối internet (để tải CDN)

### Cấu trúc dự án
```
├── index.html          # Trang chính
├── styles.css          # Custom CSS
├── script.js           # JavaScript logic
└── README.md           # Tài liệu hướng dẫn
```

### Phát triển
1. Clone hoặc download dự án
2. Mở `index.html` trong trình duyệt
3. Chỉnh sửa code theo nhu cầu
4. Test trên các thiết bị khác nhau

## 🔧 Tính năng kỹ thuật

### Validation
- **Form validation** - Kiểm tra dữ liệu đầu vào
- **Password strength** - Kiểm tra độ mạnh mật khẩu
- **Email format** - Validation định dạng email
- **Required fields** - Kiểm tra trường bắt buộc

### Data Management
- **User isolation** - Dữ liệu riêng biệt theo user
- **Auto-save** - Tự động lưu khi có thay đổi
- **Data persistence** - Lưu trữ lâu dài
- **Import/Export** - Có thể mở rộng

### Performance
- **Lazy loading** - Tải dữ liệu theo nhu cầu
- **Efficient rendering** - Render tối ưu
- **Memory management** - Quản lý bộ nhớ hiệu quả
- **Caching** - Cache dữ liệu thông minh

## 🎯 Roadmap tương lai

### Tính năng sắp tới
- [ ] **Push Notifications** - Thông báo đẩy
- [ ] **Data Export** - Xuất dữ liệu Excel/PDF
- [ ] **Charts & Graphs** - Biểu đồ trực quan
- [ ] **Multi-language** - Đa ngôn ngữ
- [ ] **Dark Mode** - Chế độ tối
- [ ] **PWA Support** - Progressive Web App

### Tích hợp
- [ ] **Bank API** - Kết nối ngân hàng
- [ ] **Calendar Sync** - Đồng bộ lịch
- [ ] **Email Integration** - Gửi email nhắc nhở
- [ ] **Cloud Storage** - Lưu trữ đám mây

## 📄 License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request để cải thiện dự án.

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ qua:
- Email: support@spendschedule.com
- GitHub Issues: [Tạo issue mới](https://github.com/your-repo/issues)

---

**Spend Schedule** - Quản lý chi tiêu thông minh, đơn giản và hiệu quả! 💰✨