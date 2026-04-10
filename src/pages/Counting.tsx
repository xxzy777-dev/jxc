import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanButton } from '@/components/BarcodeScanner';

export function Counting() {
  const { inventory, products, updateInventoryQuantity } = useStore();
  const [scannedItems, setScannedItems] = useState<{ id: string; countedQuantity: number }[]>([]);

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      // Find inventory item for this product
      // For simplicity, we just pick the first available one if no serial/batch is specified in barcode
      const invItem = inventory.find(i => i.productId === product.id);
      if (invItem) {
        const existing = scannedItems.find(s => s.id === invItem.id);
        if (existing) {
          setScannedItems(scannedItems.map(s => s.id === invItem.id ? { ...s, countedQuantity: s.countedQuantity + 1 } : s));
        } else {
          setScannedItems([...scannedItems, { id: invItem.id, countedQuantity: 1 }]);
        }
      }
    } else {
      // Check if barcode is a serial number
      const invItem = inventory.find(i => i.serialNumber === barcode);
      if (invItem) {
        const existing = scannedItems.find(s => s.id === invItem.id);
        if (!existing) {
          setScannedItems([...scannedItems, { id: invItem.id, countedQuantity: 1 }]);
        }
      } else {
        alert('Item not found for barcode: ' + barcode);
      }
    }
  };

  const handleApply = () => {
    scannedItems.forEach(item => {
      updateInventoryQuantity(item.id, item.countedQuantity);
    });
    setScannedItems([]);
    alert('Inventory updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Counting</h2>
        <div className="flex space-x-2">
          <ScanButton onScan={handleScan} />
          <Button onClick={handleApply} disabled={scannedItems.length === 0}>Apply Count</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Count Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expected Qty</TableHead>
                <TableHead>Counted Qty</TableHead>
                <TableHead>Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const scanned = scannedItems.find(s => s.id === item.id);
                const countedQty = scanned ? scanned.countedQuantity : 0;
                const variance = countedQty - item.quantity;
                
                // Only show items that have been scanned or have variance if we want, 
                // but usually we show all items in a location. Let's show all for now.
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {product?.name}
                      {item.serialNumber && <div className="text-xs text-slate-500">SN: {item.serialNumber}</div>}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={countedQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (scanned) {
                            setScannedItems(scannedItems.map(s => s.id === item.id ? { ...s, countedQuantity: val } : s));
                          } else {
                            setScannedItems([...scannedItems, { id: item.id, countedQuantity: val }]);
                          }
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <span className={variance === 0 ? 'text-slate-500' : variance > 0 ? 'text-green-600' : 'text-red-600'}>
                        {variance > 0 ? '+' : ''}{variance}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
