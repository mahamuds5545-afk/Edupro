
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { ContentType } from '../types';

interface RichContentProps {
  content: string;
  type: ContentType;
  className?: string;
}

const RichContent: React.FC<RichContentProps> = ({ content, type, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'math' && containerRef.current) {
      try {
        katex.render(content, containerRef.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch (err) {
        console.error("KaTeX error:", err);
      }
    }
  }, [content, type]);

  if (type === 'html') {
    return (
      <div 
        className={`rich-html-content ${className}`} 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  if (type === 'math') {
    return <div ref={containerRef} className={`rich-math-content ${className}`} />;
  }

  return <div className={`rich-text-content ${className}`}>{content}</div>;
};

export default RichContent;
