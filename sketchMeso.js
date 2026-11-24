// Radar circolare (5 anelli in gradazione + grandezza proporzionale) + Colonna Focus + Graduatoria Destra – p5.js (livello MESO)

const BG = '#1a1f4a';
const CARD_RED = '#e54837';
const CARD_BLUE = '#2a346e';
const COL_TEMPIO = '#28326b';
const COL_TESTO = '#FDF0D6';

// Colori categorie siti
const COL_CULTURALE = '#EBBF44';
const COL_NATURALE = '#B8DD62';
const COL_MISTO = '#65DAE3';

// 5 CERCHI CONCENTRICI (dal livello 1 interno al livello 5 esterno)
const RINGS = [0.28, 0.46, 0.64, 0.82, 1.0];

// OPACITÀ E SPESSORE DEGLI ANELLI: dal più tenue (interno) al più acceso (esterno)
const RING_STYLES = [
  { alpha: 55,  weight: 1.2 }, // Cerchio 1 (più interno - tenue)
  { alpha: 95,  weight: 1.4 }, // Cerchio 2
  { alpha: 145, weight: 1.6 }, // Cerchio 3
  { alpha: 200, weight: 1.9 }, // Cerchio 4
  { alpha: 255, weight: 2.3 }  // Cerchio 5 (più esterno - molto acceso)
];

// GRADAZIONE DEI PALLINI: dal più tenue/chiaro (interno) al più acceso/intenso (esterno)
const DANGER_COLORS = [
  '#f48c7f', // Livello 1 (più interno - tenue)
  '#ef6b5b', // Livello 2
  '#e64937', // Livello 3
  '#d12817', // Livello 4
  '#9e1108'  // Livello 5 (cerchio più grande - intenso e acceso)
];

// SCALA DIMENSIONE DEI PALLINI: leggermente più grandi man mano che ci si sposta verso l'esterno
const RING_DOT_SCALES = [0.76, 0.86, 0.96, 1.08, 1.22];

// 8 assi del radar mappati sulle macrocategorie del dataset
const LABELS = [
  { t: 'conflitti armati e\ninstabilità', dx: 0, dy: -1.14, angle: -90, key: 'Armed Conflict & Instability' },
  { t: 'pressione sociale,\nturismo e inquinamento', dx: 1.07, dy: -0.78, angle: -45, key: 'Social, Tourism & Pollution Pressure' },
  { t: 'sviluppo urbano e\ninfrastrutture', dx: 1.38, dy: 0, angle: 0, key: 'Urban Development & Infrastructure' },
  { t: 'cambiamento climatico\ne fenomeni naturali', dx: 1.0, dy: 0.84, angle: 45, key: 'Climate Change & Natural Phenomena' },
  { t: 'gestione e tutela', dx: 0, dy: 1.18, angle: 90, key: 'Management & Institutional Deficiencies' },
  { t: 'uso del suolo e\npressione biologica', dx: -0.97, dy: 0.84, angle: 135, key: 'Land Use & Biological Pressure' },
  { t: 'attività estrattive\ned energia', dx: -1.32, dy: 0, angle: 180, key: 'Extractive Activities & Energy' },
  { t: 'attività illegali', dx: -0.97, dy: -0.76, angle: -135, key: 'Illegal Activities' },
];

let tableDataset;
let focusArea = { code: 'AFR', label: 'AFRICA', culturali: 0, naturali: 0, misti: 0 };
let dangerSites = [];
let countryBars = [];

let cx, cy, R;
let activeSite = null;
let selectedSite = null;

// Variabili scrollbar
let scrollSites = 0;
let isDraggingScrollbar = false;
let scrollbarDragOffset = 0;
let sbMetrics = null;

function navHeight() {
  const nav = document.querySelector('nav, header');
  return nav ? nav.offsetHeight : 0;
}

async function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - navHeight());
  cnv.style('display', 'block');
  textFont('Helvetica, Arial, sans-serif');

  tableDataset = await loadTable('assets/dataset.csv', ',', 'header');
  elaboraDatiCSV('AFR');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - navHeight());
}

// ==========================================
// ESTRAZIONE E ORDINAMENTO DATI DAL CSV
// ==========================================
function elaboraDatiCSV(regionCode) {
  if (!tableDataset) return;

  focusArea = { code: regionCode, label: 'AFRICA', culturali: 0, naturali: 0, misti: 0 };
  dangerSites = [];
  let conteggioPaesi = {};

  for (let r = 0; r < tableDataset.getRowCount(); r++) {
    let reg = tableDataset.getString(r, 'Region_Code').trim();
    if (reg !== regionCode) continue;

    let cat = tableDataset.getString(r, 'Category').trim();
    if (cat === 'Cultural') focusArea.culturali++;
    else if (cat === 'Natural') focusArea.naturali++;
    else if (cat === 'Mixed') focusArea.misti++;

    let isDanger = tableDataset.getString(r, 'Danger').trim().toUpperCase() === 'TRUE';
    if (isDanger) {
      let name = tableDataset.getString(r, 'Name').trim();
      let country = tableDataset.getString(r, 'States_Parties').trim();
      let primaryMacro = tableDataset.getString(r, 'Danger_Primary_Macrocategory').trim();
      let urgency = tableDataset.getString(r, 'Danger_Urgency_Label').trim();
      let rawScore = tableDataset.getString(r, 'Danger_Severity_Score').replace(',', '.');
      let score = parseFloat(rawScore) || 3.0;

      let catCol = COL_CULTURALE;
      if (cat === 'Natural') catCol = COL_NATURALE;
      else if (cat === 'Mixed') catCol = COL_MISTO;

      let ringLevel = calcolaLivelloAnello(score, urgency);

      dangerSites.push({
        id: r,
        rank: 0,
        name,
        country,
        cat,
        catCol,
        primaryMacro,
        urgency,
        score,
        ringLevel,
        dotCol: DANGER_COLORS[ringLevel],
        a: -90,
        r: RINGS[ringLevel]
      });

      let stati = country.split(',');
      for (let s of stati) {
        let st = s.trim();
        if (st === 'Democratic Republic of the Congo') st = 'DR Congo';
        if (st === 'United Republic of Tanzania') st = 'Tanzania';
        if (st === 'Central African Republic') st = 'Central African Rep.';
        conteggioPaesi[st] = (conteggioPaesi[st] || 0) + 1;
      }
    }
  }

  // Ordina per graduatoria (dal punteggio di pericolo più alto al più basso)
  dangerSites.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  for (let i = 0; i < dangerSites.length; i++) {
    dangerSites[i].rank = i + 1;
  }

  // Posizionamento ad arco per ciascuna macrocategoria e livello
  posizionaPuntiOrdinatiSulRadar();

  // Ordina gli Stati dal maggior numero di siti in pericolo
  countryBars = Object.entries(conteggioPaesi)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

function calcolaLivelloAnello(score, urgency) {
  if (score >= 4.0 || urgency === 'Critical') return 4;     // Cerchio 5 (più esterno, più acceso)
  if (score >= 3.5 || urgency === 'High') return 3;         // Cerchio 4
  if (score >= 3.1 || urgency === 'Medium-High') return 2;  // Cerchio 3
  if (score >= 2.7 || urgency === 'Moderate') return 1;     // Cerchio 2
  return 0;                                                 // Cerchio 1 (più interno, più tenue)
}

function posizionaPuntiOrdinatiSulRadar() {
  let gruppi = {};
  for (let s of dangerSites) {
    let macroKey = s.primaryMacro || 'Armed Conflict & Instability';
    let groupKey = `${macroKey}__${s.ringLevel}`;
    if (!gruppi[groupKey]) gruppi[groupKey] = [];
    gruppi[groupKey].push(s);
  }

  for (let groupKey in gruppi) {
    let [macroName, levelStr] = groupKey.split('__');
    let level = parseInt(levelStr, 10);
    let labelObj = LABELS.find(l => l.key.toLowerCase() === macroName.toLowerCase());
    let baseAngle = labelObj ? labelObj.angle : -90;

    let lista = gruppi[groupKey];
    lista.sort((a, b) => a.name.localeCompare(b.name));

    let n = lista.length;
    let maxSpread = map(level, 0, 4, 24, 34);
    let stepAngle = map(level, 0, 4, 11.0, 8.2);
    let spread = min(maxSpread, (n - 1) * stepAngle);

    for (let i = 0; i < n; i++) {
      let offset = n === 1 ? 0 : map(i, 0, n - 1, -spread / 2, spread / 2);
      lista[i].a = baseAngle + offset;
      lista[i].r = RINGS[level];
    }
  }
}

function draw() {
  background(BG);

  if (!tableDataset) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Caricamento dataset UNESCO...', width / 2, height / 2);
    return;
  }

  let hoveredFromRadar = null;
  let hoveredFromList = null;

  // 1. COLONNA FOCUS (Sinistra)
  let colW = constrain(width * 0.11, 115, 165);
  let colH = height * 0.76;
  let colX = width * 0.11;
  let colY = (height - colH) / 2;
  disegnaColonnaFocus(colX, colY, colW, colH, focusArea);

  // 2. RADAR MESO (Centro)
  cx = width * 0.45;
  cy = height / 2;
  R = min(width * 0.18, height * 0.28);

  drawSpokes();
  drawRings();
  drawLabels();
  hoveredFromRadar = checkDotsHover();

  // 3. PANNELLO DESTRO
  let panelW = constrain(width * 0.24, 260, 350);
  let panelX = width - panelW - 28;
  let panelTop = height * 0.08;
  let panelTotalH = height * 0.84;

  if (hoveredFromRadar && hoveredFromRadar !== activeSite) {
    scorriFinoASito(hoveredFromRadar, panelTotalH * 0.50 - 86);
  }

  activeSite = hoveredFromRadar || hoveredFromList || selectedSite;

  hoveredFromList = disegnaPannelloDestro(panelX, panelTop, panelW, panelTotalH);
  if (hoveredFromList) {
    activeSite = hoveredFromList;
  }

  drawDots();

  if (isDraggingScrollbar) {
    cursor('grabbing');
  } else {
    cursor(hoveredFromRadar || hoveredFromList ? HAND : ARROW);
  }
}

// ==========================================
// CONTROLLO HOVER E DISEGNO PALLINI RADAR
// ==========================================
function checkDotsHover() {
  if (isDraggingScrollbar) return null;
  const baseD = R * 0.090;
  for (const p of dangerSites) {
    const a = radians(p.a);
    const px = cx + cos(a) * R * p.r;
    const py = cy + sin(a) * R * p.r;
    const dotD = baseD * RING_DOT_SCALES[p.ringLevel];

    if (dist(mouseX, mouseY, px, py) <= dotD / 2) {
      return p;
    }
  }
  return null;
}

function drawDots() {
  const baseD = R * 0.090;
  for (const p of dangerSites) {
    const a = radians(p.a);
    const px = cx + cos(a) * R * p.r;
    const py = cy + sin(a) * R * p.r;
    const dotD = baseD * RING_DOT_SCALES[p.ringLevel];

    const isHighlighted = activeSite === p;

    if (isHighlighted) {
      noFill();
      stroke(255, 130);
      strokeWeight(5);
      circle(px, py, dotD * 1.55);

      stroke(255);
      strokeWeight(2.5);
      fill(p.dotCol);
      circle(px, py, dotD * 1.25);
    } else {
      stroke(BG);
      strokeWeight(1.4);
      fill(p.dotCol);
      circle(px, py, dotD);
    }
  }
}

function scorriFinoASito(site, listH) {
  let idx = dangerSites.indexOf(site);
  if (idx === -1) return;
let cardItemH = 58;
let cardGap = 10;
let targetY = idx * (cardItemH + cardGap);
if (targetY < scrollSites || targetY + cardItemH > scrollSites + listH) {
scrollSites = targetY - listH / 2 + cardItemH / 2;
}
}
// ==========================================
// PANNELLO DESTRO (GRADUATORIA SITES IN DANGER + GRAFICO)
// ==========================================
function disegnaPannelloDestro(x, y, w, totalH) {
let gap = 18;
let redCardH = totalH * 0.50;
let chartBoxH = totalH - redCardH - gap;
let hoveredCardSite = null;
// A. CARD ROSSA SUPERIORE ("Graduatoria Sites in Danger")
push();
noStroke();
fill(CARD_RED);
rect(x, y, w, redCardH, 14);
fill(BG);
textAlign(LEFT, TOP);
textStyle(BOLD);
textSize(34);
text(dangerSites.length, x + 20, y + 16);
textSize(17);
text('Sites in Danger', x + 64, y + 20);
textStyle(NORMAL);
textSize(10);
fill(255, 230);
text('Graduatoria per indice di gravità (Score)', x + 64, y + 41);
let listY = y + 68;
let listH = redCardH - 80;
let cardItemH = 58;
let cardGap = 10;
let sbW = 7;
let sbX = x + w - 16;
let cardsW = w - 38;
let contentH = max(0, dangerSites.length * (cardItemH + cardGap) - cardGap);
let maxScroll = max(0, contentH - listH);
scrollSites = constrain(scrollSites, 0, maxScroll);
drawingContext.save();
drawingContext.beginPath();
drawingContext.rect(x + 14, listY, cardsW + 4, listH);
drawingContext.clip();
for (let i = 0; i < dangerSites.length; i++) {
let site = dangerSites[i];
let itemY = listY + i * (cardItemH + cardGap) - scrollSites;
let isHoverCard = !isDraggingScrollbar &&
mouseX >= x + 16 && mouseX <= x + 16 + cardsW &&
mouseY >= max(listY, itemY) && mouseY <= min(listY + listH, itemY + cardItemH);
if (isHoverCard) {
hoveredCardSite = site;
}
let isCardActive = (activeSite === site) || isHoverCard;
if (isCardActive) {
fill('#3d4b99');
stroke(255);
strokeWeight(2);
} else {
fill(CARD_BLUE);
noStroke();
}
rect(x + 16, itemY, cardsW, cardItemH, 8);
// Badge posizione in graduatoria (#1, #2, #3...)
noStroke();
let badgeX = x + 33;
let badgeY = itemY + cardItemH / 2;
if (site.rank === 1) fill('#EBBF44');       // Oro
else if (site.rank === 2) fill('#D0D7DE');  // Argento
else if (site.rank === 3) fill('#CD7F32');  // Bronzo
else fill(255, 30);
circle(badgeX, badgeY, 22);
fill(site.rank <= 3 ? BG : 255);
textAlign(CENTER, CENTER);
textStyle(BOLD);
textSize(10);
text(`#${site.rank}`, badgeX, badgeY + 0.5);
// Titolo sito a destra del badge
textAlign(LEFT, TOP);
fill(255);
textStyle(BOLD);
textSize(10.8);
textLeading(12.5);
text(site.name, x + 50, itemY + 7, cardsW - 42, 26);
// Pallino categoria + Paese + Score
fill(site.catCol);
circle(x + 54, itemY + 43, 7.5);
fill(isCardActive ? 255 : 210);
textStyle(NORMAL);
textSize(9.8);
text(`${site.country}  •  Score ${site.score.toFixed(2)}`, x + 63, itemY + 37, cardsW - 55);
}
drawingContext.restore();
// Barra di scorrimento verticale
if (maxScroll > 0) {
fill(0, 55);
rect(sbX, listY, sbW, listH, sbW / 2);
let thumbH = max(28, listH * (listH / contentH));
let scrollRatio = scrollSites / maxScroll;
let thumbY = listY + scrollRatio * (listH - thumbH);
sbMetrics = { x: sbX, y: listY, w: sbW, h: listH, thumbY, thumbH, maxScroll };
let isHoverThumb = mouseX >= sbX - 4 && mouseX <= sbX + sbW + 4 &&
mouseY >= thumbY && mouseY <= thumbY + thumbH;
fill(isHoverThumb || isDraggingScrollbar ? 255 : color(255, 190));
rect(sbX, thumbY, sbW, thumbH, sbW / 2);
} else {
sbMetrics = null;
}
pop();
// B. RIQUADRO INFERIORE (GRAFICO PAESI PIÙ COLPITI)
let cyBox = y + redCardH + gap;
push();
fill(255, 10);
stroke(255, 80);
strokeWeight(1.2);
rect(x, cyBox, w, chartBoxH, 14);
let infoX = x + 22;
let infoY = cyBox + 22;
let infoR = 9;
let isHoverInfo = dist(mouseX, mouseY, infoX, infoY) <= infoR + 4;
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
textAlign(LEFT, CENTER);
textStyle(BOLD);
textSize(11);
fill(230);
text('Paesi con più siti in pericolo', x + 38, infoY);
let barsTop = cyBox + 46;
let barsAvailH = chartBoxH - 56;
let nBars = max(1, countryBars.length);
let rowH = barsAvailH / nBars;
let maxVal = countryBars.length > 0 ? Math.max(...countryBars.map(c => c.count)) : 5;
let barRightX = x + w - 28;
let maxBarW = w - 150;
for (let i = 0; i < countryBars.length; i++) {
let b = countryBars[i];
let rowY = barsTop + i * rowH + rowH / 2;
let barW = map(b.count, 0, maxVal, 14, maxBarW);
let barH = min(12, rowH * 0.55);
let isCountryHighlighted = activeSite && activeSite.country.includes(b.country.replace('DR Congo', 'Democratic Republic of the Congo'));
noStroke();
fill(isCountryHighlighted ? COL_CULTURALE : 210);
textAlign(LEFT, CENTER);
textStyle(isCountryHighlighted ? BOLD : NORMAL);
textSize(10);
text(b.country, x + 16, rowY);
fill(isCountryHighlighted ? COL_CULTURALE : 238);
rect(barRightX - barW, rowY - barH / 2, barW, barH, 2);
fill(255);
textAlign(LEFT, CENTER);
textStyle(BOLD);
textSize(10);
text(b.count, barRightX + 7, rowY);
}
if (isHoverInfo) {
let boxW = w - 24;
let boxH = 44;
let bx = x + 12;
let by = infoY + 14;
fill(15, 18, 45, 245);
stroke(255, 200);
strokeWeight(1);
rect(bx, by, boxW, boxH, 6);
noStroke();
fill(255);
textAlign(LEFT, TOP);
textStyle(BOLD);
textSize(10.5);
text(`Totale Africa: ${dangerSites.length} siti in pericolo`, bx + 10, by + 8);
textStyle(NORMAL);
fill(210);
text(`Distribuiti in ${countryBars.length} Stati membri UNESCO`, bx + 10, by + 23);
}
pop();
return hoveredCardSite;
}
// ==========================================
// EVENTI MOUSE
// ==========================================
function mousePressed() {
if (sbMetrics &&
mouseX >= sbMetrics.x - 6 && mouseX <= sbMetrics.x + sbMetrics.w + 6 &&
mouseY >= sbMetrics.y && mouseY <= sbMetrics.y + sbMetrics.h) {
isDraggingScrollbar = true;
if (mouseY >= sbMetrics.thumbY && mouseY <= sbMetrics.thumbY + sbMetrics.thumbH) {
scrollbarDragOffset = mouseY - sbMetrics.thumbY;
} else {
scrollbarDragOffset = sbMetrics.thumbH / 2;
aggiornaScrollDaMouse();
}
return;
}
if (activeSite) {
selectedSite = (selectedSite === activeSite) ? null : activeSite;
} else {
selectedSite = null;
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
let panelW = constrain(width * 0.24, 260, 350);
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
{ val: datiArea.culturali, col: COL_CULTURALE },
{ val: datiArea.naturali,  col: COL_NATURALE },
{ val: datiArea.misti,     col: COL_MISTO }
];
let larghezzaBarra = larghezzaColonna * 0.11;
let distanzaBarre = larghezzaColonna * 0.175;
let startX = -distanzaBarre - larghezzaBarra / 2;
for (let b = 0; b < serie.length; b++) {
let hBarra = constrain(map(serie[b].val, 0, valoreMax, 0, altezzaMaxBarre), 8, altezzaMaxBarre);
let bx = startX + b * distanzaBarre;
let by = yBaseBarre - hBarra;
fill(serie[b].col);
rect(bx, by, larghezzaBarra, hBarra, larghezzaBarra / 2);
}
// Piede colonna
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
// STRUTTURA RADAR (5 ANELLI IN GRADAZIONE TENUE -> ACCESO)
// ==========================================
function drawRings() {
noFill();
drawingContext.setLineDash([12, 8]);
for (let i = 0; i < RINGS.length; i++) {
let st = RING_STYLES[i];
stroke(255, st.alpha);
strokeWeight(st.weight);
circle(cx, cy, 2 * R * RINGS[i]);
}
drawingContext.setLineDash([]);
}
function drawSpokes() {
stroke(255, 75);
strokeWeight(1.2);
drawingContext.setLineDash([8, 8]);
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