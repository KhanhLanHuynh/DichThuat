import { notFound } from "next/navigation";
import { loadProject, loadGlossaryTerms } from "@/lib/files";
import { getSessionUser } from "@/lib/auth";
import { EditorClient } from "@/components/EditorClient";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const data = await loadProject(id);
    const terms = await loadGlossaryTerms(
      data.manifest.glossary ?? ["glossary/terms.yaml"]
    );
    const user = await getSessionUser();
    return (
      <EditorClient
        projectId={id}
        initial={{ ...data, terms, user }}
      />
    );
  } catch {
    notFound();
  }
}
