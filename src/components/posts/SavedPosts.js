import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Header from '../Header';
import Footer from '../Footer';
import PostItem from './PostItem';
import { useUI } from '../../context/UIContext';

const SavedPosts = () => {
    const { token } = useContext(AuthContext);
    const { showToast } = useUI();
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const res = await api.get('/user/saved');
                setSavedPosts(res.data);
            } catch (error) {
                showToast('Error al cargar publicaciones guardadas', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, [token, showToast]);

    const handleUpdate = (updatedPost, deletedPostId) => {
        if (deletedPostId) {
            setSavedPosts(prev => prev.filter(p => p._id !== deletedPostId));
        } else if (updatedPost) {
            setSavedPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
        } else {
            // Full refresh if needed
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fcfcfc] font-sans selection:bg-primary-200">
            <Header />

            <main className="flex-grow pt-2 sm:pt-8 pb-24 lg:pb-12 px-2 xs:px-4 max-w-4xl mx-auto w-full">
                <div className="flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-1.5 xs:gap-6 mb-2 xs:mb-12 lowercase">
                    <div className="w-6 h-6 xs:w-16 xs:h-16 rounded-md xs:rounded-[2rem] bg-primary-600 flex items-center justify-center shadow-md xs:shadow-xl shadow-primary-200 flex-shrink-0">
                        <span className="text-[10px] xs:text-3xl">🔖</span>
                    </div>
                    <div>
                        <h1 className="text-[11px] xs:text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Publicaciones Guardadas</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                ) : savedPosts.length === 0 ? (
                    <div className="bg-white rounded-[3.5rem] p-20 text-center border border-slate-100 shadow-xl">
                        <div className="text-6xl mb-8 opacity-20">📭</div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Parece que está vacío</h2>
                        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">
                            Las publicaciones que guardes aparecerán aquí para que puedas verlas más tarde.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 xs:space-y-8 animate-fade-in">
                        {savedPosts.map(post => (
                            <PostItem
                                key={post._id}
                                post={post}
                                onUpdate={handleUpdate}
                                isDetail={false}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SavedPosts;
