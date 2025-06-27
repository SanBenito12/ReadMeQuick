'use server';

/**
 * @fileOverview Generates relevant badges for a project based on its characteristics.
 *
 * - generateBadges - A function that generates badges for a project.
 * - GenerateBadgesInput - The input type for the generateBadges function.
 * - GenerateBadgesOutput - The return type for the generateBadges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBadgesInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A description of the project, including its key features and technologies.'),
});
export type GenerateBadgesInput = z.infer<typeof GenerateBadgesInputSchema>;

const GenerateBadgesOutputSchema = z.object({
  badges: z
    .array(z.string())
    .describe('An array of markdown strings representing the badges for the project.'),
});
export type GenerateBadgesOutput = z.infer<typeof GenerateBadgesOutputSchema>;

export async function generateBadges(input: GenerateBadgesInput): Promise<GenerateBadgesOutput> {
  return generateBadgesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBadgesPrompt',
  input: {schema: GenerateBadgesInputSchema},
  output: {schema: GenerateBadgesOutputSchema},
  prompt: `Eres un experto desarrollador de software especializado en generar insignias (badges) para proyectos.

Utilizarás la descripción del proyecto para determinar las insignias relevantes para el proyecto.
Estas insignias deben mostrar las características y tecnologías clave del proyecto.

Devuelve un array de cadenas de markdown que representen las insignias.

Descripción del Proyecto: {{{projectDescription}}}`,
});

const generateBadgesFlow = ai.defineFlow(
  {
    name: 'generateBadgesFlow',
    inputSchema: GenerateBadgesInputSchema,
    outputSchema: GenerateBadgesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
