import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Models",
};

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Compare Models</h1>
      <p className="mt-2 text-gray-600">Compare models side by side.</p>
    </main>
  );
}
