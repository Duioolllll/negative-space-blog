export function Footer() {
  return (
    <footer className="ns-footer border-t border-ink px-5 py-8 md:px-10">
      <div className="ns-mono flex flex-col gap-3 text-xs text-mid md:flex-row md:items-center md:justify-between">
        <span>© 2026 Negative Space</span>
        <span className="flex gap-6">
          <a href="/posts" className="ns-footlink">전체 글</a>
          <a href="/#topics" className="ns-footlink">주제</a>
          <a href="#top" className="ns-footlink">맨 위로</a>
        </span>
      </div>
    </footer>
  );
}
