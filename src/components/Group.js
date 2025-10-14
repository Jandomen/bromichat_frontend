import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import GroupList from "./GroupChat/GroupList";
import GroupManager from "./GroupChat/GroupManager";

const Group = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Mis Grupos</h1>
        <p className="text-sm text-gray-600 mb-6">
          Haz clic en un grupo para ver sus detalles o cambiar su foto, o crea un grupo nuevo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Lista de Grupos</h2>
            <GroupList />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Crear Nuevo Grupo</h2>
            <GroupManager />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Group;