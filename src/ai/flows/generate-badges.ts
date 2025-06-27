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
  prompt: `You are an expert software developer specializing in generating badges for projects.

You will use the project description to determine relevant badges for the project.
These badges should showcase the project's key features and technologies.

Return an array of markdown strings representing the badges.

Project Description: {{{projectDescription}}}`,
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
