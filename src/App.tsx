/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Dashboard } from '../pages/Dashboard';
import { Inbound } from '../pages/Inbound';
import { Outbound } from '../pages/Outbound';
import { Inventory } from '../pages/Inventory';
import { Counting } from '../pages/Counting';
import { Orders } from '../pages/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inbound" element={<Inbound />} />
          <Route path="outbound" element={<Outbound />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="counting" element={<Counting />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
