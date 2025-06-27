import { ReadmeForm } from "@/components/readme-form";
import Logo from "@/components/icons/logo";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <Logo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
              ReadMeQuick
            </h1>
          </div>
          <p className="max-w-2xl text-muted-foreground sm:text-lg">
            Generate professional README files for your projects in seconds. Just answer a few questions and let AI do the heavy lifting.
          </p>
        </header>
        <ReadmeForm />
      </div>
    </main>
  );
}
