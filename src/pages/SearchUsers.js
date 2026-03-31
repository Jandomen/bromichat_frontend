import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserSearch from '../components/userProfile/UserSearch';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchUsers = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow pt-8 pb-12 px-4 max-w-4xl mx-auto w-full">

                <button
                    onClick={() => navigate(-1)}
                    className="lg:hidden flex items-center gap-2 mb-6 text-primary-600 font-black text-xs uppercase tracking-widest hover:bg-white p-2 rounded-xl transition-all active:scale-95"
                >
                    <ArrowLeft size={18} />
                    Volver al Inicio
                </button>
                <UserSearch />
            </main>
            <Footer />
        </div>
    );
};

export default SearchUsers;
