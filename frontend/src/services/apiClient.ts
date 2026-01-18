// API Service para conectar com o backend Gemini Burger
const API_BASE_URL = '/api';

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  stock?: number | null;
  available: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

// Buscar categorias publicamente (sem auth)
export const fetchPublicCategories = async (): Promise<ApiCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/public`);
    if (!response.ok) throw new Error('Falha ao carregar categorias');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    return [];
  }
};

// Buscar produtos publicamente (sem auth)
export const fetchPublicProducts = async (tenantSlug?: string): Promise<ApiProduct[]> => {
  try {
    const url = tenantSlug 
      ? `${API_BASE_URL}/products/public?tenant=${tenantSlug}`
      : `${API_BASE_URL}/products/public`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao carregar produtos');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    return [];
  }
};

// Converter produto da API para formato do App
export const convertApiProductToAppProduct = (
  apiProduct: ApiProduct,
  categoryMap: Map<string, string>
) => ({
  id: apiProduct.id,
  name: apiProduct.name,
  description: apiProduct.description || '',
  price: Number(apiProduct.price),
  category: categoryMap.get(apiProduct.categoryId) || 'burgers',
  image: apiProduct.image || 'https://via.placeholder.com/400?text=Produto',
  tags: []
});

// Salvar pedido no backend
export const saveOrderToBackend = async (orderData: {
  customerName: string;
  phone: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  isDelivery: boolean;
  address?: {
    street: string;
    number: string;
    district: string;
    zipCode: string;
    complement?: string;
    referencePoint?: string;
  };
  notes?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      console.error('Falha ao salvar pedido:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    return null;
  }
};

// Buscar pedidos do cliente pelo telefone
export const fetchCustomerOrders = async (phone: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/orders/${encodeURIComponent(phone)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar pedidos do cliente:', error);
    return [];
  }
};

// Buscar tenant config publicamente
export const fetchTenantConfig = async (tenantSlug: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantSlug}/config`);
    if (!response.ok) throw new Error('Tenant não encontrado');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar config do tenant:', error);
    return null;
  }
};
