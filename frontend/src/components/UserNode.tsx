import React from 'react';
import { Handle, Position } from 'reactflow';
import { useDrop } from 'react-dnd';

interface UserNodeProps {
  data: {
    username: string;
    age: number;
    hobbies: string[];
    popularityScore: number;
    onAddHobby: (hobby: string) => void;
  };
}

const UserNode: React.FC<UserNodeProps> = ({ data }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'HOBBY',
    drop: (item: { hobby: string }) => {
      data.onAddHobby(item.hobby);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getNodeColor = (score: number) => {
    if (score > 10) return 'from-purple-500 to-pink-600';
    if (score > 5) return 'from-blue-500 to-cyan-500';
    if (score > 2) return 'from-green-500 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  const getNodeSize = (score: number) => {
    if (score > 10) return 'scale-110';
    if (score > 5) return 'scale-105';
    return 'scale-100';
  };

  return (
    <div
      ref={drop as any}
      className={`px-6 py-4 rounded-xl shadow-lg bg-gradient-to-br ${getNodeColor(
        data.popularityScore
      )} text-white transition-all duration-300 ${getNodeSize(
        data.popularityScore
      )} ${isOver ? 'ring-4 ring-yellow-400' : ''}`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="font-bold text-lg mb-1">{data.username}</div>
      <div className="text-sm opacity-90">Age: {data.age}</div>
      <div className="text-xs opacity-80 mt-2">
        Score: {data.popularityScore.toFixed(1)}
      </div>
      
      {data.hobbies.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="opacity-80">Hobbies:</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.hobbies.slice(0, 3).map((hobby, i) => (
              <span
                key={i}
                className="bg-white bg-opacity-20 px-2 py-0.5 rounded"
              >
                {hobby}
              </span>
            ))}
            {data.hobbies.length > 3 && (
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                +{data.hobbies.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default UserNode;
