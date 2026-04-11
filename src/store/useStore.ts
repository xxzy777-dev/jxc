import { create } from 'zustand';

export type Product = {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  batchNumber?: string;
  serialNumber?: string;
  location: string;
  quantity: number;
  status: 'available' | 'reserved' | 'damaged';
};

export type TransactionItem = {
  productId: string;
  batchNumber?: string;
  serialNumber?: string;
  quantity: number;
};

export type InboundRecord = {
  id: string;
  date: string;
  supplier: string;
  items: TransactionItem[];
  status: 'pending' | 'completed';
};

export type OutboundRecord = {
  id: string;
  date: string;
  orderId: string;
  items: TransactionItem[];
  status: 'pending' | 'completed';
};

export type OrderItem = {
  productId: string;
  quantity: number;
  fulfilledQuantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
};

interface StoreState {
  products: Product[];
  inventory: InventoryItem[];
  inboundRecords: InboundRecord[];
  outboundRecords: OutboundRecord[];
  orders: Order[];
  
  // Actions
  addInboundRecord: (record: Omit<InboundRecord, 'id' | 'status'>) => void;
  completeInboundRecord: (id: string) => void;
  addOutboundRecord: (record: Omit<OutboundRecord, 'id' | 'status'>) => void;
  completeOutboundRecord: (id: string) => void;
  updateInventoryQuantity: (id: string, quantity: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'SKU-001', name: 'MacBook Pro 16"', barcode: '123456789012', category: 'Electronics' },
  { id: 'p2', sku: 'SKU-002', name: 'Logitech MX Master 3', barcode: '123456789013', category: 'Accessories' },
  { id: 'p3', sku: 'SKU-003', name: 'Keychron K2', barcode: '123456789014', category: 'Accessories' },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv1', productId: 'p1', batchNumber: 'B202310', serialNumber: 'SN-MBP-001', location: 'A-01-01', quantity: 1, status: 'available' },
  { id: 'inv2', productId: 'p1', batchNumber: 'B202310', serialNumber: 'SN-MBP-002', location: 'A-01-01', quantity: 1, status: 'available' },
  { id: 'inv3', productId: 'p2', batchNumber: 'B202311', location: 'B-02-05', quantity: 50, status: 'available' },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Acme Corp',
    date: new Date().toISOString(),
    items: [{ productId: 'p1', quantity: 2, fulfilledQuantity: 0 }],
    status: 'pending'
  }
];

export const useStore = create<StoreState>((set) => ({
  products: MOCK_PRODUCTS,
  inventory: MOCK_INVENTORY,
  inboundRecords: [],
  outboundRecords: [],
  orders: MOCK_ORDERS,

  addInboundRecord: (record) => set((state) => ({
    inboundRecords: [
      ...state.inboundRecords,
      { ...record, id: `IN-${Date.now()}`, status: 'pending' }
    ]
  })),

  completeInboundRecord: (id) => set((state) => {
    const record = state.inboundRecords.find(r => r.id === id);
    if (!record) return state;

    // Add items to inventory
    const newInventory = [...state.inventory];
    record.items.forEach(item => {
      newInventory.push({
        id: `inv-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        location: 'Receiving Dock', // Default location
        quantity: item.quantity,
        status: 'available'
      });
    });

    return {
      inboundRecords: state.inboundRecords.map(r => r.id === id ? { ...r, status: 'completed' } : r),
      inventory: newInventory
    };
  }),

  addOutboundRecord: (record) => set((state) => ({
    outboundRecords: [
      ...state.outboundRecords,
      { ...record, id: `OUT-${Date.now()}`, status: 'pending' }
    ]
  })),

  completeOutboundRecord: (id) => set((state) => {
    const record = state.outboundRecords.find(r => r.id === id);
    if (!record) return state;

    // Deduct from inventory
    let newInventory = [...state.inventory];
    record.items.forEach(item => {
      if (item.serialNumber) {
        newInventory = newInventory.filter(inv => inv.serialNumber !== item.serialNumber);
      } else {
        // Find matching batch and deduct
        const invItem = newInventory.find(inv => inv.productId === item.productId && inv.batchNumber === item.batchNumber);
        if (invItem) {
          invItem.quantity -= item.quantity;
        }
      }
    });

    // Update order status
    const newOrders = state.orders.map(order => {
      if (order.id === record.orderId) {
        const newItems = order.items.map(orderItem => {
          const outItem = record.items.find(i => i.productId === orderItem.productId);
          if (outItem) {
            return { ...orderItem, fulfilledQuantity: orderItem.fulfilledQuantity + outItem.quantity };
          }
          return orderItem;
        });
        const isFullyFulfilled = newItems.every(i => i.fulfilledQuantity >= i.quantity);
        return { ...order, items: newItems, status: isFullyFulfilled ? 'shipped' as const : 'processing' as const };
      }
      return order;
    });

    return {
      outboundRecords: state.outboundRecords.map(r => r.id === id ? { ...r, status: 'completed' } : r),
      inventory: newInventory.filter(inv => inv.quantity > 0),
      orders: newOrders
    };
  }),

  updateInventoryQuantity: (id, quantity) => set((state) => ({
    inventory: state.inventory.map(inv => inv.id === id ? { ...inv, quantity } : inv)
  })),

  addInventoryItem: (item) => set((state) => ({
    inventory: [...state.inventory, { ...item, id: `inv-${Date.now()}` }]
  }))
}));
