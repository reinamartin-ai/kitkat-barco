"""Prepara las fotos del folleto a partir de la carpeta General.

Reduce cada foto, la gira según su orientación y la guarda como JPEG SIN metadatos:
no queda fecha, modelo de teléfono ni ubicación GPS. Escribe fotos/fotos.js con
los epígrafes y las medidas, que usa la página.
Para cambiar la selección, editar FOTOS y volver a correr:  python fotos.py
"""
import json, os
from PIL import Image, ImageOps
import pillow_heif
pillow_heif.register_heif_opener()

ORIGEN = os.path.join(os.path.expanduser("~"), "Desktop", "Motor Velero kitkat", "General",
                      "Fotos-20260918T172928Z-1-001")
F = "Fotos-20260918T173034Z-1-001/Fotos/"
RB = F + "20230113-14 Riachuelo  - Buceo/"
AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "fotos")

# clave: (archivo relativo a ORIGEN, lado mayor en px, epígrafe)
FOTOS = {
 # portada
 "portada":      (RB + "IMG_7166.HEIC", 2200, "Fondeado, enero de 2023"),
 "portada-alta": (RB + "20230114_135210.jpg", 1500, "Fondeado, enero de 2023"),
 # navegando
 "nav-mayor":    (RB + "a97b4cb1-2f9b-4a94-a78b-9411b93a9d5c.JPG", 1500, "La mayor roja al atardecer"),
 "nav-yankee":   (RB + "520bd900-14a1-4800-8593-a214731f9069.JPG", 1500, "Yankee y mayor, rumbo al sol"),
 "nav-velas":    (RB + "IMG_7156.HEIC", 1500, "Desde el pie del palo"),
 "nav-orejas":   (RB + "20230114_051948.jpg", 1500, "A orejas de burro, al amanecer"),
 "nav-botavara": (RB + "20230114_054432.jpg", 1500, "La botavara y el sol que sale"),
 "nav-ocaso":    (RB + "98674839-55f9-4de7-aa8d-9dcdabdf62b8.JPG", 1500, "Cae el sol sobre el Río de la Plata"),
 "nav-costado":  (RB + "Copia de IMG_0264.HEIC", 1500, "Por la banda, a la puesta"),
 "nav-casa":     (RB + "Copia de IMG_0269.HEIC", 1500, "La cabina con la última luz"),
 "nav-cubierta": (RB + "1bd28468-d2fb-4e3e-8808-11fab378a7a7.JPG", 1500, "Cubierta al atardecer"),
 "nav-proa":     (RB + "20230114_134804.jpg", 1600, "La proa y la ciudad"),
 # en el agua
 "perfil":       (F + "Inspección inicial/WhatsApp Image 2022-12-19 at 09.41.17.jpeg", 1600, "De perfil, amarrado en el río"),
 "rio":          (F + "Inspección inicial/WhatsApp Image 2022-12-22 at 14.34.39 (1).jpeg", 1600, "En el río, entre los árboles"),
 "fondeado":     (RB + "20230114_135208.jpg", 1500, "Fondeado"),
 # a bordo
 "salon":        ("Fotos/salon 2.jpeg", 1400, "El salón de cubierta"),
 "navegacion":   (F + "Varios/PHOTO-2022-10-25-11-12-05(2).jpg", 1400, "Mesa de navegación y tablero"),
 "cocina":       (F + "Varios/PHOTO-2022-10-25-11-12-05(4).jpg", 1400, "La cocina"),
 "dinette":      ("Fotos/salon 4.jpg", 1400, "La dinette"),
 "camarote":     (F + "Varios/PHOTO-2022-10-25-11-40-30.jpg", 1400, "Camarote de proa"),
 "bano":         ("Fotos/baño.jpg", 1200, "El baño"),
 "cubierta":     (F + "Inspección inicial/WhatsApp Image 2022-12-22 at 14.34.38 (2).jpeg", 1400, "La cubierta hacia proa"),
 # en seco
 "grua":         (F + "230120 fondo/IMG_7281.HEIC", 1600, "En la grúa, enero de 2023"),
 "nombre":       (F + "Varios/0582D4E6-EB70-4175-877E-FF6D3D25247A.JPG", 1600, "El nombre en la proa"),
 "varada":       (F + "Varios/82E645A1-3EB5-4C93-AC04-A0E3F9573B8F.JPG", 1600, "En el varadero"),
 # historia
 "h-montana":    (F + "Fotos dueños anteriores/IMG_9520.HEIC", 1200, "Con dueños anteriores"),
 "h-puerto":     (F + "Fotos dueños anteriores/IMG_9521.HEIC", 1200, "Con dueños anteriores"),
 "h-blanco":     (F + "Fotos primera dueña/68A2F908-F8E2-40EE-AF72-DA279518A3E0.JPG", 1100, "De la época de la primera dueña"),
 "h-rojas":      (F + "Fotos primera dueña/BBAC99F0-5480-4A93-97B5-B062F5873630.JPG", 1100, "Las velas rojas, ya entonces"),
 "h-fondeo":     (F + "Fotos primera dueña/346927CF-B9CB-41F0-BC07-CA276AC42638.JPG", 1100, "De la época de la primera dueña"),
 # navegadas
 "track":        (RB + "e97be00b-69e3-46e2-b94a-2543cd31365b.JPG", 1100, "El track del 13 y 14 de enero de 2023"),
}

os.makedirs(SALIDA, exist_ok=True)
meta = {}
total = 0
for clave, (rel, lado, epi) in FOTOS.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(ORIGEN, rel))).convert("RGB")
    im.thumbnail((lado, lado), Image.LANCZOS)
    destino = os.path.join(SALIDA, clave + ".jpg")
    im.save(destino, "JPEG", quality=80, optimize=True, progressive=True)   # sin exif: sin GPS
    total += os.path.getsize(destino)
    meta[clave] = {"src": "fotos/" + clave + ".jpg", "w": im.width, "h": im.height, "t": epi}

with open(os.path.join(SALIDA, "fotos.js"), "w", encoding="utf-8") as f:
    f.write("/* generado por fotos.py */\nvar FOTOS = " + json.dumps(meta, ensure_ascii=False, indent=1) + ";\n")
print("%d fotos, %.1f MB" % (len(meta), total / 1e6))
