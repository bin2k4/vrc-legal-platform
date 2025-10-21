import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  XCircle,
  Star,
  Edit,
  Trash2,
  Plus,
  Upload,
  Settings
} from 'lucide-react';

interface LegalCase {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  estimatedDuration?: number;
  actualDuration?: number;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  client: {
    name: string;
    email: string;
    company?: string;
  };
  assignedLawyer?: {
    name: string;
    email: string;
  };
  timeline: Array<{
    date: string;
    action: string;
    description?: string;
    performedBy: {
      name: string;
    };
  }>;
  notes: Array<{
    content: string;
    createdAt: string;
    createdBy: {
      name: string;
    };
  }>;
  feedback?: {
    rating: number;
    comment: string;
    ratedAt: string;
  };
  lawyerResponse?: string;
}


const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [caseResponseText, setCaseResponseText] = useState('');
  const [submittingCaseResponse, setSubmittingCaseResponse] = useState(false);
  const [editingResponse, setEditingResponse] = useState(false);
  const [editResponseText, setEditResponseText] = useState('');
  const [submittingEditResponse, setSubmittingEditResponse] = useState(false);
  const [submittingDeleteResponse, setSubmittingDeleteResponse] = useState(false);
  
  // Quick actions states
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingUpload, setSubmittingUpload] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      console.log('Fetching case:', id);
      console.log('Token:', localStorage.getItem('token'));
      const response = await axios.get(`/api/cases/${id}`);
      setLegalCase(response.data);
    } catch (err: any) {
      console.error('Error fetching case:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Không thể tải thông tin vụ việc');
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    if (id) {
      fetchCase();
    }
  }, [id, fetchCase]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new':
        return { text: 'Mới', color: 'text-blue-600 bg-blue-100', icon: FileText };
      case 'in-progress':
        return { text: 'Đang xử lý', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
      case 'pending-client':
        return { text: 'Chờ khách hàng', color: 'text-orange-600 bg-orange-100', icon: User };
      case 'pending-court':
        return { text: 'Chờ tòa án', color: 'text-purple-600 bg-purple-100', icon: Calendar };
      case 'completed':
        return { text: 'Hoàn thành', color: 'text-green-600 bg-green-100', icon: CheckCircle };
      case 'closed':
        return { text: 'Đã đóng', color: 'text-gray-600 bg-gray-100', icon: AlertCircle };
      default:
        return { text: status, color: 'text-gray-600 bg-gray-100', icon: FileText };
    }
  };

  const handleSubmitCaseResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseResponseText.trim()) return;

    setSubmittingCaseResponse(true);
    try {
      await axios.put(`/api/cases/${id}/respond`, {
        lawyerResponse: caseResponseText
      });
      
      // Refresh case data
      await fetchCase();
      setCaseResponseText('');
      alert('Trả lời vụ việc thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi trả lời vụ việc');
    } finally {
      setSubmittingCaseResponse(false);
    }
  };

  const handleEditResponse = () => {
    if (legalCase?.lawyerResponse) {
      setEditResponseText(legalCase.lawyerResponse);
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
      await axios.put(`/api/cases/${id}/response`, {
        lawyerResponse: editResponseText
      });
      
      // Refresh case data
      await fetchCase();
      setEditingResponse(false);
      setEditResponseText('');
      alert('Sửa phản hồi thành công!');
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
      await axios.delete(`/api/cases/${id}/response`);
      
      // Refresh case data
      await fetchCase();
      alert('Xóa phản hồi thành công!');
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
      await axios.put(`/api/cases/${id}/rating`, {
        rating,
        comment: ratingComment
      });
      
      // Refresh case data
      await fetchCase();
      alert('Đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Quick Actions Handlers
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmittingNote(true);
    try {
      await axios.post(`/api/cases/${id}/notes`, {
        content: noteText
      });
      
      await fetchCase();
      setNoteText('');
      setShowAddNote(false);
      alert('Thêm ghi chú thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm ghi chú');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmittingUpload(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await axios.post(`/api/cases/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchCase();
      setSelectedFile(null);
      setShowUploadDoc(false);
      alert('Upload tài liệu thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi upload tài liệu');
    } finally {
      setSubmittingUpload(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;

    setSubmittingStatus(true);
    try {
      await axios.put(`/api/cases/${id}/status`, {
        status: newStatus
      });
      
      await fetchCase();
      setNewStatus('');
      setShowUpdateStatus(false);
      alert('Cập nhật trạng thái thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setSubmittingStatus(false);
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

  if (error || !legalCase) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Không tìm thấy vụ việc'}
          </h2>
          <button
            onClick={() => navigate('/cases')}
            className="btn-primary mt-4"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(legalCase.status);
  const priorityInfo = getPriorityInfo(legalCase.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-6xl mx-auto">
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
              {legalCase.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {legalCase.caseNumber}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(legalCase.createdAt).toLocaleDateString('vi-VN')}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Mô tả vụ việc
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">
                {legalCase.description}
              </p>
            </div>
          </div>

          {/* Lawyer Response Form for Admin/Lawyer */}
          {(user?.role === 'admin' || (user?.role === 'lawyer' && user.canHandleCases)) && legalCase.status !== 'completed' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Trả lời vụ việc
              </h2>
              <form onSubmit={handleSubmitCaseResponse} className="space-y-4">
                <div>
                  <label htmlFor="caseResponse" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung trả lời
                  </label>
                  <textarea
                    id="caseResponse"
                    value={caseResponseText}
                    onChange={(e) => setCaseResponseText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập nội dung trả lời vụ việc..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingCaseResponse || !caseResponseText.trim()}
                    className="btn-primary flex items-center"
                  >
                    {submittingCaseResponse ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Gửi trả lời
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Display Lawyer Response if available */}
          {legalCase.lawyerResponse && !editingResponse && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Phản hồi từ Luật sư
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
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-gray-900 whitespace-pre-wrap">
                  {legalCase.lawyerResponse}
                </div>
              </div>
            </div>
          )}

          {/* Edit Response Form */}
          {editingResponse && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-green-600" />
                Sửa phản hồi
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

          {/* Timeline */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lịch sử hoạt động
            </h2>
            <div className="space-y-4">
              {legalCase.timeline.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full mr-4">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.action}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>{new Date(event.date).toLocaleString('vi-VN')}</span>
                      <span>•</span>
                      <span>{event.performedBy.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {legalCase.notes && legalCase.notes.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ghi chú
              </h2>
              <div className="space-y-4">
                {legalCase.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-primary-200 pl-4">
                    <p className="text-gray-900">{note.content}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>{new Date(note.createdAt).toLocaleString('vi-VN')}</span>
                      <span>•</span>
                      <span>{note.createdBy.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin vụ việc
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Khách hàng</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{legalCase.client.name}</p>
                  <p className="text-sm text-gray-600">{legalCase.client.email}</p>
                  {legalCase.client.company && (
                    <p className="text-sm text-gray-600">{legalCase.client.company}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quyền xử lý</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {user?.role === 'lawyer' ? (
                    <div className="flex items-center">
                      {user.canHandleCases ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-700 font-medium">Có quyền xử lý vụ việc</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          <span className="text-red-700 font-medium">Chưa được cấp quyền xử lý vụ việc</span>
                        </>
                      )}
                    </div>
                  ) : user?.role === 'admin' ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-700 font-medium">Admin - Toàn quyền</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-gray-700 font-medium">Khách hàng</span>
                    </div>
                  )}
                </div>
              </div>

              {legalCase.deadline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thời hạn</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      {new Date(legalCase.deadline).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin tài chính
            </h2>
            
            <div className="space-y-4">
              {legalCase.estimatedDuration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thời gian dự kiến</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{legalCase.estimatedDuration} ngày</p>
                  </div>
                </div>
              )}

              {legalCase.actualDuration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thời gian thực tế</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{legalCase.actualDuration} ngày</p>
                  </div>
                </div>
              )}

              {legalCase.estimatedCost && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Chi phí dự kiến</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      {legalCase.estimatedCost.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              )}

              {legalCase.actualCost && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Chi phí thực tế</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      {legalCase.actualCost.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hành động nhanh
            </h2>
            
            <div className="space-y-3">
              {/* Add Note Button */}
              <button 
                onClick={() => setShowAddNote(!showAddNote)}
                className="w-full btn-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm ghi chú
              </button>
              
              {/* Upload Document Button */}
              <button 
                onClick={() => setShowUploadDoc(!showUploadDoc)}
                className="w-full btn-secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload tài liệu
              </button>
              
              {/* Update Status Button */}
              <button 
                onClick={() => setShowUpdateStatus(!showUpdateStatus)}
                className="w-full btn-secondary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cập nhật trạng thái
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNote && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thêm ghi chú</h3>
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập nội dung ghi chú..."
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNote(false)}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submittingNote || !noteText.trim()}
                      className="btn-primary"
                    >
                      {submittingNote ? 'Đang thêm...' : 'Thêm ghi chú'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Upload Document Form */}
            {showUploadDoc && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Upload tài liệu</h3>
                <form onSubmit={handleFileUpload} className="space-y-3">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadDoc(false)}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submittingUpload || !selectedFile}
                      className="btn-primary"
                    >
                      {submittingUpload ? 'Đang upload...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Status Form */}
            {showUpdateStatus && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cập nhật trạng thái</h3>
                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn trạng thái mới</option>
                    <option value="new">Mới</option>
                    <option value="in-progress">Đang xử lý</option>
                    <option value="pending-client">Chờ khách hàng</option>
                    <option value="pending-court">Chờ tòa án</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowUpdateStatus(false)}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submittingStatus || !newStatus}
                      className="btn-primary"
                    >
                      {submittingStatus ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Rating Section - Only for Client on Completed Case */}
          {user?.role === 'user' && legalCase.status === 'completed' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Đánh giá dịch vụ
              </h2>

              {legalCase.feedback ? (
                // Show existing rating
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-3">Đánh giá của bạn:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= legalCase.feedback!.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-3 text-lg font-semibold text-gray-900">
                      {legalCase.feedback.rating}/5
                    </span>
                  </div>
                  {legalCase.feedback.comment && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Nhận xét:</p>
                      <p className="text-gray-900">{legalCase.feedback.comment}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Đã đánh giá lúc: {new Date(legalCase.feedback.ratedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              ) : (
                // Show rating form
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bạn đánh giá dịch vụ xử lý vụ việc này như thế nào? *
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
                      placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ xử lý vụ việc..."
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
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
