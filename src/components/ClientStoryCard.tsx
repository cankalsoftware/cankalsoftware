"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink } from "lucide-react"; // Importing ExternalLink icon

interface ClientStoryCardProps {
  title: string;
  link: string;
  problem: string;
  solution: string;
  results: string;
  idx: number; // For stagger animation
}

export const ClientStoryCard = ({ title, link, problem, solution, results, idx }: ClientStoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      className="glass p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 hover:border-[#2563eb]/50 dark:hover:border-[#b52bff]/50 transition-all flex flex-col h-full"
    >
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground flex-grow mb-4">
        <strong>The Problem:</strong> {problem}<br/><br/>
        <strong>Our Solution:</strong> {solution}<br/><br/>
        <strong>The Results:</strong> {results}
      </p>
      {link && (
        <Link href={link} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center text-[#2563eb] dark:text-[#00f0ff] hover:underline font-semibold">
          View Project <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      )}
    </motion.div>
  );
};
