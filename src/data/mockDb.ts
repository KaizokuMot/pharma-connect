
export interface Drug {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotics' | 'Painkillers' | 'Antivirals' | 'Cardiovascular' | 'Respiratory' | 'Supplements';
  price: number; // in UGX (Ugandan Shillings)
  stock: number;
  unit: string; // e.g. "Pack of 30", "100ml Bottle", "Inhaler"
  prescriptionRequired: boolean;
  description: string;
  usage: string;
  pharmacyName: string;
  image: string;
}

export type OrderStatus = 'pending' | 'verifying' | 'confirmed' | 'dispatched' | 'delivered' | 'completed' | 'cancelled';

export interface TrackingStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface OrderItem {
  drugId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  patientName: string;
  patientPhone: string;
  items: OrderItem[];
  totalAmount: number;
  division: 'Kampala Central' | 'Kawempe' | 'Makindye' | 'Rubaga' | 'Nakawa';
  deliveryAddress: string;
  paymentMethod: 'Mobile Money' | 'Cash on Delivery';
  status: OrderStatus;
  prescriptionUrl?: string; // base64 or placeholder URL
  prescriptionApproved?: boolean;
  prescriptionRejectReason?: string;
  createdAt: string;
  updatedAt: string;
  trackingTimeline: TrackingStep[];
}

export interface KampalaDivisionInfo {
  name: 'Kampala Central' | 'Kawempe' | 'Makindye' | 'Rubaga' | 'Nakawa';
  description: string;
  color: string;
  x: number; // grid coords for visual map
  y: number;
}

// Initial Data
const INITIAL_DRUGS: Drug[] = [
  {
    id: 'drg-1',
    name: 'Amoxil (Amoxicillin)',
    genericName: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    price: 18000,
    stock: 45,
    unit: 'Pack of 20 capsules',
    prescriptionRequired: true,
    description: 'A broad-spectrum antibiotic used to treat bacterial infections such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.',
    usage: 'Take 1 capsule 3 times a day for 5-7 days. Finish the full course.',
    pharmacyName: 'Nakasero Pharmacy',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-2',
    name: 'Panadol Extra',
    genericName: 'Paracetamol 500mg + Caffeine 65mg',
    category: 'Painkillers',
    price: 4500,
    stock: 120,
    unit: 'Card of 10 tablets',
    prescriptionRequired: false,
    description: 'Provides extra pain relief for headaches, migraines, backache, toothache, and throat pain, while reducing fever.',
    usage: '1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
    pharmacyName: 'Mulago Pharmacy',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-3',
    name: 'Coartem',
    genericName: 'Artemether 20mg + Lumefantrine 120mg',
    category: 'Antivirals', 
    price: 15000,
    stock: 60,
    unit: 'Pack of 24 tablets',
    prescriptionRequired: false,
    description: 'First-line therapy for the treatment of acute, uncomplicated malaria infections caused by Plasmodium falciparum.',
    usage: 'Take with food or milk. Take 4 tablets immediately, 4 tablets after 8 hours, then 4 tablets twice daily for next 2 days.',
    pharmacyName: 'Kibuli Pharmacy',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-4',
    name: 'Ventolin Evohaler',
    genericName: 'Salbutamol 100mcg',
    category: 'Respiratory',
    price: 25000,
    stock: 25,
    unit: '1 Inhaler (200 doses)',
    prescriptionRequired: true,
    description: 'Used to relieve bronchospasm in asthma, chronic bronchitis, and emphysema. Fast-acting bronchodilator.',
    usage: 'Inhale 1 or 2 puffs when required to relieve symptoms. Max 8 puffs per day.',
    pharmacyName: 'Wandegeya Chemist',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-5',
    name: 'Glucophage',
    genericName: 'Metformin Hydrochloride 850mg',
    category: 'Cardiovascular', 
    price: 22000,
    stock: 50,
    unit: 'Pack of 30 tablets',
    prescriptionRequired: true,
    description: 'Oral anti-diabetic drug that helps control blood sugar levels in patients with type 2 diabetes.',
    usage: 'Take 1 tablet daily with breakfast or dinner. Swallow whole.',
    pharmacyName: 'Nakasero Pharmacy',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-6',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate 10mg',
    category: 'Cardiovascular',
    price: 12000,
    stock: 80,
    unit: 'Pack of 28 tablets',
    prescriptionRequired: true,
    description: 'Calcium channel blocker used to treat high blood pressure (hypertension) and chest pain (angina).',
    usage: 'Take 1 tablet once daily, at the same time each day, with or without food.',
    pharmacyName: 'Kibuli Pharmacy',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-7',
    name: 'Vitamin C + Zinc',
    genericName: 'Ascorbic Acid 500mg + Zinc 10mg',
    category: 'Supplements',
    price: 8000,
    stock: 150,
    unit: 'Tube of 20 effervescent tablets',
    prescriptionRequired: false,
    description: 'Supports the normal function of the immune system. Helps reduce tiredness and fatigue.',
    usage: 'Dissolve 1 tablet in a glass of water daily and drink immediately.',
    pharmacyName: 'Wandegeya Chemist',
    image: '/test_image.jpg'
  },
  {
    id: 'drg-8',
    name: 'Ciprobay (Ciprofloxacin)',
    genericName: 'Ciprofloxacin 500mg',
    category: 'Antibiotics',
    price: 32000,
    stock: 35,
    unit: 'Pack of 10 tablets',
    prescriptionRequired: true,
    description: 'Fluoroquinolone antibiotic used to treat serious bacterial infections, including urinary tract, skin, and joint infections.',
    usage: 'Take 1 tablet every 12 hours. Avoid dairy within 2 hours of dose. Finish course.',
    pharmacyName: 'Mulago Pharmacy',
    image: '/test_image.jpg'
  }
];

const KAMPALA_DIVISIONS: KampalaDivisionInfo[] = [
  { name: 'Kampala Central', description: 'Central business district including Nakasero, Wandegeya, and Kololo.', color: '#4f46e5', x: 50, y: 50 },
  { name: 'Kawempe', description: 'Northern division including Mulago, Kawempe, and Bwaise.', color: '#06b6d4', x: 45, y: 20 },
  { name: 'Makindye', description: 'Southern division including Muyenga, Kabalagala, and Kibuli.', color: '#10b981', x: 65, y: 75 },
  { name: 'Rubaga', description: 'Western division including Mengo, Rubaga, and Lungujja.', color: '#f59e0b', x: 20, y: 60 },
  { name: 'Nakawa', description: 'Eastern division including Bugolobi, Ntinda, and Naguru.', color: '#ec4899', x: 80, y: 40 }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-101',
    patientName: 'Ronald Mukasa',
    patientPhone: '+256 701 234 567',
    items: [
      { drugId: 'drg-2', name: 'Panadol Extra', quantity: 2, price: 4500 },
      { drugId: 'drg-7', name: 'Vitamin C + Zinc', quantity: 1, price: 8000 }
    ],
    totalAmount: 17000,
    division: 'Kampala Central',
    deliveryAddress: 'Plot 12, Nakasero Road, Kampala',
    paymentMethod: 'Mobile Money',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 3600000 * 24).toISOString(), 
    updatedAt: new Date(Date.now() - 3 * 3600000 * 24 + 2 * 3600000).toISOString(),
    trackingTimeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 3 * 3600000 * 24).toISOString(), note: 'Order placed by patient.' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 3 * 3600000 * 24 + 15 * 60000).toISOString(), note: 'Payment received via MTN Mobile Money. Order confirmed.' },
      { status: 'dispatched', timestamp: new Date(Date.now() - 3 * 3600000 * 24 + 45 * 60000).toISOString(), note: 'Order dispatched with rider.' },
      { status: 'delivered', timestamp: new Date(Date.now() - 3 * 3600000 * 24 + 90 * 60000).toISOString(), note: 'Order delivered to recipient.' },
      { status: 'completed', timestamp: new Date(Date.now() - 3 * 3600000 * 24 + 120 * 60000).toISOString(), note: 'Order marked as completed by patient.' }
    ]
  },
  {
    id: 'ORD-102',
    patientName: 'Sarah Namubiru',
    patientPhone: '+256 772 987 654',
    items: [
      { drugId: 'drg-1', name: 'Amoxil (Amoxicillin)', quantity: 1, price: 18000 }
    ],
    totalAmount: 18000,
    division: 'Nakawa',
    deliveryAddress: 'Block 4, Bugolobi Flats',
    paymentMethod: 'Mobile Money',
    status: 'dispatched',
    prescriptionUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="10" y="30" font-size="6" font-family="sans-serif">PRESCRIPTION (MOCK)</text><text x="10" y="50" font-size="5" font-family="sans-serif">Dr. Jane Namara</text><text x="10" y="65" font-size="5" font-family="sans-serif">Rx: Amoxicillin 500mg</text></svg>',
    prescriptionApproved: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), 
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(), 
    trackingTimeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Order placed by patient. Awaiting prescription validation.' },
      { status: 'verifying', timestamp: new Date(Date.now() - 1.8 * 3600000).toISOString(), note: 'Prescription details matching database.' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(), note: 'Prescription approved by Nakasero Pharmacy. Order confirmed.' },
      { status: 'dispatched', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), note: 'Dispatched via SafeBoda rider. Tracking ID: SAF-8921.' }
    ]
  }
];

// LocalStorage Persistence Helpers
const STORAGE_KEYS = {
  DRUGS: 'pharma_connect_drugs',
  ORDERS: 'pharma_connect_orders'
};

const initializeLocalStorage = () => {
  const existingDrugs = localStorage.getItem(STORAGE_KEYS.DRUGS);
  if (!existingDrugs) {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUGS));
  } else {
    // Migration: Update image paths if they are using the old /src/assets or /assets prefix
    try {
      const drugs: Drug[] = JSON.parse(existingDrugs);
      let updated = false;
      const newDrugs = drugs.map(d => {
        if (d.image && (d.image.startsWith('/src/assets/') || d.image.startsWith('/assets/'))) {
          updated = true;
          return { ...d, image: '/test_image.jpg' };
        }
        return d;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(newDrugs));
      }
    } catch (e) {
      console.error('Failed to migrate drugs localStorage', e);
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
};

// Auto-run init
initializeLocalStorage();

export const mockDb = {
  // Drugs DB
  getDrugs(): Drug[] {
    initializeLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRUGS) || '[]');
  },

  saveDrugs(drugs: Drug[]): void {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
  },

  addDrug(drug: Omit<Drug, 'id'>): Drug {
    const drugs = this.getDrugs();
    const newDrug: Drug = {
      ...drug,
      id: `drg-${Date.now()}`
    };
    drugs.push(newDrug);
    this.saveDrugs(drugs);
    return newDrug;
  },

  updateDrug(updatedDrug: Drug): void {
    const drugs = this.getDrugs();
    const index = drugs.findIndex(d => d.id === updatedDrug.id);
    if (index !== -1) {
      drugs[index] = updatedDrug;
      this.saveDrugs(drugs);
    }
  },

  deleteDrug(id: string): void {
    const drugs = this.getDrugs();
    const filtered = drugs.filter(d => d.id !== id);
    this.saveDrugs(filtered);
  },

  // Orders DB
  getOrders(): Order[] {
    initializeLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'trackingTimeline'>): Order {
    const orders = this.getOrders();
    const trackingTimeline: TrackingStep[] = [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: orderData.items.some(item => {
          const drugs = this.getDrugs();
          const d = drugs.find(x => x.id === item.drugId);
          return d?.prescriptionRequired;
        }) ? 'Order placed. Awaiting prescription validation by pharmacist.' : 'Order placed successfully. Preparing for processing.'
      }
    ];

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingTimeline
    };

    orders.unshift(newOrder); 
    this.saveOrders(orders);

    // Deduct stock
    const drugs = this.getDrugs();
    newOrder.items.forEach(item => {
      const drugIndex = drugs.findIndex(d => d.id === item.drugId);
      if (drugIndex !== -1) {
        drugs[drugIndex].stock = Math.max(0, drugs[drugIndex].stock - item.quantity);
      }
    });
    this.saveDrugs(drugs);

    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    currentOrder.status = status;
    currentOrder.updatedAt = new Date().toISOString();
    currentOrder.trackingTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}.`
    });

    orders[index] = currentOrder;
    this.saveOrders(orders);
    return currentOrder;
  },

  approvePrescription(orderId: string, approved: boolean, rejectReason?: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    currentOrder.prescriptionApproved = approved;
    if (!approved && rejectReason) {
      currentOrder.prescriptionRejectReason = rejectReason;
      currentOrder.status = 'cancelled';
      currentOrder.trackingTimeline.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: `Prescription rejected: ${rejectReason}. Order has been cancelled.`
      });
    } else {
      currentOrder.status = 'confirmed';
      currentOrder.trackingTimeline.push({
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        note: `Prescription verified and approved. Preparing your order for packaging.`
      });
    }

    currentOrder.updatedAt = new Date().toISOString();
    orders[index] = currentOrder;
    this.saveOrders(orders);
    return currentOrder;
  },

  // Kampala Divisions
  getDivisions(): KampalaDivisionInfo[] {
    return KAMPALA_DIVISIONS;
  },

  // Helpers for simple reports / metrics
  getAnalytics() {
    const orders = this.getOrders();
    const drugs = this.getDrugs();

    // 1. Total revenue
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Orders count by division
    const divisionCounts: Record<string, number> = {
      'Kampala Central': 0,
      'Kawempe': 0,
      'Makindye': 0,
      'Rubaga': 0,
      'Nakawa': 0
    };
    orders.forEach(o => {
      if (divisionCounts[o.division] !== undefined) {
        divisionCounts[o.division]++;
      }
    });

    // 3. Status breakdown
    const statusCounts: Record<string, number> = {
      pending: 0,
      verifying: 0,
      confirmed: 0,
      dispatched: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0
    };
    orders.forEach(o => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    // 4. Low stock drugs (stock < 20)
    const lowStock = drugs.filter(d => d.stock < 20);

    return {
      revenue,
      totalOrders: orders.length,
      divisionCounts,
      statusCounts,
      lowStockCount: lowStock.length,
      lowStock
    };
  },

  resetDb(): void {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUGS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
};
