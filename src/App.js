import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerList from './components/CustomerList';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CustomerForm from './components/CustomerForm';
import CustomerDetail from './components/CustomerDetail';
import BillList from './components/BillList';
import BillForm from './components/BillForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/customers" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/view/:id" element={<CustomerDetail />} />
          <Route path="/customers/edit/:id" element={
            <ProtectedRoute>
              <CustomerForm />
            </ProtectedRoute>
          } />
          <Route path="/customers/new" element={
            <ProtectedRoute>
              <CustomerForm />
            </ProtectedRoute>
          }
          />
          <Route path="/customers/:customerId/bills" element={<BillList />} />
          <Route
            path="/bills/new/:customerId"
            element={
              <ProtectedRoute>
                <BillForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills/edit/:billId"
            element={
              <ProtectedRoute>
                <BillForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;