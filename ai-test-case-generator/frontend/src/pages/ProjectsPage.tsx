import { PageHeader } from "../components/PageHeader";
import { PlaceholderPanel } from "../components/PlaceholderPanel";

export function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" subtitle="Organize requirements and test assets by product or release." crumbs={[{ label: "Home", to: "/" }, { label: "Projects" }]} />
      <PlaceholderPanel title="Project catalog" description="Create and manage QA projects. CRUD and persistence will be added in the next phase." />
    </>
  );
}
