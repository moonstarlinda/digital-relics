import type { Metadata } from "next";
import RelicExperience, { type RelicConfig } from "../RelicExperience";

const assetPath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Digital Relics — 生肖虎俑",
  description: "北魏十二生肖虎俑，从扫描数据中重新显形。",
};

const zodiacTiger: RelicConfig = {
  modelUrl: `${assetPath}/zodiac-tiger.glb`,
  pointCount: 78000,
  objectNumber: "002",
  title: "生肖虎俑",
  period: "中国，北魏，6 世纪",
  ariaLabel: "可旋转的北魏十二生肖虎俑三维模型",
  category: "十二生肖镇墓俑 · 虎",
  material: "灰陶，残留化妆土",
  dimensions: "通高 22.6 厘米",
  accession: "1972.76.3",
  collection: "Cleveland Museum of Art",
  description: "俑作虎首人身，头部向上并略转向左侧；身着宽袖长袍，双手隐于腰前衣袖之内。其表面原在白色化妆土上施红、黄、褐色化妆土。十二生肖俑以循环次序组织时间，作为墓葬随葬品，也为身后世界提供一种宇宙秩序。",
  reflection: "三维记录保存了现存表面的起伏与残留色层；数字模型所见，是器物历经埋藏、出土与保存之后的当前状态。",
  introLabel: "78,000 个表面采样点正在显现",
  fitHeight: 3.2,
  cameraDistance: 6.4,
  mobileCameraDistance: 9.7,
  mobileOffsetX: .38,
  mobileOffsetY: -.1,
  pointSize: .011,
};

export default function ZodiacTigerPage() {
  return <RelicExperience config={zodiacTiger} />;
}
