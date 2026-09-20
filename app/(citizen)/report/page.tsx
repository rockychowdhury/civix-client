import type { Metadata } from "next";
import { Container } from "@/components/landing/container";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { ReportWizard } from "@/components/report/ReportWizard";
import type { ReportCategory } from "@/components/report/steps/CategoryStep";
import { apiClient } from "@/services/api.service";
import { getUser, getUserDisplayName } from "@/services/user.service";

export const metadata: Metadata = {
  title: "Report an Issue | Civix",
  description: "Report civic issues to your local municipality.",
};

// Fallback categories in case API fails
const fallbackCategories: ReportCategory[] = [
  {
    id: "56ff44d7-6ee3-4173-aa21-cc7eb49c7e51",
    parentId: null,
    name: "Water",
    description: "Water Leakage, Drainage, Supply Issues",
    slug: "water",
  },
  {
    id: "3b88bc9a-c42e-4856-a15b-fccce5733cbc",
    parentId: "56ff44d7-6ee3-4173-aa21-cc7eb49c7e51",
    name: "Water Leakage",
    description: null,
    slug: "water-leakage",
  },
  {
    id: "road-id",
    parentId: null,
    name: "Roads",
    description: "Potholes, Streetlights, Sidewalks",
    slug: "roads",
  },
  {
    id: "pothole-id",
    parentId: "road-id",
    name: "Pothole",
    description: null,
    slug: "pothole",
  },
];

export default async function ReportPage() {
  const user = await getUser();
  const navbarUser = user ? { name: getUserDisplayName(user) } : null;

  let categories: ReportCategory[] = [];
  try {
    const response = await apiClient.get<ReportCategory[]>("/api/v1/categories");
    if (Array.isArray(response)) {
      categories = response;
    } else {
      // In case the API wraps it in some pagination object
      categories = (response as any).items || fallbackCategories;
    }
  } catch (error) {
    console.warn("Failed to fetch categories, using fallbacks.", error);
    categories = fallbackCategories;
  }

  return (
    <>
      <Navbar user={navbarUser} />
      <main className="min-h-[calc(100vh-3.5rem)] bg-paper/50 py-12 sm:py-20">
        <Container>
          <div className="mb-12">
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-ink">
              Report an Issue
            </h1>
            <p className="mt-4 text-lg text-ink/70 max-w-2xl">
              Help us keep the city running. Tell us what's wrong and where it is, and we'll route
              it to the right department.
            </p>
          </div>

          <ReportWizard categories={categories} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
