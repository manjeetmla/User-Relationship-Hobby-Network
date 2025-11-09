import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import GraphCanvas from './components/GraphCanvas';
import HobbySidebar from './components/HobbySidebar';
import UserPanel from './components/UserPanel';

function AppContent() {
  const { fetchUsers, fetchGraphData } = useApp();

  useEffect(() => {
    fetchUsers();
    fetchGraphData();
  }, [fetchUsers, fetchGraphData]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100">
        <HobbySidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              User Relationship & Hobby Network
            </h1>
            <p className="text-sm text-gray-600">
              Drag nodes to connect users, or drag hobbies onto users to add them
            </p>
          </header>
          <div className="flex-1">
            <GraphCanvas />
          </div>
        </div>
        <UserPanel />
      </div>
      <Toaster position="bottom-right" />
    </DndProvider>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
