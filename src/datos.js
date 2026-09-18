/* =====================================================================
   CONTENIDO DE LA PÁGINA DEL BARCO
   Fuentes (carpeta "Motor Velero kitkat/General"):
     folleto  = Tyler Mouldings, Endurance 37 (el folleto del astillero; es del ketch)
     informe  = Inspección del barco, Riachuelo, 25 de octubre de 2022
     constancia = Constancia de Cumplimiento de Seguridad N° 049/2023 (PNN)
   Del certificado solo se usan datos del barco: nada personal.
   ===================================================================== */

var MOTOR_URL = "https://reinamartin-ai.github.io/kitkat-motor/";

/* ---------------- ficha técnica ---------------- */
var FICHA = [
 {g:"Identificación", filas:[
  ["Nombre", "Kitkat"],
  ["Modelo", "Endurance 37"],
  ["Diseño", "Peter A. Ibold, 1970"],
  ["Constructor", "Tyler Mouldings Ltd., Tonbridge, Inglaterra (el diseño también se construyó en otros países)"],
  ["Aparejo", "Cutter: un palo, yankee y trinquetilla (el folleto original muestra la versión ketch)"],
  ["Bandera y puerto", "Estados Unidos · Delaware"],
  ["Matrícula", "DL4225AM"],
  ["Arqueo", "12,66 TRB · 12,03 TRN"],
  ["Navegación autorizada", "Zona B, hasta 8 tripulantes"]]},
 {g:"Medidas", filas:[
  ["Eslora total", "11,25 m (36' 11\") según el folleto · 11,35 m en la constancia"],
  ["Eslora de flotación", "8,40 m (26' 7\")"],
  ["Manga", "3,50 m (11' 6\") · 3,45 m en la constancia"],
  ["Calado", "1,60 m (5' 3\")"],
  ["Puntal", "1,60 m"],
  ["Desplazamiento", "9,5 toneladas"],
  ["Lastre", "3.500 kg de hierro fundido, encapsulado en la quilla"]]},
 {g:"Construcción", filas:[
  ["Casco", "Fibra de vidrio (PRFV), reforzado longitudinalmente con largueros de espuma de poliuretano"],
  ["Cubierta y casilla", "Moldeadas en PRFV. Cubierta forrada en teca"],
  ["Unión casco–cubierta", "Pegada y encapsulada, forma la regala"],
  ["Mamparos", "Contrachapado marino, laminados al casco"],
  ["Timón", "Pala de PRFV con mecha de acero inoxidable"]]},
 {g:"Motor y tanques", filas:[
  ["Motor", "Ford Lehman 4D254 (Ford 2712E), diésel de 4 cilindros, 80 HP. El Endurance 37 original venía con Perkins 4.236M"],
  ["Hélice de proa", "Sleipner SidePower, 12 V, 3 kW"],
  ["Agua", "1.000 + 198 litros (según la inspección de 2022)"],
  ["Gasoil", "350 + 190 litros (según la inspección de 2022)"]]},
 {g:"Velas (inspección 2022)", filas:[
  ["Mayores", "2, en buen estado. La que se usa es roja"],
  ["Genoas / yankee", "2, en buen estado"],
  ["Trinquetilla", "1, en condiciones aceptables"],
  ["Tormenta", "Mayor de capa y tormentín"],
  ["Spinnaker", "1"]]}
];

var CONSTANCIA = {num:"049/2023", otorgada:"2023-01-19", vence:"2025-01-04"};

/* ---------------- equipos ----------------
   e: ok (funciona) · prob (con problemas) · no (no funciona) · ret (retirado) · rev (a revisar)
   manual: archivos dentro de "General/Equipos" (solo se abren en la copia de la compu) */
var GRUPOS = ["Navegación y electrónica","Maniobra y gobierno","Energía y electricidad","Confort","Seguridad","Motor"];
var EQUIPOS = [
 {id:"plotter", g:"Navegación y electrónica", t:"Plotter", m:"ONWA", e:"ok", n:"", manual:["ONWA Chartplotter manual_OME-200725.pdf"]},
 {id:"piloto", g:"Navegación y electrónica", t:"Piloto automático", m:"Raymarine Evolution EV-100 con control p70 y actuador lineal mecánico tipo 1", e:"ok",
  n:"Reemplaza al piloto NECO que figura en el informe de 2022 (confirmar).",
  manual:["Piloto automático -20260918T172706Z-1-001/Piloto automático/RAY_Evolution EV100, ACUx_ESP.pdf",
          "Piloto automático -20260918T172706Z-1-001/Piloto automático/p70 e p70R Instrucciones de instalación y manejo 81355-1-ES.pdf",
          "Piloto automático -20260918T172706Z-1-001/Piloto automático/Mechanical Linear Drive (M81130, M81131, M81132, M81133, M81134) Installation instructions 81175-8-EN.pdf"]},
 {id:"radar", g:"Navegación y electrónica", t:"Radar", m:"Raytheon R20", e:"ret", n:"Funcionaba en 2022. Fuera de uso."},
 {id:"hf", g:"Navegación y electrónica", t:"Radio de HF", m:"Icom IC-M802", e:"no", n:"No funciona."},
 {id:"vhf", g:"Navegación y electrónica", t:"VHF", m:"", e:"rev", n:"En 2022 no se logró contacto con Prefectura de Colonia, aunque parecía funcionar."},
 {id:"gps", g:"Navegación y electrónica", t:"GPS", m:"Garmin 126", e:"rev", n:"Sin antena en 2022."},
 {id:"sonda", g:"Navegación y electrónica", t:"Ecosonda", m:"Nasa Marine, con sensor portátil", e:"ok", n:"El informe sugiere instalar un sensor fijo."},
 {id:"viento", g:"Navegación y electrónica", t:"Sensor de viento", m:"", e:"no", n:"No tiene (2022)."},
 {id:"aries", g:"Maniobra y gobierno", t:"Timón de viento", m:"Aries", e:"rev", n:"En 2022 estaba desarmado, con repuestos a bordo.",
  manual:["Piloto de viento Aries.pdf","Piloto de viento Aries_ Guía de mantenimiento, ajuste y solución de problemas.pdf"]},
 {id:"furlex", g:"Maniobra y gobierno", t:"Enrollador del yankee", m:"Seldén Furlex S300", e:"ok", n:"En buen estado en 2022, pide mantenimiento.",
  manual:["Salden furlex s300.pdf","Salden Furlex S300 partes 595-105-E (1).pdf"]},
 {id:"palo", g:"Maniobra y gobierno", t:"Mástil, botavara y tangón", m:"Seldén", e:"prob", n:"Sin daños, pero la pintura del aluminio está muy deteriorada, sobre todo en el mástil.",
  manual:["Salden jarcia botavara.pdf"]},
 {id:"jfija", g:"Maniobra y gobierno", t:"Jarcia fija", m:"", e:"ok", n:"En buen estado en 2022. Sin fecha de fabricación conocida."},
 {id:"jmovil", g:"Maniobra y gobierno", t:"Jarcia de labor", m:"", e:"prob", n:"Muy afectada por el sol: el informe sugiere cambiar el 80 %."},
 {id:"winches", g:"Maniobra y gobierno", t:"Molinetes", m:"", e:"prob", n:"Piden mantenimiento."},
 {id:"molinete", g:"Maniobra y gobierno", t:"Molinete del ancla", m:"Manual", e:"ok", n:"Tres anclas en buen estado."},
 {id:"thruster", g:"Maniobra y gobierno", t:"Hélice de proa", m:"Sleipner SidePower, 12 V, 3 kW", e:"ok", n:"Funciona. Revisar la unidad en varadero.",
  manual:["Bow thruster.pdf","Bow trhuster 2.pdf"]},
 {id:"gobierno", g:"Maniobra y gobierno", t:"Sistema de gobierno", m:"Rueda", e:"ok", n:"Pide pequeños ajustes. Tiene caña de fortuna."},
 {id:"solar", g:"Energía y electricidad", t:"Paneles solares y regulador", m:"Regulador PWM MUST", e:"ok", n:"", manual:["MANUAL-REGULADOR-PWM10-20-30-MUST.pdf"]},
 {id:"eolico", g:"Energía y electricidad", t:"Generador eólico", m:"", e:"rev", n:"No se pudo probar en 2022."},
 {id:"inverter", g:"Energía y electricidad", t:"Inversor", m:"4.000 W", e:"ok", n:""},
 {id:"baterias", g:"Energía y electricidad", t:"Baterías", m:"", e:"rev", n:"El informe sugiere cambiarlas y aumentar la capacidad."},
 {id:"tablero", g:"Energía y electricidad", t:"Tablero eléctrico", m:"Con fusibles", e:"ok", n:"Funciona. Conviene pasarlo a llaves térmicas."},
 {id:"calefon", g:"Confort", t:"Calefón", m:"Albinus", e:"ok", n:"", manual:["Calefon Albinus.pdf"]},
 {id:"calefactor", g:"Confort", t:"Calefactor", m:"Tipo Webasto", e:"ok", n:"Funciona. El informe sugiere una instalación más completa."},
 {id:"heladera", g:"Confort", t:"Heladera", m:"", e:"no", n:"No arrancaba en 2022."},
 {id:"cocina", g:"Confort", t:"Cocina y horno", m:"", e:"ok", n:""},
 {id:"agua", g:"Confort", t:"Agua a presión y bombas", m:"", e:"ok", n:""},
 {id:"dingui", g:"Confort", t:"Dingui", m:"Fibra de vidrio", e:"ok", n:""},
 {id:"balsa", g:"Seguridad", t:"Balsa salvavidas", m:"", e:"no", n:"Vencida en 2022; puede que no acepte recertificación."},
 {id:"epirb", g:"Seguridad", t:"EPIRB", m:"", e:"prob", n:"Sin certificado y posiblemente con el MMSI equivocado."},
 {id:"ais", g:"Seguridad", t:"AIS", m:"", e:"no", n:"No tiene."},
 {id:"extintores", g:"Seguridad", t:"Extintores", m:"5", e:"prob", n:"Sin certificación en 2022."},
 {id:"bengalas", g:"Seguridad", t:"Bengalas", m:"", e:"no", n:"Vencidas en 2022."},
 {id:"salvavidas", g:"Seguridad", t:"Chalecos salvavidas", m:"2 con arnés", e:"prob", n:"No alcanzan para la norma de Prefectura."},
 {id:"achique", g:"Seguridad", t:"Bombas de achique", m:"1 eléctrica y 2 manuales", e:"ok", n:""},
 {id:"motor", g:"Motor", t:"Motor", m:"Ford Lehman 4D254, 80 HP", e:"prob", n:"Ver la app del motor. En 2022: amperímetro sin funcionar y ruido en el burro de arranque."},
 {id:"caja", g:"Motor", t:"Caja", m:"", e:"prob", n:"En 2022 el aceite estaba emulsionado: posible entrada de agua por el enfriador."}
];
var ESTADOS = {ok:"Funciona", prob:"Con problemas", no:"No funciona", ret:"Retirado", rev:"A revisar"};

/* ---------------- pendientes iniciales ----------------
   Salen del informe de 2022 y de la constancia. Arrancan en "A revisar":
   puede que ya estén hechos. p: 1 urgente · 2 importante · 3 normal · 4 algún día */
var AREAS = ["Seguridad","Documentación","Casco","Cubierta","Jarcia y velas","Motor","Electricidad","Interior","Otro"];
var PEND_BASE = [
 {t:"Renovar la constancia de seguridad (vencía el 04/01/2025)", a:"Documentación", p:1, o:"Constancia 049/2023"},
 {t:"Bengalas nuevas", a:"Seguridad", p:1, o:"Informe 2022"},
 {t:"Recertificar los extintores", a:"Seguridad", p:1, o:"Informe 2022"},
 {t:"Balsa salvavidas: recertificar o reemplazar", a:"Seguridad", p:1, o:"Informe 2022"},
 {t:"EPIRB: certificar y corregir el MMSI", a:"Seguridad", p:2, o:"Informe 2022"},
 {t:"Completar chalecos salvavidas según la norma de Prefectura", a:"Seguridad", p:1, o:"Informe 2022"},
 {t:"Instalar AIS", a:"Seguridad", p:2, o:"Informe 2022"},
 {t:"Botiquín, cartas, elementos de derrota, linternas, cizalla y sondaleza", a:"Seguridad", p:2, o:"Informe 2022"},
 {t:"Aceite de la caja emulsionado: revisar el enfriador de la caja", a:"Motor", p:1, o:"Informe 2022", n:"Ver el diagnóstico en la app del motor."},
 {t:"Revisar el burro de arranque (ruido anormal)", a:"Motor", p:3, o:"Informe 2022"},
 {t:"Arreglar el amperímetro del tablero del motor", a:"Motor", p:3, o:"Informe 2022"},
 {t:"Prensaestopas muy apretado: regular", a:"Motor", p:2, o:"Informe 2022"},
 {t:"Limpiar los tanques de agua y gasoil", a:"Motor", p:3, o:"Informe 2022"},
 {t:"Toma de fondo engripada: mantenimiento o cambio", a:"Casco", p:1, o:"Informe 2022"},
 {t:"Varada: revisar ampollas (ósmosis), hélice, ánodo y bujes del timón", a:"Casco", p:2, o:"Informe 2022"},
 {t:"Pintura de fondo y barrera osmótica", a:"Casco", p:2, o:"Informe 2022"},
 {t:"Pintura de obra muerta y línea de flotación", a:"Casco", p:4, o:"Informe 2022"},
 {t:"Antideslizante de cubierta: pintar o cambiar las gomas", a:"Cubierta", p:3, o:"Informe 2022"},
 {t:"Tambuchos: burletes nuevos y reforzar la fibra", a:"Cubierta", p:3, o:"Informe 2022"},
 {t:"Reforzar el arco de popa", a:"Cubierta", p:3, o:"Informe 2022"},
 {t:"Herraje de la trinquetilla: cambiar remaches o sumar fijación", a:"Jarcia y velas", p:2, o:"Informe 2022"},
 {t:"Cambiar la jarcia de labor (80 %)", a:"Jarcia y velas", p:2, o:"Informe 2022"},
 {t:"Pintar mástil y botavara", a:"Jarcia y velas", p:3, o:"Informe 2022"},
 {t:"Revisar la instalación eléctrica del mástil", a:"Jarcia y velas", p:3, o:"Informe 2022"},
 {t:"Mantenimiento del Furlex y de los molinetes", a:"Jarcia y velas", p:3, o:"Informe 2022"},
 {t:"Armar y probar el timón de viento Aries", a:"Jarcia y velas", p:4, o:"Informe 2022"},
 {t:"Tablero a llaves térmicas", a:"Electricidad", p:3, o:"Informe 2022"},
 {t:"Baterías nuevas y más capacidad", a:"Electricidad", p:3, o:"Informe 2022"},
 {t:"Probar el generador eólico", a:"Electricidad", p:4, o:"Informe 2022"},
 {t:"Unificar las luces a LED", a:"Electricidad", p:4, o:"Informe 2022"},
 {t:"Heladera que no arranca", a:"Interior", p:3, o:"Informe 2022"},
 {t:"Barnices del interior", a:"Interior", p:4, o:"Informe 2022"},
 {t:"Limpiar las sentinas", a:"Interior", p:3, o:"Informe 2022"},
 {t:"Burletes de los ojos de buey y trabas de puertas", a:"Interior", p:4, o:"Informe 2022"},
 {t:"Completar y cambiar cabos de amarre", a:"Otro", p:3, o:"Informe 2022"}
];
var PRIOS = {1:"Urgente", 2:"Importante", 3:"Normal", 4:"Algún día"};
var ESTADOS_P = {rev:"A revisar", pend:"Pendiente", curso:"En curso", hecho:"Hecho", desc:"Descartado"};
