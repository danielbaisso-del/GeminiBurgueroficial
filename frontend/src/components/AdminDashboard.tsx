import React, { useState, useEffect } from 'react';
import { 
  Settings, Store, Palette, MapPin, Image, Save, LogOut, 
  Package, ShoppingBag, Users, TrendingUp, Edit2, Trash2, 
  Plus, X, Upload, Eye, Clock, CheckCircle, XCircle, FileText 
} from 'lucide-react';
import ProductModal from './ProductModal';
import ReportsTab from './ReportsTab';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Config {
  businessName: string;
  phone: string;
  whatsappNumber: string;
  logo?: string;
  banner?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  zipCode?: string;
  street?: string;
  number?: string;
  district?: string;
  city: string;
  state: string;
  isOpen: boolean;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  type: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  deliveryAddress?: {
    street: string;
    number: string;
    district: string;
    city: string;
  };
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'config' | 'reports'>('overview');
  const [config, setConfig] = useState<Config | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Reports
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    loadConfig();
    loadProducts();
    loadCategories();
    loadStats();
    loadOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReport(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Erro ao carregar config:', response.status);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          totalProducts: products.length,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadReport = async (period: 'daily' | 'weekly' | 'monthly') => {
    setLoadingReport(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/analytics/detailed-report?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        alert('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    // Simular upload - em produção, usar um serviço real
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setConfig(prev => prev ? { ...prev, [type]: imageUrl } : null);
    };
    reader.readAsDataURL(file);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Produto excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const toggleProductAvailability = async (id: string, available: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !available }),
      });
      
      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, available: !available } : p
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-300',
      READY: 'bg-orange-100 text-orange-800 border-orange-300',
      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      READY: 'Pronto',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.businessName}</h1>
                <p className="text-sm text-gray-500">Painel Administrativo</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Visão Geral
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'orders'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Pedidos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'products'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'config'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'reports'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatórios
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Faturamento</p>
                    <p className="text-3xl font-bold text-gray-900">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Produtos</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Header e Filtros */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h2>
                <p className="text-sm text-gray-600 mt-1">{filteredOrders.length} pedidos</p>
              </div>
              
              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    orderFilter === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setOrderFilter('PENDING')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    orderFilter === 'PENDING'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setOrderFilter('CONFIRMED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    orderFilter === 'CONFIRMED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Confirmados
                </button>
                <button
                  onClick={() => setOrderFilter('PREPARING')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    orderFilter === 'PREPARING'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Preparando
                </button>
                <button
                  onClick={() => setOrderFilter('DELIVERED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    orderFilter === 'DELIVERED'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Entregues
                </button>
              </div>
            </div>

            {/* Lista de Pedidos */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-600">
                  {orderFilter === 'all' 
                    ? 'Ainda não há pedidos no sistema.' 
                    : `Não há pedidos com status "${getStatusLabel(orderFilter as Order['status'])}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Informações do Pedido */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-gray-900">#{order.orderNumber}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                              {order.type === 'DELIVERY' ? '🚚 Delivery' : '🏪 Retirada'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Cliente:</span> {order.customerName}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Telefone:</span> {order.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Itens:</span> {order.items.length} produto(s)
                          </p>
                        </div>

                        {/* Valor e Data */}
                        <div className="flex md:flex-col items-end gap-2 md:gap-1">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">
                              R$ {Number(order.total).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'CONFIRMED');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                          >
                            ✓ Confirmar
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'PREPARING');
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                          >
                            🍳 Preparar
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'READY');
                            }}
                            className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition"
                          >
                            ✓ Pronto
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'DELIVERED');
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                          >
                            ✓ Entregar
                          </button>
                        )}
                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                                updateOrderStatus(order.id, 'CANCELLED');
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                          >
                            ✕ Cancelar
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                        >
                          👁️ Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {product.image ? (
                      <img 
                        src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => toggleProductAvailability(product.id, product.available)}
                        className={`p-2 rounded-lg ${
                          product.available ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {product.available ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-600">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações do Estabelecimento</h2>

            {/* Informações Básicas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Nome do Estabelecimento
                  </label>
                  <input
                    type="text"
                    value={config.businessName}
                    onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Status
                  </label>
                  <button
                    onClick={() => setConfig({ ...config, isOpen: !config.isOpen })}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                      config.isOpen
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {config.isOpen ? 'Aberto' : 'Fechado'}
                  </button>
                </div>
              </div>
            </div>

            {/* Cores e Visual */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores e Identidade Visual
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{config.primaryColor}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{config.secondaryColor}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cor de Destaque
                  </label>
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{config.accentColor}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{config.textColor}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{config.bgColor}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {config.logo && (
                      <img src={config.logo} alt="Logo" className="w-20 h-20 object-contain rounded-lg border border-gray-200" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Carregar Logo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Banner
                  </label>
                  <div className="flex items-center gap-4">
                    {config.banner && (
                      <img src={config.banner} alt="Banner" className="w-32 h-20 object-cover rounded-lg border border-gray-200" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Carregar Banner</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    value={config.zipCode || ''}
                    onChange={(e) => setConfig({ ...config, zipCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Rua
                  </label>
                  <input
                    type="text"
                    value={config.street || ''}
                    onChange={(e) => setConfig({ ...config, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Número
                  </label>
                  <input
                    type="text"
                    value={config.number || ''}
                    onChange={(e) => setConfig({ ...config, number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={config.district || ''}
                    onChange={(e) => setConfig({ ...config, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={config.city}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={config.state}
                    onChange={(e) => setConfig({ ...config, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                disabled={isSaving}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={(product) => {
            if (editingProduct) {
              loadProducts();
            } else {
              loadProducts();
            }
          }}
          product={editingProduct}
          categories={categories}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pedido #{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status e Ações */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Status do Pedido</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                
                {/* Ações de Status */}
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                    <>
                      {selectedOrder.status === 'PENDING' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          ✓ Confirmar Pedido
                        </button>
                      )}
                      {selectedOrder.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'PREPARING')}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                        >
                          🍳 Iniciar Preparo
                        </button>
                      )}
                      {selectedOrder.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'READY')}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                        >
                          ✓ Marcar como Pronto
                        </button>
                      )}
                      {selectedOrder.status === 'READY' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'DELIVERED')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          ✓ Marcar como Entregue
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                            updateOrderStatus(selectedOrder.id, 'CANCELLED');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.type === 'DELIVERY' ? '🚚 Delivery' : '🏪 Retirada no Local'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pagamento:</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.paymentMethod === 'PIX' && '💳 PIX'}
                      {selectedOrder.paymentMethod === 'CREDIT_CARD' && '💳 Cartão de Crédito'}
                      {selectedOrder.paymentMethod === 'DEBIT_CARD' && '💳 Cartão de Débito'}
                      {selectedOrder.paymentMethod === 'CASH' && '💵 Dinheiro'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              {selectedOrder.type === 'DELIVERY' && selectedOrder.deliveryAddress && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900">
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.number}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.deliveryAddress.district} - {selectedOrder.deliveryAddress.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x R$ {Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          R$ {Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-orange-600">
                    R$ {Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botão Fechar */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <ReportsTab
          period={reportPeriod}
          onPeriodChange={setReportPeriod}
          reportData={reportData}
          loading={loadingReport}
        />
      )}
    </div>
  );
}


