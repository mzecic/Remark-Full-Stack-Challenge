"use client";

import React from "react";

interface ExplanationCardProps {
  content: {
    title: string;
    text: string;
  };
  index: number;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({
  content,
  index,
}) => {
  return (
    <div
      className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg animate-card-entrance"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">
        {content.title}
      </h3>
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {content.text}
      </p>
    </div>
  );
};

export default ExplanationCard;
