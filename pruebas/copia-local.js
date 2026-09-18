const puppeteer = require("puppeteer"); const fs = require("fs"); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: "new" }); const p = await b.newPage();
  const errs = []; p.on("pageerror", e => errs.push(String(e)));
  await p.goto("file:///C:/Users/mrein/Desktop/Motor%20Velero%20kitkat/kitkat-barco.html#equipos", { waitUntil: "load" }); await sleep(400);
  const r = await p.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach(i => i.loading = "eager");
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    const rotas = [...document.images].filter(i => !i.naturalWidth).length;
    const links = [];
    for (const q of EQUIPOS.filter(q => q.manual)) { document.querySelector('[data-eq="' + q.id + '"]').click();
      document.querySelectorAll('#eqLista a[href*="Equipos"]').forEach(a => links.push(decodeURI(a.getAttribute("href")))); document.querySelector('[data-eq="' + q.id + '"]').click(); }
    location.hash = "#datos"; await new Promise(r => setTimeout(r, 100));
    return {rotas, links, motor: document.getElementById("motorLink").getAttribute("href")};
  });
  const base = "C:/Users/mrein/Desktop/Motor Velero kitkat/";
  const faltan = r.links.filter(l => !fs.existsSync(base + l));
  console.log("fotos rotas:", r.rotas, "| manuales enlazados:", r.links.length, "| inexistentes:", faltan, "| motor:", r.motor, fs.existsSync(base + r.motor), "| errores:", errs);
  b.process().kill(); process.exit(0);
})();
