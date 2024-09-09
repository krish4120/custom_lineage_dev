import React from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';
import './customEdge.css'; // Import your CSS file

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <path
      id={id}
      className={`react-flow__edge-path ${data?.highlight ? 'highlighted' : ''}`} // Apply class based on highlight
      style={{
        ...style,
        strokeWidth: data?.highlight ? 4 : 2,
      }}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;
