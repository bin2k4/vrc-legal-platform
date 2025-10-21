const natural = require('natural');
const compromise = require('compromise');

class VRCBot {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.conversationHistory = []; // Lưu lịch sử hội thoại
    this.userContext = {}; // Lưu ngữ cảnh người dùng
    
    // Knowledge base về luật doanh nghiệp
    this.knowledgeBase = {
      // Thành lập doanh nghiệp
      'thanh_lap_doanh_nghiep': {
        keywords: ['thành lập', 'mở công ty', 'đăng ký kinh doanh', 'giấy phép', 'tư cách pháp nhân', 'công ty tnhh', 'công ty cổ phần', 'doanh nghiệp tư nhân', 'tnhh', 'cổ phần'],
        quickAnswers: {
          cost: '💰 **CHI PHÍ THÀNH LẬP DOANH NGHIỆP:**\n\n• Lệ phí đăng ký: 300.000 - 500.000 VNĐ\n• Chi phí khắc dấu: ~200.000 VNĐ\n• Chi phí công bố: ~500.000 VNĐ\n• **Tổng cộng: khoảng 1.000.000 - 1.500.000 VNĐ**\n\n*Lưu ý: Chi phí có thể thay đổi theo từng địa phương và loại hình doanh nghiệp.',
          time: '⏱️ **THỜI GIAN THÀNH LẬP:**\n\n• Thời gian xử lý hồ sơ: **3 ngày làm việc** (kể từ khi nộp hồ sơ đầy đủ, hợp lệ)\n• Khắc dấu: 1-2 ngày\n• Công bố thông tin: ngay sau khi nhận GCNĐKDN\n\n**Tổng thời gian: khoảng 5-7 ngày** để hoàn tất toàn bộ thủ tục!',
        },
        responses: [
          '🏢 **HƯỚNG DẪN THÀNH LẬP DOANH NGHIỆP**\n\n**Bước 1: Chuẩn bị hồ sơ**\n- Đơn đăng ký kinh doanh (mẫu theo quy định)\n- Điều lệ công ty (nếu là công ty TNHH 2+ thành viên hoặc công ty cổ phần)\n- Danh sách thành viên/cổ đông\n- Bản sao CMND/CCCD/Hộ chiếu của người đại diện pháp luật\n- Giấy tờ chứng minh địa chỉ trụ sở (hợp đồng thuê/giấy tờ sở hữu)\n\n**Bước 2: Nộp hồ sơ**\n- Nộp tại Phòng Đăng ký kinh doanh thuộc Sở Kế hoạch và Đầu tư\n- Hoặc nộp online qua Cổng thông tin quốc gia về đăng ký doanh nghiệp\n- Thời gian xử lý: 3 ngày làm việc\n- Lệ phí: khoảng 300.000 - 500.000 VNĐ\n\n**Bước 3: Nhận Giấy chứng nhận đăng ký doanh nghiệp**\n\n**Bước 4: Khắc dấu và công bố thông tin**\n\n**Các loại hình doanh nghiệp:**\n✅ Công ty TNHH (1-2 thành viên) - Phổ biến nhất\n✅ Công ty cổ phần - Cho doanh nghiệp lớn\n✅ Doanh nghiệp tư nhân - Cá nhân kinh doanh\n✅ Công ty hợp danh - Ít phổ biến\n\nBạn muốn tìm hiểu chi tiết về loại hình nào?',
          
          '📋 **THÀNH LẬP CÔNG TY TNHH - CHI TIẾT**\n\n**Điều kiện:**\n- Có từ 1-50 thành viên\n- Vốn điều lệ tối thiểu: Không quy định (tùy ngành nghề)\n- Thành viên chịu trách nhiệm trong phạm vi vốn góp\n\n**Hồ sơ cần thiết:**\n1. Đơn đăng ký doanh nghiệp (theo mẫu)\n2. Điều lệ công ty (nếu có từ 2 thành viên trở lên)\n3. Danh sách thành viên\n4. Bản sao giấy tờ tùy thân\n5. Giấy tờ địa chỉ trụ sở\n\n**Ưu điểm:**\n✅ Thủ tục đơn giản\n✅ Linh hoạt trong quản trị\n✅ Bảo vệ tài sản cá nhân\n✅ Dễ huy động vốn từ thành viên\n\n**Nhược điểm:**\n❌ Khó huy động vốn từ bên ngoài\n❌ Giới hạn số lượng thành viên\n\n**Chi phí:**\n- Lệ phí đăng ký: ~300.000 VNĐ\n- Chi phí khắc dấu: ~200.000 VNĐ\n- Chi phí công bố: ~500.000 VNĐ\n\nBạn cần hỗ trợ gì thêm về TNHH?',
          
          '🎯 **THÀNH LẬP CÔNG TY CỔ PHẦN - HƯỚNG DẪN**\n\n**Đặc điểm:**\n- Có ít nhất 3 cổ đông\n- Vốn điều lệ chia thành cổ phần\n- Cổ đông chịu trách nhiệm trong phạm vi vốn góp\n- Có thể niêm yết trên sàn chứng khoán\n\n**Cơ cấu tổ chức:**\n- Đại hội đồng cổ đông\n- Hội đồng quản trị (HĐQT)\n- Ban kiểm soát (nếu có từ 11 cổ đông)\n- Giám đốc/Tổng giám đốc\n\n**Ưu điểm:**\n✅ Dễ huy động vốn\n✅ Cổ phần có thể chuyển nhượng\n✅ Có thể phát hành cổ phiếu\n✅ Phù hợp cho doanh nghiệp lớn\n\n**Nhược điểm:**\n❌ Thủ tục phức tạp hơn\n❌ Yêu cầu quản trị chặt chẽ\n❌ Chi phí vận hành cao hơn\n\n**Vốn điều lệ tối thiểu:**\n- Thông thường: Không quy định\n- Công ty chứng khoán: 25 tỷ VNĐ\n- Ngân hàng thương mại: 3.000 tỷ VNĐ\n\nBạn có kế hoạch thành lập công ty cổ phần?'
        ]
      },
      
      // Hợp đồng thương mại
      'hop_dong_thuong_mai': {
        keywords: ['hợp đồng', 'thương mại', 'mua bán', 'cung cấp dịch vụ', 'điều khoản', 'ký kết', 'thỏa thuận', 'cam kết'],
        responses: [
          '📄 **CẤU TRÚC HỢP ĐỒNG THƯƠNG MẠI**\n\n**1. Thông tin các bên:**\n- Tên đầy đủ công ty/cá nhân\n- Địa chỉ trụ sở, mã số thuế\n- Người đại diện pháp luật\n- Số điện thoại, email liên hệ\n\n**2. Đối tượng hợp đồng:**\n- Mô tả chi tiết hàng hóa/dịch vụ\n- Số lượng, chất lượng, quy cách\n- Giá trị hợp đồng, đơn giá\n- Phương thức thanh toán\n\n**3. Quyền và nghĩa vụ:**\n✅ Bên A (Người bán/Cung cấp):\n- Giao hàng đúng hạn, đúng chất lượng\n- Cung cấp chứng từ hợp lệ\n- Bảo hành, bảo trì (nếu có)\n\n✅ Bên B (Người mua/Nhận):\n- Thanh toán đầy đủ, đúng hạn\n- Nhận hàng theo thỏa thuận\n- Kiểm tra và xác nhận hàng hóa\n\n**4. Điều khoản quan trọng:**\n- Thời hạn thực hiện\n- Địa điểm giao nhận\n- Phạt vi phạm hợp đồng (thường 5-10%)\n- Bồi thường thiệt hại\n- Giải quyết tranh chấp\n- Điều kiện chấm dứt/tạm ngừng\n\nBạn cần soạn loại hợp đồng gì?',
          
          '⚖️ **VI PHẠM HỢP ĐỒNG & GIẢI QUYẾT**\n\n**Các hình thức vi phạm:**\n❌ Không thực hiện đúng hạn\n❌ Không thực hiện đúng nội dung\n❌ Giao hàng không đúng chất lượng\n❌ Không thanh toán hoặc thanh toán chậm\n\n**Biện pháp xử lý:**\n\n1. **Phạt vi phạm (Liquidated damages)**\n- Thường quy định: 0.05% - 0.1%/ngày\n- Tối đa: 5-10% giá trị hợp đồng\n- Áp dụng tự động khi vi phạm\n\n2. **Bồi thường thiệt hại**\n- Bồi thường thiệt hại thực tế\n- Lợi ích bị mất do vi phạm\n- Cần chứng minh thiệt hại\n\n3. **Đình chỉ thực hiện**\n- Tạm ngừng thực hiện nghĩa vụ\n- Chờ bên kia khắc phục\n\n4. **Đơn phương chấm dứt**\n- Khi vi phạm nghiêm trọng\n- Thông báo trước theo quy định\n\n**Cách giải quyết:**\n1️⃣ Thương lượng trực tiếp\n2️⃣ Hòa giải thương mại\n3️⃣ Trọng tài thương mại\n4️⃣ Khởi kiện tại Tòa án\n\nBạn đang gặp vấn đề gì với hợp đồng?',
          
          '✍️ **HƯỚNG DẪN KÝ KẾT HỢP ĐỒNG**\n\n**Nguyên tắc cơ bản:**\n✅ Tự nguyện, bình đẳng\n✅ Thiện chí, trung thực\n✅ Không vi phạm pháp luật\n✅ Không trái đạo đức xã hội\n\n**Điều kiện hiệu lực:**\n1. **Năng lực hành vi dân sự:**\n- Người ký phải đủ 18 tuổi\n- Không bị hạn chế năng lực\n- Có thẩm quyền đại diện (nếu ký thay)\n\n2. **Nội dung hợp lệ:**\n- Không vi phạm điều cấm\n- Không trái đạo đức\n- Xác định hoặc có thể xác định được\n\n3. **Mục đích hợp pháp:**\n- Phục vụ mục đích kinh doanh chính đáng\n- Không nhằm trốn tránh nghĩa vụ\n\n**Lưu ý quan trọng:**\n⚠️ Đọc kỹ trước khi ký\n⚠️ Hiểu rõ quyền và nghĩa vụ\n⚠️ Tham khảo luật sư nếu cần\n⚠️ Giữ bản gốc hợp đồng\n⚠️ Có đủ chữ ký, con dấu\n\n**Hồ sơ kèm theo:**\n📎 Giấy ủy quyền (nếu có)\n📎 Giấy chứng nhận đăng ký kinh doanh\n📎 Giấy tờ chứng minh năng lực tài chính\n\nBạn cần hỗ trợ soạn thảo hợp đồng?'
        ]
      },
      
      // Lao động và nhân sự
      'lao_dong_nhan_su': {
        keywords: ['hợp đồng lao động', 'lao động', 'nhân sự', 'lương', 'bảo hiểm', 'nghỉ phép', 'phép năm', 'sa thải', 'nhân viên', 'làm thêm giờ', 'chấm dứt', 'thôi việc', 'trợ cấp', 'bhxh', 'bhyt', 'bhtn', 'bảo hiểm xã hội', 'bảo hiểm y tế', 'bảo hiểm thất nghiệp'],
        quickAnswers: {
          leave: '🏖️ **NGHỈ PHÉP CỦA NGƯỜI LAO ĐỘNG:**\n\n**Nghỉ phép năm:**\n• 12 ngày/năm (cơ bản)\n• +1 ngày cho mỗi 5 năm làm việc\n• +2 ngày nếu làm công việc độc hại, nguy hiểm\n• Hưởng 100% lương\n\n**Nghỉ lễ, Tết:**\n• 10 ngày/năm (hưởng 100% lương)\n• Làm thêm ngày lễ: 300% lương + 1 ngày nghỉ bù\n\n**Nghỉ thai sản:**\n• 6 tháng cho nữ (hưởng 100% lương từ BHXH)\n• 14 ngày cho nam (nghỉ khi vợ sinh con)',
          salary: '💰 **LƯƠNG TỐI THIỂU VÙNG (2024):**\n\n• Vùng I: 4.960.000 VNĐ/tháng\n• Vùng II: 4.410.000 VNĐ/tháng\n• Vùng III: 3.860.000 VNĐ/tháng\n• Vùng IV: 3.450.000 VNĐ/tháng\n\n**Lương làm thêm giờ:**\n• Ngày thường: 150%\n• Cuối tuần: 200%\n• Ngày lễ, Tết: 300%',
        },
        responses: [
          '👥 **LUẬT LAO ĐỘNG - TỔNG QUAN**\n\n**Các loại hợp đồng lao động:**\n\n1️⃣ **Hợp đồng không xác định thời hạn**\n- Không giới hạn thời gian\n- Ổn định lâu dài cho người lao động\n- Khó chấm dứt đơn phương\n\n2️⃣ **Hợp đồng xác định thời hạn**\n- Thời hạn: 12-36 tháng\n- Gia hạn tối đa 1 lần\n- Sau đó tự động chuyển thành không xác định thời hạn\n\n3️⃣ **Hợp đồng theo mùa vụ/công việc**\n- Dưới 12 tháng\n- Phù hợp công việc ngắn hạn\n\n**Nội dung bắt buộc:**\n✅ Tên, địa chỉ các bên\n✅ Công việc, địa điểm làm việc\n✅ Thời hạn hợp đồng\n✅ Mức lương, hình thức trả lương\n✅ Chế độ nâng lương\n✅ Thời giờ làm việc, nghỉ ngơi\n✅ Trang bị bảo hộ lao động\n✅ Bảo hiểm xã hội\n\n**Quyền lợi người lao động:**\n💰 Lương tối thiểu vùng (4.96 - 7.3 triệu VNĐ)\n💰 Lương làm thêm giờ (150% - 200% - 300%)\n🏥 Bảo hiểm XH, YT, TN\n🏖️ Nghỉ phép năm: 12 ngày\n👶 Nghỉ thai sản: 6 tháng\n\nBạn cần tư vấn về điều khoản nào?',
          
          '⚠️ **CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG**\n\n**1. Thỏa thuận chấm dứt**\n✅ Hai bên cùng đồng ý\n✅ Không cần lý do\n✅ Không phải trả trợ cấp (trừ thỏa thuận)\n\n**2. Đơn phương của người lao động**\n📌 **Với HĐLĐ xác định thời hạn:**\n- Báo trước 30 ngày\n- Hoặc báo trước 3 ngày nếu:\n  + Không bố trí đúng công việc\n  + Không trả lương đầy đủ, đúng hạn\n  + Bị ngược đãi, quấy rối\n  + Ốm đau, tai nạn > 90 ngày liên tục\n\n📌 **Với HĐLĐ không xác định thời hạn:**\n- Báo trước 45 ngày\n- Hoặc 3 ngày với các lý do trên\n\n**3. Đơn phương của người sử dụng lao động**\n❌ Vi phạm kỷ luật lao động nghiêm trọng\n❌ Bị xử lý hình sự\n❌ Gây thiệt hại tài sản\n❌ Ốm đau/tai nạn quá lâu\n❌ Do hoàn cảnh kinh tế\n\n⚠️ **Lưu ý:** Phải báo trước 30-45 ngày\n⚠️ **Phải trả trợ cấp** theo quy định\n\n**Trợ cấp thôi việc:**\n💵 1/2 tháng lương cho mỗi năm làm việc\n💵 Áp dụng khi:\n- Công ty chấm dứt do hoàn cảnh kinh tế\n- Hợp đồng hết hạn mà người lao động không muốn gia hạn\n- Người lao động nghỉ hưu\n\nBạn đang cần tư vấn về tình huống nào?',
          
          '💼 **BẢO HIỂM & QUYỀN LỢI LAO ĐỘNG**\n\n**1. Bảo hiểm xã hội (BHXH)**\n\n📊 **Tỷ lệ đóng:**\n- Người sử dụng lao động: 17.5%\n- Người lao động: 8%\n- Tổng: 25.5% trên lương đóng BHXH\n\n✅ **Quyền lợi:**\n- Ốm đau: 75% lương (ngày thứ 1-30), 100% (ngày 31+)\n- Thai sản: 100% lương trong 6 tháng\n- Tai nạn lao động: Tùy mức độ\n- Hưu trí: Từ 62 tuổi (nam), 60 tuổi (nữ)\n- Tử tuất: 36 tháng lương cơ sở\n\n**2. Bảo hiểm y tế (BHYT)**\n- Người sử dụng lao động: 3%\n- Người lao động: 1.5%\n- Khám chữa bệnh tại các cơ sở y tế\n\n**3. Bảo hiểm thất nghiệp (BHTN)**\n- Người sử dụng lao động: 1%\n- Người lao động: 1%\n- Trợ cấp: 60% lương bình quân, tối đa 12 tháng\n\n**Nghỉ phép năm:**\n🏖️ 12 ngày/năm (cơ bản)\n🏖️ +1 ngày cho mỗi 5 năm làm việc\n🏖️ +2 ngày cho công việc độc hại, nguy hiểm\n🏖️ Được hưởng 100% lương\n\n**Nghỉ lễ, Tết:**\n🎉 10 ngày/năm (hưởng 100% lương)\n🎉 Làm thêm: 300% lương + 1 ngày nghỉ bù\n\nBạn cần tư vấn về quyền lợi cụ thể nào?'
        ]
      },
      
      // Thuế và tài chính
      'thue_tai_chinh': {
        keywords: ['thuế', 'tài chính', 'kế toán', 'báo cáo', 'hoàn thuế'],
        responses: [
          'Về thuế và tài chính doanh nghiệp:\n\n**1. Các loại thuế chính:**\n- Thuế giá trị gia tăng (VAT): 0%, 5%, 10%\n- Thuế thu nhập doanh nghiệp: 20%\n- Thuế thu nhập cá nhân\n- Thuế môn bài\n\n**2. Báo cáo tài chính:**\n- Báo cáo quý (nếu doanh thu > 50 tỷ)\n- Báo cáo năm\n- Báo cáo thuế\n\n**3. Nghĩa vụ kế toán:**\n- Lập sổ sách kế toán\n- Lưu trữ chứng từ\n- Báo cáo định kỳ\n\nBạn cần tư vấn về vấn đề thuế nào cụ thể?'
        ]
      },
      
      // Sở hữu trí tuệ
      'so_huu_tri_tue': {
        keywords: ['bản quyền', 'thương hiệu', 'sáng chế', 'nhãn hiệu', 'bảo hộ'],
        responses: [
          'Về sở hữu trí tuệ:\n\n**1. Bản quyền tác giả:**\n- Bảo hộ tác phẩm văn học, nghệ thuật\n- Thời hạn bảo hộ: suốt đời + 50 năm\n- Đăng ký tại Cục Bản quyền tác giả\n\n**2. Nhãn hiệu:**\n- Bảo hộ tên thương hiệu, logo\n- Thời hạn: 10 năm, gia hạn được\n- Đăng ký tại Cục Sở hữu trí tuệ\n\n**3. Sáng chế:**\n- Bảo hộ giải pháp kỹ thuật\n- Thời hạn: 20 năm\n- Yêu cầu tính mới, sáng tạo\n\nBạn muốn đăng ký bảo hộ loại tài sản trí tuệ nào?'
        ]
      },
      
      // Giải quyết tranh chấp
      'giai_quyet_tranh_chap': {
        keywords: ['tranh chấp', 'kiện tụng', 'trọng tài', 'hòa giải', 'tòa án'],
        responses: [
          'Các phương thức giải quyết tranh chấp:\n\n**1. Thương lượng:**\n- Các bên tự thỏa thuận\n- Nhanh chóng, ít tốn kém\n- Không có tính ràng buộc pháp lý\n\n**2. Hòa giải:**\n- Có bên thứ ba làm trung gian\n- Tại Trung tâm Hòa giải\n- Thỏa thuận có tính ràng buộc\n\n**3. Trọng tài:**\n- Phán quyết có tính ràng buộc\n- Nhanh hơn tòa án\n- Chi phí hợp lý\n\n**4. Tòa án:**\n- Phán quyết cuối cùng\n- Có thể kháng cáo\n- Thời gian dài, chi phí cao\n\nBạn đang gặp tranh chấp gì?'
        ]
      }
    };
    
    // Câu chào hỏi thân thiện
    this.greetingResponses = [
      'Chào bạn! 👋 Tôi là VRC Bot, trợ lý pháp lý của bạn đây! Có vấn đề gì về luật doanh nghiệp mà tôi có thể giúp không? 😊',
      'Hi! 🤗 Rất vui được gặp bạn! Tôi chuyên tư vấn về luật doanh nghiệp. Bạn muốn hỏi gì nào?',
      'Xin chào! ✨ VRC Bot xin được hỗ trợ bạn về mọi vấn đề pháp lý doanh nghiệp. Cứ hỏi thoải mái nhé!',
      'Hello bạn! 😄 Tôi ở đây để giúp bạn giải đáp thắc mắc về luật doanh nghiệp. Bạn đang quan tâm đến vấn đề gì?',
      'Chào buổi sáng/chiều/tối! ☀️ VRC Bot sẵn sàng tư vấn cho bạn rồi đây. Cần giúp gì không?'
    ];

    // Câu cảm ơn
    this.thankResponses = [
      'Không có gì đâu bạn! 😊 Nếu còn thắc mắc gì thì cứ hỏi tiếp nhé!',
      'Rất vui được giúp bạn! 🤗 Có câu hỏi nào khác không?',
      'Cảm ơn bạn! ❤️ Chúc bạn làm ăn phát đạt! Cần gì cứ nhắn tôi nha!',
      'Dạ không có chi! 😄 Đừng ngại hỏi nếu còn vấn đề nào khác nhé!',
      'Sẵn lòng hỗ trợ bạn! ✨ Chúc bạn thành công!'
    ];

    // Câu tạm biệt
    this.goodbyeResponses = [
      'Tạm biệt bạn! 👋 Chúc bạn một ngày tốt lành! Có gì cứ quay lại nha!',
      'Bye bye! 😊 Rất vui được hỗ trợ bạn hôm nay. Hẹn gặp lại!',
      'Chào tạm biệt! 🙌 Chúc bạn kinh doanh thuận lợi! Nhớ quay lại khi cần tư vấn nhé!',
      'See you! ✨ Luôn sẵn sàng hỗ trợ bạn 24/7. Hẹn gặp lại!',
      'Tạm biệt nhé! 💼 Chúc bạn thành công! Có thắc mắc gì cứ inbox tôi!'
    ];

    // Câu trả lời khi không hiểu
    this.confusedResponses = [
      'Hmm... 🤔 Tôi chưa hiểu lắm câu hỏi của bạn. Bạn có thể diễn đạt lại được không? Hoặc hỏi về:\n\n• Thành lập công ty\n• Hợp đồng\n• Lao động\n• Thuế\n• Sở hữu trí tuệ',
      'Ối! 😅 Xin lỗi nhé, tôi chưa nắm rõ ý bạn lắm. Bạn có thể hỏi cụ thể hơn được không? Ví dụ: "Làm sao để thành lập công ty TNHH?"',
      'À... 🧐 Có vẻ câu hỏi này hơi khó với tôi. Bạn thử hỏi về luật doanh nghiệp cụ thể hơn nhé! Ví dụ: hợp đồng, thuế, lao động...',
      'Uhm... 😕 Tôi chưa chắc hiểu đúng ý bạn. Bạn đang muốn hỏi về vấn đề pháp lý nào của doanh nghiệp vậy?',
      'Opps! 🙈 Tôi nghĩ tôi cần thêm thông tin một chút. Bạn có thể nói rõ hơn về vấn đề bạn đang gặp phải không?'
    ];

    // Câu trả lời mặc định
    this.defaultResponses = [
      'Xin chào! Tôi là VRC Bot - trợ lý pháp lý chuyên về luật doanh nghiệp. Tôi có thể giúp bạn về:\n\n• Thành lập doanh nghiệp\n• Hợp đồng thương mại\n• Lao động & nhân sự\n• Thuế & tài chính\n• Sở hữu trí tuệ\n• Giải quyết tranh chấp\n\nBạn có câu hỏi gì về luật doanh nghiệp?',
      'Tôi hiểu bạn đang tìm hiểu về luật doanh nghiệp. Hãy cho tôi biết cụ thể bạn quan tâm đến lĩnh vực nào để tôi có thể hỗ trợ tốt nhất.',
      'Để tôi có thể tư vấn chính xác, bạn có thể mô tả chi tiết hơn về vấn đề pháp lý bạn đang gặp phải không?',
      'Tôi là chuyên gia tư vấn pháp lý về luật doanh nghiệp. Bạn có thể đặt câu hỏi cụ thể về bất kỳ vấn đề nào liên quan đến doanh nghiệp.'
    ];
  }
  
  // Phân tích ý định người dùng (Intent Detection)
  detectIntent(question) {
    const lowerQ = question.toLowerCase();
    const doc = compromise(question);
    
    // Phát hiện các ý định cụ thể (thứ tự quan trọng - từ cụ thể đến chung chung)
    const intents = {
      asking_how: lowerQ.match(/(làm sao|làm thế nào|cách nào|thế nào để|làm như thế nào|như nào để)/),
      asking_cost: lowerQ.match(/(giá|phí|chi phí|bao nhiêu tiền|mất bao nhiêu|tốn|đắt)/),
      asking_time: lowerQ.match(/(mất bao lâu|trong bao lâu|bao lâu thì)/),
      asking_requirement: lowerQ.match(/(cần gì|cần phải|yêu cầu|điều kiện|hồ sơ|giấy tờ|chuẩn bị)/),
      asking_comparison: lowerQ.match(/(khác nhau|khác gì|so với|giống|hơn|tốt hơn)/),
      asking_when: lowerQ.match(/(khi nào|bao giờ|thời gian nào)/),
      asking_where: lowerQ.match(/(ở đâu|tại đâu|chỗ nào|nơi nào)/),
      asking_why: lowerQ.match(/(tại sao|vì sao|sao lại|tại vì)/),
      asking_what: lowerQ.match(/(là gì|gì là|gì thế|nghĩa là gì|cái gì là)/),
      seeking_advice: lowerQ.match(/(nên|tư vấn|gợi ý|giúp tôi|hỗ trợ|chỉ tôi)/),
      problem_solving: lowerQ.match(/(bị|gặp|vấn đề|lỗi|sai|không được|làm sao khi)/),
      // asking_yes_no đặt cuối cùng vì "có được" thường là part of question, không phải yes/no
      asking_amount: lowerQ.match(/(bao nhiêu|mấy)/),
    };
    
    // Tìm ý định chính
    for (const [intent, match] of Object.entries(intents)) {
      if (match) {
        return intent;
      }
    }
    
    return 'general_question';
  }
  
  // Phân tích câu hỏi và tìm chủ đề phù hợp
  analyzeQuestion(question) {
    const lowerQ = question.toLowerCase();
    const intent = this.detectIntent(question);
    
    let bestMatch = null;
    let maxScore = 0;
    let matchedKeywords = [];
    
    // Tìm chủ đề phù hợp nhất bằng cách tìm exact phrase trong câu hỏi
    for (const [topic, data] of Object.entries(this.knowledgeBase)) {
      let score = 0;
      let topicKeywords = [];
      
      for (const keyword of data.keywords) {
        // Kiểm tra exact match hoặc partial match với word boundary
        const keywordLower = keyword.toLowerCase();
        
        if (lowerQ.includes(keywordLower)) {
          // Exact phrase match - score cao nhất
          score += keywordLower.split(' ').length * 2; // Multi-word phrases score higher
          topicKeywords.push(keyword);
        } else {
          // Check individual words
          const keywordWords = keywordLower.split(' ');
          for (const word of keywordWords) {
            if (word.length > 2 && lowerQ.includes(word)) {
              score += 0.5;
              topicKeywords.push(keyword);
              break;
            }
          }
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = topic;
        matchedKeywords = [...new Set(topicKeywords)]; // Remove duplicates
      }
    }
    
    return { 
      topic: bestMatch, 
      score: maxScore,
      intent: intent,
      keywords: matchedKeywords
    };
  }
  
  // Tạo câu mở đầu tự nhiên dựa trên intent
  generateIntroPhrase(intent, keywords) {
    const intros = {
      asking_how: [
        `À, bạn muốn biết cách ${keywords[0] || 'làm việc này'} nhỉ? 🤔 Để tôi giải thích nhé:`,
        `Okie! Tôi sẽ hướng dẫn bạn ${keywords[0] || 'vấn đề này'} chi tiết nha:`,
        `Được rồi! Về việc ${keywords[0] || 'này'}, đây là các bước bạn cần làm:`,
        `Tốt! Hãy để tôi chỉ cho bạn cách ${keywords[0] || 'giải quyết vấn đề này'}:`,
      ],
      asking_what: [
        `Ah, bạn muốn hiểu rõ hơn về ${keywords[0] || 'vấn đề này'}? 💡 Tôi giải thích nhé:`,
        `Ok! Để tôi giải thích cho bạn về ${keywords[0] || 'điều này'}:`,
        `Được! ${keywords[0] || 'Vấn đề này'} là:`,
      ],
      asking_cost: [
        `Ah, bạn quan tâm đến chi phí nhỉ? 💰 Để tôi tính cho bạn nhé:`,
        `Ok! Về mặt tài chính thì:`,
        `Được rồi! Chi phí cho ${keywords[0] || 'vấn đề này'} như sau:`,
      ],
      asking_requirement: [
        `À, bạn muốn biết cần chuẩn bị gì phải không? 📋 Đây nha:`,
        `Okie! Các yêu cầu cần thiết là:`,
        `Được! Để ${keywords[0] || 'làm việc này'}, bạn cần:`,
      ],
      asking_comparison: [
        `Hmm, bạn muốn so sánh nhỉ? 🔄 Để tôi phân tích cho:`,
        `Ok! Sự khác biệt chính là:`,
        `Được! Hãy xem xét điểm khác nhau:`,
      ],
      seeking_advice: [
        `Tôi sẵn sàng tư vấn cho bạn! ✨ Đây là gợi ý của tôi:`,
        `Ok! Theo kinh nghiệm thì tôi khuyên bạn:`,
        `Được rồi! Tôi nghĩ bạn nên:`,
      ],
      problem_solving: [
        `Ồ, bạn đang gặp vấn đề à? 🆘 Đừng lo, tôi sẽ giúp bạn:`,
        `Hmm, tình huống này... Để tôi xem nhé:`,
        `Ok! Với vấn đề này, bạn có thể:`,
      ],
    };
    
    const phrases = intros[intent] || [
      'Được rồi! Về vấn đề này:',
      'Ok! Để tôi giải đáp cho bạn:',
      'Tốt! Đây là thông tin bạn cần:',
    ];
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  // Tạo câu kết thúc tự nhiên
  generateOutroPhrase(intent) {
    const outros = {
      asking_how: [
        '\n\nHy vọng hướng dẫn này giúp ích cho bạn! Có gì chưa rõ cứ hỏi tiếp nhé! 😊',
        '\n\nBạn thấy rõ chưa? Nếu còn thắc mắc gì thì cứ hỏi tôi nhé!',
        '\n\nNếu cần hỗ trợ thêm, bạn cứ nhắn tiếp nha! 🤗',
      ],
      asking_what: [
        '\n\nHy vọng giải thích của tôi đủ rõ! Còn gì thắc mắc không bạn? 🤔',
        '\n\nBạn hiểu rồi chứ? Có vấn đề nào khác không? 😊',
        '\n\nMuốn tìm hiểu sâu hơn về phần nào thì bạn cứ hỏi nhé!',
      ],
      seeking_advice: [
        '\n\nChúc bạn thành công! Còn cần tư vấn gì thêm không? 🌟',
        '\n\nHy vọng lời khuyên này hữu ích! Cần gì cứ nhắn tôi nha! ✨',
        '\n\nĐó là ý kiến của tôi! Bạn nghĩ sao? 🤝',
      ],
      default: [
        '\n\nHy vọng thông tin này hữu ích! Có câu hỏi nào khác không? 😊',
        '\n\nCòn gì thắc mắc thì cứ hỏi tôi nhé! 🤗',
        '\n\nNếu cần thêm thông tin, tôi luôn sẵn sàng! ✨',
      ],
    };
    
    const phrases = outros[intent] || outros.default;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  // Kiểm tra xem có phải quick answer không
  checkQuickAnswer(question, topic) {
    const lowerQ = question.toLowerCase();
    const topicData = this.knowledgeBase[topic];
    
    if (!topicData || !topicData.quickAnswers) {
      return null;
    }
    
    // Kiểm tra các quick answer patterns (thứ tự quan trọng)
    const patterns = {
      leave: /(nghỉ phép|phép năm|được nghỉ|ngày phép|nghỉ lễ|nghỉ tết|thai sản)/,
      salary: /(lương|mức lương|lương tối thiểu|làm thêm giờ)/,
      cost: /(chi phí|giá|phí|bao nhiêu tiền|tốn|đắt)(?!.*?(nghỉ|phép|lương))/,
      time: /(mất bao lâu|trong bao lâu|bao lâu thì|thời gian xử lý)(?!.*?(nghỉ|phép))/,
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerQ) && topicData.quickAnswers[key]) {
        return topicData.quickAnswers[key];
      }
    }
    
    return null;
  }
  
  // Tạo câu trả lời
  generateResponse(question) {
    const lowerQuestion = question.toLowerCase().trim();
    const analysis = this.analyzeQuestion(question);
    
    // 1. Kiểm tra câu chào hỏi
    if (this.isGreeting(lowerQuestion)) {
      return this.getRandomResponse(this.greetingResponses);
    }
    
    // 2. Kiểm tra câu cảm ơn
    if (this.isThankYou(lowerQuestion)) {
      return this.getRandomResponse(this.thankResponses);
    }
    
    // 3. Kiểm tra câu tạm biệt
    if (this.isGoodbye(lowerQuestion)) {
      return this.getRandomResponse(this.goodbyeResponses);
    }
    
    // 4. Nếu tìm thấy chủ đề phù hợp
    if (analysis.topic && analysis.score > 0) {
      // 4a. Kiểm tra quick answer trước
      const quickAnswer = this.checkQuickAnswer(question, analysis.topic);
      if (quickAnswer) {
        // Trả lời nhanh, ngắn gọn hơn
        const shortIntros = [
          'Dạ! Để tôi trả lời ngay nha:',
          'Oke! Đây là thông tin bạn cần:',
          'Được rồi! Cụ thể là:',
          'Dễ thôi! Như sau:',
        ];
        const intro = shortIntros[Math.floor(Math.random() * shortIntros.length)];
        const shortOutros = [
          '\n\nCòn gì thắc mắc không bạn? 😊',
          '\n\nHy vọng thông tin này hữu ích! 🙌',
          '\n\nCần tìm hiểu thêm gì không? 😄',
        ];
        const outro = shortOutros[Math.floor(Math.random() * shortOutros.length)];
        return `${intro}\n\n${quickAnswer}${outro}`;
      }
      
      // 4b. Trả lời chi tiết
      const topicData = this.knowledgeBase[analysis.topic];
      const baseResponse = this.getRandomResponse(topicData.responses);
      
      // Tạo câu trả lời tự nhiên hơn với intro và outro
      const intro = this.generateIntroPhrase(analysis.intent, analysis.keywords);
      const outro = this.generateOutroPhrase(analysis.intent);
      
      // Thêm context nếu có lịch sử
      let contextPrefix = '';
      if (this.conversationHistory.length > 0) {
        const randomContexts = [
          'Tiếp tục câu hỏi trước đó nhé! ',
          'Ok, sang vấn đề mới nào! ',
          'Được rồi! ',
          'Aha! ',
        ];
        contextPrefix = randomContexts[Math.floor(Math.random() * randomContexts.length)];
      }
      
      return `${contextPrefix}${intro}\n\n${baseResponse}${outro}`;
    }
    
    // 5. Câu trả lời khi không hiểu (score = 0)
    if (analysis.score === 0) {
      return this.getRandomResponse(this.confusedResponses);
    }
    
    // 6. Câu trả lời mặc định
    return this.getRandomResponse(this.defaultResponses);
  }
  
  // Lấy câu trả lời ngẫu nhiên từ mảng
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Kiểm tra câu chào hỏi
  isGreeting(question) {
    const greetings = [
      'xin chào', 'hello', 'hi', 'chào', 'chào bạn', 
      'hey', 'yo', 'hế lô', 'alo', 'chao', 
      'good morning', 'good afternoon', 'good evening',
      'chào buổi sáng', 'chào buổi chiều', 'chào buổi tối'
    ];
    
    return greetings.some(greeting => question.includes(greeting));
  }
  
  // Kiểm tra câu cảm ơn
  isThankYou(question) {
    const thanks = [
      'cảm ơn', 'cám ơn', 'thank', 'thanks', 'tks', 'thank you',
      'cảm ơn bạn', 'cảm ơn nhiều', 'thanks bạn', 'ơn'
    ];
    
    return thanks.some(thank => question.includes(thank));
  }
  
  // Kiểm tra câu tạm biệt
  isGoodbye(question) {
    const goodbyes = [
      'tạm biệt', 'bye', 'goodbye', 'see you', 'hẹn gặp lại',
      'bye bye', 'chào tạm biệt', 'bái bai', 'bb', 'tạm biệt nhé',
      'thôi nhé', 'tôi đi đây', 'mình đi nhé'
    ];
    
    return goodbyes.some(goodbye => question.includes(goodbye));
  }
  
  // Xử lý câu hỏi chính
  async processQuestion(question) {
    try {
      const analysis = this.analyzeQuestion(question);
      const response = this.generateResponse(question);
      
      // Lưu vào lịch sử hội thoại
      this.conversationHistory.push({
        question: question,
        response: response,
        topic: analysis.topic,
        intent: analysis.intent,
        timestamp: new Date().toISOString()
      });
      
      // Giới hạn lịch sử tối đa 10 câu hỏi gần nhất
      if (this.conversationHistory.length > 10) {
        this.conversationHistory.shift();
      }
      
      return {
        success: true,
        response: response,
        topic: analysis.topic || 'general',
        intent: analysis.intent,
        confidence: analysis.score > 2 ? 'high' : analysis.score > 0 ? 'medium' : 'low',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        success: false,
        response: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại. 😔',
        error: error.message
      };
    }
  }
  
  // Reset lịch sử hội thoại (khi bắt đầu session mới)
  resetConversation() {
    this.conversationHistory = [];
    this.userContext = {};
  }
  
  // Lấy lịch sử hội thoại
  getHistory() {
    return this.conversationHistory;
  }
}

module.exports = VRCBot;
