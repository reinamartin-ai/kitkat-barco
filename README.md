# Kitkat

El velero Kitkat, un Endurance 37 cutter: folleto, equipos, pendientes y ficha técnica.
Funciona sin internet y se instala en el celular. La app del motor está aparte y enlazada.

## Cómo se edita

| Archivo | Qué tiene |
|---|---|
| `src/datos.js` | Ficha técnica, equipos (con su estado inicial) y pendientes iniciales |
| `src/pagina.html` | Textos del folleto, estructura y estilos |
| `src/plano.svg` | El plano vélico del cutter |
| `src/app.js` | La lógica |
| `fotos.py` | Qué fotos usa el folleto y sus epígrafes |

    python fotos.py     # solo si cambia la selección de fotos (les borra el GPS y los metadatos)
    python build.py     # arma index.html y la copia del Escritorio

La copia del Escritorio (`Motor Velero kitkat/kitkat-barco.html`) abre los manuales de
`General/Equipos` directamente. La versión publicada solo los nombra: no se suben.

## Lo que nunca se publica

El certificado de navegabilidad, el documento de la matrícula y el informe de 2022 como archivo.
Del certificado solo se usan datos del barco (matrícula, medidas, arqueo, vencimiento).

## Datos del usuario

Los cambios en equipos y los pendientes viven solo en el `localStorage` del teléfono
(clave `kitkat.barco.v1`). Respaldo: Datos → Bajar copia.
