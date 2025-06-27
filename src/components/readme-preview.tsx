
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Clipboard, Download, Sparkles, Loader2, RefreshCw, Wand2 } from "lucide-react";
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
  content: string;
  projectData: ProjectData;
};

const SectionGenerator = ({ 
  title, 
  content, 
  isGenerating,
  onGenerate
}: { 
  title: string; 
  content: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) => {
  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground my-4">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Generando contenido para **{title}**...</span>
      </div>
    );
  }

  if (content) {
    return (
      <div className="group/section relative">
        <pre className="whitespace-pre-wrap text-sm text-foreground font-code bg-transparent p-0 mt-4">{content}</pre>
        <div className="absolute -top-2 -right-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
          <Button onClick={onGenerate} variant="ghost" size="sm" className="bg-background hover:bg-muted" disabled={isGenerating}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <Button onClick={onGenerate} variant="outline" size="sm" disabled={isGenerating}>
        <Sparkles className="mr-2 h-4 w-4" />
        Generar contenido para "{title}"
      </Button>
    </div>
  );
};


export function ReadmePreview({ content: initialContent, projectData }: ReadmePreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [generatingSections, setGeneratingSections] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const sectionTitles = useMemo(() => {
    if (!initialContent) return [];
    const placeholderRegex = /<!--gen-content:(.*?)-->/g;
    const matches = [...initialContent.matchAll(placeholderRegex)];
    return matches.map(match => match[1]);
  }, [initialContent]);

  const readmeParts = useMemo(() => {
    if (!initialContent) return [];
    const placeholderRegex = /<!--gen-content:(.*?)-->/g;
    return initialContent.split(placeholderRegex);
  }, [initialContent]);

  const handleGenerateSection = (title: string) => {
    startTransition(async () => {
      setGeneratingSections(prev => ({ ...prev, [title]: true }));
      try {
        const generatedContent = await generateSectionContent({
          sectionName: title,
          ...projectData,
        });
        setGeneratedContents(prev => ({...prev, [title]: generatedContent}));
      } catch (error) {
        toast({ title: `Error al generar "${title}"`, description: "Por favor, inténtalo de nuevo.", variant: "destructive" });
      } finally {
        setGeneratingSections(prev => ({ ...prev, [title]: false }));
      }
    });
  };

  const handleGenerateAll = () => {
    startTransition(async () => {
      const sectionsToGenerate = sectionTitles.filter(title => !generatedContents[title] && !generatingSections[title]);
      if (sectionsToGenerate.length === 0) {
        toast({ title: "Todo Generado", description: "Ya se ha creado contenido para todas las secciones." });
        return;
      }
      
      const generatingStateUpdate: Record<string, boolean> = {};
      sectionsToGenerate.forEach(title => { generatingStateUpdate[title] = true; });
      setGeneratingSections(prev => ({ ...prev, ...generatingStateUpdate }));
      
      toast({ title: "Generación en masa iniciada", description: `Generando ${sectionsToGenerate.length} secciones...` });

      const results = await Promise.allSettled(
        sectionsToGenerate.map(title =>
          generateSectionContent({ sectionName: title, ...projectData })
        )
      );

      const newContent: Record<string, string> = {};
      const finalGeneratingState: Record<string, boolean> = {};
      let successes = 0;
      
      results.forEach((result, index) => {
        const title = sectionsToGenerate[index];
        if (result.status === 'fulfilled') {
          newContent[title] = result.value;
          successes++;
        }
        finalGeneratingState[title] = false;
      });

      setGeneratedContents(prev => ({ ...prev, ...newContent }));
      setGeneratingSections(prev => ({ ...prev, ...finalGeneratingState }));
      
      if (successes === sectionsToGenerate.length) {
        toast({ title: "¡Éxito!", description: "Todas las secciones han sido generadas." });
      } else {
        toast({ title: "Generación Parcial", description: `Se generaron ${successes} de ${sectionsToGenerate.length} secciones.`, variant: "destructive"});
      }
    });
  };

  const getFullReadmeContent = () => {
    let finalContent = initialContent;
    for (const title in generatedContents) {
      const placeholder = `<!--gen-content:${title}-->`;
      finalContent = finalContent.replace(placeholder, generatedContents[title]);
    }
    // Clean up any remaining placeholders
    finalContent = finalContent.replace(/<!--gen-content:.*?-->/g, '\n*Contenido pendiente...*\n');
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
  
  const allGenerated = sectionTitles.every(title => !!generatedContents[title]);

  return (
    <div className="space-y-4">
       <p className="text-sm text-muted-foreground">Este es un borrador de tu README. ¡Hazlo aún mejor generando contenido para cada sección con IA!</p>
      <div className="relative">
        <div className="absolute top-2 right-2 flex gap-2 z-10">
           <Button variant="outline" size="sm" onClick={handleGenerateAll} disabled={isPending || allGenerated}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">{allGenerated ? 'Todo Generado' : 'Generar Todo'}</span>
           </Button>
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
              if (index % 2 === 1) {
                const title = part;
                return <SectionGenerator 
                  key={title} 
                  title={title} 
                  projectData={projectData}
                  content={generatedContents[title] || null}
                  isGenerating={!!generatingSections[title]}
                  onGenerate={() => handleGenerateSection(title)}
                />
              }
              return <pre key={index} className="whitespace-pre-wrap text-sm text-foreground font-code bg-transparent p-0">{part}</pre>;
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
