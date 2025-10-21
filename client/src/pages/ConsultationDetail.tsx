import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  User, 
  FileText,
  Bot,
  CheckCircle,
  AlertCircle,
  Send,
  Star,
  Edit,
  Trash2
} from 'lucide-react';

interface Consultation {
  _id: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  status: string;
  priority: string;
  aiResponse?: string;
  lawyerResponse?: string;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    company?: string;
  };
  assignedLawyer?: {
    name: string;
    email: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    ratedAt: string;
  };
}

const ConsultationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [editingResponse, setEditingResponse] = useState(false);
  const [editResponseText, setEditResponseText] = useState('');
  const [submittingEditResponse, setSubmittingEditResponse] = useState(false);
  const [submittingDeleteResponse, setSubmittingDeleteResponse] = useState(false);

  const fetchConsultation = useCallback(async () => {
    try {
      const response = await axios.get(`/api/consultations/${id}`);
      setConsultation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin tư vấn');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchConsultation();
    }
  }, [id, fetchConsultation]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setSubmittingResponse(true);
    try {
      await axios.put(`/api/consultations/${id}/respond`, {
        lawyerResponse: responseText
      });
      
      // Refresh consultation data
      await fetchConsultation();
      setResponseText('');
      alert('Trả lời tư vấn thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi trả lời tư vấn');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleEditResponse = () => {
    if (consultation?.lawyerResponse) {
      setEditResponseText(consultation.lawyerResponse);
      setEditingResponse(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingResponse(false);
    setEditResponseText('');
  };

  const handleSubmitEditResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResponseText.trim()) return;

    setSubmittingEditResponse(true);
    try {
      await axios.put(`/api/consultations/${id}/response`, {
        lawyerResponse: editResponseText
      });
      
      // Refresh consultation data
      await fetchConsultation();
      setEditingResponse(false);
      setEditResponseText('');
      alert('Sửa phản hồi tư vấn thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi sửa phản hồi');
    } finally {
      setSubmittingEditResponse(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
      return;
    }

    setSubmittingDeleteResponse(true);
    try {
      await axios.delete(`/api/consultations/${id}/response`);
      
      // Refresh consultation data
      await fetchConsultation();
      alert('Xóa phản hồi tư vấn thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phản hồi');
    } finally {
      setSubmittingDeleteResponse(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmittingRating(true);
    try {
      await axios.put(`/api/consultations/${id}/rating`, {
        rating,
        comment: ratingComment
      });
      
      // Refresh consultation data
      await fetchConsultation();
      alert('Đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
      case 'ai-responded':
        return { text: 'AI đã phản hồi', color: 'text-blue-600 bg-blue-100', icon: Bot };
      case 'lawyer-assigned':
        return { text: 'Đã giao luật sư', color: 'text-purple-600 bg-purple-100', icon: User };
      case 'completed':
        return { text: 'Hoàn thành', color: 'text-green-600 bg-green-100', icon: CheckCircle };
      case 'closed':
        return { text: 'Đã đóng', color: 'text-gray-600 bg-gray-100', icon: AlertCircle };
      default:
        return { text: status, color: 'text-gray-600 bg-gray-100', icon: MessageSquare };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'low':
        return { text: 'Thấp', color: 'text-green-600' };
      case 'medium':
        return { text: 'Trung bình', color: 'text-yellow-600' };
      case 'high':
        return { text: 'Cao', color: 'text-orange-600' };
      case 'urgent':
        return { text: 'Khẩn cấp', color: 'text-red-600' };
      default:
        return { text: priority, color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Không tìm thấy tư vấn'}
          </h2>
          <button
            onClick={() => navigate('/consultations')}
            className="btn-primary mt-4"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(consultation.status);
  const priorityInfo = getPriorityInfo(consultation.priority);
  const StatusIcon = statusInfo.icon;

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
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {consultation.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {consultation.categoryName}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(consultation.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
            >
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusInfo.text}
            </span>
            <span className={`text-sm font-medium ${priorityInfo.color}`}>
              {priorityInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Consultation Details */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin tư vấn
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {consultation.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Khách hàng</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{consultation.user.name}</p>
                  <p className="text-sm text-gray-600">{consultation.user.email}</p>
                  {consultation.user.company && (
                    <p className="text-sm text-gray-600">{consultation.user.company}</p>
                  )}
                </div>
              </div>

              {consultation.assignedLawyer && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Luật sư được giao</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{consultation.assignedLawyer.name}</p>
                    <p className="text-sm text-gray-600">{consultation.assignedLawyer.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Response */}
        {consultation.aiResponse && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              Phản hồi từ AI
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-gray-900 whitespace-pre-wrap">
                {consultation.aiResponse}
              </div>
            </div>
          </div>
        )}

        {/* Lawyer Response */}
        {consultation.lawyerResponse && !editingResponse && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Phản hồi từ luật sư
              </h2>
              {/* Edit/Delete buttons for Admin/Lawyer */}
              {(user?.role === 'admin' || (user?.role === 'lawyer' && user.canHandleCases)) && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditResponse}
                    className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Sửa
                  </button>
                  <button
                    onClick={handleDeleteResponse}
                    disabled={submittingDeleteResponse}
                    className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    {submittingDeleteResponse ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Xóa
                  </button>
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-gray-900 whitespace-pre-wrap">
                {consultation.lawyerResponse}
              </div>
            </div>
          </div>
        )}

        {/* Edit Response Form */}
        {editingResponse && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-green-600" />
              Sửa phản hồi tư vấn
            </h2>
            <form onSubmit={handleSubmitEditResponse} className="space-y-4">
              <div>
                <label htmlFor="editResponse" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung phản hồi
                </label>
                <textarea
                  id="editResponse"
                  value={editResponseText}
                  onChange={(e) => setEditResponseText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nhập nội dung phản hồi..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEditResponse || !editResponseText.trim()}
                  className="btn-primary flex items-center"
                >
                  {submittingEditResponse ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Response Form for Admin/Lawyer */}
        {(user?.role === 'admin' || user?.role === 'lawyer') && consultation.status === 'pending' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              Trả lời tư vấn
            </h2>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung trả lời
                </label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nhập nội dung trả lời tư vấn..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingResponse || !responseText.trim()}
                  className="btn-primary flex items-center"
                >
                  {submittingResponse ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi trả lời
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rating Section - Only for Client on Completed Consultation */}
        {user?.role === 'user' && consultation.status === 'completed' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Đánh giá dịch vụ
            </h2>

            {consultation.feedback ? (
              // Show existing rating
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-gray-700 mr-3">Đánh giá của bạn:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= consultation.feedback!.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-lg font-semibold text-gray-900">
                    {consultation.feedback.rating}/5
                  </span>
                </div>
                {consultation.feedback.comment && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Nhận xét:</p>
                    <p className="text-gray-900">{consultation.feedback.comment}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  Đã đánh giá lúc: {new Date(consultation.feedback.ratedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ) : (
              // Show rating form
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bạn đánh giá dịch vụ tư vấn này như thế nào? *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-3 text-lg font-semibold text-gray-900">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="ratingComment" className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    id="ratingComment"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ tư vấn..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingRating || rating === 0}
                    className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center"
                  >
                    {submittingRating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Gửi đánh giá
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Documents */}
        {consultation.documents && consultation.documents.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Tài liệu đính kèm
            </h2>
            <div className="space-y-2">
              {consultation.documents.map((doc: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{doc.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lịch sử hoạt động
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <MessageSquare className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Tạo yêu cầu tư vấn</p>
                <p className="text-sm text-gray-600">
                  {new Date(consultation.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {consultation.aiResponse && (
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI đã phản hồi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(consultation.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )}

            {consultation.lawyerResponse && (
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Luật sư đã phản hồi</p>
                  <p className="text-sm text-gray-600">
                    {new Date(consultation.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
