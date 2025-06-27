
"use server";

import { determineSections, type DetermineSectionsInput } from '@/ai/flows/determine-sections';
import { generateBadges } from '@/ai/flows/generate-badges';
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

export async function generateReadmeContent(data: z.infer<typeof generateReadmeSchema>) {
    const parsedData = generateReadmeSchema.parse(data);
    const { projectName, projectDescription, features, technologies, sections } = parsedData;

    let badges: string[] = [];
    try {
        const badgesResult = await generateBadges({
            projectDescription: `Project Type: ${parsedData.projectType}. Features: ${features}. Technologies: ${technologies}. Description: ${projectDescription}`,
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
        readmeContent += `## ${section}\n\n`;
        switch (section.toLowerCase()) {
            case 'características':
                const featureList = features.split(',').map(f => f.trim()).filter(f => f);
                if (featureList.length > 0) {
                    readmeContent += featureList.map(f => `- ${f}`).join('\n') + '\n\n';
                } else {
                    readmeContent += 'Este proyecto tiene muchas características interesantes.\n\n';
                }
                break;
            case 'tecnologías':
                 const techList = technologies.split(',').map(t => t.trim()).filter(t => t);
                if (techList.length > 0) {
                    readmeContent += `Este proyecto está construido con las siguientes tecnologías:\n\n` + techList.map(t => `- ${t}`).join('\n') + '\n\n';
                } else {
                    readmeContent += 'El proyecto utiliza una pila de tecnología moderna.\n\n';
                }
                break;
            case 'instalación':
                readmeContent += 'Para tener una copia local funcionando, sigue estos sencillos pasos.\n\n';
                readmeContent += '```bash\n';
                readmeContent += '# Clonar el repositorio\n';
                readmeContent += `git clone https://github.com/your_username/${projectName.toLowerCase().replace(/\s+/g, '-')}.git\n\n`;
                readmeContent += '# Instalar paquetes NPM\n';
                readmeContent += 'npm install\n';
                readmeContent += '```\n\n';
                break;
            case 'uso':
                readmeContent += 'Para usar este proyecto, ejecuta el siguiente comando:\n\n';
                readmeContent += '```bash\n';
                readmeContent += 'npm run dev\n';
                readmeContent += '```\n\n';
                break;
            case 'contribuciones':
                readmeContent += 'Las contribuciones son lo que hace a la comunidad de código abierto un lugar tan increíble para aprender, inspirar y crear. Cualquier contribución que hagas es **muy apreciada**.\n\n';
                readmeContent += '1. Haz un Fork del Proyecto\n';
                readmeContent += '2. Crea tu Rama de Característica (`git checkout -b feature/AmazingFeature`)\n';
                readmeContent += '3. Confirma tus Cambios (`git commit -m \'Agrega alguna Característica Increíble\'`)\n';
                readmeContent += '4. Empuja a la Rama (`git push origin feature/AmazingFeature`)\n';
                readmeContent += '5. Abre una Pull Request\n\n';
                break;
            case 'licencia':
                readmeContent += 'Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.\n\n';
                break;
            default:
                readmeContent += `*Próximamente más información sobre ${section}...*\n\n`;
                break;
        }
    });

    return readmeContent;
}
