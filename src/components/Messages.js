import React, { useState } from 'react';
import ConversationList from './messages/ConversationList';
import ConversationSearch from './messages/ConversationSearch';
import ChatComponent from './messages/ChatComponent';
import Header from './Header';
import Footer from './Footer';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [filteredConversations, setFilteredConversations] = useState(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-grow overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto p-2">
          
          <ConversationList
            onSelectConversation={setSelectedConversationId}
            filteredConversations={filteredConversations} 
          />
        </div>
        <div className="w-2/3 overflow-y-auto">
          {selectedConversationId ? (
            <ChatComponent conversationId={selectedConversationId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Selecciona una conversación
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;

