"use client";

import React from "react";

interface ExplanationCardProps {
  title: string;
  text: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ title, text }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
};

export default ExplanationCard;
