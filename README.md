# 🏛️ VRC LEGAL - Hệ thống Tư vấn Pháp lý Doanh nghiệp

> **Nền tảng tư vấn pháp lý trực tuyến với AI Chatbot thông minh**

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 **AI Chatbot** | Trả lời tự động câu hỏi pháp lý với NLP |
| 📝 **Tư vấn trực tuyến** | Gửi yêu cầu tư vấn và nhận phản hồi từ luật sư |
| ⚖️ **Quản lý vụ việc** | Theo dõi tiến độ xử lý vụ việc pháp lý |
| 📚 **32 Văn bản pháp luật** | Tìm kiếm và tra cứu tài liệu pháp lý |
| ⭐ **Đánh giá dịch vụ** | Rating 1-5 sao + feedback |
| 👨‍💼 **Admin Dashboard** | Quản lý hệ thống, cấp quyền, thống kê |

---

## 🚀 Cài đặt nhanh

### 1. Clone project
```bash
git clone <repository-url>
cd luatsuai
```

### 2. Cài đặt dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Cấu hình môi trường
```bash
# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
```

### 4. Chạy project
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

🎉 **Truy cập:** http://localhost:3000

---

## 📖 Tài liệu đầy đủ

👉 **[Xem HUONG_DAN_DAY_DU.md](HUONG_DAN_DAY_DU.md)** để biết chi tiết về:

- 📦 Cài đặt & Cấu hình
- 🏗️ Cấu trúc dự án
- 🔧 API Reference
- 🤖 Chatbot & NLP
- 📚 Quản lý tài liệu pháp lý
- 🚀 Deploy lên production
- 🐛 Troubleshooting

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Natural** + **Compromise** - NLP processing

### Frontend
- **React** + **TypeScript** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Lucide React** - Icons

---

## 📊 Database Schema

```
📦 Collections:
├── users              # Người dùng (User, Lawyer, Admin)
├── consultations      # Yêu cầu tư vấn
├── legal_cases        # Vụ việc pháp lý
└── van_ban_phap_ly    # Tài liệu pháp luật (32 văn bản)
```

---

## 👥 Phân quyền

| Vai trò | Quyền hạn |
|---------|-----------|
| **User** | Gửi tư vấn, tạo vụ việc, đánh giá dịch vụ |
| **Lawyer** | Xem & phản hồi tư vấn, quản lý vụ việc |
| **Admin** | Toàn quyền quản lý, cấp quyền cho luật sư |

---

## 📈 Roadmap

### ✅ Hoàn thành (v1.0)
- Authentication & Authorization
- Consultation & Case management
- AI Chatbot với NLP
- 32 legal documents
- Rating & Feedback
- Admin dashboard

### 🔄 Đang phát triển (v1.1)
- Spell correction tiếng Việt
- Entity recognition
- Semantic search
- Email notifications

### 📋 Kế hoạch (v2.0)
- GPT-4 integration
- Document upload (PDF/Word)
- Video consultation
- Mobile app
- Payment integration

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Email**: support@vrc-legal.com
- **GitHub**: [Issues](https://github.com/your-repo/issues)
- **Documentation**: [HUONG_DAN_DAY_DU.md](HUONG_DAN_DAY_DU.md)

---

## 🙏 Acknowledgments

- **Natural** - NLP library for JavaScript
- **Compromise** - Text processing
- **Tailwind CSS** - Utility-first CSS
- **MongoDB** - NoSQL database
- **React** - UI library

---

**Made with ❤️ by VRC Development Team**

🚀 **v1.0.0** | 📅 **October 2024**
