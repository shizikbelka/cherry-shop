import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]); // ДЛЯ КОЛЛЕКЦИЙ
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [showForm, setShowForm] = useState(false);
    const [showCollectionForm, setShowCollectionForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCollection, setEditingCollection] = useState(null);
    
    // Форма товара
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        collection_id: '',
        image_url: '',
        stock: ''
    });
    
    // Форма коллекции
    const [collectionForm, setCollectionForm] = useState({
        title: '',
        slug: '',
        hero_title: '',
        description: '',
        image_url: '',
        release_date: ''
    });
    
    // Выбранные размеры и цвета (массивы)
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    // Загрузка данных
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchOrders();
        fetchCollections();
        fetchSizes();
        fetchColors();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/collections');
            setCollections(response.data);
        } catch (error) {
            console.error('Ошибка загрузки коллекций:', error);
        }
    };

    const fetchSizes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/sizes');
            setSizes(response.data);
        } catch (error) {
            console.error('Ошибка загрузки размеров:', error);
        }
    };

    const fetchColors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/colors');
            setColors(response.data);
        } catch (error) {
            console.error('Ошибка загрузки цветов:', error);
        }
    };

    // ============ УПРАВЛЕНИЕ ТОВАРАМИ ============
    const handleSizeToggle = (sizeId) => {
        setSelectedSizes(prev => 
            prev.includes(sizeId) 
                ? prev.filter(id => id !== sizeId)
                : [...prev, sizeId]
        );
    };

    const handleColorToggle = (colorId) => {
        setSelectedColors(prev => 
            prev.includes(colorId) 
                ? prev.filter(id => id !== colorId)
                : [...prev, colorId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let productId;
            
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/admin/products/${editingProduct.id}`, formData);
                productId = editingProduct.id;
                alert('Товар обновлён');
            } else {
                const response = await axios.post('http://localhost:5000/api/admin/products', formData);
                productId = response.data.product.id;
                alert('Товар добавлен');
            }
            
            if (selectedSizes.length > 0) {
                await axios.delete(`http://localhost:5000/api/admin/products/${productId}/sizes`);
                for (const sizeId of selectedSizes) {
                    await axios.post(`http://localhost:5000/api/admin/products/${productId}/sizes`, { size_id: sizeId, stock: 10 });
                }
            }
            
            if (selectedColors.length > 0) {
                await axios.delete(`http://localhost:5000/api/admin/products/${productId}/colors`);
                for (const colorId of selectedColors) {
                    await axios.post(`http://localhost:5000/api/admin/products/${productId}/colors`, { color_id: colorId });
                }
            }
            
            setShowForm(false);
            setEditingProduct(null);
            setFormData({ title: '', description: '', price: '', category_id: '', collection_id: '', image_url: '', stock: '' });
            setSelectedSizes([]);
            setSelectedColors([]);
            fetchProducts();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении товара');
        }
    };

    const handleEdit = async (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
            price: product.price,
            category_id: product.category_id || '',
            collection_id: product.collection_id || '',
            image_url: product.image_url || '',
            stock: product.stock
        });
        
        try {
            const sizesRes = await axios.get(`http://localhost:5000/api/products/${product.id}/sizes`);
            setSelectedSizes(sizesRes.data.map(s => s.id));
            
            const colorsRes = await axios.get(`http://localhost:5000/api/products/${product.id}/colors`);
            setSelectedColors(colorsRes.data.map(c => c.id));
        } catch (error) {
            console.error('Ошибка загрузки размеров/цветов товара:', error);
            setSelectedSizes([]);
            setSelectedColors([]);
        }
        
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить товар?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/products/${id}`);
                alert('Товар удалён');
                fetchProducts();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Ошибка при удалении');
            }
        }
    };

    // ============ УПРАВЛЕНИЕ КОЛЛЕКЦИЯМИ ============
    const handleCollectionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCollection) {
                await axios.put(`http://localhost:5000/api/admin/collections/${editingCollection.id}`, collectionForm);
                alert('Коллекция обновлена');
            } else {
                await axios.post('http://localhost:5000/api/admin/collections', collectionForm);
                alert('Коллекция добавлена');
            }
            setShowCollectionForm(false);
            setEditingCollection(null);
            setCollectionForm({ title: '', slug: '', hero_title: '', description: '', image_url: '', release_date: '' });
            fetchCollections();
        } catch (error) {
            console.error('Ошибка сохранения коллекции:', error);
            alert('Ошибка при сохранении коллекции');
        }
    };

    const handleEditCollection = (collection) => {
        setEditingCollection(collection);
        setCollectionForm({
            title: collection.title,
            slug: collection.slug,
            hero_title: collection.hero_title || '',
            description: collection.description || '',
            image_url: collection.image_url || '',
            release_date: collection.release_date || ''
        });
        setShowCollectionForm(true);
    };

    const handleDeleteCollection = async (id) => {
        if (confirm('Удалить коллекцию? Товары в ней останутся, но потеряют связь с коллекцией')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/collections/${id}`);
                alert('Коллекция удалена');
                fetchCollections();
            } catch (error) {
                console.error('Ошибка удаления коллекции:', error);
                alert('Ошибка при удалении коллекции');
            }
        }
    };

    // ============ ЗАКАЗЫ ============
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status: newStatus });
            alert(`Статус заказа #${orderId} изменён`);
            fetchOrders();
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
            alert('Ошибка при изменении статуса заказа');
        }
    };

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : 'Без категории';
    };

    const getCollectionName = (collectionId) => {
        const coll = collections.find(c => c.id === collectionId);
        return coll ? coll.title : 'Без коллекции';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': '🆕 Оформлен',
            'confirmed': '✅ Принят',
            'shipped': '🚚 В пути',
            'delivered': '📦 Доставлен'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const availableStatuses = [
        { value: 'pending', label: '🆕 Оформлен' },
        { value: 'confirmed', label: '✅ Принят' },
        { value: 'shipped', label: '🚚 В пути' },
        { value: 'delivered', label: '📦 Доставлен' }
    ];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-xl text-gray-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-playfair font-bold text-burgundy mb-8">Админ-панель</h1>
                
                {/* ============ ВКЛАДКИ ============ */}
                <div className="flex gap-2 mb-6 border-b flex-wrap">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 font-semibold transition-all duration-200 rounded-t-lg ${
                            activeTab === 'products'
                                ? 'bg-burgundy text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📦 Товары
                    </button>
                    <button
                        onClick={() => setActiveTab('collections')}
                        className={`px-6 py-3 font-semibold transition-all duration-200 rounded-t-lg ${
                            activeTab === 'collections'
                                ? 'bg-burgundy text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        🖼️ Коллекции
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 font-semibold transition-all duration-200 rounded-t-lg ${
                            activeTab === 'orders'
                                ? 'bg-burgundy text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📋 Заказы
                    </button>
                </div>

                {/* ============ ВКЛАДКА: ТОВАРЫ ============ */}
                {activeTab === 'products' && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setFormData({ title: '', description: '', price: '', category_id: '', collection_id: '', image_url: '', stock: '' });
                                    setSelectedSizes([]);
                                    setSelectedColors([]);
                                    setShowForm(true);
                                }}
                                className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark transition"
                            >
                                + Добавить товар
                            </button>
                        </div>

                        {/* Форма товара */}
                        {showForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <h2 className="text-xl font-bold mb-4">
                                        {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Название *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Описание</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Цена *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Категория *</label>
                                            <select
                                                required
                                                value={formData.category_id}
                                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* ВЫБОР КОЛЛЕКЦИИ (необязательно) */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Коллекция (необязательно)</label>
                                            <select
                                                value={formData.collection_id}
                                                onChange={(e) => setFormData({...formData, collection_id: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            >
                                                <option value="">Без коллекции</option>
                                                {collections.map(coll => (
                                                    <option key={coll.id} value={coll.id}>{coll.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">URL изображения</label>
                                            <input
                                                type="text"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Количество на складе</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>

                                        {/* ВЫБОР РАЗМЕРОВ (необязательно) */}
                                        {sizes.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Размеры (необязательно, можно выбрать несколько)
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {sizes.map(size => (
                                                        <button
                                                            key={size.id}
                                                            type="button"
                                                            onClick={() => handleSizeToggle(size.id)}
                                                            className={`px-4 py-2 rounded-lg border transition ${
                                                                selectedSizes.includes(size.id)
                                                                    ? 'bg-burgundy text-white border-burgundy'
                                                                    : 'border-gray-300 hover:border-burgundy'
                                                            }`}
                                                        >
                                                            {size.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ВЫБОР ЦВЕТОВ (необязательно) */}
                                        {colors.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Цвета (необязательно, можно выбрать несколько)
                                                </label>
                                                <div className="flex flex-wrap gap-3">
                                                    {colors.map(color => (
                                                        <button
                                                            key={color.id}
                                                            type="button"
                                                            onClick={() => handleColorToggle(color.id)}
                                                            className={`w-10 h-10 rounded-full border-2 transition ${
                                                                selectedColors.includes(color.id)
                                                                    ? 'ring-2 ring-burgundy ring-offset-2'
                                                                    : ''
                                                            }`}
                                                            style={{ backgroundColor: color.code || '#ccc' }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-4">
                                            <button type="submit" className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark">
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setEditingProduct(null);
                                                }}
                                                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Таблица товаров */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Название</th>
                                            <th className="px-4 py-3 text-left">Категория</th>
                                            <th className="px-4 py-3 text-left">Коллекция</th>
                                            <th className="px-4 py-3 text-left">Цена</th>
                                            <th className="px-4 py-3 text-left">Склад</th>
                                            <th className="px-4 py-3 text-left">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{product.id}</td>
                                                <td className="px-4 py-3">{product.title}</td>
                                                <td className="px-4 py-3">{getCategoryName(product.category_id)}</td>
                                                <td className="px-4 py-3">{getCollectionName(product.collection_id)}</td>
                                                <td className="px-4 py-3">{product.price} ₽</td>
                                                <td className="px-4 py-3">{product.stock}</td>
                                                <td className="px-4 py-3 space-x-2">
                                                    <button onClick={() => handleEdit(product)} className="text-burgundy hover:text-burgundy-dark">✏️</button>
                                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ============ ВКЛАДКА: КОЛЛЕКЦИИ ============ */}
                {activeTab === 'collections' && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setEditingCollection(null);
                                    setCollectionForm({ title: '', slug: '', hero_title: '', description: '', image_url: '', release_date: '' });
                                    setShowCollectionForm(true);
                                }}
                                className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark transition"
                            >
                                + Добавить коллекцию
                            </button>
                        </div>

                        {/* Форма коллекции */}
                        {showCollectionForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                                    <h2 className="text-xl font-bold mb-4">
                                        {editingCollection ? 'Редактировать коллекцию' : 'Новая коллекция'}
                                    </h2>
                                    <form onSubmit={handleCollectionSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Название *</label>
                                            <input
                                                type="text"
                                                required
                                                value={collectionForm.title}
                                                onChange={(e) => setCollectionForm({...collectionForm, title: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Slug (для URL, например: x-rndm-crew) *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={collectionForm.slug}
                                                onChange={(e) => setCollectionForm({...collectionForm, slug: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                placeholder="например: x-rndm-crew"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Заголовок на карточке</label>
                                            <input
                                                type="text"
                                                value={collectionForm.hero_title}
                                                onChange={(e) => setCollectionForm({...collectionForm, hero_title: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                placeholder="например: x RNDM CREW"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Описание</label>
                                            <textarea
                                                value={collectionForm.description}
                                                onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">URL изображения</label>
                                            <input
                                                type="text"
                                                value={collectionForm.image_url}
                                                onChange={(e) => setCollectionForm({...collectionForm, image_url: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                placeholder="https://example.com/photo.jpg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Дата релиза</label>
                                            <input
                                                type="text"
                                                value={collectionForm.release_date}
                                                onChange={(e) => setCollectionForm({...collectionForm, release_date: e.target.value})}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                placeholder="Released on 20 February 2026"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button type="submit" className="bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-burgundy-dark">
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCollectionForm(false);
                                                    setEditingCollection(null);
                                                }}
                                                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Таблица коллекций */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Название</th>
                                            <th className="px-4 py-3 text-left">Slug</th>
                                            <th className="px-4 py-3 text-left">Дата</th>
                                            <th className="px-4 py-3 text-left">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {collections.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                    Коллекций пока нет
                                                </td>
                                            </tr>
                                        ) : (
                                            collections.map(collection => (
                                                <tr key={collection.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">{collection.id}</td>
                                                    <td className="px-4 py-3 font-medium">{collection.title}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{collection.slug}</td>
                                                    <td className="px-4 py-3 text-sm">{collection.release_date || '—'}</td>
                                                    <td className="px-4 py-3 space-x-2">
                                                        <button onClick={() => handleEditCollection(collection)} className="text-burgundy hover:text-burgundy-dark">✏️</button>
                                                        <button onClick={() => handleDeleteCollection(collection.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ============ ВКЛАДКА: ЗАКАЗЫ ============ */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">№ заказа</th>
                                        <th className="px-4 py-3 text-left">Пользователь</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Дата</th>
                                        <th className="px-4 py-3 text-left">Сумма</th>
                                        <th className="px-4 py-3 text-left">Статус</th>
                                        <th className="px-4 py-3 text-left">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                Заказов пока нет
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">#{order.id}</td>
                                                <td className="px-4 py-3">{order.username}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{order.email}</td>
                                                <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                                                <td className="px-4 py-3 font-bold text-burgundy">{order.total} ₽</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy"
                                                    >
                                                        {availableStatuses.map(status => (
                                                            <option key={status.value} value={status.value}>
                                                                {status.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;