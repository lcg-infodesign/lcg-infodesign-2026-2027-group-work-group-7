// Radar circolare + Colonna Focus + Pannello Destro (Sites in Danger) – p5.js (livello MESO)

const BG = '#1a1f4a';
const RED = '#c4301c';
const CARD_RED = '#e54837';
const CARD_BLUE = '#2a346e';
const DARK = '#7a1a14';
const COL_TEMPIO = '#28326b';
const COL_TESTO = '#FDF0D6';

// Colori categorie siti
const COL_CULTURALE = '#EBBF44';
const COL_NATURALE = '#B8DD62';
const COL_MISTO = '#65DAE3';

// Dati colonna focus (Africa)
const FOCUS_AREA = {
  code: 'AFR',
  label: 'AFRICA',
  culturali: 61,
  naturali: 44,
  misti: 5
};

// Lista siti in pericolo (collegati ai punti del radar)
const SITES_IN_DANGER = [
  { name: 'Boma-Badingilo Migratory\nLandscape', country: 'South Sudan', cat: 'Naturale', col: COL_CULTURALE, threat: 'conflitti' },
  { name: 'Tomb of Askia', country: 'Mali', cat: 'Culturale', col: COL_MISTO, threat: 'conflitti' },
  { name: 'Lake Turkana National Parks', country: 'Kenya', cat: 'Naturale', col: COL_NATURALE, threat: 'sviluppo' },
  { name: 'Old Towns of Djenné', country: 'Mali', cat: 'Culturale', col: COL_CULTURALE, threat: 'conflitti' },
  { name: 'Mount Nimba Strict Nature Reserve', country: 'Guinea / Côte d\'Ivoire', cat: 'Naturale', col: COL_NATURALE, threat: 'illegali' },
  { name: 'Okapi Wildlife Reserve', country: 'DR Congo', cat: 'Naturale', col: COL_NATURALE, threat: 'illegali' },
  { name: 'Niokolo-Koba National Park', country: 'Senegal', cat: 'Naturale', col: COL_NATURALE, threat: 'illegali' },
  { name: 'Selous Game Reserve', country: 'Tanzania', cat: 'Naturale', col: COL_NATURALE, threat: 'illegali' },
  { name: 'Tombs of Buganda Kings at Kasubi', country: 'Uganda', cat: 'Culturale', col: COL_CULTURALE, threat: 'gestione' }
];

// Dati grafico inferiore
const COUNTRY_BARS = [
  { country: 'DR Congo', count: 5 },
  { country: 'Libya', count: 5 },
  { country: 'Mali', count: 3 },
  { country: 'Kenya', count: 1 },
  { country: 'South Sudan', count: 1 },
  { country: 'Uganda', count: 1 },
  { country: 'Guinea / Senegal / Tanzania', count: 3 }
];

const RINGS = [0.2, 0.34, 0.47, 0.62, 0.8, 1];

const LABELS = [
  { t: 'conflitti armati e\ninstabilità', dx: 0, dy: -1.14 },
  { t: 'pressione sociale,\nturismo e inquinamento', dx: 1.07, dy: -0.78 },
  { t: 'sviluppo urbano e\ninfrastrutture', dx: 1.38, dy: 0 },
  { t: 'cambiamento climatico\ne fenomeni naturali', dx: 1.0, dy: 0.84 },
  { t: 'gestione e tutela', dx: 0, dy: 1.18 },
  { t: 'uso del suolo e\npressione biologica', dx: -0.97, dy: 0.84 },
  { t: 'carenze gestionali e\nistituzionali', dx: -1.32, dy: 0 },
  { t: 'attività illegali', dx: -0.97, dy: -0.76 },
];

const DOTS = [
  { a: -106, r: 1.00, c: DARK, title: 'Conflitti armati #1', info: 'Boma-Badingilo (South Sudan)' },
  { a: -98,  r: 1.01, c: DARK, title: 'Conflitti armati #2', info: 'Tomb of Askia (Mali)' },
  { a: -90,  r: 1.02, c: DARK, title: 'Conflitti armati #3', info: 'Old Towns of Djenné (Mali)' },
  { a: -82,  r: 1.01, c: DARK, title: 'Conflitti armati #4', info: 'Instabilità nell\'area del Sahel' },
  { a: -74,  r: 1.00, c: DARK, title: 'Conflitti armati #5', info: 'Parchi nazionali in RD Congo' },

  { a: -97, r: 0.78, c: RED, title: 'Attività illegali #1', info: 'Mount Nimba Strict Nature Reserve' },
  { a: -83, r: 0.78, c: RED, title: 'Attività illegali #2', info: 'Okapi Wildlife Reserve (Bracconaggio)' },
  { a: -90, r: 0.61, c: RED, title: 'Attività illegali #3', info: 'Selous Game Reserve (Bracconaggio)' },

  { a: -45,   r: 1.00, c: DARK, title: 'Turismo e pressione', info: 'Impatto antropico sui siti' },
  { a: -35.5, r: 0.99, c: DARK, title: 'Inquinamento', info: 'Degrado ambientale' },
  { a: -45,   r: 0.81, c: DARK, title: 'Pressione sociale', info: 'Espansione insediamenti' },
  { a: -45,   r: 0.63, c: RED,  title: 'Impatto turistico', info: 'Infrastrutture non regolamentate' },

  { a: 0,   r: 0.62, c: RED,  title: 'Sviluppo urbano', info: 'Lake Turkana National Parks (Dighe)' },
  { a: 180, r: 0.62, c: RED,  title: 'Carenze gestionali', info: 'Tombs of Buganda Kings (Uganda)' },
  { a: 135, r: 0.96, c: DARK, title: 'Uso del suolo', info: 'Niokolo-Koba National Park (Senegal)' },
];

let cx, cy, R;
let hoveredItem = null;
let selectedDot = null;

// Variabili per scorrimento e barra scrollbar
let scrollSites = 0;
let isDraggingScrollbar = false;
let scrollbarDragOffset = 0;
let sbMetrics = null; // Salva coordinate della barra per il drag

function navHeight() {
  const nav = document.querySelector('nav, header');
  return nav ? nav.offsetHeight : 0;
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - navHeight());
  cnv.style('display', 'block');
  textFont('Helvetica, Arial, sans-serif');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - navHeight());
}

function draw() {
  background(BG);
  hoveredItem = null;

  // 1. COLONNA FOCUS (Sinistra)
  let colW = constrain(width * 0.11, 115, 165);
  let colH = height * 0.76;
  let colX = width * 0.11;
  let colY = (height - colH) / 2;
  disegnaColonnaFocus(colX, colY, colW, colH, FOCUS_AREA);

  // 2. RADAR MESO (Centro)
  cx = width * 0.45;
  cy = height / 2;
  R = min(width * 0.18, height * 0.28);

  drawSpokes();
  drawRings();
  drawLabels();
  drawDots();

  // 3. PANNELLO DESTRO
  let panelW = constrain(width * 0.23, 250, 340);
  let panelX = width - panelW - 28;
  let panelTop = height * 0.08;
  let panelTotalH = height * 0.84;

  disegnaPannelloDestro(panelX, panelTop, panelW, panelTotalH);

  // Cursore e Tooltip
  if (isDraggingScrollbar) {
    cursor('grabbing');
  } else {
    cursor(hoveredItem ? HAND : ARROW);
  }

  if (hoveredItem) {
    drawTooltip(hoveredItem);
  }
}

// ==========================================
// PANNELLO DESTRO (SITES IN DANGER + GRAFICO)
// ==========================================
function disegnaPannelloDestro(x, y, w, totalH) {
  let gap = 18;
  let redCardH = totalH * 0.50;
  let chartBoxH = totalH - redCardH - gap;

  // ------------------------------------------
  // A. CARD ROSSA SUPERIORE ("Sites in Danger")
  // ------------------------------------------
  push();
  noStroke();
  fill(CARD_RED);
  rect(x, y, w, redCardH, 14);

  let listaVisibile = selectedDot
    ? SITES_IN_DANGER.filter(s => s.name.includes(selectedDot.info.split(' (')))
    : SITES_IN_DANGER;
  if (listaVisibile.length === 0) listaVisibile = SITES_IN_DANGER;

  fill(BG);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(34);
  text(listaVisibile.length, x + 20, y + 16);

  textSize(18);
  text('Sites in Danger', x + 56, y + 25);

  textStyle(NORMAL);
  textSize(10);
  fill(255, 220);
  text(selectedDot ? 'Filtro attivo (clicca fuori per reset)' : 'Trascina la barra o usa la rotellina', x + 20, y + 56);

  // Dimensioni area lista e barra di scorrimento
  let listY = y + 74;
  let listH = redCardH - 86;
  let cardItemH = 54;
  let cardGap = 10;
  let sbW = 7;
  let sbX = x + w - 16;
  let cardsW = w - 38; // Lascia spazio a destra per la scrollbar

  let contentH = listaVisibile.length * (cardItemH + cardGap) - cardGap;
  let maxScroll = max(0, contentH - listH);
  scrollSites = constrain(scrollSites, 0, maxScroll);

  // Disegno delle card ritagliate
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x + 14, listY, cardsW + 4, listH);
  drawingContext.clip();

  for (let i = 0; i < listaVisibile.length; i++) {
    let site = listaVisibile[i];
    let itemY = listY + i * (cardItemH + cardGap) - scrollSites;

    fill(CARD_BLUE);
    rect(x + 16, itemY, cardsW, cardItemH, 8);

    fill(255);
    textStyle(BOLD);
    textSize(11.5);
    textLeading(13);
    text(site.name, x + 26, itemY + 8, cardsW - 18);

    let isTwoLines = site.name.includes('\n');
    let subY = isTwoLines ? itemY + 38 : itemY + 28;

    fill(site.col);
    circle(x + 31, subY + 4, 8);

    fill(210);
    textStyle(NORMAL);
    textSize(10.5);
    text(site.country, x + 41, subY - 1);

    if (!isDraggingScrollbar &&
        mouseX >= x + 16 && mouseX <= x + 16 + cardsW &&
        mouseY >= max(listY, itemY) && mouseY <= min(listY + listH, itemY + cardItemH)) {
      hoveredItem = {
        title: site.name.replace('\n', ' '),
        info: `${site.country} • Patrimonio ${site.cat}`,
        x: x + 16 + cardsW / 2,
        y: itemY
      };
    }
  }
  drawingContext.restore();

  // --- BARRA DI SCORRIMENTO VERTICALE ---
  if (maxScroll > 0) {
    // Binario (track)
    fill(0, 55);
    rect(sbX, listY, sbW, listH, sbW / 2);

    // Cursore (thumb) proporzionale al contenuto
    let thumbH = max(28, listH * (listH / contentH));
    let scrollRatio = scrollSites / maxScroll;
    let thumbY = listY + scrollRatio * (listH - thumbH);

    sbMetrics = { x: sbX, y: listY, w: sbW, h: listH, thumbY, thumbH, maxScroll };

    let isHoverThumb = mouseX >= sbX - 4 && mouseX <= sbX + sbW + 4 &&
                       mouseY >= thumbY && mouseY <= thumbY + thumbH;

    if (isHoverThumb) hoveredItem = { title: '', info: '', silent: true };

    fill(isHoverThumb || isDraggingScrollbar ? 255 : color(255, 190));
    rect(sbX, thumbY, sbW, thumbH, sbW / 2);
  } else {
    sbMetrics = null;
  }
  pop();

  // ------------------------------------------
  // B. RIQUADRO INFERIORE (GRAFICO PAESI + PUNTO INFO)
  // ------------------------------------------
  let cyBox = y + redCardH + gap;
  push();
  fill(255, 10);
  stroke(255, 80);
  strokeWeight(1.2);
  rect(x, cyBox, w, chartBoxH, 14);

  // Calcolo totale siti nel grafico
  let totaleSitiGrafico = COUNTRY_BARS.reduce((acc, item) => acc + item.count, 0);

  // Piccolo cerchio INFO in alto a sinistra
  let infoX = x + 22;
  let infoY = cyBox + 22;
  let infoR = 9;
  let isHoverInfo = dist(mouseX, mouseY, infoX, infoY) <= infoR + 3;

  fill(isHoverInfo ? 255 : color(255, 25));
  stroke(255, 200);
  strokeWeight(1.2);
  circle(infoX, infoY, infoR * 2);

  noStroke();
  fill(isHoverInfo ? BG : 255);
textAlign(CENTER, CENTER);
textStyle(BOLD);
textSize(11);
text('i', infoX, infoY + 0.5);
if (isHoverInfo) {
hoveredItem = {
title: `Totale: ${totaleSitiGrafico} siti in pericolo`,
info: `Distribuiti in ${COUNTRY_BARS.length} aree/stati africani`,
x: infoX,
y: infoY
};
}
// Titolo grafico accanto al cerchio info
textAlign(LEFT, CENTER);
textStyle(BOLD);
textSize(11);
fill(230);
text('Siti in pericolo per Stato', x + 38, infoY);
// Barre orizzontali bianche 
let barsTop = cyBox + 46;
let barsAvailH = chartBoxH - 58;
let rowH = barsAvailH / COUNTRY_BARS.length;
let maxVal = 5;
let barRightX = x + w - 28; // Spazio a destra per il numero
let maxBarW = w - 145;
for (let i = 0; i < COUNTRY_BARS.length; i++) {
let b = COUNTRY_BARS[i];
let rowY = barsTop + i * rowH + rowH / 2;
let barW = map(b.count, 0, maxVal, 16, maxBarW);
let barH = min(13, rowH * 0.52);
// Nome paese a sinistra
noStroke();
fill(210);
textAlign(LEFT, CENTER);
textStyle(NORMAL);
textSize(10.5);
text(b.country, x + 16, rowY);
// Barra bianca orizzontale allineata a destra
fill(238);
rect(barRightX - barW, rowY - barH / 2, barW, barH, 2);
// Valore numerico pulito a destra della barra
fill(255);
textAlign(LEFT, CENTER);
textStyle(BOLD);
textSize(10.5);
text(b.count, barRightX + 7, rowY);
// Hover sulla riga del paese
if (mouseX >= x + 12 && mouseX <= x + w - 12 &&
mouseY >= rowY - rowH / 2 && mouseY <= rowY + rowH / 2) {
hoveredItem = {
title: b.country,
info: `${b.count} ${b.count === 1 ? 'sito UNESCO' : 'siti UNESCO'} in pericolo`,
x: barRightX - barW / 2,
y: rowY - barH / 2
};
}
}
pop();
}
// ==========================================
// GESTIONE EVENTI MOUSE (DRAG SCROLLBAR + CLICK)
// ==========================================
function mousePressed() {
// 1. Controllo click sulla scrollbar
if (sbMetrics &&
mouseX >= sbMetrics.x - 6 && mouseX <= sbMetrics.x + sbMetrics.w + 6 &&
mouseY >= sbMetrics.y && mouseY <= sbMetrics.y + sbMetrics.h) {
isDraggingScrollbar = true;
if (mouseY >= sbMetrics.thumbY && mouseY <= sbMetrics.thumbY + sbMetrics.thumbH) {
scrollbarDragOffset = mouseY - sbMetrics.thumbY;
} else {
// Click diretto sul binario: sposta il cursore lì
scrollbarDragOffset = sbMetrics.thumbH / 2;
aggiornaScrollDaMouse();
}
return;
}
// 2. Controllo click sui pallini del radar
if (hoveredItem && hoveredItem.isDot) {
selectedDot = DOTS.find(d => d.title === hoveredItem.title);
scrollSites = 0;
} else {
selectedDot = null;
}
}
function mouseDragged() {
if (isDraggingScrollbar && sbMetrics) {
aggiornaScrollDaMouse();
}
}
function mouseReleased() {
isDraggingScrollbar = false;
}
function aggiornaScrollDaMouse() {
if (!sbMetrics) return;
let trackTravel = sbMetrics.h - sbMetrics.thumbH;
if (trackTravel <= 0) return;
let newThumbY = constrain(mouseY - scrollbarDragOffset, sbMetrics.y, sbMetrics.y + trackTravel);
let ratio = (newThumbY - sbMetrics.y) / trackTravel;
scrollSites = ratio * sbMetrics.maxScroll;
}
function mouseWheel(event) {
let panelW = constrain(width * 0.23, 250, 340);
let panelX = width - panelW - 28;
if (mouseX >= panelX && mouseX <= panelX + panelW) {
scrollSites += event.delta * 0.5;
return false;
}
}
// ==========================================
// COLONNA FOCUS A SINISTRA
// ==========================================
function disegnaColonnaFocus(xCentro, yTop, larghezzaColonna, altezzaTotale, datiArea) {
push();
translate(xCentro, yTop);
rectMode(CORNER);
noStroke();
let altezzaCapitello = 45;
let altezzaPiede = 28;
let distanzaPiedeBase = 8;
let spessoreBase = 24;
let larghezzaCapitello = larghezzaColonna * 1.1;
let yInizioFusto = altezzaCapitello + 8;
let yFineFusto = altezzaTotale - distanzaPiedeBase - altezzaPiede;
// Capitello
fill(COL_TEMPIO);
let hAbacoAlto = 10;
let wAltoSopra = larghezzaCapitello * 0.88;
let wAltoSotto = larghezzaCapitello * 0.96;
quad(-wAltoSopra / 2, 0, wAltoSopra / 2, 0, wAltoSotto / 2, hAbacoAlto, -wAltoSotto / 2, hAbacoAlto);
let spazioStacco = 3;
let yAbacoBasso = hAbacoAlto + spazioStacco;
let hAbacoBasso = 10;
quad(-wAltoSotto / 2, yAbacoBasso, wAltoSotto / 2, yAbacoBasso, wAltoSopra / 2, yAbacoBasso + hAbacoBasso, -wAltoSopra / 2, yAbacoBasso + hAbacoBasso);
let hCollarino = 5;
let yCorpo = yAbacoBasso + hAbacoBasso + spazioStacco;
let yFineCorpo = max(yCorpo + 14, yInizioFusto - hCollarino);
let hCorpo = yFineCorpo - yCorpo;
let wCorpoSopra = wAltoSopra - 8;
let wCorpoSotto = larghezzaColonna * 0.60;
let yMeta = yCorpo + hCorpo * 0.5;
let wMeta = (wCorpoSopra + wCorpoSotto) * 0.45;
beginShape();
vertex(-wCorpoSopra / 2, yCorpo);
vertex( wCorpoSopra / 2, yCorpo);
vertex( wMeta / 2, yMeta);
vertex( wCorpoSotto / 2, yFineCorpo);
vertex(-wCorpoSotto / 2, yFineCorpo);
vertex(-wMeta / 2, yMeta);
endShape(CLOSE);
fill(BG);
let wFascia = (wCorpoSopra + wCorpoSotto) / 2;
rect(-wFascia / 2, yCorpo + hCorpo * 0.35, wFascia, spazioStacco);
fill(COL_TEMPIO);
let wCollarino = wFascia - 12;
rect(-wCollarino / 2, yFineCorpo + spazioStacco, wCollarino, hCollarino);
// Scanalature fusto
stroke(COL_TEMPIO);
strokeWeight(2.5);
let numeroLinee = 6;
let larghezzaFasciaLinee = larghezzaColonna * 0.52;
let xInizioFusto = -larghezzaFasciaLinee / 2;
let spazioTraLinee = larghezzaFasciaLinee / (numeroLinee - 1);
for (let j = 0; j < numeroLinee; j++) {
let xLinea = xInizioFusto + j * spazioTraLinee;
line(xLinea, yInizioFusto + spazioStacco, xLinea, yFineFusto + 3);
}
// Barre dati
noStroke();
let valoreMax = 150;
let yBaseBarre = yFineFusto - 4;
let altezzaMaxBarre = (yFineFusto - 4) - (yInizioFusto + 8);
let serie = [
{ name: 'Siti Culturali', val: datiArea.culturali, col: COL_CULTURALE },
{ name: 'Siti Naturali',  val: datiArea.naturali,  col: COL_NATURALE },
{ name: 'Siti Misti',     val: datiArea.misti,     col: COL_MISTO }
];
let larghezzaBarra = larghezzaColonna * 0.11;
let distanzaBarre = larghezzaColonna * 0.175;
let startX = -distanzaBarre - larghezzaBarra / 2;
for (let b = 0; b < serie.length; b++) {
let hBarra = constrain(map(serie[b].val, 0, valoreMax, 0, altezzaMaxBarre), 8, altezzaMaxBarre);
let bx = startX + b * distanzaBarre;
let by = yBaseBarre - hBarra;
let absX = xCentro + bx;
let absY = yTop + by;
if (!isDraggingScrollbar &&
mouseX >= absX && mouseX <= absX + larghezzaBarra && mouseY >= absY && mouseY <= absY + hBarra) {
hoveredItem = {
title: `${datiArea.label} – ${serie[b].name}`,
info: `Totale siti registrati: ${serie[b].val}`,
x: absX + larghezzaBarra / 2,
y: absY
};
stroke(255);
strokeWeight(2);
} else {
noStroke();
}
fill(serie[b].col);
rect(bx, by, larghezzaBarra, hBarra, larghezzaBarra / 2);
}
// Piede colonna
noStroke();
fill(COL_TEMPIO);
let staccoPiede = 3;
let y0 = yFineFusto;
let hUtilePiede = max(12, altezzaPiede - staccoPiede * 3);
let y1 = y0 + hUtilePiede * 0.20 + staccoPiede;
let w1 = larghezzaColonna * 0.60;
rect(-w1 / 2, y1 - staccoPiede, w1, 5);
let y2 = y1 + hUtilePiede * 0.2 + staccoPiede;
let h2 = hUtilePiede * 0.34;
let w2Sopra = w1 * 0.92;
let w2Sotto = larghezzaCapitello * 0.80;
quad(-w2Sopra / 2, y2, w2Sopra / 2, y2, w2Sotto / 2, y2 + h2, -w2Sotto / 2, y2 + h2);
let y3 = y2 + h2 + staccoPiede;
let w3 = larghezzaCapitello * 0.84;
rect(-w3 / 2, y3, w3, 5);
// Basamento con etichetta
fill(COL_TEMPIO);
let wBase = larghezzaColonna * 1.25;
rect(-wBase / 2, altezzaTotale, wBase, spessoreBase, 3);
fill(COL_TESTO);
textAlign(CENTER, CENTER);
textStyle(BOLD);
textSize(12);
text(datiArea.label, 0, altezzaTotale + spessoreBase / 2);
pop();
}
// ==========================================
// RADAR MESO
// ==========================================
function drawRings() {
noFill();
stroke(255, 200);
strokeWeight(1.8);
drawingContext.setLineDash([14, 10]);
for (const f of RINGS) circle(cx, cy, 2 * R * f);
drawingContext.setLineDash([]);
}
function drawSpokes() {
stroke(255, 90);
strokeWeight(1.2);
drawingContext.setLineDash([10, 10]);
for (let i = 0; i < 8; i++) {
const a = radians(i * 45);
line(cx, cy, cx + cos(a) * R * 1.02, cy + sin(a) * R * 1.02);
}
drawingContext.setLineDash([]);
}
function drawLabels() {
noStroke();
fill(255);
textAlign(CENTER, CENTER);
textSize(max(10, R * 0.056));
textLeading(max(12, R * 0.066));
for (const l of LABELS) text(l.t, cx + l.dx * R, cy + l.dy * R);
}
function drawDots() {
const baseD = R * 0.105;
for (const p of DOTS) {
const a = radians(p.a);
const px = cx + cos(a) * R * p.r;
const py = cy + sin(a) * R * p.r;
const isHover = !isDraggingScrollbar && dist(mouseX, mouseY, px, py) <= baseD / 2;
const isSelected = selectedDot === p;
if (isHover) {
hoveredItem = { ...p, x: px, y: py, isDot: true };
}
if (isHover || isSelected) {
stroke(255);
strokeWeight(isSelected ? 3 : 2);
fill(p.c);
circle(px, py, baseD * 1.25);
} else {
noStroke();
fill(p.c);
circle(px, py, baseD);
}
}
}
function drawTooltip(item) {
if (item.silent) return;
const pad = 10;
textSize(12);
const w = max(textWidth(item.title), textWidth(item.info)) + pad * 2;
const h = 44;
let tx = constrain(item.x - w / 2, 10, width - w - 10);
let ty = item.y - 22 - h;
if (ty < 10) ty = item.y + 22;
fill(15, 18, 45, 240);
stroke(255, 180);
strokeWeight(1);
rect(tx, ty, w, h, 6);
noStroke();
textAlign(LEFT, TOP);
fill(255);
textStyle(BOLD);
text(item.title, tx + pad, ty + 7);
textStyle(NORMAL);
fill(210);
text(item.info, tx + pad, ty + 23);
}