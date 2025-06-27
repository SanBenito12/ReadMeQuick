
// use server'
'use server';

/**
 * @fileOverview Determines the appropriate sections for a README file based on project details.
 *
 * - determineSections - A function that determines the sections for a README file.
 * - DetermineSectionsInput - The input type for the determineSections function.
 * - DetermineSectionsOutput - The return type for the determineSections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineSectionsInputSchema = z.object({
  projectType: z.string().describe('The type of the project (e.g., web app, library, CLI tool).'),
  projectDescription: z.string().describe('A detailed description of the project.'),
  features: z.string().describe('A comma-separated list of key features of the project.'),
  technologies: z.string().describe('A comma-separated list of technologies used in the project.'),
});
export type DetermineSectionsInput = z.infer<typeof DetermineSectionsInputSchema>;

const DetermineSectionsOutputSchema = z.object({
  sections: z.array(z.string()).describe('An array of section names to include in the README file (e.g., ["Introducción", "Instalación", "Uso"]).'),
});
export type DetermineSectionsOutput = z.infer<typeof DetermineSectionsOutputSchema>;

export async function determineSections(input: DetermineSectionsInput): Promise<DetermineSectionsOutput> {
  return determineSectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineSectionsPrompt',
  input: {schema: DetermineSectionsInputSchema},
  output: {schema: DetermineSectionsOutputSchema},
  prompt: `Basado en los detalles del proyecto a continuación, determina las secciones apropiadas para incluir en el archivo README.

Project Type: {{{projectType}}}
Project Description: {{{projectDescription}}}
Key Features: {{{features}}}
Technologies Used: {{{technologies}}}

Considera secciones comunes como Introducción, Instalación, Uso, Contribuciones, Licencia y cualquier otra sección relevante basada en los detalles del proyecto.

Devuelve un array JSON de cadenas que representen los nombres de las secciones. Ejemplo: ["Introducción", "Instalación", "Uso", "Contribuciones", "Licencia"]
`,
});

const determineSectionsFlow = ai.defineFlow(
  {
    name: 'determineSectionsFlow',
    inputSchema: DetermineSectionsInputSchema,
    outputSchema: DetermineSectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
