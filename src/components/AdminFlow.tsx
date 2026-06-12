import React, { useState, useEffect } from 'react';
import { mockDb } from '../data/mockDb.ts';
import type { Drug, Order, OrderStatus } from '../data/mockDb.ts';

interface AdminFlowProps {
  activeTab: 'dashboard' | 'orders' | 'inventory';
  setActiveTab: (tab: 'dashboard' | 'orders' | 'inventory') => void;
}

export const AdminFlow: React.FC<AdminFlowProps> = ({ activeTab }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Prescription Reject State
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Inventory Management State
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [drugForm, setDrugForm] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics' as Drug['category'],
    price: 0,
    stock: 0,
    unit: 'Pack of 30',
    prescriptionRequired: false,
    description: '',
    usage: '',
    pharmacyName: 'Nakasero Pharmacy',
    image: '/src/assets/test_image.jpg'
  });

  const refreshData = () => {
    setOrders(mockDb.getOrders());
    setDrugs(mockDb.getDrugs());
    setAnalytics(mockDb.getAnalytics());
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handleApprovePrescription = (orderId: string) => {
    const updated = mockDb.approvePrescription(orderId, true);
    if (updated) {
      setSelectedOrder(updated);
      refreshData();
    }
  };

  const handleRejectPrescription = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    const updated = mockDb.approvePrescription(orderId, false, rejectReason);
    if (updated) {
      setSelectedOrder(updated);
      setRejectMode(false);
      setRejectReason('');
      refreshData();
    }
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'pending';
    let note = '';

    if (currentStatus === 'pending') {
      nextStatus = 'confirmed';
      note = 'Order verified by pharmacy and confirmed for fulfillment.';
    } else if (currentStatus === 'confirmed') {
      nextStatus = 'dispatched';
      note = 'Order packaged and handed over to SafeBoda express rider.';
    } else if (currentStatus === 'dispatched') {
      nextStatus = 'delivered';
      note = 'Rider arrived at Kampala address. Package delivered.';
    }

    const updated = mockDb.updateOrderStatus(orderId, nextStatus, note);
    if (updated) {
      setSelectedOrder(updated);
      refreshData();
    }
  };

  const handleSaveDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      mockDb.addDrug(drugForm);
    } else if (editingDrug) {
      mockDb.updateDrug({
        ...drugForm,
        id: editingDrug.id
      });
    }
    setIsAdding(false);
    setEditingDrug(null);
    refreshData();
  };

  const handleDeleteDrug = (drugId: string) => {
    if (window.confirm('Are you sure you want to remove this medication from inventory?')) {
      mockDb.deleteDrug(drugId);
      refreshData();
    }
  };

  const startEdit = (drug: Drug) => {
    setEditingDrug(drug);
    setDrugForm({
      name: drug.name,
      genericName: drug.genericName,
      category: drug.category,
      price: drug.price,
      stock: drug.stock,
      unit: drug.unit,
      prescriptionRequired: drug.prescriptionRequired,
      description: drug.description,
      usage: drug.usage,
      pharmacyName: drug.pharmacyName,
      image: drug.image
    });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingDrug(null);
    setDrugForm({
      name: '',
      genericName: '',
      category: 'Antibiotics',
      price: 15000,
      stock: 50,
      unit: 'Pack of 30 tablets',
      prescriptionRequired: false,
      description: '',
      usage: '',
      pharmacyName: 'Nakasero Pharmacy',
      image: '/src/assets/test_image.jpg'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' UGX';
  };

  return (
    <div className="glass-container">
      {/* 1. DASHBOARD & ANALYTICS TAB */}
      {activeTab === 'dashboard' && analytics && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Kampala District Network Analytics</p>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div className="glass-card" style={{ margin: 0, padding: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Total Orders</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{analytics.totalOrders}</span>
            </div>
            <div className="glass-card" style={{ margin: 0, padding: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Gross Revenue</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)', whiteSpace: 'nowrap' }}>{formatPrice(analytics.revenue)}</span>
            </div>
            <div className="glass-card" style={{ margin: 0, padding: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Low Stock Items</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: analytics.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{analytics.lowStockCount}</span>
            </div>
            <div className="glass-card" style={{ margin: 0, padding: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Pending Review</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--warning)' }}>{analytics.statusCounts.verifying || 0}</span>
            </div>
          </div>

          {/* Kampala map SVG layout */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>📍 Order Density Map</h3>
            <div className="map-container">
              <svg className="map-svg" viewBox="0 0 100 100">
                {/* Simplified stylized outline of Kampala divisions */}
                {/* Kawempe (North) */}
                <path d="M 20,25 L 45,10 L 70,20 L 55,40 L 30,35 Z" className="map-division" style={{ fill: 'rgba(6, 182, 212, 0.08)' }} />
                {/* Kampala Central */}
                <path d="M 30,35 L 55,40 L 65,55 L 45,60 L 25,50 Z" className="map-division" style={{ fill: 'rgba(79, 70, 229, 0.08)' }} />
                {/* Nakawa (East) */}
                <path d="M 70,20 L 95,30 L 90,65 L 65,55 L 55,40 Z" className="map-division" style={{ fill: 'rgba(236, 72, 153, 0.08)' }} />
                {/* Rubaga (West) */}
                <path d="M 5,45 L 25,50 L 45,60 L 30,85 L 10,75 Z" className="map-division" style={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
                {/* Makindye (South) */}
                <path d="M 45,60 L 65,55 L 85,75 L 60,95 L 30,85 Z" className="map-division" style={{ fill: 'rgba(16, 185, 129, 0.08)' }} />

                {/* Legend points */}
                {/* Central */}
                <circle cx="48" cy="48" r="3" fill="#4f46e5" />
                {/* Kawempe */}
                <circle cx="45" cy="23" r="3" fill="#06b6d4" />
                {/* Makindye */}
                <circle cx="60" cy="74" r="3" fill="#10b981" />
                {/* Rubaga */}
                <circle cx="23" cy="62" r="3" fill="#f59e0b" />
                {/* Nakawa */}
                <circle cx="75" cy="42" r="3" fill="#ec4899" />
              </svg>
              
              {/* Overlay markers based on actual orders */}
              {analytics.divisionCounts['Kampala Central'] > 0 && (
                <div className="map-marker" style={{ left: '48%', top: '48%', background: '#4f46e5' }}>
                  <div className="map-marker-pulse" style={{ background: '#4f46e5' }}></div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', zIndex: 2 }}>{analytics.divisionCounts['Kampala Central']}</span>
                </div>
              )}
              {analytics.divisionCounts['Kawempe'] > 0 && (
                <div className="map-marker" style={{ left: '45%', top: '23%', background: '#06b6d4' }}>
                  <div className="map-marker-pulse" style={{ background: '#06b6d4' }}></div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', zIndex: 2 }}>{analytics.divisionCounts['Kawempe']}</span>
                </div>
              )}
              {analytics.divisionCounts['Makindye'] > 0 && (
                <div className="map-marker" style={{ left: '60%', top: '74%', background: '#10b981' }}>
                  <div className="map-marker-pulse" style={{ background: '#10b981' }}></div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', zIndex: 2 }}>{analytics.divisionCounts['Makindye']}</span>
                </div>
              )}
              {analytics.divisionCounts['Rubaga'] > 0 && (
                <div className="map-marker" style={{ left: '23%', top: '62%', background: '#f59e0b' }}>
                  <div className="map-marker-pulse" style={{ background: '#f59e0b' }}></div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', zIndex: 2 }}>{analytics.divisionCounts['Rubaga']}</span>
                </div>
              )}
              {analytics.divisionCounts['Nakawa'] > 0 && (
                <div className="map-marker" style={{ left: '75%', top: '42%', background: '#ec4899' }}>
                  <div className="map-marker-pulse" style={{ background: '#ec4899' }}></div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', zIndex: 2 }}>{analytics.divisionCounts['Nakawa']}</span>
                </div>
              )}
            </div>

            <div className="map-legend">
              <div className="map-legend-item"><span className="map-legend-color" style={{ background: '#4f46e5' }}></span> Central ({analytics.divisionCounts['Kampala Central'] || 0})</div>
              <div className="map-legend-item"><span className="map-legend-color" style={{ background: '#06b6d4' }}></span> Kawempe ({analytics.divisionCounts['Kawempe'] || 0})</div>
              <div className="map-legend-item"><span className="map-legend-color" style={{ background: '#10b981' }}></span> Makindye ({analytics.divisionCounts['Makindye'] || 0})</div>
              <div className="map-legend-item"><span className="map-legend-color" style={{ background: '#f59e0b' }}></span> Rubaga ({analytics.divisionCounts['Rubaga'] || 0})</div>
              <div className="map-legend-item"><span className="map-legend-color" style={{ background: '#ec4899' }}></span> Nakawa ({analytics.divisionCounts['Nakawa'] || 0})</div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {analytics.lowStock.length > 0 && (
            <div className="glass-card" style={{ borderColor: 'var(--danger-glow)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ LOW STOCK WARNINGS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.lowStock.map((drug: Drug) => (
                  <div key={drug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <img src={drug.image} alt={drug.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span>{drug.name} ({drug.pharmacyName})</span>
                    </div>
                    <strong style={{ color: 'var(--danger)' }}>{drug.stock} left</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ORDERS LIST & ACTIONS */}
      {activeTab === 'orders' && !selectedOrder && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Manage Orders</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fulfillment and prescription reviews</p>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <p>No customer orders in network database.</p>
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="glass-card glass-card-interactive"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{order.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.patientName}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {order.items.length} drug(s) • {formatPrice(order.totalAmount)}
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                      📍 {order.division} • {order.paymentMethod}
                    </span>
                  </div>

                  <span className={`badge ${
                    order.status === 'completed' ? 'badge-success' :
                    order.status === 'cancelled' ? 'badge-danger' :
                    order.status === 'dispatched' ? 'badge-info' :
                    order.status === 'verifying' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {order.status === 'verifying' ? 'Needs Rx Review' : order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULFILLMENT / PRESCRIPTION VERIFICATION VIEW */}
      {activeTab === 'orders' && selectedOrder && (
        <div className="animate-fade-in">
          <button
            onClick={() => {
              setSelectedOrder(null);
              setRejectMode(false);
              setRejectReason('');
            }}
            className="btn btn-secondary btn-small"
            style={{ width: 'auto', marginBottom: '16px' }}
          >
            ← Back to Orders
          </button>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CLIENT ORDER</span>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{selectedOrder.id}</h2>
              </div>
              <span className={`badge ${
                selectedOrder.status === 'completed' ? 'badge-success' :
                selectedOrder.status === 'cancelled' ? 'badge-danger' :
                selectedOrder.status === 'dispatched' ? 'badge-info' :
                selectedOrder.status === 'verifying' ? 'badge-warning' :
                'badge-secondary'
              }`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Delivery address metadata */}
            <div style={{ marginBottom: '16px', fontSize: '13px' }}>
              <p style={{ marginBottom: '3px' }}><span style={{ color: 'var(--text-secondary)' }}>Recipient:</span> <strong>{selectedOrder.patientName}</strong></p>
              <p style={{ marginBottom: '3px' }}><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> {selectedOrder.patientPhone}</p>
              <p style={{ marginBottom: '3px' }}><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {selectedOrder.deliveryAddress}, {selectedOrder.division}</p>
              <p><span style={{ color: 'var(--text-secondary)' }}>Payment:</span> {selectedOrder.paymentMethod}</p>
            </div>

            {/* Items */}
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>Item name</span>
                <span>Qty x Price</span>
              </div>
              {selectedOrder.items.map(item => (
                <div key={item.drugId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{item.name}</span>
                  <span>{item.quantity} x {formatPrice(item.price)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px', marginTop: '6px', fontWeight: 700, color: 'var(--primary)' }}>
                <span>Total Amount</span>
                <span>{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Prescription Review Panel */}
            {selectedOrder.prescriptionUrl && (
              <div className="glass-card" style={{ margin: '0 0 16px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Uploaded Doctor's Slip</span>
                
                <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedOrder.prescriptionUrl.replace('data:image/svg+xml;utf8,', '') }} style={{ width: '150px', height: '150px' }}></div>
                </div>

                {selectedOrder.status === 'verifying' && !rejectMode && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprovePrescription(selectedOrder.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      ✓ Approve Rx
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      ✕ Reject Rx
                    </button>
                  </div>
                )}

                {rejectMode && (
                  <form onSubmit={(e) => handleRejectPrescription(e, selectedOrder.id)}>
                    <div className="input-group">
                      <span className="input-label" style={{ color: 'var(--danger)' }}>Reason for Rejection</span>
                      <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g. Invalid signature, wrong drug type"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button type="submit" className="btn btn-danger btn-small" style={{ flex: 1 }}>Submit Reject</button>
                      <button type="button" onClick={() => setRejectMode(false)} className="btn btn-secondary btn-small" style={{ flex: 1 }}>Cancel</button>
                    </div>
                  </form>
                )}

                {selectedOrder.prescriptionApproved !== undefined && (
                  <div style={{ textAlign: 'center', fontSize: '13px', padding: '6px', borderRadius: '4px', background: selectedOrder.prescriptionApproved ? 'var(--success-glow)' : 'var(--danger-glow)', color: selectedOrder.prescriptionApproved ? 'var(--success)' : 'var(--danger)' }}>
                    {selectedOrder.prescriptionApproved ? '✓ Prescription Approved' : `✕ Prescription Rejected: ${selectedOrder.prescriptionRejectReason}`}
                  </div>
                )}
              </div>
            )}

            {/* Advance Status Controls */}
            {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'verifying' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Action Controls</h4>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrder.id, 'pending')}
                    className="btn btn-primary"
                  >
                    Confirm Order (Prepare Fulfillment)
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrder.id, 'confirmed')}
                    className="btn btn-accent"
                  >
                    🚀 Dispatch Order (Hand to rider)
                  </button>
                )}
                {selectedOrder.status === 'dispatched' && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrder.id, 'dispatched')}
                    className="btn btn-primary"
                  >
                    ✓ Mark Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. INVENTORY TAB (ADD / EDIT / LIST) */}
      {activeTab === 'inventory' && !editingDrug && !isAdding && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>Inventory</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Add, edit, or remove medications</p>
            </div>
            <button onClick={startAdd} className="btn btn-primary" style={{ borderRadius: '50%', padding: 0, width: '40px', height: '40px', fontSize: '20px' }}>
              ＋
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {drugs.map(drug => (
              <div key={drug.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', margin: 0, gap: '12px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                  <img src={drug.image} alt={drug.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{drug.name}</span>
                    {drug.prescriptionRequired && (
                      <span className="badge badge-danger" style={{ fontSize: '8px', padding: '2px 4px' }}>Rx</span>
                    )}
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {drug.genericName} • {drug.unit}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px' }}>
                    <span>Price: <strong style={{ color: 'var(--primary)' }}>{formatPrice(drug.price)}</strong></span>
                    <span>Stock: <strong style={{ color: drug.stock < 20 ? 'var(--danger)' : 'var(--text-primary)' }}>{drug.stock}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => startEdit(drug)} className="btn btn-secondary btn-small" style={{ padding: '6px 10px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteDrug(drug.id)} className="btn btn-danger btn-small" style={{ padding: '6px 10px', background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT INVENTORY FORM */}
      {activeTab === 'inventory' && (editingDrug || isAdding) && (
        <div className="animate-fade-in">
          <button
            onClick={() => {
              setEditingDrug(null);
              setIsAdding(false);
            }}
            className="btn btn-secondary btn-small"
            style={{ width: 'auto', marginBottom: '16px' }}
          >
            ← Back to Inventory
          </button>

          <div className="glass-card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              {isAdding ? 'Add New Medication' : `Edit: ${editingDrug?.name}`}
            </h2>

            <form onSubmit={handleSaveDrug}>
              <div className="input-group">
                <span className="input-label">Medication Name</span>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Amoxil 500mg"
                  value={drugForm.name}
                  onChange={e => setDrugForm({ ...drugForm, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <span className="input-label">Generic Name / Ingredient</span>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Amoxicillin Trihydrate"
                  value={drugForm.genericName}
                  onChange={e => setDrugForm({ ...drugForm, genericName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <span className="input-label">Category</span>
                  <select
                    className="input-field select-field"
                    value={drugForm.category}
                    onChange={e => setDrugForm({ ...drugForm, category: e.target.value as any })}
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Painkillers">Painkillers</option>
                    <option value="Antivirals">Antivirals/Malaria</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Supplements">Supplements</option>
                  </select>
                </div>

                <div className="input-group">
                  <span className="input-label">Stock Unit</span>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Pack of 30 tabs"
                    value={drugForm.unit}
                    onChange={e => setDrugForm({ ...drugForm, unit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <span className="input-label">Price (UGX)</span>
                  <input
                    type="number"
                    required
                    min="100"
                    className="input-field"
                    value={drugForm.price}
                    onChange={e => setDrugForm({ ...drugForm, price: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="input-group">
                  <span className="input-label">Stock Quantity</span>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input-field"
                    value={drugForm.stock}
                    onChange={e => setDrugForm({ ...drugForm, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input
                  type="checkbox"
                  id="prescriptionRequired"
                  checked={drugForm.prescriptionRequired}
                  onChange={e => setDrugForm({ ...drugForm, prescriptionRequired: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="prescriptionRequired" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Requires Prescription Review (Rx)
                </label>
              </div>

              <div className="input-group">
                <span className="input-label">Partner Pharmacy</span>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={drugForm.pharmacyName}
                  onChange={e => setDrugForm({ ...drugForm, pharmacyName: e.target.value })}
                />
              </div>

              <div className="input-group">
                <span className="input-label">Short Description</span>
                <textarea
                  className="input-field"
                  rows={2}
                  style={{ resize: 'none' }}
                  placeholder="Clinical purpose and context..."
                  value={drugForm.description}
                  onChange={e => setDrugForm({ ...drugForm, description: e.target.value })}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <span className="input-label">Usage Instructions</span>
                <textarea
                  className="input-field"
                  rows={2}
                  style={{ resize: 'none' }}
                  placeholder="Standard dosage guidance..."
                  value={drugForm.usage}
                  onChange={e => setDrugForm({ ...drugForm, usage: e.target.value })}
                />
              </div>

              <div className="input-group">
                <span className="input-label">Image URL</span>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. /src/assets/drug.jpg"
                  value={drugForm.image}
                  onChange={e => setDrugForm({ ...drugForm, image: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
