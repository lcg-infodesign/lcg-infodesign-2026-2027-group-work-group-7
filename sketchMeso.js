// Radar circolare (8 categorie inglese + 5 anelli gradazione) + Colonna Focus + Graduatoria Destra – p5.js (livello MESO)

const BG = '#0B2545';
const COL_TEMPIO = '#1e3a5c';
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

// SCALA DIMENSIONE DEI PALLINI ENFATIZZATA
const RING_DOT_SCALES = [0.58, 0.76, 0.96, 1.20, 1.48];

// 8 assi del radar con i nomi esatti in inglese dal dataset CSV
const LABELS = [
  { t: 'Armed Conflict &\nInstability', dx: 0, dy: -1.15, angle: -90, key: 'Armed Conflict & Instability' },
  { t: 'Social, Tourism &\nPollution Pressure', dx: 1.12, dy: -0.78, angle: -45, key: 'Social, Tourism & Pollution Pressure' },
  { t: 'Urban Development &\nInfrastructure', dx: 1.42, dy: 0, angle: 0, key: 'Urban Development & Infrastructure' },
  { t: 'Climate Change &\nNatural Phenomena', dx: 1.08, dy: 0.84, angle: 45, key: 'Climate Change & Natural Phenomena' },
  { t: 'Management & Institutional\nDeficiencies', dx: 0, dy: 1.18, angle: 90, key: 'Management & Institutional Deficiencies' },
  { t: 'Land Use &\nBiological Pressure', dx: -1.05, dy: 0.84, angle: 135, key: 'Land Use & Biological Pressure' },
  { t: 'Extractive Activities\n& Energy', dx: -1.38, dy: 0, angle: 180, key: 'Extractive Activities & Energy' },
  { t: 'Illegal Activities', dx: -1.02, dy: -0.76, angle: -135, key: 'Illegal Activities' },
];

let tableDataset;
let focusArea = { code: 'AFR', label: 'AFRICA', culturali: 0, naturali: 0, misti: 0 };
let dangerSites = [];
let countryBars = [];

let cx, cy, R;
let activeSite = null;
let selectedSite = null;
let lastRadarHovered = null;

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

// ESTRAZIONE E ORDINAMENTO DATI DAL CSV
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
      let rawScore = tableDataset.getString(r, 'Danger_Severity_Score').replace(',', '.'); // Sostituisce eventuali virgole con punti decimali
      let score = parseFloat(rawScore) || 3.0; //nel caso manca il punteggio, assegna un valore medio di 3.0

      let catCol = COL_CULTURALE; 
      if (cat === 'Natural') catCol = COL_NATURALE;
      else if (cat === 'Mixed') catCol = COL_MISTO;

      let ringLevel = calcolaLivelloAnello(score, urgency); // Livello anello da 0 a 4 (interno -> esterno)

      dangerSites.push({ // Oggetto per ciascun sito in pericolo
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

      let stati = country.split(','); // Alcuni siti hanno più Stati separati da virgola
      for (let s of stati) { // Conta il numero di siti in pericolo per ciascun Paese
        let st = normalizzaNomePaese(s.trim());
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

function normalizzaNomePaese(st) { //abbreviazione dei nomi di alcuni Stati per evitare che siano troppo lunghi nella graduatoria
  if (st === 'Democratic Republic of the Congo') return 'DR Congo';
  if (st === 'United Republic of Tanzania') return 'Tanzania';
  if (st === 'Central African Republic') return 'Central African Rep.';
  return st;
}

function calcolaLivelloAnello(score, urgency) {
  if (score >= 4.0 || urgency === 'Critical') return 4;     // Cerchio 5 (più esterno, più acceso)
  if (score >= 3.5 || urgency === 'High') return 3;         // Cerchio 4
  if (score >= 3.1 || urgency === 'Medium-High') return 2;  // Cerchio 3
  if (score >= 2.7 || urgency === 'Moderate') return 1;     // Cerchio 2
  return 0;                                                 // Cerchio 1 (più interno, più tenue)
}
//tutti i calcoli per posizionare i pallini sul radar in base alla macrocategoria e al livello di anello
function posizionaPuntiOrdinatiSulRadar() {// Posizionamento ad arco dei pallini sul radar, raggruppati per macrocategoria e livello di anello
  let gruppi = {};
  for (let s of dangerSites) {
    let macroKey = s.primaryMacro || 'Armed Conflict & Instability'; // Se manca la macrocategoria, assegna un valore di default
    let groupKey = `${macroKey}__${s.ringLevel}`;// Gruppo univoco per ciascuna macrocategoria e livello di anello
    if (!gruppi[groupKey]) gruppi[groupKey] = [];// Inizializza l'array se non esiste ancora
    gruppi[groupKey].push(s);// Aggiunge il sito al gruppo corrispondente
  }

  for (let groupKey in gruppi) {// Per ciascun gruppo, calcola l'angolo di base e la distribuzione ad arco dei pallini
    let [macroName, levelStr] = groupKey.split('__');
    let level = parseInt(levelStr, 10);// Livello di anello da 0 a 4
    let labelObj = LABELS.find(l => l.key.toLowerCase() === macroName.toLowerCase());// Trova l'oggetto label corrispondente alla macrocategoria
    let baseAngle = labelObj ? labelObj.angle : -90;

    let lista = gruppi[groupKey];
    lista.sort((a, b) => a.name.localeCompare(b.name));

    let n = lista.length;// Numero di pallini nel gruppo
    let maxSpread = map(level, 0, 4, 24, 34);
    let stepAngle = map(level, 0, 4, 11.0, 8.2);
    let spread = min(maxSpread, (n - 1) * stepAngle);// Spread totale dell'arco per il gruppo, limitato a un massimo in base al livello di anello

    for (let i = 0; i < n; i++) {//ciclo per calcolare l'angolo di ciascun pallino nel gruppo, distribuito ad arco attorno all'angolo di base della macrocategoria
      let offset = n === 1 ? 0 : map(i, 0, n - 1, -spread / 2, spread / 2);// Offset angolare per ciascun pallino, distribuito simmetricamente attorno all'angolo di base
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

  // 1. COLONNA FOCUS (Sinistra)
  let colW = constrain(width * 0.11, 115, 165);
  let colH = height * 0.76;
  let colX = width * 0.11;
  let colY = (height - colH) / 2;
  disegnaColonnaFocus(colX, colY, colW, colH, focusArea);

  // 2. RADAR MESO (Centro)
  cx = width * 0.44;
  cy = height / 2;
  R = min(width * 0.18, height * 0.28);

  drawSpokes();
  drawRings();
  drawLabels();

  // Controllo hover sul radar
  let hoveredFromRadar = checkDotsHover();

  // 3. PANNELLO DESTRO
  let panelW = constrain(width * 0.25, 275, 365);
  let panelX = width - panelW - 28;
  let panelTop = height * 0.06;
  let panelTotalH = height * 0.88;
  let listH = panelTotalH * 0.58 - 78;

  // Scorre la lista solo nel momento in cui il mouse entra su un nuovo pallino del radar
  if (hoveredFromRadar && hoveredFromRadar !== lastRadarHovered) {
    scorriFinoASito(hoveredFromRadar, listH);
  }
  lastRadarHovered = hoveredFromRadar;

  // Controllo hover sulla lista (solo se non stiamo già puntando un pallino sul radar)
  let hoveredFromList = hoveredFromRadar ? null : checkListHover(panelX, panelTop, panelW, panelTotalH);

  // Stato attivo finale: priorità a hover radar -> hover lista -> eventuale selezione da click
  activeSite = hoveredFromRadar || hoveredFromList || selectedSite;

  disegnaPannelloDestro(panelX, panelTop, panelW, panelTotalH);
  drawDots();

  if (isDraggingScrollbar) {
    cursor('grabbing');
  } else {
    cursor(hoveredFromRadar || hoveredFromList ? HAND : ARROW);
  }
}


// CONTROLLO HOVER SEPARATO (RADAR E LISTA)

function checkDotsHover() {// Controlla se il mouse è sopra un pallino del radar
  if (isDraggingScrollbar) return null;// Non controlla l'hover se stiamo trascinando la scrollbar
  const baseD = R * 0.092;// Diametro base del pallino (scala proporzionale al raggio del radar)
  for (const p of dangerSites) {
    const a = radians(p.a);
    const px = cx + cos(a) * R * p.r;// Coordinate X del pallino sul radar
    const py = cy + sin(a) * R * p.r;// Coordinate Y del pallino sul radar
    const dotD = baseD * RING_DOT_SCALES[p.ringLevel];// Diametro effettivo del pallino in base al livello di anello

    if (dist(mouseX, mouseY, px, py) <= dotD / 2) {// Controlla se il mouse è dentro il cerchio del pallino
      return p;
    }
  }
  return null;
}

function checkListHover(x, y, w, totalH) {// Controlla se il mouse è sopra un elemento della lista graduatoria
  if (isDraggingScrollbar) return null;
  let redCardH = totalH * 0.58;
  let listY = y + 66;
  let listH = redCardH - 78;
  let cardItemH = 64;
  let cardGap = 10;
  let cardsW = w - 38;

  if (mouseX < x + 16 || mouseX > x + 16 + cardsW || mouseY < listY || mouseY > listY + listH) {// Controlla se il mouse è dentro l'area della lista
    return null;// Se il mouse è fuori dall'area della lista, non c'è hover
  }

  for (let i = 0; i < dangerSites.length; i++) {// Controlla ciascun elemento della lista per vedere se il mouse è sopra di esso
let itemY = listY + i * (cardItemH + cardGap) - scrollSites;// Calcola la posizione Y dell'elemento della lista in base allo scroll
if (mouseY >= itemY && mouseY <= itemY + cardItemH) {// Controlla se il mouse è dentro l'elemento della lista
return dangerSites[i];
}
}
return null;
}
function drawDots() {
const baseD = R * 0.092;// Diametro base del pallino (scala proporzionale al raggio del radar)
for (const p of dangerSites) {
const a = radians(p.a);
const px = cx + cos(a) * R * p.r;// Coordinate X del pallino sul radar
const py = cy + sin(a) * R * p.r;// Coordinate Y del pallino sul radar
const dotD = baseD * RING_DOT_SCALES[p.ringLevel];// Diametro effettivo del pallino in base al livello di anello
const isHighlighted = activeSite === p;// Controlla se il pallino è attivo (hover o selezionato)
if (isHighlighted) {// Disegna il pallino evidenziato con un bordo bianco più spesso e leggermente più grande
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
function scorriFinoASito(site, listH) {// Scorre la lista graduatoria fino a portare in vista il sito selezionato
let idx = dangerSites.indexOf(site);
if (idx === -1) return;// Se il sito non è trovato, esce dalla funzione
let cardItemH = 64;
let cardGap = 10;
let targetY = idx * (cardItemH + cardGap);// Calcola la posizione Y del sito nella lista graduatoria
if (targetY < scrollSites || targetY + cardItemH > scrollSites + listH) {// Controlla se il sito è fuori dalla vista corrente della lista
scrollSites = targetY - listH / 2 + cardItemH / 2;// Aggiorna lo scroll per centrare il sito nella vista della lista
}
}

// PANNELLO DESTRO (GRADUATORIA SITES IN DANGER + GRAFICO)

function disegnaPannelloDestro(x, y, w, totalH) {
let gap = 16;
let redCardH = totalH * 0.58;
let chartBoxH = totalH - redCardH - gap;
// A. RIQUADRO SUPERIORE ("Graduatoria Sites in Danger")
push();
fill(255, 10);
stroke(255, 80);
strokeWeight(1.2);
rect(x, y, w, redCardH, 14);
noStroke();
fill(255);
textAlign(LEFT, TOP);
textStyle(BOLD);
textSize(34);
text(dangerSites.length, x + 20, y + 14);
textSize(17);
text('Sites in Danger', x + 66, y + 18);
textStyle(NORMAL);
textSize(10.5);
fill(210);
text('Graduatoria per indice di gravità (Score)', x + 66, y + 39);
let listY = y + 66;// Posizione Y della lista graduatoria
let listH = redCardH - 78;// Altezza disponibile per la lista graduatoria
let cardItemH = 64;
let cardGap = 10;
let sbW = 7;// Larghezza barra di scorrimento
let sbX = x + w - 16;
let cardsW = w - 38;
let contentH = max(0, dangerSites.length * (cardItemH + cardGap) - cardGap);// Altezza totale del contenuto della lista graduatoria
let maxScroll = max(0, contentH - listH);// Altezza massima dello scroll (quando il contenuto è più alto della lista)
scrollSites = constrain(scrollSites, 0, maxScroll);
drawingContext.save();// Salva lo stato del contesto di disegno per applicare il clipping alla lista graduatoria
drawingContext.beginPath();// Inizia un nuovo percorso per il clipping, il clippung è necessario per evitare che i contenuti della lista escano dai bordi del riquadro
drawingContext.rect(x + 14, listY, cardsW + 4, listH);// Definisce il rettangolo di clipping per la lista graduatoria
drawingContext.clip();// Applica il clipping al contesto di disegno
for (let i = 0; i < dangerSites.length; i++) {// Ciclo per disegnare ciascun elemento della lista graduatoria
let site = dangerSites[i];
let itemY = listY + i * (cardItemH + cardGap) - scrollSites;
let isCardActive = (activeSite === site);
// Sfondo card con il colore del proprio pallino sul radar
let cDot = color(site.dotCol);
if (isCardActive) {
fill(red(cDot), green(cDot), blue(cDot), 235);
stroke(255);
strokeWeight(2);
} else {
fill(red(cDot), green(cDot), blue(cDot), 155);
stroke(red(cDot), green(cDot), blue(cDot), 230);
strokeWeight(1);
}
rect(x + 16, itemY, cardsW, cardItemH, 9);
// Badge posizione in graduatoria (#1, #2, #3...)
let badgeX = x + 36;
let badgeY = itemY + cardItemH / 2;
fill(site.dotCol);
stroke(255, 200);
strokeWeight(1.4);
circle(badgeX, badgeY, 28);
noStroke();
fill(255);
textAlign(CENTER, CENTER);
textStyle(BOLD);
textSize(12);
text(`#${site.rank}`, badgeX, badgeY + 0.5);// Centra verticalmente il testo del badge
// Blocco testo centrale
let textX = x + 58;
let textMaxW = cardsW - 50;
textAlign(LEFT, CENTER);
fill(255);
textStyle(BOLD);
textSize(11.8);
textLeading(13.5);
text(site.name, textX, itemY + 21, textMaxW);
let subY = itemY + 46;// Posizione Y del sottotitolo (Paese + Score)
fill(site.catCol);
circle(textX + 4, subY, 8);
fill(245);
textStyle(NORMAL);
textSize(10.5);
text(`${site.country}  •  Score ${site.score.toFixed(2)}`, textX + 13, subY);// Centra verticalmente il testo del sottotitolo
}
drawingContext.restore();
// Barra di scorrimento verticale
if (maxScroll > 0) {
fill(255, 30);
rect(sbX, listY, sbW, listH, sbW / 2);
let thumbH = max(28, listH * (listH / contentH));// Altezza minima della thumb della scrollbar
let scrollRatio = scrollSites / maxScroll;// Rapporto tra lo scroll corrente e lo scroll massimo
let thumbY = listY + scrollRatio * (listH - thumbH);
sbMetrics = { x: sbX, y: listY, w: sbW, h: listH, thumbY, thumbH, maxScroll };// Salva le metriche della scrollbar per l'interazione con il mouse
let isHoverThumb = mouseX >= sbX - 4 && mouseX <= sbX + sbW + 4 &&// Controlla se il mouse è sopra la thumb della scrollbar
mouseY >= thumbY && mouseY <= thumbY + thumbH;// Controlla se il mouse è sopra la thumb della scrollbar
fill(isHoverThumb || isDraggingScrollbar ? 255 : color(255, 180));
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
let infoY = cyBox + 21;
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
let barsTop = cyBox + 42;
let barsAvailH = chartBoxH - 50;
let nBars = max(1, countryBars.length);
let rowH = barsAvailH / nBars;
let maxVal = countryBars.length > 0 ? Math.max(...countryBars.map(c => c.count)) : 5; // Valore massimo per scalare le barre
let barRightX = x + w - 28;
let maxBarW = w - 155;
let activeCountries = activeSite
? activeSite.country.split(',').map(s => normalizzaNomePaese(s.trim()))
: [];
for (let i = 0; i < countryBars.length; i++) {// Ciclo per disegnare ciascuna barra della graduatoria dei Paesi
let b = countryBars[i];
let rowY = barsTop + i * rowH + rowH / 2;
let barW = map(b.count, 0, maxVal, 14, maxBarW);
let barH = min(11, rowH * 0.55);
let isMatch = activeCountries.includes(b.country);// Controlla se il Paese della barra corrisponde a uno dei Paesi del sito attivo (hover o selezione)
let alphaRow = activeSite ? (isMatch ? 255 : 55) : 225;// Opacità della riga in base allo stato attivo (hover o selezione)
noStroke();
fill(255, alphaRow);
textAlign(LEFT, CENTER);
textStyle(isMatch ? BOLD : NORMAL);
textSize(10);
text(b.country, x + 16, rowY);
fill(240, alphaRow);
rect(barRightX - barW, rowY - barH / 2, barW, barH, 2);
fill(255, alphaRow);
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
}

// EVENTI MOUSE

function mousePressed() {
if (sbMetrics &&
mouseX >= sbMetrics.x - 6 && mouseX <= sbMetrics.x + sbMetrics.w + 6 &&// Controlla se il mouse è sopra la scrollbar (con un margine di 6px)
mouseY >= sbMetrics.y && mouseY <= sbMetrics.y + sbMetrics.h) {// Controlla se il mouse è dentro l'area della scrollbar
isDraggingScrollbar = true;// Inizia il trascinamento della scrollbar
if (mouseY >= sbMetrics.thumbY && mouseY <= sbMetrics.thumbY + sbMetrics.thumbH) {// Controlla se il mouse è sopra la thumb della scrollbar
scrollbarDragOffset = mouseY - sbMetrics.thumbY;
} else {
scrollbarDragOffset = sbMetrics.thumbH / 2;
aggiornaScrollDaMouse();
}
return;
}
let hoveredDot = checkDotsHover();
let panelW = constrain(width * 0.25, 275, 365);
let panelX = width - panelW - 28;
let panelTop = height * 0.06;
let panelTotalH = height * 0.88;
let hoveredCard = checkListHover(panelX, panelTop, panelW, panelTotalH);// Controlla se il mouse è sopra un elemento della lista graduatoria
let clickedSite = hoveredDot || hoveredCard;
if (clickedSite) {
selectedSite = (selectedSite === clickedSite) ? null : clickedSite;
} else {
selectedSite = null;
}
}
function mouseDragged() {
if (isDraggingScrollbar && sbMetrics) {// Se stiamo trascinando la scrollbar, aggiorna lo scroll in base alla posizione del mouse
aggiornaScrollDaMouse();
}
}
function mouseReleased() {
isDraggingScrollbar = false;// Termina il trascinamento della scrollbar
}
function aggiornaScrollDaMouse() {// Aggiorna la posizione dello scroll in base alla posizione del mouse durante il trascinamento della scrollbar
if (!sbMetrics) return;
let trackTravel = sbMetrics.h - sbMetrics.thumbH;
if (trackTravel <= 0) return;
let newThumbY = constrain(mouseY - scrollbarDragOffset, sbMetrics.y, sbMetrics.y + trackTravel);
let ratio = (newThumbY - sbMetrics.y) / trackTravel;
scrollSites = ratio * sbMetrics.maxScroll;
}
function mouseWheel(event) {// Controlla se il mouse è sopra il pannello destro (lista graduatoria) per consentire lo scroll con la rotellina del mouse
let panelW = constrain(width * 0.25, 275, 365);
let panelX = width - panelW - 28;
if (mouseX >= panelX && mouseX <= panelX + panelW) {
scrollSites += event.delta * 0.5;
return false;
}
}

// COLONNA FOCUS A SINISTRA

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

// STRUTTURA RADAR (5 ANELLI IN GRADAZIONE TENUE -> ACCESO)

function drawRings() {
noFill();
drawingContext.setLineDash([14, 10]);
for (let i = 0; i < RINGS.length; i++) {// Ciclo per disegnare ciascun anello del radar
let st = RING_STYLES[i];
stroke(255, st.alpha);
strokeWeight(st.weight);
circle(cx, cy, 2 * R * RINGS[i]);// Disegna il cerchio con il raggio corretto in base al livello di anello
}
drawingContext.setLineDash([]);
}
function drawSpokes() {
stroke(255, 75);
strokeWeight(1.2);
drawingContext.setLineDash([10, 10]);
for (let i = 0; i < 8; i++) {// Disegna 8 raggi a 45° l'uno dall'altro
const a = radians(i * 45);// Angolo in radianti per ciascun raggio
line(cx, cy, cx + cos(a) * R * 1.02, cy + sin(a) * R * 1.02);// Estende leggermente i raggi oltre il cerchio più esterno
}
drawingContext.setLineDash([]);
}
function drawLabels() {// Disegna le etichette delle macrocategorie attorno al radar
noStroke();
fill(255);
textAlign(CENTER, CENTER);
textSize(max(10, R * 0.054));
textLeading(max(12, R * 0.064));
for (const l of LABELS) text(l.t, cx + l.dx * R, cy + l.dy * R);// Disegna ciascuna etichetta in base alle coordinate relative al centro del radar
}