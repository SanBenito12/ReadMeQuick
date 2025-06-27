"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Clipboard, Download, Sparkles, Loader2 } from "lucide-react";
import React, { useState, useTransition, useMemo } from "react";
import { generateSectionContent } from "@/app/actions";

type ProjectData = {
  projectName: string;
  projectDescription: string;
  projectType: string;
  features: string;
  technologies: string;
};

type ReadmePreviewProps = {
  content: string; // This is the initial structure
  projectData: ProjectData;
};

const SectionGenerator = ({ title, projectData, onGenerate }: { title: string; projectData: ProjectData; onGenerate: (title: string, content: string) => void; }) => {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<string | null>(null);

  const handleGenerate = () => {
    startTransition(async () => {
      const generatedContent = await generateSectionContent({
        sectionName: title,
        ...projectData,
      });
      setContent(generatedContent);
      onGenerate(title, generatedContent);
    });
  };

  return (
    <div>
      {isPending ? (
        <div className="flex items-center gap-2 text-muted-foreground my-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generando contenido para **{title}**...</span>
        </div>
      ) : content ? (
        <pre className="whitespace-pre-wrap text-sm text-foreground font-code bg-transparent p-0 mt-4">{content}</pre>
      ) : (
        <div className="my-4">
          <Button onClick={handleGenerate} variant="outline" size="sm" disabled={isPending}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generar contenido para "{title}"
          </Button>
        </div>
      )}
    </div>
  );
};


export function ReadmePreview({ content: initialContent, projectData }: ReadmePreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});

  const handleContentGenerated = (title: string, content: string) => {
    setGeneratedContents(prev => ({...prev, [title]: content}));
  };

  const readmeParts = useMemo(() => {
    if (!initialContent) return [];
    const placeholderRegex = /<!--gen-content:(.*?)-->/g;
    return initialContent.split(placeholderRegex);
  }, [initialContent]);

  const getFullReadmeContent = () => {
    let finalContent = initialContent;
    for (const title in generatedContents) {
      const placeholder = `<!--gen-content:${title}-->`;
      finalContent = finalContent.replace(placeholder, generatedContents[title]);
    }
    // Clean up any remaining placeholders
    finalContent = finalContent.replace(/<!--gen-content:.*?-->/g, '*Contenido pendiente...*');
    return finalContent;
  };
  
  const handleCopy = () => {
    const fullContent = getFullReadmeContent();
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "El contenido del README ha sido copiado al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullContent = getFullReadmeContent();
    const blob = new Blob([fullContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "¡Descargado!", description: "README.md ha sido descargado." });
  };
  
  return (
    <div className="space-y-4">
       <p className="text-sm text-muted-foreground">Este es un borrador de tu README. ¡Hazlo aún mejor generando contenido para cada sección con IA!</p>
      <div className="relative">
        <div className="absolute top-2 right-2 flex gap-2 z-10">
           <Button variant="ghost" size="icon" onClick={handleCopy} title="Copiar Markdown">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="sr-only">Copiar</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Descargar README.md">
            <Download className="h-4 w-4" />
            <span className="sr-only">Descargar</span>
          </Button>
        </div>
        <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/50 p-4">
          <div className="font-code">
            {readmeParts.map((part, index) => {
              // Odd indexes are the section titles captured by the regex
              if (index % 2 === 1) {
                const title = part;
                return <SectionGenerator key={title} title={title} projectData={projectData} onGenerate={handleContentGenerated} />
              }
              // Even indexes are the static parts of the markdown
              return <pre key={index} className="whitespace-pre-wrap text-sm text-foreground font-code bg-transparent p-0">{part}</pre>;
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
