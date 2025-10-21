import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  Shield, 
  Clock, 
  Users,
  Award,
  Building2,
  Phone,
  Mail,
  MapPin,
  Brain,
  BookOpen,
  PenTool,
  Briefcase,
  Zap,
  BarChart3,
  Folder,
  Bell
} from 'lucide-react';

const Home: React.FC = () => {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - AI Tư Vấn Pháp Lý */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-blue-900">AI Tư Vấn Pháp Lý</h1>
            </div>
            
            <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Trải nghiệm công nghệ AI tiên tiến để nhận tư vấn pháp lý nhanh chóng, chính xác 24/7. 
              Hệ thống AI của chúng tôi được đào tạo bởi đội ngũ luật sư chuyên nghiệp với hàng nghìn tình huống thực tế.
            </p>
            
            <Link 
              to="/ai-assistant"
              className="inline-block bg-yellow-400 text-gray-900 font-bold py-5 px-12 rounded-2xl hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
            >
              Bắt Đầu Tư Vấn Với AI
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Card 1 */}
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MessageSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Trả Lời Tức Thì</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Nhận câu trả lời pháp lý ngay lập tức, không cần chờ đợi.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Tra Cứu Văn Bản</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Tìm kiếm và giải thích các điều khoản pháp luật liên quan.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <PenTool className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Soạn Thảo Nhanh</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Tạo mẫu hợp đồng và văn bản pháp lý cơ bản tự động.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tư Vấn Với Luật Sư Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-6">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-5xl font-bold text-blue-900">Tư Vấn Với Luật Sư</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Service Cards */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <Scale className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Tư Vấn Pháp Lý Doanh Nghiệp</h3>
                <p className="text-gray-600 leading-relaxed">Cung cấp giải pháp pháp lý toàn diện cho mọi hoạt động kinh doanh của doanh nghiệp.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Soạn Thảo Hợp Đồng</h3>
                <p className="text-gray-600 leading-relaxed">Xây dựng và đánh giá các hợp đồng kinh doanh, đảm bảo quyền lợi tối đa cho khách hàng.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Thành Lập Doanh Nghiệp</h3>
                <p className="text-gray-600 leading-relaxed">Hỗ trợ thủ tục thành lập, đăng ký kinh doanh và các giấy phép cần thiết.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">M&A và Tái Cấu Trúc</h3>
                <p className="text-gray-600 leading-relaxed">Tư vấn về sáp nhập, mua bán và tái cấu trúc doanh nghiệp theo pháp luật.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Bảo Vệ Quyền Sở Hữu Trí Tuệ</h3>
                <p className="text-gray-600 leading-relaxed">Đăng ký và bảo vệ nhãn hiệu, bản quyền, bằng sáng chế cho doanh nghiệp.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Giải Quyết Tranh Chấp</h3>
                <p className="text-gray-600 leading-relaxed">Đại diện khách hàng trong các vụ kiện, trọng tài và hòa giải thương mại.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Quản Lý Vụ Việc Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-6">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-5xl font-bold text-blue-900">Quản Lý Vụ Việc</h2>
              </div>
              
              <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                Theo dõi tiến độ xử lý vụ việc của bạn một cách minh bạch và thuận tiện. 
                Nhận thông báo cập nhật và trao đổi trực tiếp với luật sư phụ trách.
              </p>
              
              <Link 
                to="/cases"
                className="inline-block bg-yellow-400 text-gray-900 font-bold py-5 px-12 rounded-2xl hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
              >
                Xem Vụ Việc Của Tôi
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <BarChart3 className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Theo Dõi Tiến Độ</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Cập nhật thời gian thực về tình trạng xử lý vụ việc của bạn.</p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Folder className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Quản Lý Tài Liệu</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Lưu trữ và truy cập tất cả tài liệu liên quan đến vụ việc.</p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Bell className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Thông Báo Thông Minh</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Nhận cảnh báo về các mốc quan trọng và hạn chót.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Về VRC Legal Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl font-bold text-blue-900 mb-10">Về VRC Legal</h2>
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                  <p>
                    VRC Legal là công ty tư vấn pháp lý hàng đầu cho doanh nghiệp tại Việt Nam. 
                    Với đội ngũ luật sư giàu kinh nghiệm và cam kết mang đến giải pháp pháp lý tối ưu nhất.
                  </p>
                  <p>
                    Chúng tôi tự hào là đối tác đáng tin cậy của hàng trăm doanh nghiệp, từ startup đến các tập đoàn lớn, 
                    giúp họ vượt qua mọi thách thức pháp lý và phát triển bền vững.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="text-5xl font-bold text-blue-900 mb-4">500+</div>
                  <div className="text-gray-600 text-lg">Khách Hàng Tin Tưởng</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="text-5xl font-bold text-blue-900 mb-4">15+</div>
                  <div className="text-gray-600 text-lg">Năm Kinh Nghiệm</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="text-5xl font-bold text-blue-900 mb-4">98%</div>
                  <div className="text-gray-600 text-lg">Tỷ Lệ Thành Công</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="text-5xl font-bold text-blue-900 mb-4">50+</div>
                  <div className="text-gray-600 text-lg">Luật Sư Chuyên Nghiệp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 bg-blue-900 text-white">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-6xl font-bold mb-8">Liên Hệ Với Chúng Tôi</h2>
            <p className="text-2xl text-blue-200 mb-20 max-w-4xl mx-auto leading-relaxed">
              Hãy để VRC Legal đồng hành cùng sự phát triển của doanh nghiệp bạn
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Phone Card */}
              <div className="bg-blue-800 p-12 rounded-3xl shadow-2xl border border-blue-700 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Điện Thoại</h3>
                <p className="text-blue-200 text-xl">0326193877</p>
              </div>

              {/* Email Card */}
              <div className="bg-blue-800 p-12 rounded-3xl shadow-2xl border border-blue-700 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Email</h3>
                <p className="text-blue-200 text-xl">lehonganh@gmail.com</p>
              </div>

              {/* Address Card - Full Width */}
              <div className="md:col-span-2 lg:col-span-1 bg-blue-800 p-12 rounded-3xl shadow-2xl border border-blue-700 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Địa Chỉ</h3>
                <p className="text-blue-200 text-xl">Tầng 15, Tòa nhà ABC, Quận 1, TP.HCM</p>
              </div>
            </div>

            {/* Additional Contact Info */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-900" />
                </div>
                <h4 className="text-xl font-bold mb-2">Giờ Làm Việc</h4>
                <p className="text-blue-200">8:00 - 17:00 (T2-T6)</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Chat Trực Tuyến</h4>
                <p className="text-blue-200">24/7 Hỗ Trợ</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Đội Ngũ</h4>
                <p className="text-blue-200">50+ Luật Sư</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Kinh Nghiệm</h4>
                <p className="text-blue-200">15+ Năm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="w-full px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-400 text-lg">
              © 2025 VRC Legal. All Rights Reserved. | Dịch Vụ Tư Vấn Luật Doanh Nghiệp Hàng Đầu Việt Nam
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;