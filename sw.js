/* Service worker de Kitkat (el barco).

   Estrategia: stale-while-revalidate.
   Responde desde el caché al instante (la app abre sin esperar la red, aunque haya
   media barra de señal) y en paralelo pide la versión nueva para dejarla lista para
   la próxima apertura. Sin conexión, sirve el caché y listo.

   Contrapartida: al abrir ves la versión anterior, no la recién subida. Para que eso
   no se convierta en "cambié el código y el celular sigue mostrando lo viejo", cuando
   el HTML cambió de verdad el worker le avisa a la app, que muestra un cartel.

   La app no pide nada a servidores externos: todo lo que se cachea es propio.

   ⚠️ AL CAMBIAR ARCHIVOS DE ASSETS, SUBIR VERSION (v2 -> v3 -> ...).
      Cambiar solo el contenido de index.html no lo exige (la revalidación en segundo
      plano lo levanta igual), pero agregar, renombrar o borrar algo de ASSETS sí. */
"use strict";

const VERSION = "kitkat-barco-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  /*FOTOS*/
  "./fotos/bano.jpg",
  "./fotos/camarote.jpg",
  "./fotos/cocina.jpg",
  "./fotos/cubierta.jpg",
  "./fotos/dinette.jpg",
  "./fotos/fondeado.jpg",
  "./fotos/grua.jpg",
  "./fotos/h-blanco.jpg",
  "./fotos/h-fondeo.jpg",
  "./fotos/h-montana.jpg",
  "./fotos/h-puerto.jpg",
  "./fotos/h-rojas.jpg",
  "./fotos/nav-botavara.jpg",
  "./fotos/nav-casa.jpg",
  "./fotos/nav-costado.jpg",
  "./fotos/nav-cubierta.jpg",
  "./fotos/nav-mayor.jpg",
  "./fotos/nav-ocaso.jpg",
  "./fotos/nav-orejas.jpg",
  "./fotos/nav-proa.jpg",
  "./fotos/nav-velas.jpg",
  "./fotos/nav-yankee.jpg",
  "./fotos/navegacion.jpg",
  "./fotos/nombre.jpg",
  "./fotos/perfil.jpg",
  "./fotos/portada-alta.jpg",
  "./fotos/portada.jpg",
  "./fotos/rio.jpg",
  "./fotos/salon.jpg",
  "./fotos/track.jpg",
  "./fotos/varada.jpg"
  /*FIN*/
];

self.addEventListener("install", ev => {
  ev.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function avisarDeActualizacion() {
  const cs = await self.clients.matchAll({ type: "window" });
  cs.forEach(c => c.postMessage({ tipo: "actualizado" }));
}

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  const esNavegacion = req.mode === "navigate";

  ev.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const guardado = (await cache.match(req)) ||
                     (esNavegacion ? await cache.match("./index.html") : undefined);

    // Leído ahora, antes de devolver `guardado`, para no tocarle el body después.
    const textoViejo = (esNavegacion && guardado) ? await guardado.clone().text() : null;

    const revalidar = fetch(req).then(async res => {
      if (!res || !res.ok) return res;
      if (esNavegacion) {
        // Se guarda bajo las dos claves: la URL pedida y el index explícito,
        // que es el respaldo cuando la navegación no matchea exacto.
        const texto = await res.clone().text();
        const cabeceras = res.headers;
        await cache.put("./index.html", new Response(texto, { headers: cabeceras }));
        await cache.put(req, new Response(texto, { headers: cabeceras }));
        if (textoViejo !== null && textoViejo !== texto) await avisarDeActualizacion();
      } else {
        await cache.put(req, res.clone());
      }
      return res;
    }).catch(() => null);

    // Hay copia: se devuelve ya, y la revalidación sigue sola en segundo plano.
    if (guardado) {
      ev.waitUntil(revalidar);
      return guardado;
    }

    // Primera vez (o algo fuera del precache): no queda otra que esperar la red.
    const res = await revalidar;
    return res || new Response(
      "Sin conexión y todavía sin copia guardada. Abrí la app una vez con datos o wifi.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  })());
});
