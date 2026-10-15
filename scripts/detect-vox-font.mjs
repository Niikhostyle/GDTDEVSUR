const base = "https://www.vox-web.com.ar";
const cssFiles = [
  "/_next/static/css/47133b5686b03bf6.css",
  "/_next/static/css/108fa3bd3b1a5ced.css",
];

for (const file of cssFiles) {
  const css = await (await fetch(base + file)).text();
  console.log("\n====", file, "len", css.length);
  const faces = [...css.matchAll(/@font-face\{[^}]+\}/g)].map((m) => m[0]);
  console.log("faces", faces);
  const special = css.match(/\.font-special\{[^}]+\}|\.font-body\{[^}]+\}|\.font-display\{[^}]+\}/g);
  console.log("classes", special);
  const vars = css.match(/--font[^:]*:[^;]+/g);
  console.log("vars", vars?.slice(0, 20));
  const family = css.match(/font-family:[^;!}]+/g)?.slice(0, 30);
  console.log("families", family);
}
