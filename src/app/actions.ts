
"use server";

import { determineSections, type DetermineSectionsInput } from '@/ai/flows/determine-sections';
import { generateBadges } from '@/ai/flows/generate-badges';
import { generateSectionContent as generateSectionContentFlow, type GenerateSectionContentInput } from '@/ai/flows/generate-section-content';
import { z } from 'zod';

const getSectionsSchema = z.object({
  projectType: z.string(),
  projectDescription: z.string(),
  features: z.string(),
  technologies: z.string(),
});

export async function getSections(input: DetermineSectionsInput) {
  const parsedInput = getSectionsSchema.parse(input);
  try {
    const result = await determineSections(parsedInput);
    return result.sections;
  } catch (error) {
    console.error("Error determining sections:", error);
    // Fallback to a default set of sections on error
    return ["Introducción", "Características", "Tecnologías", "Instalación", "Uso", "Licencia"];
  }
}

const generateReadmeSchema = z.object({
  projectName: z.string(),
  projectDescription: z.string(),
  projectType: z.string(),
  features: z.string(),
  technologies: z.string(),
  sections: z.array(z.string()),
});

export async function generateReadmeStructure(data: z.infer<typeof generateReadmeSchema>) {
    const parsedData = generateReadmeSchema.parse(data);
    const { projectName, projectDescription, projectType, features, technologies, sections } = parsedData;

    let badges: string[] = [];
    try {
        const badgesResult = await generateBadges({
            projectDescription: `Project Type: ${projectType}. Features: ${features}. Technologies: ${technologies}. Description: ${projectDescription}`,
        });
        if (badgesResult && badgesResult.badges) {
            badges = badgesResult.badges;
        }
    } catch (error) {
        console.error("Error generating badges:", error);
    }
    
    let readmeContent = `# ${projectName}\n\n`;

    if (badges.length > 0) {
        readmeContent += `${badges.join(' ')}\n\n`;
    }

    readmeContent += `${projectDescription}\n\n`;

    sections.forEach(section => {
        readmeContent += `## ${section}\n\n<!--gen-content:${section}-->\n\n`;
    });

    return readmeContent;
}

const generateSectionContentSchema = z.object({
    sectionName: z.string(),
    projectName: z.string(),
    projectDescription: z.string(),
    projectType: z.string(),
    features: z.string(),
    technologies: z.string(),
});

export async function generateSectionContent(input: GenerateSectionContentInput) {
    const parsedInput = generateSectionContentSchema.parse(input);
    try {
        const result = await generateSectionContentFlow(parsedInput);
        return result.sectionContent;
    } catch (error) {
        console.error(`Error generating content for section "${parsedInput.sectionName}":`, error);
        return `> Error: No se pudo generar el contenido para esta sección. Por favor, inténtalo de nuevo.`;
    }
}
