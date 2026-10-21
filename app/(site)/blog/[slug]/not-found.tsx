import { Button } from "@/components/ui/Button";
import { GridLines } from "@/components/ui/Backdrop";

export default function ArticleNotFound() {
  return (
    <section
      data-theme="dark"
      className="bg-ink-950 text-foreground relative flex min-h-[80svh] items-center overflow-hidden"
    >
      <GridLines className="text-white opacity-50" />
      <div className="container-x relative py-32">
        <p className="eyebrow text-ink-300">Insights · 404</p>
        <h1 className="text-h1 mt-6 max-w-[16ch] font-semibold text-white">
          This article is not available.
        </h1>
        <p className="text-lead text-ink-300 mt-6 max-w-[48ch]">
          It may have been unpublished, moved, or the link may be incomplete.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/blog">Browse insights</Button>
          <Button href="/blog/search" variant="secondary" arrow={false}>
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
