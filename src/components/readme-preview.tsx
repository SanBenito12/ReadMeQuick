"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Clipboard, Download } from "lucide-react";
import { useState } from "react";

type ReadmePreviewProps = {
  content: string;
};

export function ReadmePreview({ content }: ReadmePreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "El contenido del README ha sido copiado al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
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
      <div className="relative">
        <div className="absolute top-2 right-2 flex gap-2">
           <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="sr-only">Copiar</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Descargar</span>
          </Button>
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-code">
            {content}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
}
