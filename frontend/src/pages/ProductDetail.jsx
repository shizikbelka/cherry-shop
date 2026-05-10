// frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [openSection, setOpenSection] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        const foundProduct = products.find(p => p.id === parseInt(id));
        setProduct(foundProduct);
        
        if (foundProduct?.sizes && foundProduct.sizes.length > 0) {
            setSelectedSize(foundProduct.sizes[0]);
        }
        if (foundProduct?.colors && foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0]);
        }
        
        setLoading(false);
    }, [id]);

    const isCertificate = product?.category_name === 'Сертификаты' || product?.isCertificate === true;
    const isSizeSelected = isCertificate || selectedSize !== '';
    const isColorSelected = isCertificate || selectedColor !== '';
    const canAddToCart = isCertificate || (isSizeSelected && isColorSelected);

    const handleAddToCart = () => {
        if (!canAddToCart) {
            if (!isSizeSelected) alert('Пожалуйста, выберите размер');
            if (!isColorSelected) alert('Пожалуйста, выберите цвет');
            return;
        }
        
        addToCart({ 
            ...product, 
            selectedSize: isCertificate ? null : selectedSize,
            selectedColor: isCertificate ? null : selectedColor,
            cartQuantity: quantity,
            isCertificate: isCertificate
        }, quantity);
        
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-xl text-gray-600">Загрузка...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-500">Товар не найден</p>
                <Link to="/" className="mt-4 inline-block bg-burgundy text-white px-6 py-2 rounded-lg">Вернуться в каталог</Link>
            </div>
        );
    }

    const sizesFromDB = product.sizes || [];
    const colorsFromDB = product.colors || [];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="lg:w-1/2">
                        <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="lg:w-1/2 p-6 lg:p-8">
                        {isCertificate && (
                            <div className="inline-block bg-burgundy text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                                🎁 Подарочный сертификат
                            </div>
                        )}
                        
                        <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-2">{product.title}</h1>
                        <p className="text-gray-400 text-sm mb-4">Артикул: {product.id}</p>
                        <p className="text-3xl font-bold text-burgundy mb-6">{product.price} ₽</p>
                        
                        {!isCertificate && colorsFromDB.length > 0 && (
                            <div className="mb-6">
                                <span className="font-semibold text-gray-700 block mb-3">Цвет</span>
                                <div className="flex flex-wrap gap-3">
                                    {colorsFromDB.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition ${
                                                selectedColor === color ? 'ring-2 ring-burgundy ring-offset-2' : ''
                                            }`}
                                            style={{ backgroundColor: 
                                                color === 'Черный' ? '#000000' :
                                                color === 'Белый' ? '#FFFFFF' :
                                                color === 'Серый' ? '#808080' :
                                                color === 'Красный' ? '#FF0000' :
                                                color === 'Синий' ? '#0000FF' :
                                                color === 'Молочный' ? '#FEFCFF' :
                                                color === 'Розовый' ? '#FF69B4' :
                                                color === 'Коричневый' ? '#654321' : '#ccc'
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                {selectedColor && <p className="text-sm text-gray-500 mt-2">Выбран: {selectedColor}</p>}
                            </div>
                        )}
                        
                        {!isCertificate && sizesFromDB.length > 0 && (
                            <div className="mb-6">
                                <span className="font-semibold text-gray-700 block mb-3">Размер</span>
                                <div className="flex flex-wrap gap-3">
                                    {sizesFromDB.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[60px] h-12 px-3 rounded-lg border-2 transition font-medium ${
                                                selectedSize === size 
                                                    ? 'bg-burgundy text-white border-burgundy' 
                                                    : 'border-gray-300 hover:border-burgundy'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && <p className="text-sm text-gray-500 mt-2">Выбран: {selectedSize}</p>}
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <span className="font-semibold text-gray-700 block mb-3">Количество</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="font-semibold text-xl min-w-[50px] text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="w-10 h-10 rounded-full bg-burgundy hover:bg-burgundy-dark flex items-center justify-center transition text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleAddToCart}
                            disabled={!canAddToCart}
                            className={`w-full py-4 rounded-lg transition text-lg font-semibold mb-8 flex items-center justify-center gap-2 ${
                                addedToCart 
                                    ? 'bg-green-500 text-white' 
                                    : canAddToCart 
                                        ? 'bg-burgundy text-white hover:bg-burgundy-dark' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {addedToCart ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Добавлено в корзину!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    Добавить в корзину
                                </>
                            )}
                        </button>
                        
                        {!isCertificate && !canAddToCart && (
                            <p className="text-red-500 text-sm text-center -mt-6 mb-6">
                                Выберите цвет и размер для добавления в корзину
                            </p>
                        )}
                        
                        <div className="border-t pt-4">
                            <button onClick={() => toggleSection('description')} className="w-full flex justify-between items-center py-3 text-left font-semibold text-gray-700">
                                Описание изделия
                                <svg className={`w-5 h-5 transition-transform ${openSection === 'description' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openSection === 'description' && (
                                <div className="pb-4 text-gray-600 whitespace-pre-line">
                                    {product.fullDescription || product.description}
                                </div>
                            )}
                        </div>
                        
                        {!isCertificate && (
                            <div className="border-t">
                                <button onClick={() => toggleSection('delivery')} className="w-full flex justify-between items-center py-3 text-left font-semibold text-gray-700">
                                    Доставка & Оплата
                                    <svg className={`w-5 h-5 transition-transform ${openSection === 'delivery' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openSection === 'delivery' && (
                                    <div className="pb-4 text-gray-600 space-y-3">
                                        <p>Отправки изделия производим в течение 7 рабочих дней.</p>
                                        <p>Доставку осуществляет сервис-партнер CDEK.</p>
                                        <p className="font-semibold mt-2">Оплата заказа доступна банковскими картами Visa, Mastercard и МИР.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;