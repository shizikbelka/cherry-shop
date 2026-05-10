// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Certificates from './pages/Certificates';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

const AppRoutes = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/category/:categorySlug" element={<Catalog />} />
                    <Route path="/collection/:collectionSlug" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/login" />} />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <Router basename="/cherry-shop">
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;