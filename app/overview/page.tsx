import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digital Relics — 数字遗存",
  description: "以真实高度比例对照三件数字文物。",
};

const relics = [
  {
    key: "owl",
    href: "/owl-zun",
    image: "/overview/owl-zun.webp",
    title: "鸮尊",
    height: "31.1 cm",
    ratio: 31.1 / 102.9,
  },
  {
    key: "tiger",
    href: "/zodiac-tiger",
    image: "/overview/zodiac-tiger.webp",
    title: "生肖虎俑",
    height: "22.6 cm",
    ratio: 22.6 / 102.9,
  },
  {
    key: "guanyin",
    href: "/water-moon-guanyin",
    image: "/overview/water-moon-guanyin.webp",
    title: "水月观音",
    height: "102.9 cm",
    ratio: 1,
  },
] as const;

export default function OverviewPage() {
  return (
    <main className="overview-page">
      <header className="overview-header">
        <p className="wordmark">DIGITAL RELICS</p>
      </header>

      <section className="overview-intro" aria-labelledby="overview-title">
        <p className="overview-kicker">TRUE SCALE · 真实尺度</p>
        <h1 id="overview-title">数字遗存</h1>
        <p className="overview-description">三件器物依实际高度比例呈现。</p>
      </section>

      <p className="overview-entry-hint">点击器物，观看细节</p>

      <div className="scale-ruler" aria-hidden="true">
        <span className="scale-mark scale-mark-100">100 cm</span>
        <span className="scale-mark scale-mark-50">50</span>
        <span className="scale-mark scale-mark-0">0</span>
      </div>

      <div className="overview-scroll">
        <section className="scale-wall" aria-label="三件器物真实高度比例对照">
          <div className="scale-ground" aria-hidden="true" />
          {relics.map((relic) => (
            <Link
              className={`scale-relic scale-relic-${relic.key}`}
              href={relic.href}
              key={relic.key}
              aria-label={`查看${relic.title}，通高${relic.height}`}
            >
              <span className="scale-image-wrap" style={{ "--relic-ratio": relic.ratio } as React.CSSProperties}>
                {/* Pre-trimmed transparent museum renders; intrinsic layout is controlled by the scale wrapper. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={relic.image} alt="" draggable={false} />
              </span>
              <span className="scale-label">
                <strong>{relic.title}</strong>
                <small>{relic.height}</small>
              </span>
            </Link>
          ))}
        </section>
      </div>

      <p className="overview-mobile-hint" aria-hidden="true">横向滑动 · 点击器物观看细节 <span>→</span></p>
    </main>
  );
}
