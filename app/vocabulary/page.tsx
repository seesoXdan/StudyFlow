const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function VocabularyPage() {
  return (
    <iframe
      src={`${basePath}/vocabulary.html`}
      title="영어단어"
      className="w-full rounded-2xl border border-border bg-white"
      style={{ height: "calc(100dvh - 180px)", minHeight: 480 }}
    />
  );
}
