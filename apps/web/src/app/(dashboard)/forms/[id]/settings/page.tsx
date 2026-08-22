import { redirect } from "next/navigation";

export default async function FormSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/forms/${id}`);
}
