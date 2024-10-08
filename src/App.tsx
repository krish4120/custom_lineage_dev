import { useState, useEffect, useCallback, FormEvent, ChangeEvent, useRef } from 'react';
import dagre from 'dagre';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  type OnConnect, 
  type ReactFlowInstance 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Navbar from './Navbar'; // Ensure this file exists and matches the casing
import { parseJsonData } from './dataTransform';
import CustomNode from './customNode';
import CustomEdge from './customeEdge';
import './Home.css'; // Import the CSS file for the home page

// Helper function to get text dimensions
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

export default function AppHome() {
  const [view, setView] = useState<'home' | 'app'>(() => localStorage.getItem('view') as 'home' | 'app' || 'home'); // Load view from localStorage
  const [jsonInput, setJsonInput] = useState<string>('');   // JSON input state
  const [jsonData, setJsonData] = useState<any[]>(() => {
    // Load JSON data from localStorage if available
    const savedData = localStorage.getItem('jsonData');
    return savedData ? JSON.parse(savedData) : [];
  });      // Parsed JSON data state

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('view', view);
  }, [view]);

  useEffect(() => {
    if (jsonData.length > 0) {
      localStorage.setItem('jsonData', JSON.stringify(jsonData));
    }
  }, [jsonData]);

  // Handle form submission in Home view
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const parsedData = JSON.parse(jsonInput);
      setJsonData(parsedData);
      setView('app'); // Switch to app view after valid JSON is submitted
    } catch (error) {
      alert('Invalid JSON data');
    }
  };

  // Handle change in textarea
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
  };

  // Handle download of the graph (from the app view)
  const handleDownload = async () => {
    if (reactFlowInstanceRef.current) {
      try {
        const flow = await reactFlowInstanceRef.current.toObject();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flow.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);
      } catch (error) {
        console.error('Error generating download:', error);
      }
    }
  };

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
      return newExpandedNodes;
    });
  };

  useEffect(() => {
    if (jsonData.length === 0) return; // Do nothing if no jsonData

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
          highlighted: highlightedNodeIds.includes(node.id),
        },
        hidden: hiddenNodes.has(node.id),
      };
    });

    setNodes(nodesWithDependencies);
    setEdges(parsedEdges.map((edge) => ({
      ...edge,
      hidden: hiddenEdges.has(edge.id),
      data: { highlight: highlightedEdges.has(edge.id) },
    })));
  }, [jsonData, expandedNodes, hiddenNodes, hiddenEdges, highlightedEdges, highlightedNodeIds]);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        hideNodeAndChildren(nodeId); // Hide children only
      } else {
        newSet.add(nodeId);
        showNodeAndChildren(nodeId); // Show children
      }
      return newSet;
    });
  };
  
  const handleNodeClick = useCallback((nodeId: string) => {
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
    setHighlightedEdges(highlightEdges);
  }, [edges]);

  const hideNodeAndChildren = useCallback((parentId: string) => {
    const visitedNodes = new Set<string>();
    
    // The parent node should not be hidden
    setHiddenNodes((prev) => {
      const newSet = new Set(prev);
      const toHide = new Set<string>();
  
      const traverse = (id: string) => {
        // If the node is already visited, return to avoid cyclic issues
        if (visitedNodes.has(id)) return;
        visitedNodes.add(id);
        
        edges.forEach((edge) => {
          if (edge.source === id && edge.target !== parentId) {
            // Add the target to the nodes to hide and traverse further
            toHide.add(edge.target);
            traverse(edge.target);
          }
        });
      };
  
      // Traverse children of the parent node but exclude the parent node itself
      traverse(parentId);
      
      // Add all the nodes to hide except the parent node
      toHide.forEach((nodeId) => newSet.add(nodeId));
      return newSet;
    });
  
    // Similarly, hide edges connected to the hidden nodes
    setHiddenEdges((prev) => {
      const newSet = new Set(prev);
  
      edges.forEach((edge) => {
        if ((hiddenNodes.has(edge.source) || hiddenNodes.has(edge.target)) && edge.source !== parentId) {
          newSet.add(edge.id);
        }
      });
  
      return newSet;
    });
  }, [edges, hiddenNodes]);
  
  const showNodeAndChildren = (parentId) => {
    setHiddenNodes((prev) => {
      const newSet = new Set(prev);
      const toShow = new Set();
      edges.forEach((edge) => {
        if (edge.source === parentId) {
          toShow.add(edge.target);
        }
      });
      toShow.forEach((nodeId) => newSet.delete(String(nodeId)));
      return newSet;
    });

    setHiddenEdges((prev) => {
      const newSet = new Set(prev);
      edges.forEach((edge) => {
        if (edge.source === parentId) {
          newSet.delete(edge.id);
        }
      });
      return newSet;
    });
  };

  const handleSearch = (searchTerm: string): number => {
    const matchingNodes = nodes.filter((n) => n.id.includes(searchTerm.toUpperCase()));
    const matchingNodeIds = matchingNodes.map((node) => node.id);
    setHighlightedNodeIds(matchingNodeIds);
    setCurrentIndex(0);
  
    if (matchingNodeIds.length > 0 && reactFlowInstanceRef.current) {
      const nodeToView = nodes.find(n => n.id === matchingNodeIds[0]);
      if (nodeToView) {
        reactFlowInstanceRef.current.fitView({
          nodes: [nodeToView], // Focus on the first matched node
          duration: 500, // Optional: set a smooth transition duration
          padding: 0.2 // Optional: set padding to the zoom
        });
      }
    }
    else
    {
      alert('Not Available');
    }
  
    return matchingNodes.length;
  };
  
  const handleNext = () => {
    if (highlightedNodeIds.length === 0) return;
  
    const nextIndex = (currentIndex + 1) % highlightedNodeIds.length;
    const nextNodeId = highlightedNodeIds[nextIndex];
  
    const nextNode = nodes.find((node) => node.id === nextNodeId);
  
    if (nextNode && reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({
        nodes: [nextNode], // Focus on the next matched node
        duration: 500, // Optional: set a smooth transition duration
        padding: 0.2 // Optional: set padding to the zoom
      });
    }
  
    setCurrentIndex(nextIndex);
  };
  
  // Conditionally render Home or App view based on state
  return view === 'home' ? (
    <div className="container">
      <h1 className="header">Welcome to the Data Visualization App</h1>
      <form className="json-form" onSubmit={handleSubmit}>
        <textarea
          className="textarea"
          rows={10}
          cols={50}        
          value={jsonInput}
          onChange={handleChange}
          placeholder="Paste your JSON data here..."
        />
        <br />
        <button className="button" type="submit">Submit</button>
      </form>
    </div>
  ) : (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Navbar
        onExpandCollapseToggle={handleExpandCollapseToggle}
        onDownload={handleDownload}
        onSearch={handleSearch}
        onNext={handleNext}
        onReset={() => setView('home')} // Reset to home
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleExpandCollapseToggle as OnConnect}
        onInit={(instance) => (reactFlowInstanceRef.current = instance)}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
