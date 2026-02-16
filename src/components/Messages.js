import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ConversationList from './messages/ConversationList';
import ConversationSearch from './messages/ConversationSearch';
import ChatComponent from './messages/ChatComponent';
import Header from './Header';
import Footer from './Footer';

const Messages = () => {
  const { conversationId } = useParams();
  const [selectedConversationId, setSelectedConversationId] = useState(conversationId || null);
  const [filteredConversations, setFilteredConversations] = useState(null);

  useEffect(() => {
    setSelectedConversationId(conversationId || null);
  }, [conversationId]);

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden">
      <Header />
      <main className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x border-gray-200 bg-white shadow-xl my-4 rounded-xl">
        <div className="w-full md:w-1/3 border-r bg-white flex flex-col z-10">
          <ConversationSearch onResults={setFilteredConversations} />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ConversationList
              onSelectConversation={setSelectedConversationId}
              filteredConversations={filteredConversations}
            />
          </div>
        </div>
        <div className="hidden md:flex md:w-2/3 bg-gray-50 flex-col relative">
          {selectedConversationId ? (
            <ChatComponent conversationId={selectedConversationId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                <span className="text-4xl text-indigo-300">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Tus mensajes</h3>
              <p className="text-gray-500">Selecciona una conversación para empezar a chatear</p>
            </div>
          )}
        </div>
      </main>
      {/* Mobile View Overlay for Chat */}
      {selectedConversationId && (
        <div className="md:hidden fixed inset-0 z-[110] bg-white flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatComponent
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Messages;

