import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Eye,
  User,
  Trash2
} from 'lucide-react';

interface LegalCase {
  _id: string;
  caseNumber: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  client: {
    name: string;
    email: string;
  };
  assignedLawyer?: {
    name: string;
    email: string;
  };
}

const Cases: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const categories = [
    { id: 'thành-lập-doanh-nghiệp', name: 'Thành lập doanh nghiệp' },
    { id: 'hợp-đồng-thương-mại', name: 'Hợp đồng thương mại' },
    { id: 'sở-hữu-trí-tuệ', name: 'Sở hữu trí tuệ' },
    { id: 'lao-động-nhân-sự', name: 'Lao động & Nhân sự' },
    { id: 'thuế-tài-chính', name: 'Thuế & Tài chính' },
    { id: 'đầu-tư-kinh-doanh', name: 'Đầu tư & Kinh doanh' },
    { id: 'giải-quyết-tranh-chấp', name: 'Giải quyết tranh chấp' },
    { id: 'tư-vấn-pháp-lý', name: 'Tư vấn pháp lý' },
    { id: 'khác', name: 'Khác' }
  ];

  const statuses = [
    { id: 'new', name: 'Mới', color: 'text-blue-600 bg-blue-100' },
    { id: 'in-progress', name: 'Đang xử lý', color: 'text-yellow-600 bg-yellow-100' },
    { id: 'pending-client', name: 'Chờ khách hàng', color: 'text-orange-600 bg-orange-100' },
    { id: 'pending-court', name: 'Chờ tòa án', color: 'text-purple-600 bg-purple-100' },
    { id: 'completed', name: 'Hoàn thành', color: 'text-green-600 bg-green-100' },
    { id: 'closed', name: 'Đã đóng', color: 'text-gray-600 bg-gray-100' }
  ];

  const priorities = [
    { id: 'low', name: 'Thấp', color: 'text-green-600' },
    { id: 'medium', name: 'Trung bình', color: 'text-yellow-600' },
    { id: 'high', name: 'Cao', color: 'text-orange-600' },
    { id: 'urgent', name: 'Khẩn cấp', color: 'text-red-600' }
  ];

  const fetchCases = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await axios.get(`/api/cases?${params.toString()}`);
      setCases(response.data.cases);
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      if (error.response?.status === 403) {
        alert(error.response.data.message || 'Bạn chưa được cấp quyền xử lý vụ việc');
        setCases([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, categoryFilter, priorityFilter, fetchCases]);

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.id === status) || { name: status, color: 'text-gray-600 bg-gray-100' };
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.id === priority) || { name: priority, color: 'text-gray-600', text: priority };
  };

  const handleDeleteCase = async (id: string) => {
    if (!token) {
      alert('Vui lòng đăng nhập để xóa vụ việc!');
      navigate('/login');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa vụ việc này?')) {
      return;
    }

    try {
      console.log('Deleting case:', id);
      console.log('Token:', token);
      
      const response = await axios.delete(`/api/cases/${id}`);
      console.log('Delete response:', response.data);
      
      setCases(cases.filter(c => c._id !== id));
      alert('Xóa vụ việc thành công!');
    } catch (error: any) {
      console.error('Error deleting case:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/login');
      } else {
        alert(`Có lỗi xảy ra khi xóa vụ việc: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const filteredCases = cases.filter(legalCase =>
    legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    legalCase.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚖️ Danh sách vụ việc
            </h1>
            <p className="text-gray-600">
              Quản lý và theo dõi các vụ việc pháp lý đang được xử lý
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/cases/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo vụ việc
            </Link>
            <Link
              to="/consultations"
              className="btn-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo từ tư vấn
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số vụ việc, tiêu đề hoặc khách hàng..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="">Tất cả ưu tiên</option>
              {priorities.map(priority => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter || categoryFilter || priorityFilter
              ? 'Không tìm thấy vụ việc nào'
              : 'Chưa có vụ việc nào'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter || categoryFilter || priorityFilter
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Tạo vụ việc đầu tiên từ yêu cầu tư vấn'
            }
          </p>
          <Link
            to="/consultations"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Xem tư vấn
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((legalCase) => {
            const statusInfo = getStatusInfo(legalCase.status);
            const priorityInfo = getPriorityInfo(legalCase.priority);
            
            return (
              <div
                key={legalCase._id}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {legalCase.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.name}
                      </span>
                      <span className={`text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {legalCase.caseNumber}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {legalCase.client.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(legalCase.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Luật sư: </span>
                      {legalCase.assignedLawyer ? legalCase.assignedLawyer.name : 'Chưa phân công'}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <Link
                      to={`/cases/${legalCase._id}`}
                      className="btn-secondary"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => handleDeleteCase(legalCase._id)}
                      className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Cases;
