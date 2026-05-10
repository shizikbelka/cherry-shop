// frontend/src/pages/MainPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../data';
import Catalog from './Catalog';

const MainPage = () => {
    const [loading, setLoading] = useState(false);

    // Добавляем сертификаты как 4-ю карточку
    const allCards = [...collections, { id: 'certificates', title: 'Подарочные сертификаты', slug: 'certificates', isGift: true }];

    return (
        <div className="bg-gray-50">
            {/* БЛОК С КОЛЛЕКЦИЯМИ (4 фото) */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allCards.map((card) => (
                        <div key={card.id} className="relative group overflow-hidden rounded-xl shadow-lg h-96">
                            {!card.isGift ? (
                                <>
                                    <img 
                                        src={card.image_url} 
                                        alt={card.title}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center p-4">
                                        <h3 className="text-2xl font-playfair font-bold mb-2">{card.hero_title}</h3>
                                        <Link to={`/collection/${card.slug}`} className="mt-2 bg-white text-burgundy px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition">
                                            Смотреть коллекцию
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <Link to="/certificates" className="block w-full h-full">
                                    <div className="w-full h-full bg-gradient-to-br from-burgundy to-burgundy-dark flex flex-col items-center justify-center text-white text-center p-4">
                                        <div className="text-6xl mb-4">🎁</div>
                                        <h3 className="text-2xl font-playfair font-bold mb-2">Подарочные сертификаты</h3>
                                        <p className="mb-4">Подарите радость выбора</p>
                                        <span className="mt-2 bg-white text-burgundy px-4 py-2 rounded-full text-sm font-semibold">Выбрать сертификат</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* БЛОК ПОДПИСКИ С РЕКЛАМНЫМ БАННЕРОМ СПРАВА */}
            <div className="bg-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-2">Получайте обновления первыми</h2>
                            <p className="text-gray-500 mb-4">Новые коллекции и пополнения желанных позиций первыми на ваш e-mail</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input 
                                    type="email" 
                                    placeholder="Ваш e-mail" 
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                                <button className="bg-burgundy text-white px-6 py-3 rounded-lg font-semibold hover:bg-burgundy-dark transition">
                                    Подписаться
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Я даю согласие на обработку моих персональных данных в соответствии с политикой конфиденциальности.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <img 
                                src="https://sun9-80.userapi.com/s/v1/ig2/Px0B_atl880GdLbD9Un5MGwa4JB-TFjDBU4YDOUH0S4WphokDQ_ARrCUDw77CKS1zBjpAUCCPXUPOECBzsVoUjRJ.jpg?quality=95&as=32x21,48x32,72x48,108x72,160x107,240x160,360x241,480x321,540x361,618x413&from=bu&u=kf6qLOpSDGAHzPjEz-Nz2maY8bwwoifSLq8je2VXqD8&cs=618x0" 
                                alt="Рекламный баннер"
                                className="h-64 w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* КАТАЛОГ ТОВАРОВ */}
            <Catalog isMainPage={true} />
        </div>
    );
};

export default MainPage;