import type { Node, Edge } from '@xyflow/react';

// Define possible node types
type NodeType = 'TABLE' | 'VIEW' | 'POWER BI DATASET' | 'POWER BI REPORT';

// Function to get the color based on node type
const getColor = (type: NodeType): string => {
  switch (type) {
    case 'TABLE':
      return '#4CAF50'; // Green for table
    case 'VIEW':
      return '#2196F3'; // Blue for view
    case 'POWER BI DATASET':
      return '#FF9800'; // Orange for Power BI dataset
    case 'POWER BI REPORT':
      return '#D5B4B4'; // White for Power BI report
    default:
      return '#000000'; // Default color (black) for unknown types
  }
};

// Define types for nodes and edges
interface Child {
  isStage: number;
  name: string;
  type: NodeType; // Use NodeType for type
}

interface Parent {
  isStage: number;
  name: string;
  type: NodeType; // Use NodeType for type
}

interface InputData {
  child?: Child[]; // Make these optional
  childNames?: string;
  depdOrder: number;
  isStage: number;
  name: string;
  parent?: Parent[]; // Make these optional
  parentNames?: string;
  type: NodeType; // Use NodeType for type
}

// Function to parse the JSON and return nodes and edges
export const parseJsonData = (data: InputData[]): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create a map to keep track of node IDs
  const nodeMap = new Map<string, boolean>();

  data.forEach((item) => {
    // Ensure child and parent arrays are initialized
    const children = item.child || [];
    const parents = item.parent || [];

    // Determine the background color based on the type
    const backgroundColor = getColor(item.type);

    // Create the parent node
    if (!nodeMap.has(item.name)) {
      nodes.push({
        id: item.name,
        type: 'custom',
        data: { 
          label: item.name, 
          expanded: true,
          type: item.type,
          hasDependencies: children.length > 0,
          onToggleExpand: () => {}, // Placeholder for the expand toggle function
          onNodeClick: () => {}, // Placeholder for the node click function
        },
        position: { x: 0, y: 0 },
        style: { 
          backgroundColor,
          borderRadius: '12px', // Ensure nodes have rounded corners
          padding: '8px', // Add padding if necessary
        },
      });
      nodeMap.set(item.name, true);
    }

    // Create child nodes and edges
    children.forEach((child) => {
      if (!nodeMap.has(child.name)) {
        const childColor = getColor(child.type);

        nodes.push({
          id: child.name,
          type: 'custom',
          data: { 
            label: child.name, 
            expanded: true,
            type: child.type,
            hasDependencies: false, // Assuming children don't have their own children here
            onToggleExpand: () => {}, // Placeholder for the expand toggle function
            onNodeClick: () => {}, // Placeholder for the node click function
          },
          position: { x: 0, y: 0 },
          style: { 
            backgroundColor: childColor,
            borderRadius: '12px', // Ensure nodes have rounded corners
            padding: '8px', // Add padding if necessary
          },
        });
        nodeMap.set(child.name, true);
      }
      edges.push({
        id: `${item.name}->${child.name}`,
        type: 'custom',
        source: item.name,
        target: child.name,
      });
    });

    // Create parent edges
    parents.forEach((parent) => {
      if (!nodeMap.has(parent.name)) {
        const parentColor = getColor(parent.type);

        nodes.push({
          id: parent.name,
          type: 'custom',
          data: { 
            label: parent.name, 
            expanded: true,
            type: parent.type,
            hasDependencies: false,
            onToggleExpand: () => {}, // Placeholder for the expand toggle function
            onNodeClick: () => {}, // Placeholder for the node click function
          },
          position: { x: 0, y: 0 },
          style: { 
            backgroundColor: parentColor,
            borderRadius: '12px', // Ensure nodes have rounded corners
            padding: '8px', // Add padding if necessary
          },
        });
        nodeMap.set(parent.name, true);
      }
      edges.push({
        id: `${parent.name}->${item.name}`,
        type: 'custom',
        source: parent.name,
        target: item.name,
      });
    });
  });

  return { nodes, edges };
};
