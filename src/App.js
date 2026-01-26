import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerList from './components/customers/CustomerList';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CustomerForm from './components/customers/CustomerForm';
import CustomerDetail from './components/customers/CustomerDetail';
import BillList from './components/bills/BillList';
import BillForm from './components/bills/BillForm';
import ProductsList from './components/products/ProductsList';
import ProductForm from './components/products/ProductForm';
import ProductDetails from './components/products/ProductDetails';

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
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/add"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;