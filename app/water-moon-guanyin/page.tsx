import type { Metadata } from "next";
import RelicExperience, { type RelicConfig } from "../RelicExperience";

const assetPath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Digital Relics — 水月观音",
  description: "宋代十二世纪水月观音，从扫描数据中重新显形。",
};

const waterMoonGuanyin: RelicConfig = {
  modelUrl: `${assetPath}/water-moon-guanyin.glb`,
  pointCount: 110000,
  objectNumber: "003",
  title: "水月观音",
  period: "中国，宋代，12 世纪",
  ariaLabel: "可旋转的十二世纪水月观音三维模型",
  category: "水月观音菩萨造像",
  material: "木、灰泥、彩绘",
  dimensions: "高 102.9 × 宽 85.1 × 深 50.8 厘米",
  accession: "99.24.2",
  collection: "Minneapolis Institute of Art",
  description: "观音以“自在坐”安坐于象征普陀洛迦山的岩座，姿态舒展而沉静。水月观音图像源自《华严经》相关传统：菩萨居于海边岩窟，观照水中月影；发冠中央的阿弥陀佛像表明其观音身份。",
  reflection: "摄影测量将木雕现存的形体、彩绘与表面损耗记录为几何和纹理；数字模型保存的是扫描时刻的状态，并不能替代原物的材质与尺度经验。",
  introLabel: "110,000 个表面采样点正在显现",
  fitHeight: 3.05,
  cameraDistance: 6.5,
  mobileCameraDistance: 10.2,
  pointSize: .0105,
};

export default function WaterMoonGuanyinPage() {
  return <RelicExperience config={waterMoonGuanyin} />;
}
