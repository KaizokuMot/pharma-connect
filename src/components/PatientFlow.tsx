import React, { useState, useEffect } from 'react';
import { mockDb } from '../data/mockDb.ts';
import type { Drug, Order } from '../data/mockDb.ts';
import MdesTestImage from '../assets/test_image.jpg';

interface PatientFlowProps {
  activeTab: 'search' | 'cart' | 'orders';
  setActiveTab: (tab: 'search' | 'cart' | 'orders') => void;
  cart: { drugId: string; quantity: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ drugId: string; quantity: number }[]>>;
}

export const PatientFlow: React.FC<PatientFlowProps> = ({
  activeTab,
  setActiveTab,
  cart,
  setCart
}) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // Checkout Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [division, setDivision] = useState<'Kampala Central' | 'Kawempe' | 'Makindye' | 'Rubaga' | 'Nakawa'>('Kampala Central');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Cash on Delivery'>('Mobile Money');
  
  // Prescription State
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load drugs
    setDrugs(mockDb.getDrugs());
    // Load orders
    setOrders(mockDb.getOrders());
  }, [activeTab]);

  // Categories
  const categories = ['All', 'Antibiotics', 'Painkillers', 'Antivirals', 'Cardiovascular', 'Respiratory', 'Supplements'];

  // Filter drugs
  const filteredDrugs = drugs.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drug.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drug.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart operations
  const addToCart = (drug: Drug) => {
    if (drug.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.drugId === drug.id);
      if (existing) {
        if (existing.quantity >= drug.stock) return prev; // Limit to stock
        return prev.map(item => item.drugId === drug.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { drugId: drug.id, quantity: 1 }];
    });
  };

  const updateQuantity = (drugId: string, delta: number) => {
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return;

    setCart(prev => {
      const existing = prev.find(item => item.drugId === drugId);
      if (!existing) return prev;
      
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(item => item.drugId !== drugId);
      }
      if (newQty > drug.stock) return prev; // Limit to stock
      
      return prev.map(item => item.drugId === drugId ? { ...item, quantity: newQty } : item);
    });
  };

  const cartDetails = cart.map(item => {
    const drug = drugs.find(d => d.id === item.drugId);
    return {
      drug,
      quantity: item.quantity
    };
  }).filter(item => item.drug !== undefined) as { drug: Drug; quantity: number }[];

  const cartTotal = cartDetails.reduce((sum, item) => sum + (item.drug.price * item.quantity), 0);
  const cartNeedsPrescription = cartDetails.some(item => item.drug.prescriptionRequired);

  // Generate a mock prescription file
  const generateMockPrescription = () => {
    setIsUploading(true);
    setTimeout(() => {
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e0f2fe"/><text x="10" y="30" font-size="6" font-weight="bold" font-family="sans-serif" fill="%230369a1">KAMPALA CLINIC RX</text><text x="10" y="45" font-size="5" font-family="sans-serif">Patient: ${patientName || 'Anonymous'}</text><text x="10" y="60" font-size="5" font-family="sans-serif" font-weight="bold">Rx: ${cartDetails.map(c => c.drug.name).join(', ')}</text><text x="10" y="80" font-size="4" font-family="sans-serif" fill="%236b7280">Ref No: RX-${Math.floor(100000 + Math.random() * 900000)}</text></svg>`;
      setPrescriptionFile(mockSvg);
      setPrescriptionFileName(`Rx_Prescription_${Date.now().toString().slice(-4)}.svg`);
      setIsUploading(false);
    }, 800);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (cartNeedsPrescription && !prescriptionFile) {
      alert('This order contains prescription-required drugs. Please upload/generate a prescription.');
      return;
    }
    if (!patientName || !patientPhone || !deliveryAddress) {
      alert('Please fill out all fields.');
      return;
    }

    const orderItems = cartDetails.map(item => ({
      drugId: item.drug.id,
      name: item.drug.name,
      quantity: item.quantity,
      price: item.drug.price
    }));

    const newOrder = mockDb.createOrder({
      patientName,
      patientPhone,
      items: orderItems,
      totalAmount: cartTotal,
      division,
      deliveryAddress,
      paymentMethod,
      status: cartNeedsPrescription ? 'verifying' : 'pending',
      prescriptionUrl: prescriptionFile || undefined
    });

    // Reset states
    setCart([]);
    setPrescriptionFile(null);
    setPrescriptionFileName('');
    setPatientName('');
    setPatientPhone('');
    setDeliveryAddress('');

    // Go to tracking
    setOrders(mockDb.getOrders());
    setSelectedOrder(newOrder);
    setActiveTab('orders');
  };

  const handleMarkCompleted = (orderId: string) => {
    const updated = mockDb.updateOrderStatus(orderId, 'completed', 'Order received and marked completed by patient.');
    if (updated) {
      setOrders(mockDb.getOrders());
      setSelectedOrder(updated);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' UGX';
  };

  return (
    <div className="glass-container">
      {/* 1. SEARCH TAB */}
      {activeTab === 'search' && !selectedDrug && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Find Medications</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}> Kampalas trusted digital pharmacy network </p>
          </div>

          {/* Search box */}
          <div className="input-group" style={{ marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search drug name or active ingredient..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Slider */}
          <div className="category-slider">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'category-pill-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Listing */}
          <div style={{ marginTop: '8px' }}>
            {filteredDrugs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</p>
                <p style={{ fontWeight: 500 }}>No medications found matching your filter.</p>
              </div>
            ) : (
              filteredDrugs.map(drug => (
                <div key={drug.id} className="glass-card glass-card-interactive" onClick={() => setSelectedDrug(drug)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                    <img src={MdesTestImage} alt={drug.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{drug.name}</span>
                      {drug.prescriptionRequired && (
                        <span className="badge badge-warning" style={{ fontSize: '8px', padding: '2px 4px' }}>Rx</span>
                      )}
                    </div>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {drug.genericName}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{formatPrice(drug.price)}</span>
                      <span style={{ fontSize: '11px', color: drug.stock > 10 ? 'var(--success)' : drug.stock > 0 ? 'var(--warning)' : 'var(--danger)' }}>
                        {drug.stock > 0 ? `${drug.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(drug);
                    }}
                    disabled={drug.stock <= 0}
                    className="btn btn-primary"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
                  >
                    ＋
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DRUG DETAIL MODAL (within search tab) */}
      {activeTab === 'search' && selectedDrug && (
        <div className="animate-fade-in">
          <button onClick={() => setSelectedDrug(null)} className="btn btn-secondary btn-small" style={{ width: 'auto', marginBottom: '16px' }}>
            ← Back to Medications
          </button>
          
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
              <img src={selectedDrug.image} alt={selectedDrug.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span className="badge badge-secondary" style={{ marginBottom: '6px' }}>{selectedDrug.category}</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '2px', color: 'var(--text-primary)' }}>{selectedDrug.name}</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{selectedDrug.genericName}</p>
                </div>
                {selectedDrug.prescriptionRequired && (
                  <span className="badge badge-danger" style={{ padding: '4px 8px' }}>Prescription Req.</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 0', padding: '12px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Price ({selectedDrug.unit})</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(selectedDrug.price)}</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedDrug.description}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Dosage & Usage</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedDrug.usage}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Fulfill Partner: <strong>{selectedDrug.pharmacyName}</strong></span>
                <span>Available Stock: <strong>{selectedDrug.stock}</strong></span>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedDrug);
                  setSelectedDrug(null);
                }}
                disabled={selectedDrug.stock <= 0}
                className="btn btn-primary"
              >
                {selectedDrug.stock > 0 ? `Add to Cart - ${formatPrice(selectedDrug.price)}` : 'Temporarily Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CART TAB */}
      {activeTab === 'cart' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Shopping Cart</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Review selected drugs and place order</p>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Your shopping cart is empty.</p>
              <button onClick={() => setActiveTab('search')} className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                Browse Medications
              </button>
            </div>
          ) : (
            <div>
              {/* Cart Items List */}
              <div style={{ marginBottom: '20px' }}>
                {cartDetails.map(item => (
                  <div key={item.drug.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', marginBottom: '10px', gap: '12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <img src={item.drug.image} alt={item.drug.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{item.drug.name}</span>
                        {item.drug.prescriptionRequired && (
                          <span className="badge badge-warning" style={{ fontSize: '8px', padding: '2px 4px' }}>Rx</span>
                        )}
                      </div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{formatPrice(item.drug.price)} each</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateQuantity(item.drug.id, -1)} className="btn btn-secondary btn-small" style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        －
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.drug.id, 1)} className="btn btn-secondary btn-small" style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ＋
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Card */}
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderLeft: '3px solid var(--primary)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(cartTotal)}</span>
              </div>

              {/* Prescription Upload Panel */}
              {cartNeedsPrescription && (
                <div className="glass-card" style={{ borderLeft: '3px solid var(--warning)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Prescription Required</h3>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    One or more items in your cart require a valid prescription. Please generate or upload a doctor's slip.
                  </p>
                  
                  {prescriptionFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500 }}>✓ {prescriptionFileName}</span>
                        <button onClick={() => { setPrescriptionFile(null); setPrescriptionFileName(''); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: prescriptionFile.replace('data:image/svg+xml;utf8,', '') }} style={{ width: '100px', height: '100px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}></div>
                    </div>
                  ) : (
                    <div className="prescription-uploader" onClick={generateMockPrescription}>
                      {isUploading ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uploading prescription...</span>
                      ) : (
                        <>
                          <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>📄</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>Generate Mock Prescription</span>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Simulates doctor validation against database</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Form */}
              <form onSubmit={handlePlaceOrder} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>Delivery Details</h3>
                </div>

                <div className="input-group">
                  <span className="input-label">Patient Full Name</span>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your name"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <span className="input-label">Mobile Number</span>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    placeholder="e.g. +256 701 234 567"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <span className="input-label">Kampala Division</span>
                  <select
                    className="input-field select-field"
                    value={division}
                    onChange={e => setDivision(e.target.value as any)}
                  >
                    <option value="Kampala Central">Kampala Central (Nakasero, Wandegeya)</option>
                    <option value="Kawempe">Kawempe (Mulago, Kawempe)</option>
                    <option value="Makindye">Makindye (Kibuli, Muyenga)</option>
                    <option value="Rubaga">Rubaga (Mengo, Rubaga)</option>
                    <option value="Nakawa">Nakawa (Bugolobi, Ntinda)</option>
                  </select>
                </div>

                <div className="input-group">
                  <span className="input-label">Specific Street Address</span>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Plot 12, Wandegeya Rd"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <span className="input-label">Payment Method</span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: paymentMethod === 'Mobile Money' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', border: `1px solid ${paymentMethod === 'Mobile Money' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'Mobile Money'} onChange={() => setPaymentMethod('Mobile Money')} style={{ accentColor: 'var(--primary)' }} />
                      Mobile Money
                    </label>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: paymentMethod === 'Cash on Delivery' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', border: `1px solid ${paymentMethod === 'Cash on Delivery' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} style={{ accentColor: 'var(--primary)' }} />
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                >
                  Place Order • {formatPrice(cartTotal)}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. ORDERS TAB & TRACKING VIEW */}
      {activeTab === 'orders' && !selectedOrder && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Track Orders</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Status and history of your pharmacy orders</p>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📦</span>
              <p>No orders placed yet.</p>
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="glass-card glass-card-interactive"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{order.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatPrice(order.totalAmount)}
                    </span>
                    <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      📍 {order.division}
                    </span>
                  </div>

                  <span className={`badge ${
                    order.status === 'completed' ? 'badge-success' :
                    order.status === 'cancelled' ? 'badge-danger' :
                    order.status === 'dispatched' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRACKING TIMELINE DETAIL VIEW */}
      {activeTab === 'orders' && selectedOrder && (
        <div className="animate-fade-in">
          <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary btn-small" style={{ width: 'auto', marginBottom: '16px' }}>
            ← Back to Orders
          </button>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{selectedOrder.id}</h2>
              </div>
              <span className={`badge ${
                selectedOrder.status === 'completed' ? 'badge-success' :
                selectedOrder.status === 'cancelled' ? 'badge-danger' :
                selectedOrder.status === 'dispatched' ? 'badge-info' :
                'badge-warning'
              }`}>
                {selectedOrder.status}
              </span>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px' }}>
              <p style={{ marginBottom: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Deliver to:</span> <strong>{selectedOrder.patientName}</strong></p>
              <p style={{ marginBottom: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {selectedOrder.patientPhone}</p>
              <p style={{ marginBottom: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Address:</span> {selectedOrder.deliveryAddress}, {selectedOrder.division}</p>
              <p><span style={{ color: 'var(--text-muted)' }}>Method:</span> {selectedOrder.paymentMethod}</p>
            </div>

            {/* Items table */}
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '20px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '6px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>Item</span>
                <span>Total</span>
              </div>
              {selectedOrder.items.map(item => (
                <div key={item.drugId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '6px', fontWeight: 700, color: 'var(--primary)' }}>
                <span>Total</span>
                <span>{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Order Timeline</h3>
              
              <div className="timeline">
                {selectedOrder.trackingTimeline.map((step, idx) => (
                  <div key={idx} className="timeline-step">
                    <div className={`timeline-dot ${idx === selectedOrder.trackingTimeline.length - 1 ? 'timeline-dot-active' : ''}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-title" style={{ textTransform: 'capitalize' }}>{step.status}</div>
                      <div className="timeline-time">
                        {new Date(step.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="timeline-note">{step.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action for patient to complete order */}
            {selectedOrder.status === 'dispatched' && (
              <button
                onClick={() => handleMarkCompleted(selectedOrder.id)}
                className="btn btn-primary"
              >
                ✓ Confirm Order Delivery Received
              </button>
            )}
            
            {selectedOrder.status === 'delivered' && (
              <button
                onClick={() => handleMarkCompleted(selectedOrder.id)}
                className="btn btn-primary"
              >
                ✓ Confirm Delivery Received
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
