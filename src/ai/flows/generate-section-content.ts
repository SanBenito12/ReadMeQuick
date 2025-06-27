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
  prompt: `Eres un experto redactor técnico y desarrollador de software que crea archivos README excepcionales. Tu tarea es generar contenido detallado y útil en formato markdown para la sección específica de un README.

**Sección a generar:** '{{{sectionName}}}'

**Detalles del Proyecto:**
- **Nombre:** {{{projectName}}}
- **Descripción:** {{{projectDescription}}}
- **Tipo:** {{{projectType}}}
- **Características Clave:** {{{features}}}
- **Tecnologías Usadas:** {{{technologies}}}

**Instrucciones Específicas:**
1.  **NO incluyas el título de la sección** en tu respuesta (ej., no escribas \`## {{{sectionName}}}\`). Solo genera el contenido.
2.  **Adapta el contenido** al nombre de la sección (\`sectionName\`). Sé muy específico y detallado.
3.  Utiliza formato **Markdown** de alta calidad, incluyendo bloques de código con lenguaje especificado (ej., \`\`\`bash \`\`\`), listas, negritas, etc., cuando sea apropiado.
4.  **Expande la información proporcionada.** No te limites a repetir los detalles del proyecto. Elabóralos.

**Guía de Contenido por Sección:**
-   Si la sección es **Introducción**: Expande la descripción del proyecto. Explica el problema que resuelve y para quién es útil.
-   Si la sección es **Características**: Toma la lista de características clave (\`{{{features}}}\`) y describe cada una con más detalle en una lista de viñetas.
-   Si la sección es **Tecnologías**: Lista las tecnologías (\`{{{technologies}}}\`) utilizadas y, si es posible, menciona brevemente por qué se eligieron.
-   Si la sección es **Instalación**: Proporciona una guía paso a paso con bloques de código claros. Incluye prerrequisitos, clonación del repositorio (\`git clone ...\`), instalación de dependencias (ej., \`npm install\`), y configuración de variables de entorno si aplica.
-   Si la sección es **Uso**: Explica cómo ejecutar el proyecto. Proporciona comandos (\`npm run dev\`) y ejemplos de uso. Si es una API, muestra ejemplos de endpoints.
-   Si la sección es **Contribuciones**: Describe cómo otros desarrolladores pueden contribuir. Incluye pasos como hacer un fork, crear una rama, hacer un commit y abrir un Pull Request.
-   Si la sección es **Licencia**: Sugiere una licencia común como MIT y proporciona el texto estándar para ello, mencionando el año actual y el propietario de los derechos de autor (puedes usar un placeholder como \`[Nombre del Propietario]\`).

Genera ahora el contenido para la sección **'{{{sectionName}}}'**.
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
