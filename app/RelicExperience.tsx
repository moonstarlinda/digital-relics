"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

type ViewMode = "points" | "threshold" | "solid";
const TRAIL_COUNT = 10;

export type RelicConfig = {
  modelUrl: string;
  pointCount: number;
  objectNumber: string;
  title: string;
  period: string;
  ariaLabel: string;
  category: string;
  material: string;
  dimensions: string;
  accession: string;
  collection: string;
  description: string;
  reflection: string;
  introLabel: string;
  fitHeight?: number;
  cameraDistance?: number;
  mobileCameraDistance?: number;
  mobileOffsetX?: number;
  mobileOffsetY?: number;
  pointSize?: number;
};

function triangleArea(position: THREE.BufferAttribute, index?: THREE.BufferAttribute | null) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let area = 0;
  const count = index ? index.count : position.count;
  for (let i = 0; i < count; i += 3) {
    a.fromBufferAttribute(position, index ? index.getX(i) : i);
    b.fromBufferAttribute(position, index ? index.getX(i + 1) : i + 1);
    c.fromBufferAttribute(position, index ? index.getX(i + 2) : i + 2);
    area += new THREE.Triangle(a, b, c).getArea();
  }
  return area;
}

function textureReader(texture?: THREE.Texture | null) {
  const image = texture?.image as CanvasImageSource & { width?: number; height?: number };
  if (!texture || !image?.width || !image?.height) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return (uv: THREE.Vector2, color: THREE.Color) => {
      const mapped = uv.clone(); texture.transformUv(mapped);
      const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(mapped.x * canvas.width)));
      const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((1 - mapped.y) * canvas.height)));
      const o = (y * canvas.width + x) * 4;
      color.setRGB(pixels[o] / 255, pixels[o + 1] / 255, pixels[o + 2] / 255);
      if (texture.colorSpace === THREE.SRGBColorSpace) color.convertSRGBToLinear();
    };
  } catch { return null; }
}

export default function RelicExperience({ config }: { config: RelicConfig }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<ViewMode>("points");
  const modeStartedRef = useRef(0);
  const [mode, setMode] = useState<ViewMode>("points");
  const [loading, setLoading] = useState(true);
  const [intro, setIntro] = useState(true);
  const introVisibleRef = useRef(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const selectMode = (next: ViewMode) => { modeRef.current = next; modeStartedRef.current = performance.now(); setMode(next); };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11100e);
    scene.fog = new THREE.FogExp2(0x11100e, 0.055);
    let compactViewport = mount.clientWidth <= 720;
    const desktopDistance = config.cameraDistance ?? 6.2;
    const mobileDistance = config.mobileCameraDistance ?? desktopDistance * 1.45;
    const initialDistance = compactViewport ? mobileDistance : desktopDistance;
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.01, 100);
    camera.position.set(0, 0.15, initialDistance);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.055; controls.enablePan = false;
    controls.minDistance = 3.4; controls.maxDistance = Math.max(9, initialDistance * 1.35); controls.autoRotate = true; controls.autoRotateSpeed = 0.22;
    controls.target.set(0, -0.05, 0);
    scene.add(new THREE.HemisphereLight(0xd9d0bc, 0x17130f, 1.55));
    const key = new THREE.DirectionalLight(0xffe4bd, 3.15); key.position.set(-3, 4, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x78988b, 1.5); rim.position.set(4, 1, -3); scene.add(rim);
    const lowFill = new THREE.DirectionalLight(0x8c765d, .7); lowFill.position.set(0, -2, 3); scene.add(lowFill);
    let pointMaterial: THREE.PointsMaterial | null = null;
    let pointGeometry: THREE.BufferGeometry | null = null;
    let artifactGroup: THREE.Group | null = null;
    const solidMaterials: THREE.MeshStandardMaterial[] = [];
    const revealUniforms: Array<{ base: { value: number }; layer: { value: number }; scan: { value: number }; trails: { value: THREE.Vector3[] }; resolution: { value: THREE.Vector2 } }> = [];
    const pointer = new THREE.Vector2(20, 20);
    const trailPoints = Array.from({ length: TRAIL_COUNT }, () => new THREE.Vector3(20, 20, 0));
    let hover = 0, frame = 0, lastTrailAt = 0, trailCursor = 0, introStarted = 0;

    const pointCount = config.pointCount;
    new GLTFLoader().load(config.modelUrl, (gltf) => {
      const root = gltf.scene; root.updateMatrixWorld(true);
      const meshes: THREE.Mesh[] = [], areas: number[] = [];
      let totalArea = 0;
      root.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const position = child.geometry.getAttribute("position") as THREE.BufferAttribute;
        if (!position) return;
        const area = triangleArea(position, child.geometry.getIndex()) * child.matrixWorld.getMaxScaleOnAxis() ** 2;
        meshes.push(child); areas.push(area); totalArea += area;
        const original = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial;
        const material = original.clone();
        material.transparent = true; material.opacity = 1; material.alphaTest = .075; material.depthWrite = true; material.side = THREE.FrontSide; material.roughness = Math.max(.68, material.roughness ?? .8);
        material.metalness = Math.min(.22, material.metalness ?? 0); child.material = material; solidMaterials.push(material);
        const uniforms = { base: { value: 0 }, layer: { value: -2 }, scan: { value: -1.7 }, trails: { value: trailPoints }, resolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight).multiplyScalar(renderer.getPixelRatio()) } };
        revealUniforms.push(uniforms);
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uBaseOpacity = uniforms.base;
          shader.uniforms.uLayerY = uniforms.layer;
          shader.uniforms.uScanY = uniforms.scan;
          shader.uniforms.uTrails = uniforms.trails;
          shader.uniforms.uResolution = uniforms.resolution;
          shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>\nvarying vec3 vRevealWorld;`);
          shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>\nvRevealWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
          shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>\nuniform float uBaseOpacity;\nuniform float uLayerY;\nuniform float uScanY;\nuniform vec3 uTrails[${TRAIL_COUNT}];\nuniform vec2 uResolution;\nvarying vec3 vRevealWorld;`);
          shader.fragmentShader = shader.fragmentShader.replace("#include <alphatest_fragment>", `vec2 revealUv = gl_FragCoord.xy / uResolution;\nfloat localReveal = 0.0;\nfor (int i = 0; i < ${TRAIL_COUNT}; i++) {\n  vec2 delta = vec2((revealUv.x - uTrails[i].x) * (uResolution.x / uResolution.y), revealUv.y - uTrails[i].y);\n  localReveal = max(localReveal, (1.0 - smoothstep(0.032, 0.105, length(delta))) * uTrails[i].z);\n}\nfloat scanCore = 1.0 - smoothstep(0.035, 0.12, abs(vRevealWorld.y - uScanY));\nfloat scanAfterglow = (1.0 - smoothstep(0.12, 0.34, abs(vRevealWorld.y - uScanY))) * 0.16;\nfloat layerReveal = (1.0 - smoothstep(uLayerY - 0.10, uLayerY + 0.08, vRevealWorld.y)) * 0.9;\nfloat revealed = max(uBaseOpacity, max(layerReveal, max(localReveal, max(scanCore * 0.82, scanAfterglow))));\ndiffuseColor.a *= revealed;\n#include <alphatest_fragment>`);
        };
      });
      const positions = new Float32Array(pointCount * 3), colors = new Float32Array(pointCount * 3);
      const p = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color(), uv = new THREE.Vector2();
      let cursor = 0;
      meshes.forEach((mesh, meshIndex) => {
        const count = meshIndex === meshes.length - 1 ? pointCount - cursor : Math.round((areas[meshIndex] / totalArea) * pointCount);
        const sampler = new MeshSurfaceSampler(mesh).build();
        const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
        const readTexture = textureReader(material.map);
        for (let i = 0; i < count && cursor < pointCount; i++, cursor++) {
          c.copy(material.color ?? new THREE.Color(0x8c7657)); sampler.sample(p, n, undefined, uv); p.applyMatrix4(mesh.matrixWorld);
          if (readTexture) readTexture(uv, c);
          positions.set([p.x, p.y, p.z], cursor * 3); colors.set([c.r, c.g, c.b], cursor * 3);
        }
      });
      for (let i = pointCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        for (let k = 0; k < 3; k++) { const pi = i * 3 + k, pj = j * 3 + k; [positions[pi], positions[pj]] = [positions[pj], positions[pi]]; [colors[pi], colors[pj]] = [colors[pj], colors[pi]]; }
      }
      const geometry = new THREE.BufferGeometry(); pointGeometry = geometry;
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setDrawRange(0, 600);
      pointMaterial = new THREE.PointsMaterial({ size: config.pointSize ?? .012, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 1, depthWrite: false });
      const points = new THREE.Points(geometry, pointMaterial);
      const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const artifact = new THREE.Group(); artifact.scale.setScalar((config.fitHeight ?? 3.35) / size.y);
      artifactGroup = artifact;
      if (compactViewport) artifact.position.set(config.mobileOffsetX ?? 0, config.mobileOffsetY ?? 0, 0);
      root.position.copy(center).multiplyScalar(-1); points.position.copy(center).multiplyScalar(-1); artifact.add(root, points); scene.add(artifact);
      introStarted = performance.now(); modeStartedRef.current = introStarted;
      setLoading(false);
    }, (event) => setProgress(event.total ? Math.round(event.loaded / event.total * 100) : 0), () => { setError("模型未能读取，请确认模型文件位于 public 目录。"); setLoading(false); });

    const onPointerMove = (event: PointerEvent) => { const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height); hover = 1; controls.autoRotate = false; const now = performance.now(); if (now - lastTrailAt > 48) { trailPoints[trailCursor].set(pointer.x, pointer.y, 1); trailCursor = (trailCursor + 1) % TRAIL_COUNT; lastTrailAt = now; } };
    const onPointerLeave = () => { pointer.set(20, 20); hover = 0; controls.autoRotate = true; };
    renderer.domElement.addEventListener("pointermove", onPointerMove); renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate); controls.update();
      const value = modeRef.current === "points" ? 0 : modeRef.current === "threshold" ? .46 : 1;
      const elapsed = clock.elapsedTime;
      if (pointGeometry && introStarted) {
        const introProgress = Math.min(1, (performance.now() - introStarted) / 5200);
        const eased = 1 - Math.pow(1 - introProgress, 3);
        pointGeometry.setDrawRange(0, Math.max(600, Math.floor(pointCount * eased)));
        if (introProgress === 1 && introVisibleRef.current) {
          introVisibleRef.current = false;
          setIntro(false);
        }
      }
      trailPoints.forEach((trail) => { trail.z *= hover ? .982 : .968; });
      if (pointMaterial) { pointMaterial.opacity += ((1 - value * .92) - pointMaterial.opacity) * .07; pointMaterial.size = (config.pointSize ?? .012) * .96 + Math.sin(elapsed * .45) * .00035; }
      revealUniforms.forEach((uniforms) => { const targetBase = modeRef.current === "solid" ? 1 : modeRef.current === "threshold" ? .46 : 0; uniforms.base.value += (targetBase - uniforms.base.value) * .07; uniforms.layer.value = -2; uniforms.scan.value = -4; });
      renderer.render(scene, camera);
    };
    animate();
    const resize = () => { const nextCompact = mount.clientWidth <= 720; if (nextCompact !== compactViewport) { compactViewport = nextCompact; const distance = compactViewport ? mobileDistance : desktopDistance; const direction = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).addScaledVector(direction, distance); controls.maxDistance = Math.max(9, distance * 1.35); if (artifactGroup) artifactGroup.position.set(compactViewport ? config.mobileOffsetX ?? 0 : 0, compactViewport ? config.mobileOffsetY ?? 0 : 0, 0); } camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); revealUniforms.forEach((u) => u.resolution.value.set(mount.clientWidth, mount.clientHeight).multiplyScalar(renderer.getPixelRatio())); };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      pointGeometry?.dispose();
      pointMaterial?.dispose();
      solidMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [config]);

  return <main className="relic-page">
    <div ref={mountRef} className="relic-stage" aria-label={config.ariaLabel} />
    <header className="masthead"><div className="wordmark">DIGITAL RELICS</div></header>
    <nav className="detail-nav" aria-label="详情页导航">
      <Link className="overview-link" href="/">器物总览</Link>
      <button className="catalog-trigger" onClick={() => { setAboutOpen(false); setCatalogOpen((open) => !open); }} aria-expanded={catalogOpen}>目录 <span>{catalogOpen ? "－" : "＋"}</span></button>
    </nav>
    <section className={`caption ${aboutOpen ? "expanded" : ""}`}>
      <h1 className={config.objectNumber !== "001" ? "title-compact" : ""}>{config.title}</h1>
      <p className="period">{config.period}</p>
      <button className="about-trigger" onClick={() => { setCatalogOpen(false); setAboutOpen((open) => !open); }} aria-expanded={aboutOpen}>关于此物 <span>{aboutOpen ? "－" : "＋"}</span></button>
      <div className="inline-about" aria-hidden={!aboutOpen}>
        <p className="inline-category">{config.category}</p>
        <p>{config.description}</p>
        <dl>
          <dt>材质</dt><dd>{config.material}</dd>
          <dt>尺寸</dt><dd>{config.dimensions}</dd>
          <dt>收藏</dt><dd>{config.collection}</dd>
          <dt>编号</dt><dd>{config.accession}</dd>
        </dl>
        <p className="inline-reflection">{config.reflection}</p>
      </div>
    </section>
    <nav className="mode-switch" aria-label="显示形态">
      {(["points", "threshold", "solid"] as ViewMode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => selectMode(item)}>{item === "points" ? "点云" : item === "threshold" ? "显形" : "实体"}</button>)}
      <p className="mode-description" aria-live="polite">{mode === "points" ? "从器物表面采集的坐标与颜色" : mode === "threshold" ? "点云与扫描表面之间的显影状态" : "扫描模型所记录的完整表面"}</p>
    </nav>
    <footer className="footer-note"><p>拖动旋转 · 滚轮缩放 · 掠过表面以显形</p><p>{config.collection.toUpperCase()} · CC0</p></footer>
    {loading && <div className="loading"><span>正在读取表面</span><i style={{ width: `${progress}%` }} /></div>}
    {!loading && <div className={`intro-note ${intro ? "visible" : ""}`}>{config.introLabel}</div>}
    <aside className={`catalog-panel ${catalogOpen ? "open" : ""}`} aria-hidden={!catalogOpen}>
      <button className="catalog-close" onClick={() => setCatalogOpen(false)} aria-label="关闭目录">收起</button>
      <h2>器物目录</h2>
      <nav aria-label="器物目录">
        <Link href="/owl-zun" className={config.objectNumber === "001" ? "active" : ""}><span>鸮尊</span><small>商代晚期 · 约公元前 13–12 世纪</small></Link>
        <Link href="/zodiac-tiger" className={config.objectNumber === "002" ? "active" : ""}><span>生肖虎俑</span><small>北魏 · 6 世纪</small></Link>
        <Link href="/water-moon-guanyin" className={config.objectNumber === "003" ? "active" : ""}><span>水月观音</span><small>宋代 · 12 世纪</small></Link>
      </nav>
    </aside>
    {catalogOpen && <button className="about-scrim" onClick={() => setCatalogOpen(false)} aria-label="关闭目录" />}
    {error && <div className="error">{error}</div>}
  </main>;
}
