import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanButton } from '@/components/BarcodeScanner';
import { Plus, Check } from 'lucide-react';

export function Inbound() {
  const { inboundRecords, products, addInboundRecord, completeInboundRecord } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; batchNumber: string; serialNumber: string }[]>([]);

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      setItems([...items, { productId: product.id, quantity: 1, batchNumber: '', serialNumber: '' }]);
    } else {
      alert('Product not found for barcode: ' + barcode);
    }
  };

  const handleSave = () => {
    if (!supplier || items.length === 0) return;
    addInboundRecord({
      date: new Date().toISOString(),
      supplier,
      items
    });
    setIsCreating(false);
    setSupplier('');
    setItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Inbound Operations</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Inbound
          </Button>
        )}
      </div>

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Inbound Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Enter supplier name" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Items</h3>
                <ScanButton onScan={handleScan} />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <TableRow key={index}>
                        <TableCell>{product?.name} ({product?.sku})</TableCell>
                        <TableCell>
                          <Input 
                            value={item.batchNumber} 
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].batchNumber = e.target.value;
                              setItems(newItems);
                            }} 
                            placeholder="Batch (optional)"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={item.serialNumber} 
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].serialNumber = e.target.value;
                              // If serial number is provided, quantity must be 1
                              if (e.target.value) newItems[index].quantity = 1;
                              setItems(newItems);
                            }} 
                            placeholder="SN (optional)"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantity = parseInt(e.target.value) || 0;
                              setItems(newItems);
                            }} 
                            disabled={!!item.serialNumber}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" className="text-red-500" onClick={() => setItems(items.filter((_, i) => i !== index))}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        Scan a barcode or add items manually
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!supplier || items.length === 0}>Save Record</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inboundRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.supplier}</TableCell>
                  <TableCell>{record.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.status === 'pending' && (
                      <Button size="sm" onClick={() => completeInboundRecord(record.id)}>
                        <Check className="w-4 h-4 mr-1" /> Receive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {inboundRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No inbound records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
