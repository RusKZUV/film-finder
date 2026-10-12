import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-100">
          Discover Your Next Favorite Film
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
          Find movies by describing what you want to watch in natural language.
        </p>
      </div>
    </Layout>
  );
}
