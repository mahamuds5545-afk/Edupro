
import React, { useState, useEffect } from 'react';
import { dbOps } from '../dbService';
import { Notice } from '../types';

// Define props for the Marquee component to handle text passed from parent (e.g. App.tsx)
interface MarqueeProps {
  text?: string;
}

const Marquee: React.FC<MarqueeProps> = ({ text }) => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    dbOps.listen('notices', (data) => {
      if (data) {
        setNotices(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setNotices([]);
      }
    });
  }, []);

  // Determine the final text to display: prioritize real-time notices from DB, 
  // then fall back to the text prop provided by the parent.
  const combinedNotices = notices.map(n => n.text).join(' • ');
  const displayValue = combinedNotices || text;

  // If there is no text to show from either source, don't render anything
  if (!displayValue) return null;

  return (
    <div className="bg-orange-600 text-white py-2.5 overflow-hidden whitespace-nowrap relative border-b border-orange-700 marquee-container">
      <div className="marquee-text font-black text-sm uppercase tracking-widest px-4">
        📢 {displayValue} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 📢 {displayValue} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; 📢 {displayValue}
      </div>
    </div>
  );
};

export default Marquee;
