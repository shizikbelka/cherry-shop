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
                        {/* Логотип и описание - с новым шрифтом */}
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

                        {/* Контакты */}
                        <div>
                            <h4 className="font-semibold text-lg mb-3 text-burgundy-light">Контакты</h4>
                            <ul className="space-y-2 text-gray-400 font-poppins">
                                <li>📞 +7 (999) 123-45-67</li>
                                <li>📧 info@cherrystyle.ru</li>
                                <li>📍 Москва, ул. Тверская, 1</li>
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