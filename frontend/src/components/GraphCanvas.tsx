import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../context/AppContext';
import type { GraphNode } from '../types';
import UserNode from './UserNode';

const nodeTypes = {
  userNode: UserNode,
};

const GraphCanvas: React.FC = () => {
  const { graphData, linkUsers, fetchGraphData, addHobbyToUser } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  useEffect(() => {
    const flowNodes: Node[] = graphData.nodes.map((node: GraphNode, index: number) => ({
      id: node.id,
      type: 'userNode',
      position: {
        x: (index % 4) * 300 + 100,
        y: Math.floor(index / 4) * 200 + 100,
      },
      data: {
        username: node.username,
        age: node.age,
        hobbies: node.hobbies,
        popularityScore: node.popularity_score,
        onAddHobby: (hobby: string) => addHobbyToUser(node.id, hobby),
      },
    }));

    const flowEdges: Edge[] = graphData.edges.map((edge, index) => ({
      id: `e${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, setNodes, setEdges, addHobbyToUser]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (connection.source && connection.target) {
        try {
          await linkUsers(connection.source, connection.target);
        } catch (error) {
          console.error('Failed to create friendship:', error);
        }
      }
    },
    [linkUsers]
  );

  const onNodeDragStart: NodeMouseHandler = useCallback((_, node) => {
    setDraggedNode(node.id);
  }, []);

  const onNodeDragStop: NodeMouseHandler = useCallback(
    async (_, node) => {
      if (draggedNode && draggedNode !== node.id) {
        try {
          await linkUsers(draggedNode, node.id);
        } catch (error) {
          console.error('Failed to create friendship:', error);
        }
      }
      setDraggedNode(null);
    },
    [draggedNode, linkUsers]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default GraphCanvas;
