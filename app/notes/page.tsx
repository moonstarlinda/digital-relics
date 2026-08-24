import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Digital Relics — 创作手记",
  description: "数字遗存从一次三维扫描课程开始。",
};

export default function NotesPage() {
  return (
    <main className="notes-page">
      <header className="masthead notes-header">
        <Link className="wordmark" href="/" aria-label="返回数字遗存器物总览">DIGITAL RELICS</Link>
      </header>
      <nav className="detail-nav notes-detail-nav" aria-label="页面导航">
        <Link className="overview-link" href="/">器物总览</Link>
      </nav>

      <article className="notes-spread">
        <section className="notes-left" aria-labelledby="notes-title">
          <div className="notes-title-block">
            <p className="notes-kicker">FIELD NOTES · 创作过程</p>
            <h1 id="notes-title">创作手记</h1>
          </div>

          <section className="notes-copy-section">
            <p className="notes-section-label">「作品的由来」</p>
            <figure className="notes-photo">
              <div className="notes-photo-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/notes/scanning-course.jpeg"
                  alt="社区课程现场的三维扫描设备与正在接受结构光扫描的鸮卣模型"
                />
              </div>
            </figure>
            <p>2026 年 8 月 21 日，我报名参加了北京市丰台区某街道举办的公益培训课程，课程名字叫“数字重生·鸮卣——文物三维扫描与数字化创意课程”。授课老师来自某学校文物修复专业，把三维扫描仪和一件鸮卣模型带到教学现场，当场演示了调试设备和扫描文物的过程。</p>
            <p>我得以亲眼看到并且动手操作：亲手移动模型，点击软件按键带动扫描镜头开始工作，再移动模型、再扫描。由此看到了一个具有体积、表面和材质的物体，是怎样被逐步转换为屏幕中的立体图像的。</p>
            <p>课上同学们问了各种各样的问题，包括扫描获得的数据如何应用。有的被用来辅助策展，比如参观者点击透明屏幕，放大、缩小或者旋转虚拟文物；有的可以用来 3D 打印仿制文物；有的可以提供给厂家制作文创产品。</p>
            <p>课程是独立的一次课，课后也没有留作业，我却觉得我应该做点儿什么。至少到这里，我已经明白了之前在网上看到的那些炫酷的、由粒子爆发组成物体的点云特效大致是怎么来的。我来做个简单的网页，就以鸮卣为原型，作为此次课程没有白听的证明，应该还是可行的。</p>
          </section>
        </section>

        <section className="notes-right" aria-label="创作过程正文">
          <section className="notes-copy-section">
            <p className="notes-section-label">「展品的选择」</p>
            <p>做网页，第一件事便是如何获得扫描物体所得到的数据文件呢？上课时老师避而不谈扫描设备的价格，我到淘宝随便搜了搜，都在万元以上，对我来说可不现实。</p>
            <p>于是我上网搜别人都是怎么扫描的，得知手机有相关的 App：用户围绕物体 360 度拍摄数十张甚至更多的照片，软件可以自动拼凑生成立体的扫描文件，我还是觉得麻烦。也有的人从博物馆下载文物照片，喂给 AI 或者相关软件生成扫描数据。我觉得这很容易失真；对于日常物品倒还好，对于历史文物却不够严谨。</p>
            <p>然后我又想到，是否有公开的、扫描好的数据呢？经过一番搜寻，终于发现有些博物馆通过 Sketchfab 网站公开发布模型，并且有不错的免费授权形式。可惜的是，我找到的多是外国博物馆保存的中国文物，没有发现课程中的山西博物馆“鸮卣”；好消息是，我找到了一个一眼看上去与它非常相似的小猫头鹰器具，再一看年代，也是商朝的，十分相似。</p>
            <p>于是“鸮尊”（owl-zun）顺理成章地成为作品中的第一件展示器物，这也避开了网络上已经被反复复现的鸮卣形象。</p>
            <p>第二件“水月观音”是顺藤摸瓜，在同一个博物馆发布的诸多文物数据中，凭眼缘选择的。这尊斜坐观音神态闲适、风格飘逸。我在河北正定隆兴寺中见过相似的造像，那是第一次见到这种造像，印象深刻，所以算是有一面之缘，故用之。只是因为年代较晚，在网页中排列到了第三件。</p>
            <p>只有两件，不成展览，必须至少再展一件。这次挑选的标准有：中国文物，年代与前两件不重复，最好也不是与前两件同一博物馆的藏品。我考察了多人陶俑、清代瓷器、佛造像、建筑模型，最终把目光锁定到动物形俑上。一开始注意到了猪头俑，后来发现英文名称含有“zodiac”，原来这是一套十二生肖俑。那么，我本人喜欢老虎，所以最终使用了“虎俑”。这就是第三件器物的由来。</p>
          </section>

          <section className="notes-copy-section">
            <p className="notes-section-label">「作者的倔强」</p>
            <p>完成了最重要的挑选展示对象、下载数据文件，后续的事情就交给 AI 了。毫不夸张地说，整个网页的页面设计、策展文字书写、代码实现、部署上线，几乎 99.99% 由 AI 完成。人机协作（主要靠机）是时代的主流、不可逆的浪潮。但是作为人类，我还是顽强地维护了一下自己的面子。没错——这篇无甚文采、平白直叙的文字是我所写，99.99% 由人类完成。</p>
          </section>

          <footer className="notes-date">
            <span>Digital Relics</span>
            <time dateTime="2026-08-24">2026 年 8 月 24 日</time>
          </footer>
        </section>
      </article>
    </main>
  );
}
