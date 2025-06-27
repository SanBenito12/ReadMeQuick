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
    return ["Introduction", "Features", "Technologies", "Installation", "Usage", "License"];
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
            case 'features':
                const featureList = features.split(',').map(f => f.trim()).filter(f => f);
                if (featureList.length > 0) {
                    readmeContent += featureList.map(f => `- ${f}`).join('\n') + '\n\n';
                } else {
                    readmeContent += 'This project has many exciting features.\n\n';
                }
                break;
            case 'technologies':
                 const techList = technologies.split(',').map(t => t.trim()).filter(t => t);
                if (techList.length > 0) {
                    readmeContent += `This project is built with the following technologies:\n\n` + techList.map(t => `- ${t}`).join('\n') + '\n\n';
                } else {
                    readmeContent += 'The project utilizes a modern tech stack.\n\n';
                }
                break;
            case 'installation':
                readmeContent += 'To get a local copy up and running, follow these simple steps.\n\n';
                readmeContent += '```bash\n';
                readmeContent += '# Clone the repository\n';
                readmeContent += `git clone https://github.com/your_username/${projectName.toLowerCase().replace(/\s+/g, '-')}.git\n\n`;
                readmeContent += '# Install NPM packages\n';
                readmeContent += 'npm install\n';
                readmeContent += '```\n\n';
                break;
            case 'usage':
                readmeContent += 'To use this project, run the following command:\n\n';
                readmeContent += '```bash\n';
                readmeContent += 'npm run dev\n';
                readmeContent += '```\n\n';
                break;
            case 'contributing':
                readmeContent += 'Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.\n\n';
                readmeContent += '1. Fork the Project\n';
                readmeContent += '2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)\n';
                readmeContent += '3. Commit your Changes (`git commit -m \'Add some AmazingFeature\'`)\n';
                readmeContent += '4. Push to the Branch (`git push origin feature/AmazingFeature`)\n';
                readmeContent += '5. Open a Pull Request\n\n';
                break;
            case 'license':
                readmeContent += 'Distributed under the MIT License. See `LICENSE` for more information.\n\n';
                break;
            default:
                readmeContent += `*More information about ${section} coming soon...*\n\n`;
                break;
        }
    });

    return readmeContent;
}
