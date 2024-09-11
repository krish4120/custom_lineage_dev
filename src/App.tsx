import { useEffect, useCallback, useState, useRef } from 'react';
import dagre from 'dagre';
import { useLocation } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type ReactFlowInstance,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { parseJsonData } from './dataTransform';
import CustomNode from './customNode';
import CustomEdge from './customeEdge';
import Navbar from './Navbar'; // Ensure this file exists and matches the casing

function getTextDimensions(text: string, font = '14px Arial'): { width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    const width = metrics.width;
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return { width, height };
  }
  return { width: 0, height: 0 };
}

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function App() {
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const jsonData = location.state?.jsonData || [];

  // Log jsonData whenever it changes
  useEffect(() => {
    console.log('Location state jsonData:', jsonData);
  }, [jsonData]);

  // Log nodes whenever they change
  useEffect(() => {
    console.log('Nodes:', nodes);
  }, [nodes]);

  // Log edges whenever they change
  useEffect(() => {
    console.log('Edges:', edges);
  }, [edges]);

  // Log expanded nodes whenever they change
  useEffect(() => {
    console.log('Expanded Nodes:', expandedNodes);
  }, [expandedNodes]);

  // Log hidden nodes whenever they change
  useEffect(() => {
    console.log('Hidden Nodes:', hiddenNodes);
  }, [hiddenNodes]);

  // Log hidden edges whenever they change
  useEffect(() => {
    console.log('Hidden Edges:', hiddenEdges);
  }, [hiddenEdges]);

  // Log highlighted edges whenever they change
  useEffect(() => {
    console.log('Highlighted Edges:', highlightedEdges);
  }, [highlightedEdges]);

  // Log highlighted node IDs whenever they change
  useEffect(() => {
    console.log('Highlighted Node IDs:', highlightedNodeIds);
  }, [highlightedNodeIds]);

  // Log current index whenever it changes
  useEffect(() => {
    console.log('Current Index:', currentIndex);
  }, [currentIndex]);

  // Function to toggle expand/collapse of all nodes
  const handleExpandCollapseToggle = () => {
    setExpandedNodes((prevExpandedNodes) => {
      const newExpandedNodes = new Set(prevExpandedNodes);
      if (newExpandedNodes.size > 0) {
        newExpandedNodes.clear();
        nodes.forEach(node => hideNodeAndChildren(node.id));
      } else {
        nodes.forEach(node => showNodeAndChildren(node.id));
        nodes.forEach(node => newExpandedNodes.add(node.id));
      }
      console.log('Expanded Nodes:', Array.from(newExpandedNodes));
      return newExpandedNodes;
    });
  };

  // Function to handle download of the graph
  const handleDownload = async () => {
    if (reactFlowInstanceRef.current) {
      try {
        // Assuming `toObject` returns a promise with flow data
        const flow = await reactFlowInstanceRef.current.toObject(); 
  
        // Convert the flow object to a JSON string
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
  
        // Create a temporary anchor element for downloading the file
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flow.json");
  
        // Append the anchor to the body and trigger the download
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
  
        // Remove the anchor from the body
        document.body.removeChild(downloadAnchorNode);
      } catch (error) {
        console.error('Error generating download:', error);
      }
    }
  };
  
  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = parseJsonData(jsonData);
  
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'LR',
      nodesep: 100,
      edgesep: 50,
      ranksep: 150,
    });
    g.setDefaultEdgeLabel(() => ({}));
  
    parsedNodes.forEach((node) => {
      const { width, height } = getTextDimensions(String(node.data.label || node.id));
      g.setNode(node.id, { width: width + 20, height: height + 20 });
    });
  
    parsedEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(g);
  
    const nodesWithDependencies = parsedNodes.map((node) => {
      const hasDependencies = parsedEdges.some(edge => edge.source === node.id);
      return {
        ...node,
        position: {
          x: g.node(node.id).x - g.node(node.id).width / 2,
          y: g.node(node.id).y - g.node(node.id).height / 2,
        },
        data: {
          ...node.data,
          expanded: expandedNodes.has(node.id),
          onToggleExpand: () => handleToggleExpand(node.id),
          onNodeClick: () => handleNodeClick(node.id),
          hasDependencies,
          highlighted: highlightedNodeIds.includes(node.id), // Highlight logic
        },
        hidden: hiddenNodes.has(node.id),
      };
    });
  
    console.log('Parsed Nodes:', nodesWithDependencies);
    console.log('Parsed Edges:', parsedEdges);

    setNodes(nodesWithDependencies);
    setEdges(parsedEdges.map((edge) => ({
      ...edge,
      hidden: hiddenEdges.has(edge.id),
      data: { highlight: highlightedEdges.has(edge.id) },
    })));
  }, [jsonData, expandedNodes, hiddenNodes, hiddenEdges, highlightedEdges, highlightedNodeIds]);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      console.log(`Previous value of expandedNodes: ${JSON.stringify([...prev])}`);
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        hideNodeAndChildren(nodeId);
      } else {
        newSet.add(nodeId);
        showNodeAndChildren(nodeId);
      }
      console.log('Expanded Nodes after toggle:', Array.from(newSet));
      return newSet;
    });
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    console.log('A '+nodeId);

    const highlightEdges = new Set<string>();
    const visitedNodes = new Set<string>();
    const traverse = (id: string) => {
      if (visitedNodes.has(id)) return;
      visitedNodes.add(id);
  
      edges.forEach((edge) => {
        if (edge.source === id) {
          highlightEdges.add(edge.id);
          traverse(edge.target);
        }
      });
    };
    traverse(nodeId);
    console.log('Highlighted Edges:', Array.from(highlightEdges));
    setHighlightedEdges(highlightEdges);
  }, [edges]);

  const hideNodeAndChildren = useCallback((parentId: string) => {
    console.log('B '+parentId);
    const visitedNodes = new Set<string>();
    setHiddenNodes((prev) => {
      const newSet = new Set(prev);
      const toHide = new Set<string>();
      const traverse = (id: string) => {
        if (visitedNodes.has(id)) return;
        visitedNodes.add(id);
  
        edges.forEach((edge) => {
          if (edge.source === id) {
            toHide.add(edge.target);
            traverse(edge.target);
          }
        });
      };
      traverse(parentId);
      toHide.forEach((nodeId) => newSet.add(nodeId));
      console.log('Hidden Nodes after hiding:', Array.from(newSet));
      return newSet;
    });
  
    setHiddenEdges((prev) => {
      const newSet = new Set(prev);
      edges.forEach((edge) => {
        if (edge.source === parentId || hiddenNodes.has(edge.source)) {
          newSet.add(edge.id);
        }
      });
      console.log('Hidden Edges after hiding:', Array.from(newSet));
      return newSet;
    });
  }, [edges, hiddenNodes]);

  const showNodeAndChildren = (parentId: string) => {
    setHiddenNodes((prev) => {
      const newSet = new Set(prev);
      const toShow = new Set<string>();
      edges.forEach((edge) => {
        if (edge.source === parentId) {
          toShow.add(edge.target);
        }
      });
      toShow.forEach((nodeId) => newSet.delete(nodeId));
      console.log('Hidden Nodes after showing:', Array.from(newSet));
      return newSet;
    });

    setHiddenEdges((prev) => {
      const newSet = new Set(prev);
      edges.forEach((edge) => {
        if (edge.source === parentId) {
          newSet.delete(edge.id);
        }
      });
      console.log('Hidden Edges after showing:', Array.from(newSet));
      return newSet;
    });
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log('Connection attempt blocked:', connection);
    },
    []
  );

  const handleSearch = (searchTerm: string): number => {
    const matchingNodes = nodes.filter((n) => n.id.includes(searchTerm));
    const matchingNodeIds = matchingNodes.map((node) => node.id);
    setHighlightedNodeIds(matchingNodeIds);
    setCurrentIndex(0);
  
    if (matchingNodes.length > 0 && reactFlowInstanceRef.current) {
      try {
        reactFlowInstanceRef.current.fitView({ nodes: [matchingNodes[0]] });
      } catch (error) {
        console.error('Error fitting view:', error);
      }
    } else {
      console.warn('No matching nodes found');
    }
  
    console.log('Matching Nodes:', matchingNodes);
    return matchingNodes.length;
  };
  
  const handleNext = () => {
    if (highlightedNodeIds.length === 0) return;

    const nextIndex = (currentIndex + 1) % highlightedNodeIds.length;
    const nextNodeId = highlightedNodeIds[nextIndex];
    setCurrentIndex(nextIndex);

    const node = nodes.find((n) => n.id === nextNodeId);
    if (node && reactFlowInstanceRef.current) {
      try {
        reactFlowInstanceRef.current.fitView({ nodes: [node] });
      } catch (error) {
        console.error('Error fitting view:', error);
      }
    }
  };


  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Navbar 
        onExpandCollapseToggle={handleExpandCollapseToggle} 
        onDownload={handleDownload} 
        onSearch={handleSearch} 
        onNext={handleNext} 
        onReset={handleNext}
        databases={[]} 
        schemas={[]} 
        tables={[]}
      />
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
