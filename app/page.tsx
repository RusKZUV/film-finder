import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-100">
            Discover Your Next Favorite Film
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            Find movies by describing what you want to watch in natural language.
          </p>
        </div>

        <SearchBar />
      </div>
    </Layout>
  );
}
