"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Loader2, Sparkles, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getSections, generateReadmeContent } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ReadmePreview } from "@/components/readme-preview";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  projectName: string;
  projectDescription: string;
  projectType: string;
  features: string;
  technologies: string;
  sections: string[];
};

const initialFormData: FormData = {
  projectName: "",
  projectDescription: "",
  projectType: "",
  features: "",
  technologies: "",
  sections: [],
};

export function ReadmeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [suggestedSections, setSuggestedSections] = useState<string[]>([]);
  const [generatedReadme, setGeneratedReadme] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionsChange = (section: string) => {
    setFormData((prev) => {
      const newSections = prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section];
      return { ...prev, sections: newSections };
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) { // After Features & Tech
      if (!formData.projectDescription || !formData.features || !formData.technologies || !formData.projectType) {
        toast({ title: "Missing Information", description: "Please fill out all fields before proceeding.", variant: "destructive" });
        return;
      }
      startTransition(async () => {
        try {
          const sections = await getSections(formData);
          setSuggestedSections(sections);
          setFormData(prev => ({ ...prev, sections }));
          setCurrentStep(s => s + 1);
        } catch (error) {
           toast({ title: "AI Error", description: "Could not suggest sections. Please proceed with manual selection.", variant: "destructive" });
           setSuggestedSections(["Introduction", "Features", "Technologies", "Installation", "Usage", "Contributing", "License"]);
           setFormData(prev => ({ ...prev, sections: ["Introduction", "Features", "Technologies", "Installation", "Usage", "Contributing", "License"] }));
           setCurrentStep(s => s + 1);
        }
      });
    } else {
      setCurrentStep(s => s + 1);
    }
  };
  
  const handleGenerateReadme = () => {
    if (formData.sections.length === 0) {
      toast({ title: "No Sections Selected", description: "Please select at least one section for your README.", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const readme = await generateReadmeContent(formData);
        setGeneratedReadme(readme);
        setCurrentStep(s => s + 1);
      } catch (error) {
        toast({ title: "Generation Error", description: "Failed to generate README. Please try again.", variant: "destructive" });
      }
    });
  };

  const handleStartOver = () => {
    setFormData(initialFormData);
    setSuggestedSections([]);
    setGeneratedReadme("");
    setCurrentStep(0);
  };
  
  const promptIcon = <ChevronRight className="h-5 w-5 text-accent flex-shrink-0" />;

  const steps = [
    // Step 0: Project Details
    {
      title: "Project Details",
      content: (
        <>
          <div className="flex items-start gap-3">
            {promptIcon}
            <div className="w-full space-y-2">
              <Label htmlFor="projectName">What's your project's name?</Label>
              <Input id="projectName" name="projectName" value={formData.projectName} onChange={handleInputChange} placeholder="e.g., ReadMeQuick" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            {promptIcon}
            <div className="w-full space-y-2">
              <Label htmlFor="projectType">What type of project is it?</Label>
              <Input id="projectType" name="projectType" value={formData.projectType} onChange={handleInputChange} placeholder="e.g., Web App, CLI Tool, Library" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            {promptIcon}
            <div className="w-full space-y-2">
              <Label htmlFor="projectDescription">Describe your project in a sentence or two.</Label>
              <Textarea id="projectDescription" name="projectDescription" value={formData.projectDescription} onChange={handleInputChange} placeholder="A tool to generate READMEs using AI..." />
            </div>
          </div>
        </>
      ),
      button: <Button onClick={handleNextStep}>Next</Button>
    },
    // Step 1: Features & Technologies
    {
      title: "Features & Technologies",
      content: (
        <>
          <div className="flex items-start gap-3">
            {promptIcon}
            <div className="w-full space-y-2">
              <Label htmlFor="features">List the key features (comma-separated).</Label>
              <Textarea id="features" name="features" value={formData.features} onChange={handleInputChange} placeholder="Interactive CLI, AI-powered suggestions, Badge generation..." />
            </div>
          </div>
          <div className="flex items-start gap-3">
            {promptIcon}
            <div className="w-full space-y-2">
              <Label htmlFor="technologies">List the main technologies used (comma-separated).</Label>
              <Textarea id="technologies" name="technologies" value={formData.technologies} onChange={handleInputChange} placeholder="Next.js, Tailwind CSS, Genkit..." />
            </div>
          </div>
        </>
      ),
      button: (
        <Button onClick={handleNextStep} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Suggest Sections
        </Button>
      )
    },
    // Step 2: Select Sections
    {
      title: "Select Sections",
      content: (
        <div className="flex items-start gap-3">
          {promptIcon}
          <div className="w-full space-y-3">
            <Label>AI has suggested these sections. Refine as needed.</Label>
            <div className="grid grid-cols-2 gap-4 rounded-md border p-4 sm:grid-cols-3">
              {suggestedSections.map((section) => (
                <div key={section} className="flex items-center gap-2">
                  <Checkbox
                    id={section}
                    checked={formData.sections.includes(section)}
                    onCheckedChange={() => handleSectionsChange(section)}
                  />
                  <Label htmlFor={section} className="font-normal">{section}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
       button: (
        <Button onClick={handleGenerateReadme} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate README
        </Button>
      )
    },
    // Step 3: Preview
    {
      title: "README Preview",
      content: <ReadmePreview content={generatedReadme} />,
      button: <Button onClick={handleStartOver} variant="outline">Start Over</Button>
    }
  ];

  return (
    <Card className="w-full overflow-hidden shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isPending && currentStep !== 2 && currentStep !== 3 ? (
               <div className="flex flex-col items-center justify-center gap-4 py-16">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-muted-foreground">AI is thinking...</p>
               </div>
            ) : (
              <>
                {steps[currentStep].content}
                <div className="flex justify-end pt-4">
                  {steps[currentStep].button}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
