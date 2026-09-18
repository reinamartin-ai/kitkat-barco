const puppeteer = require("puppeteer");
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log("  OK   " + n); } else { fail++; console.log("  FAIL " + n + (d ? " -> " + d : "")); } };
(async () => {
  const b = await puppeteer.launch({ headless: "new" }); const p = await b.newPage();
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.setViewport({ width: 390, height: 844 });
  await p.goto("http://127.0.0.1:8766/", { waitUntil: "load" }); await sleep(500);
  const E = (f, ...a) => p.evaluate(f, ...a);
  const go = async h => { await E(h => { location.hash = h; }, h); await sleep(200); };
  ok("abre en el folleto", await E(() => !document.getElementById("v-folleto").hidden));
  ok("plano vélico dentro de la página", await E(() => !!document.querySelector(".sailplan svg title")));
  ok("todas las fotos del folleto existen", await E(() => document.querySelectorAll("[data-foto-fig] img").length === document.querySelectorAll("[data-foto-fig]").length));
  // visor
  await E(() => document.querySelector('[data-foto-fig="nav-yankee"]').click()); await sleep(100);
  ok("el visor abre", await E(() => !!document.querySelector(".lb img")));
  await p.keyboard.press("ArrowRight"); await sleep(50);
  ok("el visor avanza", await E(() => document.querySelector(".lb p").textContent === FOTOS["nav-ocaso"].t));
  await p.keyboard.press("Escape"); await sleep(50);
  ok("el visor cierra con Escape", await E(() => !document.querySelector(".lb")));
  // equipos
  await go("#equipos");
  ok("lista de equipos", await E(() => document.querySelectorAll("[data-eq]").length === EQUIPOS.length));
  await E(() => document.querySelector('[data-eq="vhf"]').click()); await sleep(100);
  await E(() => { const s = document.getElementById("eqE"); s.value = "ok"; s.dispatchEvent(new Event("change", {bubbles:true})); }); await sleep(100);
  ok("cambiar estado del VHF", await E(() => document.querySelector('[data-eq="vhf"] .pill').textContent === "Funciona"));
  await E(() => document.getElementById("eqNuevo").click()); await sleep(50);
  await E(() => { const f = document.getElementById("eqForm"); f.elements.t.value = "Radio VHF portátil"; f.elements.m.value = "Icom M25"; f.requestSubmit(); }); await sleep(100);
  ok("agregar un equipo", await E(() => /Radio VHF portátil/.test(document.getElementById("eqLista").textContent)));
  await E(() => document.querySelector('[data-eqf="no"]').click()); await sleep(50);
  ok("filtro 'No funciona'", await E(() => [...document.querySelectorAll("#eqLista .pill")].every(x => x.textContent === "No funciona")));
  ok("en la web, los manuales se mencionan sin enlace", await E(() => { document.querySelector('[data-eqf="todos"]').click(); document.querySelector('[data-eq="furlex"]').click(); return /carpeta/.test(document.getElementById("eqLista").textContent) && !document.querySelector('#eqLista a[href*="Equipos"]'); }));
  // pendientes
  await go("#pendientes");
  const n0 = await E(() => document.querySelectorAll("#pLista .item").length);
  ok("pendientes iniciales = lista de base", n0 === await E(() => PEND_BASE.length), n0);
  ok("los urgentes van primero", await E(() => document.querySelector("#pLista .pill").textContent === "Urgente"));
  await E(() => document.querySelector("[data-p]").click()); await sleep(80);
  await E(() => document.querySelector("[data-phecho]").click()); await sleep(80);
  ok("marcar hecho lo saca de abiertos", await E(() => document.querySelectorAll("#pLista .item").length) === n0 - 1);
  await E(() => document.getElementById("pNuevo").click()); await sleep(50);
  await E(() => { const f = document.getElementById("pForm"); f.elements.t.value = "Cambiar la bomba de agua dulce"; f.elements.p.value = "1"; f.requestSubmit(); }); await sleep(100);
  ok("anotar un pendiente nuevo", await E(() => /bomba de agua dulce/.test(document.getElementById("pLista").textContent)));
  await E(() => document.querySelector('[data-pa="Seguridad"]').click()); await sleep(50);
  ok("filtro por área", await E(() => [...document.querySelectorAll("#pLista .m")].every(m => m.textContent.startsWith("Seguridad"))));
  await E(() => document.querySelector('[data-pa="todas"]').click()); await sleep(50);
  await E(() => document.querySelector("[data-p]").click()); await sleep(50);
  const antes = await E(() => window.__barco.S().pend.length);
  await E(() => document.querySelector("[data-pdel]").click()); await sleep(30);
  ok("borrar pide confirmación", await E(() => window.__barco.S().pend.length) === antes);
  await E(() => document.querySelector("[data-pdel]").click()); await sleep(50);
  ok("y después borra", await E(() => window.__barco.S().pend.length) === antes - 1);
  // datos
  await go("#datos");
  ok("avisa la constancia vencida", await E(() => /venció el 04\/01\/2025/.test(document.getElementById("constancia").textContent)));
  ok("enlace a la app del motor", await E(() => document.getElementById("motorLink").href === MOTOR_URL));
  ok("no hay datos personales del certificado", await E(() => !/C\.I|\d\.\d{3}\.\d{3}-\d|Propietario|Apoderado/.test(document.documentElement.innerHTML)));
  // recarga: persiste
  await p.reload({ waitUntil: "load" }); await sleep(400);
  const S = await E(() => window.__barco.S());
  ok("tras recargar: equipo nuevo y VHF", S.eqx.length === 1 && S.eq.vhf.e === "ok");
  ok("tras recargar: el hecho sigue hecho y el borrado no vuelve", S.pend.length === n0 && S.pend.some(x => x.e === "hecho") && !S.pend.some(x => /bomba de agua dulce/.test(x.t)), S.pend.length);
  // migración desde la lista vieja (v1): lo tocado se queda, lo intacto se reemplaza
  await E(() => { const v = {v:1, eq:{}, eqx:[], pend:[
      {id:"b5", t:"Bengalas nuevas", a:"Seguridad", p:1, e:"rev", o:"Informe 2022", n:"", c:"2026-09-18", f:""},
      {id:"b6", t:"Recertificar los extintores", a:"Seguridad", p:1, e:"hecho", o:"Informe 2022", n:"", c:"2026-09-18", f:"2026-09-18"},
      {id:"nzz", t:"Cosa mía", a:"Otro", p:3, e:"pend", o:"", n:"", c:"2026-09-18", f:""}]};
    localStorage.setItem("kitkat.barco.v1", JSON.stringify(v)); });
  await p.reload({ waitUntil: "load" }); await sleep(300);
  const M = await E(() => window.__barco.S());
  ok("migración: se va el intacto de 2022", !M.pend.some(x => x.t === "Bengalas nuevas"));
  ok("migración: queda lo que el usuario tocó o anotó", M.pend.some(x => x.t === "Recertificar los extintores" && x.e === "hecho") && M.pend.some(x => x.t === "Cosa mía"));
  ok("migración: entra la lista nueva", M.pend.some(x => /agua salada/.test(x.t)) && M.pendVer === 2);
  // sin conexión
  await E(async () => { await navigator.serviceWorker.ready; }); await sleep(1500);
  await p.setOfflineMode(true); await p.reload({ waitUntil: "load" }); await sleep(600);
  ok("abre sin conexión", await E(() => document.title) === "Kitkat · Endurance 37");
  ok("las fotos se ven sin conexión", await E(async () => { document.querySelectorAll("img[loading=lazy]").forEach(i => i.loading = "eager");
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    return [...document.images].every(i => i.naturalWidth > 0); }));
  await p.setOfflineMode(false);
  ok("sin errores de JS", errs.length === 0, errs.join(" | "));
  console.log("\n==== " + pass + " OK, " + fail + " FALLAN ====");
  b.process().kill(); process.exit(fail ? 1 : 0);
})();
