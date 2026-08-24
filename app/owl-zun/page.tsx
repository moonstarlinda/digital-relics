import type { Metadata } from "next";
import RelicExperience, { type RelicConfig } from "../RelicExperience";

export const metadata: Metadata = {
  title: "Digital Relics — 鸮尊",
  description: "商代晚期鸮形青铜尊，从扫描数据中重新显形。",
};

const owlZun: RelicConfig = {
  modelUrl: "/owl-zun.glb",
  pointCount: 85000,
  objectNumber: "001",
  title: "鸮尊",
  period: "中国，商代晚期\n约公元前 13–12 世纪",
  ariaLabel: "可旋转的商代鸮尊三维模型",
  category: "鸮形青铜尊 · 酒器",
  material: "青铜",
  dimensions: "高 31.1 × 宽 18.3 × 深 21.0 厘米",
  accession: "50.46.116",
  collection: "Minneapolis Institute of Art",
  description: "器物由可拆卸的鸮首形器盖与中空的鸟形器身组成。它是商代少见的动物形青铜容器之一；造型受到北方安阳地区影响，而风格与铸造技术又联系着长江中游的青铜传统。",
  reflection: "页面呈现的是器物表面经三维记录后形成的数据替身，而非青铜原器本身。",
  introLabel: "85,000 个表面采样点正在显现",
  mobileCameraDistance: 10,
  mobileOffsetX: .18,
  mobileOffsetY: -.12,
};

export default function OwlZunPage() {
  return <RelicExperience config={owlZun} />;
}
