import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const navigate = useNavigate();

    const categories = [
        { name: 'Все товары', slug: 'all' },
        { name: 'Худи & Кофты', slug: 'hoodies' },
        { name: 'Штаны & Шорты', slug: 'pants' },
        { name: 'Футболки & Верх', slug: 't-shirts' },
        { name: 'Аксессуары', slug: 'accessories' },
        { name: 'Верхняя одежда', slug: 'outerwear' }
    ];

    const handleCategoryClick = (slug) => {
        setShowCategoriesModal(false);
        navigate(`/category/${slug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <footer className="bg-gray-dark text-white mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Логотип и описание */}
                        <div>
                            <h3 className="text-3xl font-playfair font-bold text-burgundy-light mb-4">
                                CherryStyle
                            </h3>
                            <p className="text-gray-400 font-poppins">
                                Стильная одежда для каждого дня. Качество, комфорт и элегантность в каждой детали.
                            </p>
                        </div>

                        {/* Кнопка "Каталог" с модальным окном */}
                        <div>
                            <h4 className="font-semibold text-lg mb-3 text-burgundy-light">Навигация</h4>
                            <button
                                onClick={() => setShowCategoriesModal(true)}
                                className="text-gray-400 hover:text-burgundy-light transition font-poppins"
                            >
                                📂 Каталог товаров →
                            </button>
                        </div>

                        {/* Контакты с иконками */}
                        <div>
                            <h4 className="font-semibold text-lg mb-3 text-burgundy-light">Контакты</h4>
                            <ul className="space-y-3 text-gray-400 font-poppins">
                                {/* Телефон */}
                                <li className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <span>+7 (999) 123-45-67</span>
                                </li>
                                
                                {/* Email */}
                                <li className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span>info@cherrystyle.ru</span>
                                </li>
                                
                                {/* Локация */}
                                <li className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span>Москва, ул. Тверская, 1</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400 font-poppins text-sm">
                        <p>&copy; 2025 CherryStyle. Все права защищены.</p>
                    </div>
                </div>
            </footer>

            {/* Модальное окно с категориями */}
            {showCategoriesModal && (
                <div className="modal-overlay" onClick={() => setShowCategoriesModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-playfair font-bold text-burgundy">Каталог</h3>
                            <button 
                                onClick={() => setShowCategoriesModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-burgundy hover:text-white transition-all duration-200 font-poppins"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;