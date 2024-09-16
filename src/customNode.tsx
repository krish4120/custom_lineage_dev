import React, { useEffect, useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import './customNode.css';

interface CustomNodeProps {
  data: {
    label: string;
    expanded: boolean;
    onToggleExpand: () => void;
    onNodeClick: () => void;
    hasDependencies: boolean;
    type: string; // Add type prop to distinguish between table and view
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const [nodeSize, setNodeSize] = useState({ width: 100, height: 50 });
  const textRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const calculateSize = () => {
      if (textRef.current && iconRef.current) {
        const textWidth = textRef.current.offsetWidth;
        const textHeight = textRef.current.offsetHeight;
        const iconWidth = iconRef.current.offsetWidth;
        const iconHeight = iconRef.current.offsetHeight;
        const buttonWidth = buttonRef.current?.offsetWidth || 0;
        const buttonHeight = buttonRef.current?.offsetHeight || 0;

        const padding = 20;
        const totalWidth = iconWidth + textWidth + buttonWidth + padding * 2;
        const totalHeight = Math.max(iconHeight, textHeight, buttonHeight) + padding * 2;

        setNodeSize({ width: totalWidth, height: totalHeight });
      }
    };

    calculateSize();
  }, [data.label, data.hasDependencies]);

  const getImageDetails = (type: string) => {
    switch (type.toUpperCase()) {
      case 'TABLE':
        return {
          src: '../custom_lineage_dev/table.png',
          alt: 'Table'
        };
      case 'VIEW':
        return {
          src: '../custom_lineage_dev/database_view.png',
          alt: 'View'
        };
      case 'POWER BI DATASET':
        return {
          src: '../custom_lineage_dev/powerbi_dataset.png',
          alt: 'Power BI Dataset'
        };
      case 'POWER BI REPORT':
        return {
          src: '../custom_lineage_dev/powerbi_report.png',
          alt: 'Power BI Report'
        };
      default:
        return {
          src: '../custom_lineage_dev/default.png',
          alt: 'Default'
        };
    }
  };

  const { src, alt } = getImageDetails(data.type);

  const handleTextClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    console.log('Text clicked:', e.currentTarget.innerText); // Log the text clicked
    if (e.ctrlKey && textRef.current) {
      navigator.clipboard.writeText(textRef.current.innerText)
        .then(() => {
          setNotification('Text copied!');
          setTimeout(() => setNotification(null), 2000);
        })
        .catch(() => {
          setNotification('Failed to copy text.');
          setTimeout(() => setNotification(null), 2000);
        });
    }
  };

  return (
    <div
      className={`custom-node ${data.expanded ? 'expanded' : 'collapsed'}`}
      style={{ width: `${nodeSize.width}px`, height: `${nodeSize.height}px` }}
      onClick={() => {
        console.log('Node clicked:', data.label); // Log the node label on click
        data.onNodeClick();
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
      />
      <div className="custom-node-content">
        <img 
          ref={iconRef}
          src={src} 
          alt={alt} 
          className="icon" 
        />
        <div className="text-and-button">
          <span 
            ref={textRef}
            onClick={handleTextClick}
            className="node-label"
          >
            {data.label}
          </span>
          {data.hasDependencies && (
            <button ref={buttonRef} onClick={data.onToggleExpand}>
              {data.expanded ? '▼' : '▲'}
            </button>
          )}
        </div>
      </div>
      {data.hasDependencies && (
        <Handle 
          type="source" 
          position={Position.Right} 
        />
      )}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
