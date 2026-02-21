import { redirect } from "next/navigation";

// Root page — redirect to main app which lives under (main) route group
// The (main) group handles the authenticated layout with sidebar
export default function RootPage() {
  redirect("/");
}
