import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Catalog from './Catalog';

const MainPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/collections');
                setCollections(res.data);
            } catch (error) {
                console.error('Ошибка загрузки коллекций:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const allCards = [...collections, { id: 'certificates', title: 'Подарочные сертификаты', slug: 'certificates', isGift: true }];

    if (loading) return <div className="container mx-auto px-4 py-16 text-center">Загрузка коллекций...</div>;

    return (
        <div className="bg-gray-50">
            {/* БЛОК С КОЛЛЕКЦИЯМИ (4 фото) */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {collections.map((collection) => (
                        <div key={collection.id} className="relative group overflow-hidden rounded-xl shadow-lg h-96">
                            <img 
                                src={collection.image_url || 'https://via.placeholder.com/600x400?text=Collection+Photo'} 
                                alt={collection.title}
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center p-4">
                                <h3 className="text-2xl font-playfair font-bold mb-2">{collection.hero_title || collection.title}</h3>
                                <Link to={`/collection/${collection.slug}`} className="mt-2 bg-white text-burgundy px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition">
                                    Смотреть коллекцию
                                </Link>
                            </div>
                        </div>
                    ))}
                    
                    {/* 4-я карточка — переход на страницу сертификатов */}
                    <div className="relative group overflow-hidden rounded-xl shadow-lg h-96">
                        <img 
                            src="https://sun9-15.userapi.com/s/v1/ig2/xo_xmLYGyzsUQCWbLTLyfGfgHjBO7M7hN0iXxBuIpGkFs3KeskH8-iZxDPKBV5N3lwXFIzVyvR4RlfKF7IPShn-L.jpg?quality=95&as=32x42,48x63,72x94,108x141,160x209,240x314,360x470,480x627,540x705,640x836,720x941,1080x1411,1116x1458&from=bu&cs=1116x0" 
                            alt="Подарочные сертификаты"
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center p-4">
                            <h3 className="text-2xl font-playfair font-bold mb-2">Подарочные сертификаты</h3>
                            <Link to="/certificates" className="mt-2 bg-white text-burgundy px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition">
                                Смотреть →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* БЛОК ПОДПИСКИ С РЕКЛАМНЫМ БАННЕРОМ СПРАВА */}
            <div className="bg-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Левая часть - форма подписки */}
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
                        {/* Правая часть - рекламный баннер с фото */}
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