"""Arma index.html a partir de src/ y deja una copia para abrir con doble clic.

    src/pagina.html  estructura y estilos (folleto, equipos, pendientes, datos)
    src/plano.svg    el plano vélico del cutter
    src/datos.js     ficha técnica, equipos y pendientes iniciales
    src/app.js       la lógica
    fotos/fotos.js   lo genera fotos.py

Uso:  python build.py      (si cambiaste la selección de fotos, antes: python fotos.py)
Copia local: Escritorio/Motor Velero kitkat/kitkat-barco.html + kitkat-barco-fotos/
(desde ahí los manuales de General/Equipos se abren directo).
"""
import io, os, re, shutil, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
def leer(*p): return io.open(os.path.join(AQUI, *p), encoding="utf-8").read()

html = leer("src", "pagina.html")
for marca, contenido in (("<!--SVG-->", leer("src", "plano.svg")),
                         ("<!--FOTOS-->", leer("fotos", "fotos.js")),
                         ("<!--DATOS-->", leer("src", "datos.js")),
                         ("<!--APP-->", leer("src", "app.js"))):
    if html.count(marca) != 1: sys.exit("falta la marca " + marca)
    html = html.replace(marca, contenido)
io.open(os.path.join(AQUI, "index.html"), "w", encoding="utf-8", newline="\n").write(html)

# lista de archivos que el service worker guarda para usar sin señal
fotos = sorted(f for f in os.listdir(os.path.join(AQUI, "fotos")) if f.endswith(".jpg"))
sw = leer("sw.js")
lista = ",\n".join('  "./fotos/%s"' % f for f in fotos)
sw = re.sub(r"/\*FOTOS\*/[\s\S]*?/\*FIN\*/", "/*FOTOS*/\n" + lista + "\n  /*FIN*/", sw)
io.open(os.path.join(AQUI, "sw.js"), "w", encoding="utf-8", newline="\n").write(sw)

dest = os.path.join(os.path.expanduser("~"), "Desktop", "Motor Velero kitkat")
if os.path.isdir(dest):
    shutil.copyfile(os.path.join(AQUI, "index.html"), os.path.join(dest, "kitkat-barco.html"))
    fd = os.path.join(dest, "kitkat-barco-fotos")
    os.makedirs(fd, exist_ok=True)
    for f in fotos: shutil.copyfile(os.path.join(AQUI, "fotos", f), os.path.join(fd, f))
    print("copia local en", os.path.join(dest, "kitkat-barco.html"))
print("index.html: %d KB, %d fotos" % (len(html.encode("utf-8")) // 1024, len(fotos)))
