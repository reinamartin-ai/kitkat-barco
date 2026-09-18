(function(){
  "use strict";

  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function hoy(){ var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  function fechaLinda(iso){ if(!iso) return ""; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  var toastTO;
  function toast(t){ var e = $("#toast"); e.textContent = t; e.classList.add("on");
    clearTimeout(toastTO); toastTO = setTimeout(function(){ e.classList.remove("on"); }, 2400); }

  /* abierta desde la compu (doble clic) o publicada */
  var LOCAL = location.protocol === "file:";
  var FOTO_DIR = LOCAL ? "kitkat-barco-fotos/" : "fotos/";
  var MANUAL_DIR = LOCAL ? "General/Equipos/" : null;

  /* ============================================================
     DATOS GUARDADOS EN EL TELÉFONO
     ============================================================ */
  var KEY = "kitkat.barco.v1";
  function vacio(){ return {v:1, eq:{}, eqx:[], pend:null}; }
  var S = (function(){
    try{ var r = localStorage.getItem(KEY); if(r){ var d = JSON.parse(r); if(d && d.v === 1) return d; } }catch(e){}
    return vacio();
  })();
  if(!Array.isArray(S.eqx)) S.eqx = [];
  if(!S.eq) S.eq = {};
  if(!Array.isArray(S.pend)){
    S.pend = PEND_BASE.map(function(p, i){
      return {id:"b" + i, t:p.t, a:p.a, p:p.p, e:"rev", o:p.o || "", n:p.n || "", c:hoy(), f:""};
    });
  }
  var avisado = false;
  function guardar(){
    try{ localStorage.setItem(KEY, JSON.stringify(S)); }
    catch(e){ if(!avisado){ avisado = true; toast("Este navegador no deja guardar: los cambios se pierden al cerrar."); } }
  }

  /* ============================================================
     FOTOS Y VISOR
     ============================================================ */
  function fsrc(k){ return FOTO_DIR + k + ".jpg"; }
  $$("[data-foto]").forEach(function(img){
    var k = img.getAttribute("data-foto"), f = FOTOS[k]; if(!f) return;
    img.src = fsrc(k); img.width = f.w; img.height = f.h;
  });
  $$("[data-foto-src]").forEach(function(s){ s.srcset = fsrc(s.getAttribute("data-foto-src")); });
  $$("[data-foto-fig]").forEach(function(fig){
    var k = fig.getAttribute("data-foto-fig"), f = FOTOS[k]; if(!f){ fig.remove(); return; }
    fig.innerHTML = '<img loading="lazy" decoding="async" src="' + fsrc(k) + '" width="' + f.w + '" height="' + f.h + '" alt="' + esc(f.t) + '"><figcaption>' + esc(f.t) + '</figcaption>';
    fig.tabIndex = 0; fig.setAttribute("role", "button"); fig.setAttribute("aria-label", "Ver en grande: " + f.t);
  });

  var lb = null, lbList = [], lbIx = 0, lbPrevFocus = null;
  function abrirVisor(lista, ix){
    lbList = lista; lbIx = ix; lbPrevFocus = document.activeElement;
    lb = document.createElement("div");
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Foto en grande");
    lb.innerHTML = '<img alt=""><p></p><button class="x" type="button" aria-label="Cerrar">&#10005;</button>' +
      (lista.length > 1 ? '<button class="prev" type="button" aria-label="Anterior">&lsaquo;</button><button class="next" type="button" aria-label="Siguiente">&rsaquo;</button>' : '');
    document.body.appendChild(lb);
    pintarVisor();
    lb.addEventListener("click", function(e){
      if(e.target.closest(".x") || e.target === lb) cerrarVisor();
      else if(e.target.closest(".prev")) mover(-1);
      else if(e.target.closest(".next")) mover(1);
    });
    $(".x", lb).focus();
  }
  function pintarVisor(){ var k = lbList[lbIx]; $("img", lb).src = fsrc(k); $("img", lb).alt = FOTOS[k].t; $("p", lb).textContent = FOTOS[k].t; }
  function mover(d){ lbIx = (lbIx + d + lbList.length) % lbList.length; pintarVisor(); }
  function cerrarVisor(){ if(lb){ lb.remove(); lb = null; if(lbPrevFocus) lbPrevFocus.focus(); } }
  document.addEventListener("keydown", function(e){
    if(!lb) return;
    if(e.key === "Escape") cerrarVisor();
    if(e.key === "ArrowRight") mover(1);
    if(e.key === "ArrowLeft") mover(-1);
  });
  $$("[data-galeria]").forEach(function(g){
    var figs = $$("[data-foto-fig]", g), keys = figs.map(function(f){ return f.getAttribute("data-foto-fig"); });
    figs.forEach(function(f, i){
      f.addEventListener("click", function(){ abrirVisor(keys, i); });
      f.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); abrirVisor(keys, i); } });
    });
  });
  $("#printBtn").addEventListener("click", function(){
    /* las fotos de abajo cargan recién al verlas: se fuerzan antes de imprimir */
    $$("#v-folleto img[loading=lazy]").forEach(function(i){ i.loading = "eager"; });
    setTimeout(function(){ window.print(); }, 400);
  });

  /* el plano vélico viene como SVG dentro de la página */

  /* ============================================================
     VISTAS
     ============================================================ */
  var VISTAS = ["folleto","equipos","pendientes","datos"];
  function ruta(){
    var v = location.hash.replace(/^#\/?/, "").split("/")[0];
    if(VISTAS.indexOf(v) < 0) v = "folleto";
    VISTAS.forEach(function(x){ $("#v-" + x).hidden = (x !== v); });
    $$(".tabs a").forEach(function(a){ if(a.getAttribute("data-v") === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if(v === "equipos") verEquipos();
    if(v === "pendientes") verPendientes();
    if(v === "datos") verDatos();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", ruta);

  /* ============================================================
     EQUIPOS
     ============================================================ */
  var eqFiltro = "todos", eqAbierto = null;
  function equipos(){
    return EQUIPOS.map(function(q){
      var o = S.eq[q.id] || {};
      return {id:q.id, g:q.g, t:q.t, m:q.m, e:o.e || q.e, n:(o.n !== undefined ? o.n : q.n), manual:q.manual || [], base:true};
    }).concat(S.eqx.map(function(q){ return {id:q.id, g:q.g, t:q.t, m:q.m, e:q.e, n:q.n, manual:[], base:false}; }));
  }
  function opciones(obj, sel){
    return Object.keys(obj).map(function(k){ return '<option value="' + k + '"' + (String(k) === String(sel) ? " selected" : "") + '>' + esc(obj[k]) + '</option>'; }).join("");
  }
  function opcionesLista(arr, sel){ return arr.map(function(k){ return '<option' + (k === sel ? " selected" : "") + '>' + esc(k) + '</option>'; }).join(""); }

  function verEquipos(){
    var todos = equipos(), cnt = {todos:todos.length};
    todos.forEach(function(q){ cnt[q.e] = (cnt[q.e] || 0) + 1; });
    var f = '<button type="button" class="chip" data-eqf="todos" aria-pressed="' + (eqFiltro === "todos") + '">Todos <i>' + cnt.todos + '</i></button>';
    Object.keys(ESTADOS).forEach(function(k){
      if(cnt[k]) f += '<button type="button" class="chip" data-eqf="' + k + '" aria-pressed="' + (eqFiltro === k) + '">' + ESTADOS[k] + ' <i>' + cnt[k] + '</i></button>';
    });
    $("#eqFiltros").innerHTML = f;
    var h = "";
    var grupos = GRUPOS.slice();
    todos.forEach(function(q){ if(grupos.indexOf(q.g) < 0) grupos.push(q.g); });
    grupos.forEach(function(g){
      var items = todos.filter(function(q){ return q.g === g && (eqFiltro === "todos" || q.e === eqFiltro); });
      if(!items.length) return;
      h += '<div class="group"><h3>' + esc(g) + '</h3><ul class="list">';
      items.forEach(function(q){
        var abierto = eqAbierto === q.id;
        h += '<li class="item"><button type="button" data-eq="' + q.id + '" aria-expanded="' + abierto + '">' +
          '<span class="t">' + esc(q.t) + '</span><span class="pill ' + q.e + '">' + ESTADOS[q.e] + '</span>' +
          '<span class="m">' + esc([q.m, q.n].filter(Boolean).join(" · ")) + '</span></button>';
        if(abierto){
          h += '<div class="edit">' +
            '<div class="row"><div class="fld"><label for="eqE">Estado</label><select id="eqE" data-eqset="e">' + opciones(ESTADOS, q.e) + '</select></div></div>' +
            '<div class="fld"><label for="eqN">Notas</label><textarea id="eqN" data-eqset="n">' + esc(q.n) + '</textarea></div>';
          if(q.manual.length){
            h += '<div class="fld"><label>Manuales</label>' + (MANUAL_DIR
              ? '<div class="manuals">' + q.manual.map(function(m){ return '<a class="btn small" target="_blank" rel="noopener" href="' + esc(encodeURI(MANUAL_DIR + m)) + '">' + esc(m.split("/").pop().replace(/\.pdf$/i, "")) + '</a>'; }).join("") + '</div>'
              : '<p class="fine">Están en la compu, en la carpeta <i>General/Equipos</i>: ' + esc(q.manual.map(function(m){ return m.split("/").pop(); }).join(" · ")) + '</p>') + '</div>';
          }
          if(!q.base) h += '<button type="button" class="del" data-eqdel="' + q.id + '">Borrar este equipo</button>';
          h += '</div>';
        }
        h += '</li>';
      });
      h += '</ul></div>';
    });
    if(!h) h = '<p class="fine">No hay equipos en ese estado.</p>';
    $("#eqLista").innerHTML = h;
  }
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-eqf]");
    if(b){ eqFiltro = b.getAttribute("data-eqf"); verEquipos(); return; }
    b = e.target.closest("[data-eq]");
    if(b){ var id = b.getAttribute("data-eq"); eqAbierto = (eqAbierto === id ? null : id); verEquipos();
      var nb = $('[data-eq="' + id + '"]'); if(nb) nb.focus(); return; }
    b = e.target.closest("[data-eqdel]");
    if(b){ var d = b.getAttribute("data-eqdel"); S.eqx = S.eqx.filter(function(q){ return q.id !== d; }); guardar(); eqAbierto = null; verEquipos(); toast("Equipo borrado"); }
  });
  document.addEventListener("change", function(e){
    var el = e.target.closest("[data-eqset]"); if(!el || !eqAbierto) return;
    var campo = el.getAttribute("data-eqset"), custom = S.eqx.filter(function(q){ return q.id === eqAbierto; })[0];
    if(custom) custom[campo] = el.value;
    else { S.eq[eqAbierto] = S.eq[eqAbierto] || {}; S.eq[eqAbierto][campo] = el.value; }
    guardar();
    if(campo === "e"){ verEquipos(); toast("Estado guardado"); } else toast("Nota guardada");
  });
  $("#eqNuevo").addEventListener("click", function(){
    var box = $("#eqNuevoBox");
    if(box.innerHTML){ box.innerHTML = ""; return; }
    box.innerHTML = '<form class="newbox" id="eqForm"><div class="row">' +
      '<div class="fld"><label for="nqT">Equipo</label><input id="nqT" name="t" required placeholder="Ej.: Radio VHF portátil"></div>' +
      '<div class="fld"><label for="nqM">Marca y modelo</label><input id="nqM" name="m"></div></div>' +
      '<div class="row"><div class="fld"><label for="nqG">Grupo</label><select id="nqG" name="g">' + opcionesLista(GRUPOS, GRUPOS[0]) + '</select></div>' +
      '<div class="fld"><label for="nqE">Estado</label><select id="nqE" name="e">' + opciones(ESTADOS, "ok") + '</select></div></div>' +
      '<div class="fld"><label for="nqN">Notas</label><textarea id="nqN" name="n"></textarea></div>' +
      '<div class="tools"><button class="btn primary" type="submit">Agregar</button><button class="btn" type="button" id="nqC">Cancelar</button></div></form>';
    $("#nqT").focus();
    $("#nqC").onclick = function(){ box.innerHTML = ""; };
    $("#eqForm").onsubmit = function(ev){
      ev.preventDefault(); var el = this.elements;
      S.eqx.push({id:"x" + uid(), t:el.t.value.trim(), m:el.m.value.trim(), g:el.g.value, e:el.e.value, n:el.n.value.trim()});
      guardar(); box.innerHTML = ""; verEquipos(); toast("Equipo agregado");
    };
  });

  /* ============================================================
     PENDIENTES
     ============================================================ */
  var pFiltro = "abiertos", pArea = "todas", pAbierto = null;
  var ABIERTOS = {rev:1, pend:1, curso:1};
  var ORDEN_E = {curso:0, pend:1, rev:2, hecho:3, desc:4};
  function pasaFiltro(x){
    if(pFiltro === "abiertos" && !ABIERTOS[x.e]) return false;
    if(pFiltro !== "abiertos" && pFiltro !== "todos" && x.e !== pFiltro) return false;
    if(pArea !== "todas" && x.a !== pArea) return false;
    return true;
  }
  function verPendientes(){
    var cnt = {abiertos:0, todos:S.pend.length};
    S.pend.forEach(function(x){ cnt[x.e] = (cnt[x.e] || 0) + 1; if(ABIERTOS[x.e]) cnt.abiertos++; });
    var f = '<button type="button" class="chip" data-pf="abiertos" aria-pressed="' + (pFiltro === "abiertos") + '">Abiertos <i>' + cnt.abiertos + '</i></button>';
    Object.keys(ESTADOS_P).forEach(function(k){
      if(cnt[k]) f += '<button type="button" class="chip" data-pf="' + k + '" aria-pressed="' + (pFiltro === k) + '">' + ESTADOS_P[k] + ' <i>' + cnt[k] + '</i></button>';
    });
    f += '<button type="button" class="chip" data-pf="todos" aria-pressed="' + (pFiltro === "todos") + '">Todos <i>' + cnt.todos + '</i></button>';
    $("#pFiltros").innerHTML = f;
    var areas = AREAS.filter(function(a){ return S.pend.some(function(x){ return x.a === a; }); });
    $("#pAreas").innerHTML = '<button type="button" class="chip" data-pa="todas" aria-pressed="' + (pArea === "todas") + '">Todas las áreas</button>' +
      areas.map(function(a){ return '<button type="button" class="chip" data-pa="' + esc(a) + '" aria-pressed="' + (pArea === a) + '">' + esc(a) + '</button>'; }).join("");

    var lista = S.pend.filter(pasaFiltro).sort(function(a, b){
      return (ABIERTOS[b.e] ? 1 : 0) - (ABIERTOS[a.e] ? 1 : 0) || a.p - b.p || ORDEN_E[a.e] - ORDEN_E[b.e] || a.t.localeCompare(b.t);
    });
    var h = '<ul class="list">';
    lista.forEach(function(x){
      var ab = pAbierto === x.id, cerrado = !ABIERTOS[x.e];
      h += '<li class="item' + (cerrado ? " done" : "") + '"><button type="button" data-p="' + x.id + '" aria-expanded="' + ab + '">' +
        '<span class="t">' + esc(x.t) + '</span><span class="pill ' + (cerrado ? x.e : "p" + x.p) + '">' + (cerrado ? ESTADOS_P[x.e] : PRIOS[x.p]) + '</span>' +
        '<span class="m">' + esc(x.a) + (x.e === "rev" || x.e === "curso" ? " · " + ESTADOS_P[x.e] : "") + (x.o ? " · " + esc(x.o) : "") +
        (x.e === "hecho" && x.f ? " · hecho el " + fechaLinda(x.f) : "") + (x.n ? "<br>" + esc(x.n) : "") + '</span></button>';
      if(ab){
        h += '<div class="edit">' +
          '<div class="fld"><label for="pT">Qué</label><input id="pT" data-pset="t" value="' + esc(x.t) + '"></div>' +
          '<div class="row"><div class="fld"><label for="pE">Estado</label><select id="pE" data-pset="e">' + opciones(ESTADOS_P, x.e) + '</select></div>' +
          '<div class="fld"><label for="pP">Prioridad</label><select id="pP" data-pset="p">' + opciones(PRIOS, x.p) + '</select></div>' +
          '<div class="fld"><label for="pA">Área</label><select id="pA" data-pset="a">' + opcionesLista(AREAS, x.a) + '</select></div></div>' +
          '<div class="fld"><label for="pN">Notas</label><textarea id="pN" data-pset="n" placeholder="Presupuesto, a quién llamar, qué repuesto…">' + esc(x.n) + '</textarea></div>' +
          '<div class="tools">' + (x.e !== "hecho" ? '<button type="button" class="btn primary small" data-phecho="' + x.id + '">Marcar hecho</button>' : '') +
          '<button type="button" class="del" data-pdel="' + x.id + '">Borrar</button></div>' +
          '<p class="fine">Anotado el ' + fechaLinda(x.c) + '</p></div>';
      }
      h += '</li>';
    });
    h += '</ul>';
    if(!lista.length) h = '<p class="fine">Nada en esta lista.</p>';
    $("#pLista").innerHTML = h;
  }
  function pendPor(id){ return S.pend.filter(function(x){ return x.id === id; })[0]; }
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-pf]");
    if(b){ pFiltro = b.getAttribute("data-pf"); verPendientes(); return; }
    b = e.target.closest("[data-pa]");
    if(b){ pArea = b.getAttribute("data-pa"); verPendientes(); return; }
    b = e.target.closest("[data-p]");
    if(b){ var id = b.getAttribute("data-p"); pAbierto = (pAbierto === id ? null : id); verPendientes();
      var nb = $('[data-p="' + id + '"]'); if(nb) nb.focus(); return; }
    b = e.target.closest("[data-phecho]");
    if(b){ var x = pendPor(b.getAttribute("data-phecho")); x.e = "hecho"; x.f = hoy(); guardar(); pAbierto = null; verPendientes(); toast("¡Hecho!"); return; }
    b = e.target.closest("[data-pdel]");
    if(b){
      if(b.getAttribute("data-confirm") !== "1"){ b.setAttribute("data-confirm", "1"); b.textContent = "¿Seguro? Tocá otra vez para borrar"; return; }
      var d = b.getAttribute("data-pdel"); S.pend = S.pend.filter(function(x){ return x.id !== d; }); guardar(); pAbierto = null; verPendientes(); toast("Borrado");
    }
  });
  document.addEventListener("change", function(e){
    var el = e.target.closest("[data-pset]"); if(!el || !pAbierto) return;
    var x = pendPor(pAbierto), campo = el.getAttribute("data-pset");
    x[campo] = (campo === "p") ? parseInt(el.value, 10) : el.value;
    if(campo === "e" && el.value === "hecho" && !x.f) x.f = hoy();
    guardar();
    if(campo !== "n" && campo !== "t") verPendientes();
    toast("Guardado");
  });
  $("#pNuevo").addEventListener("click", function(){
    var box = $("#pNuevoBox");
    if(box.innerHTML){ box.innerHTML = ""; return; }
    box.innerHTML = '<form class="newbox" id="pForm">' +
      '<div class="fld"><label for="npT">Qué hay que hacer</label><input id="npT" name="t" required placeholder="Ej.: Cambiar la bomba de agua dulce"></div>' +
      '<div class="row"><div class="fld"><label for="npA">Área</label><select id="npA" name="a">' + opcionesLista(AREAS, "Otro") + '</select></div>' +
      '<div class="fld"><label for="npP">Prioridad</label><select id="npP" name="p">' + opciones(PRIOS, 3) + '</select></div></div>' +
      '<div class="fld"><label for="npN">Notas</label><textarea id="npN" name="n"></textarea></div>' +
      '<div class="tools"><button class="btn primary" type="submit">Anotar</button><button class="btn" type="button" id="npC">Cancelar</button></div></form>';
    $("#npT").focus();
    $("#npC").onclick = function(){ box.innerHTML = ""; };
    $("#pForm").onsubmit = function(ev){
      ev.preventDefault(); var el = this.elements;
      S.pend.push({id:"n" + uid(), t:el.t.value.trim(), a:el.a.value, p:parseInt(el.p.value, 10), e:"pend", o:"", n:el.n.value.trim(), c:hoy(), f:""});
      guardar(); box.innerHTML = ""; pFiltro = "abiertos"; verPendientes(); toast("Anotado");
    };
  });

  /* ============================================================
     DATOS
     ============================================================ */
  function verDatos(){
    var vencida = hoy() > CONSTANCIA.vence;
    $("#constancia").innerHTML = vencida
      ? '<div class="warnbox"><b>La constancia de seguridad venció el ' + fechaLinda(CONSTANCIA.vence) + '.</b> Es la N° ' + CONSTANCIA.num + ', otorgada el ' + fechaLinda(CONSTANCIA.otorgada) + '. Si ya la renovaste, marcá el pendiente como hecho.</div>'
      : '<p class="fine">Constancia de seguridad N° ' + CONSTANCIA.num + ', válida hasta el ' + fechaLinda(CONSTANCIA.vence) + '.</p>';
    $("#motorLink").href = LOCAL ? "kitkat-motor.html" : MOTOR_URL;
    $("#ficha").innerHTML = FICHA.map(function(g){
      return '<section class="fcard"><h3>' + esc(g.g) + '</h3><dl>' + g.filas.map(function(f){
        return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join("") + '</dl></section>';
    }).join("");
  }
  $("#exp").addEventListener("click", function(){
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], {type:"application/json"}));
    a.download = "kitkat-barco-copia-" + hoy() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("Copia generada");
  });
  $("#imp").addEventListener("change", function(){
    var file = this.files && this.files[0]; this.value = "";
    if(!file) return;
    var r = new FileReader();
    r.onload = function(){
      try{
        var d = JSON.parse(r.result);
        if(!d || d.v !== 1 || !Array.isArray(d.pend)) throw 0;
        S = d; if(!S.eq) S.eq = {}; if(!Array.isArray(S.eqx)) S.eqx = [];
        guardar(); toast("Copia cargada: " + S.pend.length + " pendientes");
      }catch(e){ toast("Ese archivo no es una copia de esta página"); }
    };
    r.readAsText(file);
  });

  ruta();

  if("serviceWorker" in navigator && location.protocol.indexOf("http") === 0){
    window.addEventListener("load", function(){
      navigator.serviceWorker.register("sw.js").catch(function(){});
      navigator.serviceWorker.addEventListener("message", function(ev){
        if(ev.data && ev.data.tipo === "actualizado") toast("Hay una versión nueva. Cerrá y volvé a abrir.");
      });
    });
  }

  window.__barco = {S:function(){ return S; }, equipos:equipos};
})();
