import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useApp } from '../context/AppContext';

interface DraggableHobbyProps {
  hobby: string;
}

const DraggableHobby: React.FC<DraggableHobbyProps> = ({ hobby }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'HOBBY',
    item: { hobby },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`px-3 py-2 bg-blue-500 text-white rounded-lg cursor-move hover:bg-blue-600 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {hobby}
    </div>
  );
};

const HobbySidebar: React.FC = () => {
  const { allHobbies } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [customHobbies, setCustomHobbies] = useState<string[]>([]);

  const filteredHobbies = [...allHobbies, ...customHobbies].filter((hobby) =>
    hobby.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomHobby = () => {
    if (newHobby.trim() && !allHobbies.includes(newHobby.trim()) && !customHobbies.includes(newHobby.trim())) {
      setCustomHobbies([...customHobbies, newHobby.trim()]);
      setNewHobby('');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Hobbies</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search hobbies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new hobby..."
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomHobby()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCustomHobby}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Drag hobbies onto users
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredHobbies.length > 0 ? (
          filteredHobbies.map((hobby, index) => (
            <DraggableHobby key={`${hobby}-${index}`} hobby={hobby} />
          ))
        ) : (
          <div className="text-gray-400 text-sm">
            {searchTerm ? 'No hobbies found' : 'No hobbies available. Create users with hobbies or add custom ones.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default HobbySidebar;
