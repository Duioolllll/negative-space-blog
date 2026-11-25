export function About() {
  return (
    <section id="about" className="ns-about relative px-5 py-24 md:px-10 md:py-40" aria-labelledby="about-title">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <figure className="md:col-span-4">
          <img src="/assets/about-hands.jpg" alt="창가 빛 아래에서 노트에 연필로 글을 쓰는 손" className="aspect-[3/4] w-full object-cover" loading="lazy" />
        </figure>
        <div className="relative md:col-span-7 md:col-start-6 md:pt-10">
          <h2 id="about-title" className="text-4xl leading-[1.1] tracking-tight md:text-6xl">
            작게 쓰고<br />오래 남기기<span className="ns-period" aria-hidden="true" />
          </h2>
          <div className="mt-10 grid max-w-[40rem] gap-5 text-base leading-relaxed text-graphite">
            <p>
              낮에는 화면을 만들고 밤에는 문장을 다듬습니다. 이 블로그는 그 사이에서 남는 것들, 쓰다 지운 문장과 찍다 만 사진, 고치고 또 고친 코드를 모아 두는 암실이에요.
            </p>
            <p>
              빠르게 올리는 것보다 제대로 현상하는 것을 좋아합니다. 그래서 글은 자주 올라오지 않지만, 올라온 글은 오래 읽혀도 괜찮도록 다듬어 둡니다.
            </p>
          </div>
        </div>
        <p className="ns-rail ns-mono absolute right-5 top-24 hidden text-xs text-mid md:block md:right-10 md:top-40">
          SEOUL / SINCE 2026 / B&amp;W
        </p>
      </div>
    </section>
  );
}
