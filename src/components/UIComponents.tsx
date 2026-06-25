import { ReactNode } from "react";

export function GlassContainer({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`glass p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ProjectCard({ title, description, link, tags }: { title: string, description: string, link: string, tags?: string[] }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block glass-hover p-6 rounded-2xl glass h-full flex flex-col">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80 mb-4 flex-1">{description}</p>
      {tags && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
