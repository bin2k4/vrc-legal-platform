import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  FileText, 
  BarChart3,
  Plus,
  Eye,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalConsultations: number;
  totalCases: number;
  pendingConsultations: number;
  completedConsultations: number;
  activeCases: number;
  totalVisits: number;
  todayVisits: number;
}

interface RecentConsultation {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface RecentCase {
  _id: string;
  title: string;
  caseNumber: string;
  status: string;
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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConsultations: 0,
    totalCases: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    activeCases: 0,
    totalVisits: 0,
    todayVisits: 0
  });
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch stats
      const [usersRes, consultationsRes, casesRes] = await Promise.all([
        axios.get('/api/auth/users'),
        axios.get('/api/consultations/stats'),
        axios.get('/api/cases/stats')
      ]);

      setStats({
        totalUsers: usersRes.data.totalUsers || 0,
        totalConsultations: consultationsRes.data.totalConsultations || 0,
        totalCases: casesRes.data.totalCases || 0,
        pendingConsultations: consultationsRes.data.pendingConsultations || 0,
        completedConsultations: consultationsRes.data.completedConsultations || 0,
        activeCases: casesRes.data.activeCases || 0,
        totalVisits: Math.floor(Math.random() * 10000) + 5000, // Mock data for now
        todayVisits: Math.floor(Math.random() * 200) + 50 // Mock data for now
      });

      // Fetch recent consultations
      const consultationsData = await axios.get('/api/consultations?limit=5');
      setRecentConsultations(consultationsData.data.consultations || []);

      // Fetch recent cases
      const casesData = await axios.get('/api/cases?limit=5');
      setRecentCases(casesData.data.cases || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { name: string; color: string } } = {
      'pending': { name: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'ai-responded': { name: 'AI đã trả lời', color: 'bg-blue-100 text-blue-800' },
      'lawyer-assigned': { name: 'Đã gán luật sư', color: 'bg-purple-100 text-purple-800' },
      'completed': { name: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'closed': { name: 'Đã đóng', color: 'bg-gray-100 text-gray-800' },
      'active': { name: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
      'on-hold': { name: 'Tạm dừng', color: 'bg-orange-100 text-orange-800' },
      'resolved': { name: 'Đã giải quyết', color: 'bg-green-100 text-green-800' }
    };
    return statusMap[status] || { name: status, color: 'bg-gray-100 text-gray-800' };
  };

  const handleRespondConsultation = (consultationId: string) => {
    // Navigate to consultation detail page for response
    window.location.href = `/consultations/${consultationId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chào mừng trở lại, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Đây là tổng quan về hoạt động tư vấn pháp lý của bạn
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/consultations"
                className="btn-primary"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Quản lý tư vấn
              </Link>
              <Link
                to="/cases"
                className="btn-secondary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Quản lý vụ việc
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/consultations"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Xem tư vấn</h3>
                <p className="text-blue-100">Quản lý tư vấn</p>
              </div>
            </div>
          </Link>

          <Link
            to="/cases"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Xem vụ việc</h3>
                <p className="text-green-100">Quản lý vụ việc</p>
              </div>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Lượt truy cập</h3>
                <p className="text-purple-100">Thống kê web</p>
              </div>
            </div>
          </Link>

          <Link
            to="/ai-assistant"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center">
              <Plus className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">AI Tư vấn</h3>
                <p className="text-orange-100">Hỏi AI ngay</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Permission Management */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quản lý quyền luật sư</h2>
              <button
                onClick={() => window.location.href = '/admin/permissions'}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Cấp quyền
              </button>
            </div>
            <p className="text-gray-600">
              Quản lý quyền xử lý vụ việc của các tài khoản luật sư
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Khi có luật sư mới đăng ký, họ sẽ xuất hiện trong danh sách chờ cấp quyền.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng tư vấn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vụ việc</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lượt truy cập</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVisits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayVisits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vụ việc đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCases || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Consultations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">📋 Tư vấn gần đây</h3>
                </div>
                <Link
                  to="/consultations"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                💬 Các yêu cầu tư vấn pháp lý từ khách hàng - cần phản hồi nhanh
              </p>
              {recentConsultations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có tư vấn nào</p>
              ) : (
                <div className="space-y-4">
                  {recentConsultations.map((consultation) => {
                    const statusInfo = getStatusInfo(consultation.status);
                    return (
                      <div key={consultation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{consultation.title}</h4>
                          <p className="text-sm text-gray-600 truncate">{consultation.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {consultation.user.name} • {new Date(consultation.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.name}
                          </span>
                          <Link
                            to={`/consultations/${consultation._id}`}
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Link>
                          {consultation.status === 'pending' && (
                            <button
                              onClick={() => handleRespondConsultation(consultation._id)}
                              className="btn-primary text-xs px-3 py-1"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Trả lời
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Cases */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">⚖️ Vụ việc gần đây</h3>
                </div>
                <Link
                  to="/cases"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                ⚖️ Các vụ việc pháp lý đang được xử lý - cần theo dõi tiến độ
              </p>
              {recentCases.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có vụ việc nào</p>
              ) : (
                <div className="space-y-4">
                  {recentCases.map((legalCase) => {
                    const statusInfo = getStatusInfo(legalCase.status);
                    return (
                      <div key={legalCase._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{legalCase.title}</h4>
                          <p className="text-sm text-gray-600 truncate">{legalCase.caseNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {legalCase.client.name} • {legalCase.assignedLawyer ? legalCase.assignedLawyer.name : 'Chưa phân công'} • {new Date(legalCase.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
