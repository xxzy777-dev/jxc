import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertCircle } from 'lucide-react';

export function Dashboard() {
  const { inventory, inboundRecords, outboundRecords } = useStore();

  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const pendingInbound = inboundRecords.filter(r => r.status === 'pending').length;
  const pendingOutbound = outboundRecords.filter(r => r.status === 'pending').length;
  const lowStockItems = inventory.filter(item => item.quantity < 10).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Inventory</CardTitle>
            <Package className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
            <p className="text-xs text-slate-500 mt-1">Items in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Inbound</CardTitle>
            <ArrowDownToLine className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingInbound}</div>
            <p className="text-xs text-slate-500 mt-1">Tasks waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Outbound</CardTitle>
            <ArrowUpFromLine className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingOutbound}</div>
            <p className="text-xs text-slate-500 mt-1">Tasks waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{lowStockItems}</div>
            <p className="text-xs text-slate-500 mt-1">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock activity list */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Inbound received: IN-12345</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
                <div className="text-sm font-medium text-green-600">+50 items</div>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Order shipped: ORD-001</p>
                  <p className="text-xs text-slate-500">5 hours ago</p>
                </div>
                <div className="text-sm font-medium text-blue-600">-2 items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
