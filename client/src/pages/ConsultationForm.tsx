import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';

const ConsultationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    isUrgent: false,
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'thành-lập-doanh-nghiệp', name: 'Thành lập doanh nghiệp' },
    { id: 'hợp-đồng-thương-mại', name: 'Hợp đồng thương mại' },
    { id: 'sở-hữu-trí-tuệ', name: 'Sở hữu trí tuệ' },
    { id: 'lao-động-nhân-sự', name: 'Lao động & Nhân sự' },
    { id: 'thuế-tài-chính', name: 'Thuế & Tài chính' },
    { id: 'đầu-tư-kinh-doanh', name: 'Đầu tư & Kinh doanh' },
    { id: 'giải-quyết-tranh-chấp', name: 'Giải quyết tranh chấp' },
    { id: 'khác', name: 'Khác' }
  ];

  const priorities = [
    { id: 'low', name: 'Thấp', color: 'text-green-600' },
    { id: 'medium', name: 'Trung bình', color: 'text-yellow-600' },
    { id: 'high', name: 'Cao', color: 'text-orange-600' },
    { id: 'urgent', name: 'Khẩn cấp', color: 'text-red-600' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/consultations', formData);

      // Hiển thị thông báo thành công và chuyển về danh sách
      alert('Tạo yêu cầu tư vấn thành công!');
      navigate('/consultations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tạo yêu cầu tư vấn mới
        </h1>
        <p className="text-gray-600">
          Mô tả chi tiết vấn đề pháp lý của bạn để nhận tư vấn tốt nhất
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề yêu cầu *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="input-field"
                placeholder="Ví dụ: Tư vấn thành lập công ty TNHH"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                id="category"
                name="category"
                required
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="input-field"
                placeholder="Mô tả chi tiết vấn đề pháp lý của bạn, bao gồm bối cảnh, tình huống cụ thể và câu hỏi cần được giải đáp..."
                value={formData.description}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/2000 ký tự
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cài đặt ưu tiên</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map((priority) => (
                  <label
                    key={priority.id}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer ${
                      formData.priority === priority.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.id}
                      checked={formData.priority === priority.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium ${priority.color}`}>
                      {priority.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isUrgent"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-900">
                Đánh dấu là khẩn cấp
              </label>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Thời hạn mong muốn (tùy chọn)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                className="input-field"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>


        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            Tạo yêu cầu tư vấn
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;
