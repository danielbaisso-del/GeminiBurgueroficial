
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, X, MessageSquare, MapPin, CreditCard, Star, Trash2, Plus, Minus, Send, Navigation, Loader2, Beer, Package, MessageCircle, AlertCircle } from 'lucide-react';
import { MENU_ITEMS, WHATSAPP_NUMBER } from './constants';
import { Product, CartItem, OrderDetails, PaymentMethod } from './types';
import { getAIRecommendation } from './services/geminiService';
import QRCode from 'qrcode';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(() => {
    // Dev: imagem PIX injetada para testes locais. Remova quando não for necessária.
    return 'data:image/png;base64,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';
  });
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [itemNotesModal, setItemNotesModal] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });
  const [tempNotes, setTempNotes] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [needsChange, setNeedsChange] = useState(false);
  
  // Carregar configurações do admin
  interface AppConfig {
    businessName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    [key: string]: unknown;
  }

  const [appConfig, setAppConfig] = useState<AppConfig | null>(() => {
    const demoConfig = localStorage.getItem('demoConfig');
    if (demoConfig) {
      try {
        const parsed = JSON.parse(demoConfig) as unknown;
        if (typeof parsed === 'object' && parsed !== null) return parsed as AppConfig;
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  // Atualizar configurações quando localStorage mudar
  useEffect(() => {
    const handleConfigChange = () => {
      const demoConfig = localStorage.getItem('demoConfig');
      if (demoConfig) {
        try {
          const parsedConfig = JSON.parse(demoConfig);
          setAppConfig(parsedConfig);
        } catch (e) {
          // erro ao carregar configurações do localStorage
        }
      }
    };
    
    window.addEventListener('storage', handleConfigChange);
    window.addEventListener('demoConfigChanged', handleConfigChange as EventListener);

    // Fallback: polling periódico para garantir atualização no mesmo contexto
    const interval = window.setInterval(handleConfigChange, 2000);

    return () => {
      window.removeEventListener('storage', handleConfigChange);
      window.removeEventListener('demoConfigChanged', handleConfigChange as EventListener);
      window.clearInterval(interval);
    };
  }, []);
  
  // Cor do texto para os inputs (padrão vindo da config do admin ou branca)
  const inputTextColor = appConfig?.textColor || '#ffffff';
  
  // Helper para converter categoryId em slug (definido ANTES de ser usado)
  const getCategorySlugById = (categoryId: string) => {
    const map: Record<string, string> = {
      '1': 'burgers',
      '2': 'sides',
      '3': 'drinks',
      '4': 'desserts',
      '5': 'combos',
      '6': 'alcohol'
    };
    return map[categoryId] || 'burgers';
  };
  
  // Carregar produtos do admin se existirem
  const [menuItems, setMenuItems] = useState<Product[]>(() => {
    const demoProducts = localStorage.getItem('demoProducts');
    if (demoProducts) {
      try {
        const parsedProducts = JSON.parse(demoProducts) as unknown;
        if (Array.isArray(parsedProducts)) {
          return parsedProducts.map((p) => {
            const obj = p as Record<string, unknown>;
            return {
              id: String(obj.id || ''),
              name: String(obj.name || ''),
              description: String(obj.description || ''),
              price: Number(obj.price) || 0,
              category: getCategorySlugById(String(obj.categoryId || '1')),
              image: String(obj.image || ''),
              tags: []
            } as Product;
          });
        }
      } catch (e) {
        // erro ao parsear produtos demo
      }
    }

    // Nenhum produto no localStorage, usando MENU_ITEMS
    return MENU_ITEMS;
  });
  
  // Atualizar menuItems quando localStorage mudar
  useEffect(() => {
    const handleStorageChange = () => {
      const demoProducts = localStorage.getItem('demoProducts');
      if (demoProducts) {
        try {
          const parsedProducts = JSON.parse(demoProducts) as unknown;
          if (Array.isArray(parsedProducts)) {
            const converted = parsedProducts.map((p) => {
              const obj = p as Record<string, unknown>;
              return {
                id: String(obj.id || ''),
                name: String(obj.name || ''),
                description: String(obj.description || ''),
                price: Number(obj.price) || 0,
                category: getCategorySlugById(String(obj.categoryId || '1')),
                image: String(obj.image || ''),
                tags: []
              } as Product;
            });
            setMenuItems(converted);
          }
          } catch (e) {
            // erro ao carregar produtos demo
          }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar a cada 2 segundos se houve mudança
    const interval = setInterval(() => {
      handleStorageChange();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    phone: '',
    isDelivery: true,
    zipCode: '',
    street: '',
    district: '',
    number: '',
    complement: '',
    referencePoint: '',
    paymentMethod: 'PIX',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    cashValue: '',
    needsChange: false
  });

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  function crc16(str: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  useEffect(() => {
    let mounted = true;
    async function fetchPix() {
      if (!showPayment || orderDetails.paymentMethod !== 'PIX') return;
      setIsQrLoading(true);
      setQrCodeUrl('');
      setQrError(null);
      try {
        // In development prefer the saved sample PNG to avoid external provider
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let resp;
        if (isLocal) {
          resp = await fetch('/api/payments/dev/sample-pix');
        } else {
          resp = await fetch('/api/payments/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Number(cartTotal), description: 'Pagamento do pedido' })
          });
        }
        if (!mounted) return;
        if (!resp.ok) {
          const txt = await resp.text();
          console.error('pix create error', txt);
          setQrError(typeof txt === 'string' ? txt : JSON.stringify(txt));
          setQrCodeUrl('');
        } else {
          // If we called the dev sample endpoint it returns an image binary, not JSON
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            // use the endpoint directly as src
            setQrCodeUrl('/api/payments/dev/sample-pix');
          } else {
            const data = await resp.json();
            const url = data.qrCodePng || data.qrCode || data.qrCodeData || '';
            if (!url) {
              setQrError('Resposta sem qrCode');
              setQrCodeUrl('');
            } else {
              setQrCodeUrl(url);
            }
          }
        }
      } catch (e) {
        console.error('failed to fetch pix', e);
        setQrError(String(e));
        setQrCodeUrl('');
      } finally {
        if (mounted) setIsQrLoading(false);
      }
    }

    fetchPix();
    return () => { mounted = false; };
  }, [showPayment, orderDetails.paymentMethod, cartTotal]);

  async function generatePixViaApi() {
    setIsQrLoading(true);
    setQrError(null);
    setQrCodeUrl('');
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let resp;
      if (isLocal) {
        resp = await fetch('/api/payments/dev/sample-pix');
      } else {
        resp = await fetch('/api/payments/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(cartTotal), description: 'Pagamento do pedido (manual)' })
        });
      }
      if (!resp.ok) {
        const txt = await resp.text();
        setQrError(typeof txt === 'string' ? txt : JSON.stringify(txt));
        return;
      }
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        setQrCodeUrl('/api/payments/dev/sample-pix');
      } else {
        const data = await resp.json();
        const url = data.qrCodePng || data.qrCode || data.qrCodeData || '';
        if (!url) {
          setQrError('Resposta sem qrCode');
        } else {
          setQrCodeUrl(url);
        }
      }
    } catch (e) {
      setQrError(String(e));
    } finally {
      setIsQrLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const openNotesModal = (itemId: string) => {
    const item = cart.find(i => i.id === itemId);
    setTempNotes(item?.notes || '');
    setItemNotesModal({ isOpen: true, itemId });
  };

  const saveItemNotes = () => {
    if (itemNotesModal.itemId) {
      setCart(prev => prev.map(item => 
        item.id === itemNotesModal.itemId 
          ? { ...item, notes: tempNotes }
          : item
      ));
    }
    setItemNotesModal({ isOpen: false, itemId: null });
    setTempNotes('');
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setOrderDetails(prev => ({
            ...prev,
            street: data.logradouro || '',
            district: data.bairro || '',
            zipCode: cep
          }));
        }
      } catch (e) {
        // CEP fetch error
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrderDetails(prev => ({
          ...prev,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
        setIsGeoLoading(false);
      },
      (_err) => {
        // geolocation error
        setIsGeoLoading(false);
        alert("Não foi possível obter sua localização. Verifique as permissões.");
      }
    );
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const recommendation = await getAIRecommendation(aiInput);
    setAiMessage(recommendation);
    setIsAiLoading(false);
    setAiInput('');
  };

  const generateWhatsAppLink = () => {
    const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
    
    let addressInfo = '';
    if (orderDetails.isDelivery) {
      addressInfo = `
*ENDEREÇO:*
📍 Rua: ${orderDetails.street}, ${orderDetails.number}
🏙️ Bairro: ${orderDetails.district}
📫 CEP: ${orderDetails.zipCode}
🏠 Comp: ${orderDetails.complement || 'N/A'}
🗺️ Ref: ${orderDetails.referencePoint || 'N/A'}
${orderDetails.coords ? `📍 GPS: https://www.google.com/maps?q=${orderDetails.coords.lat},${orderDetails.coords.lng}` : ''}`;
    }

    const message = `
*🍔 NOVO PEDIDO - GEMINI BURGER*
---
*CLIENTE:* ${orderDetails.customerName}
*TELEFONE:* ${orderDetails.phone}
*TIPO:* ${orderDetails.isDelivery ? '🚀 ENTREGA' : '🏠 RETIRADA'}
${addressInfo}
---
*PEDIDO:*
${itemsList}

*💰 TOTAL:* R$ ${cartTotal.toFixed(2)}
*💳 PAGAMENTO:* ${orderDetails.paymentMethod}
${orderDetails.paymentMethod.includes('Cartão') ? `*💳 CARTÃO:* ${orderDetails.cardName} - **** **** **** ${orderDetails.cardNumber?.slice(-4)}` : ''}
${orderDetails.notes ? `*📝 OBS:* ${orderDetails.notes}` : ''}
---
Aguardando confirmação!`.trim();

    // Salvar pedido no localStorage para o admin visualizar
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `#${String(Date.now()).slice(-6)}`,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: cartTotal,
      paymentMethod: orderDetails.paymentMethod,
      status: 'pending',
      isDelivery: orderDetails.isDelivery,
      address: orderDetails.isDelivery ? {
        street: orderDetails.street,
        number: orderDetails.number,
        district: orderDetails.district,
        zipCode: orderDetails.zipCode,
        complement: orderDetails.complement,
        referencePoint: orderDetails.referencePoint,
        coords: orderDetails.coords
      } : null,
      notes: orderDetails.notes,
      createdAt: new Date().toISOString()
    };

    // Adicionar ao localStorage
    const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
    existingOrders.unshift(newOrder);
    localStorage.setItem('demoOrders', JSON.stringify(existingOrders));

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    
    // Limpar carrinho após enviar
    setCart([]);
    setShowPayment(false);
    setShowCheckout(false);
    setShowCardModal(false);
    setShowCashModal(false);
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'combos', label: 'Combos', icon: <Package size={16}/> },
    { id: 'burgers', label: 'Hambúrgueres', icon: null },
    { id: 'sides', label: 'Acompanhamentos', icon: null },
    { id: 'drinks', label: 'Bebidas', icon: null },
    { id: 'alcohol', label: 'Bebidas Alcoólicas', icon: <Beer size={16}/> },
    { id: 'desserts', label: 'Sobremesas', icon: null },
  ];

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: appConfig?.bgColor || '#0f1724',
        color: appConfig?.textColor || undefined,
        ['--input-text-color' as any]: appConfig?.textColor || '#ffffff'
      } as React.CSSProperties}
    >
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Star className="text-white fill-current" size={24} />
            </div>
            <h1 className="font-heading text-2xl tracking-wider text-orange-500">
              {appConfig?.businessName || 'GEMINI BURGER'}
            </h1>
          </div>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-950">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <div className="relative z-10 max-w-2xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-heading mb-4 leading-tight">
            Escolha seu <span className="text-orange-500">Sabor Inteligente</span>
          </h2>
          <form 
            onSubmit={handleAiAsk} 
            className="flex gap-2 p-2 bg-zinc-900/90 rounded-2xl border border-zinc-800 transition-all shadow-2xl backdrop-blur-sm"
            onFocus={(e) => e.currentTarget.style.borderColor = appConfig?.primaryColor || '#ea580c'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#27272a'}
          >
            <input 
              type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)}
              placeholder="Peça uma recomendação: 'Quero um combo com IPA'..."
              className="flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-zinc-600"
            />
            <button 
              type="submit" 
              disabled={isAiLoading} 
              className="bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
          {aiMessage && (
            <div className="mt-4 p-4 bg-zinc-900 border border-orange-500/30 text-zinc-200 text-left relative animate-in fade-in slide-in-from-top-4 rounded-2xl">
              <button onClick={() => setAiMessage(null)} className="absolute top-2 right-2 text-zinc-500 hover:text-white"><X size={16}/></button>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1"><Star size={14} className="text-white fill-current" /></div>
                <p className="leading-relaxed italic text-sm">{aiMessage}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all group flex flex-col h-full shadow-lg">
              <div className="h-52 relative overflow-hidden bg-zinc-800 flex items-center justify-center">
                <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.name} style={{ objectFit: item.image.startsWith('/') || item.image.includes('png') ? 'contain' : 'cover' }} />
                {item.tags?.map(tag => (
                  <span key={tag} className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-md">{tag}</span>
                ))}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-zinc-100">{item.name}</h3>
                  <span className="text-orange-500 font-bold text-lg">R$ {item.price.toFixed(2)}</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-1">{item.description}</p>
                <button onClick={() => addToCart(item)} className="w-full py-4 bg-zinc-800 hover:bg-orange-600 text-zinc-100 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group-active:scale-95">
                  Adicionar ao Carrinho <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-800 animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-2xl font-heading text-white">Meu Carrinho</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <ShoppingCart size={80} className="mb-4" />
                  <p className="text-xl">Vazio por aqui...</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-zinc-800 shadow-md" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-zinc-100 text-lg">{item.name}</h4>
                      <p className="text-orange-500 font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      {item.notes && (
                        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-xs flex items-center gap-1">
                            <MessageCircle size={12} />
                            <span className="font-medium">Obs:</span> {item.notes}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-zinc-400 hover:text-orange-500 transition-colors"><Minus size={16} /></button>
                          <span className="w-4 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-zinc-400 hover:text-orange-500 transition-colors"><Plus size={16} /></button>
                        </div>
                        <button 
                          onClick={() => openNotesModal(item.id)} 
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                            item.notes 
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30' 
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400'
                          }`}
                          title={item.notes ? "Editar observação" : "Adicionar observação"}
                        >
                          <MessageCircle size={20} />
                          <span className="text-xs font-medium">
                            {item.notes ? 'Editar' : 'Obs'}
                          </span>
                        </button>
                        <button 
                          onClick={() => updateQuantity(item.id, -item.quantity)} 
                          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-400 text-lg">Total</span>
                  <span className="text-4xl font-heading text-orange-500">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setShowCheckout(true)} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-95">
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center py-10">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={() => setShowCheckout(false)} />
            <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-4xl font-heading text-white">Detalhes do Pedido</h3>
                  <button onClick={() => setShowCheckout(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full transition-colors"><X size={28} /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-orange-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <span className="w-8 h-[1px] bg-orange-500"></span> Identificação & Tipo
                    </h4>
                    <div className="space-y-4">
                      <input 
                        type="text" placeholder="Qual seu nome?" 
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500 transition-all"
                        value={orderDetails.customerName} onChange={e => setOrderDetails(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                      <input 
                        type="tel" placeholder="WhatsApp (DDD)"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500 transition-all"
                        value={orderDetails.phone} onChange={e => setOrderDetails(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setOrderDetails(prev => ({ ...prev, isDelivery: true }))} className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${orderDetails.isDelivery ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                        <MapPin size={20} /> Entrega
                      </button>
                      <button onClick={() => setOrderDetails(prev => ({ ...prev, isDelivery: false }))} className={`flex-1 py-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${!orderDetails.isDelivery ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                        <ShoppingCart size={20} /> Retirada
                      </button>
                    </div>

                    {orderDetails.isDelivery && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex gap-4">
                          <div className="flex-1 relative">
                            <input 
                              type="text" placeholder="CEP" 
                              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500 transition-all"
                              value={orderDetails.zipCode} onChange={e => {
                                setOrderDetails(prev => ({ ...prev, zipCode: e.target.value }));
                                fetchAddressByCep(e.target.value);
                              }}
                            />
                            {isCepLoading && <Loader2 className="absolute right-4 top-4 animate-spin text-orange-500" />}
                          </div>
                          <button 
                            onClick={getUserLocation} 
                            className={`px-4 bg-zinc-900 border-2 rounded-2xl hover:border-orange-500 transition-all ${orderDetails.coords ? 'text-green-500 border-green-500/50' : 'text-zinc-500 border-zinc-800'}`}
                            title="Usar localização atual"
                          >
                            {isGeoLoading ? <Loader2 className="animate-spin" /> : <Navigation size={24} />}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <input 
                            type="text" placeholder="Rua" className="col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500"
                            value={orderDetails.street} onChange={e => setOrderDetails(prev => ({ ...prev, street: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Nº" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500 text-center"
                            value={orderDetails.number} onChange={e => setOrderDetails(prev => ({ ...prev, number: e.target.value }))}
                          />
                        </div>
                        <input 
                          type="text" placeholder="Bairro" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500"
                          value={orderDetails.district} onChange={e => setOrderDetails(prev => ({ ...prev, district: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" placeholder="Complemento" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500"
                            value={orderDetails.complement} onChange={e => setOrderDetails(prev => ({ ...prev, complement: e.target.value }))}
                          />
                          <input 
                            type="text" placeholder="Ref. (opcional)" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-orange-500"
                            value={orderDetails.referencePoint} onChange={e => setOrderDetails(prev => ({ ...prev, referencePoint: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-orange-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <span className="w-8 h-[1px] bg-orange-500"></span> Pagamento
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setOrderDetails(prev => ({ ...prev, paymentMethod: method as PaymentMethod }))}
                          className={`w-full py-4 px-6 rounded-2xl border-2 flex items-center justify-between transition-all ${orderDetails.paymentMethod === method ? 'bg-zinc-800 border-orange-500 text-white shadow-md' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                          <span className="flex items-center gap-4 font-semibold text-lg">
                            <CreditCard size={22} /> {method}
                          </span>
                          {orderDetails.paymentMethod === method && <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-zinc-800">
                  <div className="text-center md:text-left">
                    <p className="text-zinc-500 text-lg">Total Final</p>
                    <p className="text-5xl font-heading text-orange-500">R$ {cartTotal.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (orderDetails.paymentMethod === 'PIX') {
                        setShowPayment(true);
                        setShowCheckout(false);
                      } else if (orderDetails.paymentMethod.includes('Cartão')) {
                        setShowCardModal(true);
                      } else if (orderDetails.paymentMethod === 'Dinheiro') {
                        setShowCashModal(true);
                      }
                    }}
                    disabled={!orderDetails.customerName || !orderDetails.phone || (orderDetails.isDelivery && (!orderDetails.street || !orderDetails.number))}
                    className="w-full md:w-auto px-16 py-6 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-green-600/30 flex items-center justify-center gap-4 text-xl group active:scale-95"
                  >
                    <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" /> Ir para Pagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowPayment(false)} />
          <div className="relative bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-heading text-white">Pagamento</h2>
                <button onClick={() => setShowPayment(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-full transition-colors"><X size={28} /></button>
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">Método de Pagamento</label>
                <select
                  value={orderDetails.paymentMethod}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              {orderDetails.paymentMethod === 'PIX' ? (
                <div className="text-center">
                  <h3 className="text-xl text-white mb-4">Pague com PIX</h3>
                  <p className="text-zinc-400 mb-6">Escaneie o QR Code abaixo para pagar R$ {cartTotal.toFixed(2)}</p>
                  {isQrLoading ? (
                    <p className="text-zinc-400">Gerando QR Code...</p>
                  ) : qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code PIX" className="mx-auto mb-6" />
                  ) : (
                    <div className="mb-4">
                      <p className="text-zinc-400">Não foi possível gerar o QR Code.</p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <button onClick={generatePixViaApi} className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl">Gerar QR manualmente</button>
                      </div>
                      {qrError && <p className="text-red-400 mt-3 text-sm">Erro: {qrError}</p>}
                    </div>
                  )}
                  {qrError && !isQrLoading && qrCodeUrl && <p className="text-red-400 mt-3 text-sm">Erro: {qrError}</p>}
                  <button 
                    onClick={generateWhatsAppLink}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all"
                  >
                    Confirmar Pagamento e Enviar Pedido
                  </button>
                </div>
              ) : orderDetails.paymentMethod.includes('Cartão') ? (
                <div>
                  <h3 className="text-xl text-white mb-4">Dados do Cartão</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nome no cartão"
                      value={orderDetails.cardName || ''}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, cardName: e.target.value }))}
                      className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500"
                    />
                    <input
                      type="text"
                      placeholder="Número do cartão"
                      value={orderDetails.cardNumber || ''}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500"
                    />
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={orderDetails.cardExpiry || ''}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, cardExpiry: e.target.value }))}
                        className="flex-1 p-4 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={orderDetails.cardCvv || ''}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, cardCvv: e.target.value }))}
                        className="flex-1 p-4 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={generateWhatsAppLink}
                    disabled={!orderDetails.cardName || !orderDetails.cardNumber || !orderDetails.cardExpiry || !orderDetails.cardCvv}
                    className="w-full mt-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white font-bold rounded-2xl transition-all"
                  >
                    Confirmar Pagamento e Enviar Pedido
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl text-white mb-4">Pagamento em Dinheiro</h3>
                  <p className="text-zinc-400 mb-6">Pagamento será feito na entrega/retirada.</p>
                  <button 
                    onClick={generateWhatsAppLink}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all"
                  >
                    Enviar Pedido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Notes Modal */}
      {itemNotesModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setItemNotesModal({ isOpen: false, itemId: null })} />
          <div className="relative bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-blue-500/50 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading text-white flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <MessageCircle className="text-blue-400" size={32} />
                  </div>
                  <span>Observações do Item</span>
                </h3>
                <button onClick={() => setItemNotesModal({ isOpen: false, itemId: null })} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <p className="text-blue-400 text-sm font-medium mb-2">💡 Exemplos de observações:</p>
                <ul className="text-blue-300 text-xs space-y-1 ml-4 list-disc">
                  <li>Sem cebola</li>
                  <li>Ponto da carne: mal passada</li>
                  <li>Sem picles</li>
                  <li>Molho à parte</li>
                  <li>Batata bem crocante</li>
                </ul>
              </div>
              
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne bem passado..."
                className="w-full bg-zinc-800 border-2 border-zinc-700 focus:border-blue-500 rounded-2xl px-6 py-4 text-orange-500 placeholder-zinc-500 outline-none transition-all h-32 resize-none text-base"
                maxLength={200}
              />
              <p className="text-zinc-500 text-xs mt-2 text-right">{tempNotes.length}/200 caracteres</p>
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setItemNotesModal({ isOpen: false, itemId: null })}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-2xl transition-all border border-zinc-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveItemNotes}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Salvar Observação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowCardModal(false)} />
          <div className="relative bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading text-white flex items-center gap-3">
                  <CreditCard className="text-orange-500" size={28} />
                  Pagamento com Cartão
                </h3>
                <button onClick={() => setShowCardModal(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-blue-400 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">Informação Importante</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      O pagamento será realizado na {orderDetails.isDelivery ? 'entrega' : 'retirada'} do pedido. 
                      Nosso entregador levará a máquina de cartão para processar o pagamento de <strong className="text-white">R$ {cartTotal.toFixed(2)}</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-2xl transition-all"
                >
                  Voltar
                </button>
                <button 
                  onClick={() => {
                    setShowCardModal(false);
                    setShowCheckout(false);
                    setShowPayment(true);
                  }}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Confirmar <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Modal */}
      {showCashModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowCashModal(false)} />
          <div className="relative bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading text-white flex items-center gap-3">
                  <CreditCard className="text-orange-500" size={28} />
                  Pagamento em Dinheiro
                </h3>
                <button onClick={() => setShowCashModal(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">Valor total do pedido</label>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4">
                    <p className="text-3xl font-heading" style={{ color: appConfig?.secondaryColor || '#f59e0b' }}>R$ {cartTotal.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
                  <input
                    type="checkbox"
                    id="needsChange"
                    checked={needsChange}
                    onChange={(e) => {
                      setNeedsChange(e.target.checked);
                      if (!e.target.checked) setCashAmount('');
                    }}
                    className="w-5 h-5 rounded accent-orange-500"
                  />
                  <label htmlFor="needsChange" className="text-white font-semibold cursor-pointer flex-1">
                    Preciso de troco
                  </label>
                </div>

                {needsChange && (
                  <div className="animate-in slide-in-from-top-4 duration-200">
                    <label className="block text-white mb-2 font-semibold">Valor que vai pagar</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={cashAmount}
                      onChange={(e) => {
                        setCashAmount(e.target.value);
                        setOrderDetails(prev => ({ ...prev, cashValue: e.target.value, needsChange: true }));
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg outline-none focus:border-orange-500 transition-all"
                      style={{ color: `${inputTextColor} !important` }}
                    />
                    {cashAmount && parseFloat(cashAmount) > cartTotal && (
                      <p className="text-green-400 text-sm mt-2 font-semibold">
                        Troco: R$ {(parseFloat(cashAmount) - cartTotal).toFixed(2)}
                      </p>
                    )}
                    {cashAmount && parseFloat(cashAmount) < cartTotal && (
                      <p className="text-red-400 text-sm mt-2 font-semibold">
                        ⚠️ O valor informado é menor que o total do pedido
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setShowCashModal(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-2xl transition-all"
                >
                  Voltar
                </button>
                <button 
                  onClick={() => {
                    if (!needsChange) {
                      setOrderDetails(prev => ({ ...prev, cashValue: '', needsChange: false }));
                    }
                    setShowCashModal(false);
                    setShowCheckout(false);
                    setShowPayment(true);
                  }}
                  disabled={needsChange && (!cashAmount || parseFloat(cashAmount) < cartTotal)}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Confirmar <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-16 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <Star className="text-orange-500 fill-current" size={24} />
              <h2 className="font-heading text-3xl tracking-wider">GEMINI BURGER</h2>
            </div>
            <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
              Alta gastronomia artesanal com entrega expressa via WhatsApp. Sabor e inteligência em cada mordida.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-center md:text-left">
            <div>
              <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.3em]">Menu</h5>
              <ul className="text-zinc-500 space-y-3 text-xs">
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Combos</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Hambúrgueres</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Artesanais</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.3em]">Funcionamento</h5>
              <ul className="text-zinc-500 space-y-3 text-xs">
                <li>Terça à Domingo</li>
                <li>18:00 — 23:30</li>
                <li>Delivery: (11) 9999-9999</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.3em]">Redes</h5>
              <div className="flex justify-center md:justify-start gap-4 text-zinc-500">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center hover:text-white transition-all cursor-pointer border border-zinc-800 hover:border-orange-500"><MessageSquare size={18}/></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-zinc-900 text-center text-zinc-700 text-[10px] uppercase tracking-widest">
          Gemini Burger © 2024 — Orgulhosamente artesanal.
        </div>
      </footer>

      {/* Mobile Sticky Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom-4">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="w-full text-white p-5 rounded-2xl font-bold flex items-center justify-between shadow-2xl active:scale-95 transition-transform"
            style={{ 
              backgroundColor: appConfig?.primaryColor || '#ea580c',
              boxShadow: `0 25px 50px -12px ${appConfig?.primaryColor || '#ea580c'}66`
            }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl"><ShoppingCart size={24} /></div>
              <span className="text-lg">Carrinho ({cart.reduce((a,b) => a + b.quantity, 0)})</span>
            </div>
            <span className="text-xl">R$ {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
