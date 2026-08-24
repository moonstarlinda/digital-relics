import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the overview as the site entry", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Digital Relics — 数字遗存<\/title>/);
  assert.match(html, /数字遗存/);
  assert.match(html, /href="\/owl-zun"/);
  assert.match(html, /href="\/zodiac-tiger"/);
  assert.match(html, /href="\/water-moon-guanyin"/);
  assert.match(html, /href="\/notes"[^>]*>创作手记/);
});

test("renders the project notes", async () => {
  const response = await render("/notes");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Digital Relics — 创作手记<\/title>/);
  assert.match(html, /「作品的由来」/);
  assert.match(html, /「展品的选择」/);
  assert.match(html, /「作者的倔强」/);
  assert.match(html, /数字重生·鸮卣/);
  assert.match(html, /src="\/notes\/scanning-course\.jpeg"/);
  assert.match(html, /href="\/"[^>]*>器物总览/);
});

const detailRoutes = [
  ["/owl-zun", "鸮尊", "可旋转的商代鸮尊三维模型"],
  ["/zodiac-tiger", "生肖虎俑", "可旋转的北魏十二生肖虎俑三维模型"],
  ["/water-moon-guanyin", "水月观音", "可旋转的十二世纪水月观音三维模型"],
];

for (const [pathname, title, ariaLabel] of detailRoutes) {
  test(`renders ${pathname}`, async () => {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>Digital Relics — ${title}<\\/title>`));
    assert.match(html, new RegExp(`aria-label="${ariaLabel}"`));
    assert.match(html, /href="\/"[^>]*>器物总览/);
  });
}

test("does not expose the internal capture utility", async () => {
  const response = await render("/capture-assets");
  assert.equal(response.status, 404);
});
