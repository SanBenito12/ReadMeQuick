'use server';
/**
 * @fileOverview Generates the content for a specific section of a README file.
 *
 * - generateSectionContent - A function that generates content for a README section.
 * - GenerateSectionContentInput - The input type for the generateSectionContent function.
 * - GenerateSectionContentOutput - The return type for the generateSectionContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSectionContentInputSchema = z.object({
  sectionName: z.string().describe('The name of the section to generate content for (e.g., "Instalación", "Uso").'),
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('A detailed description of the project.'),
  projectType: z.string().describe('The type of the project (e.g., web app, library, CLI tool).'),
  features: z.string().describe('A comma-separated list of key features of the project.'),
  technologies: z.string().describe('A comma-separated list of technologies used in the project.'),
});
export type GenerateSectionContentInput = z.infer<typeof GenerateSectionContentInputSchema>;

const GenerateSectionContentOutputSchema = z.object({
  sectionContent: z.string().describe('The generated markdown content for the specified section.'),
});
export type GenerateSectionContentOutput = z.infer<typeof GenerateSectionContentOutputSchema>;


export async function generateSectionContent(input: GenerateSectionContentInput): Promise<GenerateSectionContentOutput> {
  return generateSectionContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSectionContentPrompt',
  input: {schema: GenerateSectionContentInputSchema},
  output: {schema: GenerateSectionContentOutputSchema},
  prompt: `Eres un experto redactor técnico que crea archivos README excepcionales.
Basado en los siguientes detalles del proyecto, escribe el contenido para la sección "**{{{sectionName}}}**" de un archivo README.
La salida debe estar en formato markdown y ser directamente usable.
No incluyas el título de la sección (ej. '## {{{sectionName}}}') en tu respuesta, solo el contenido.

Detalles del Proyecto:
- Nombre: {{{projectName}}}
- Descripción: {{{projectDescription}}}
- Tipo: {{{projectType}}}
- Características Clave: {{{features}}}
- Tecnologías Usadas: {{{technologies}}}

Por ejemplo, si la sección es "Instalación", proporciona los comandos de clonación y de instalación de dependencias. Si es "Uso", proporciona un ejemplo de cómo ejecutar el proyecto. Si es "Características", elabora sobre las características listadas.
Sé claro, conciso y útil.
`,
});

const generateSectionContentFlow = ai.defineFlow(
  {
    name: 'generateSectionContentFlow',
    inputSchema: GenerateSectionContentInputSchema,
    outputSchema: GenerateSectionContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
