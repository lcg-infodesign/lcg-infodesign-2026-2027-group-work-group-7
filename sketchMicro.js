
let percorsoDati = "assets/dataset.csv";

// colonne del dataset
let colonnaImmagine = "Image";
let colonnaTesto = "Short_Description";
let colonnaStato = "States_Parties";
let colonnaCategoria = "Category";
let colonnaLivello = "Danger_Severity_Score";
let colonnaEtichetta = "Danger_Urgency_Label";

// mappa
let linkMappa = "https://www.google.com/maps?q=0,20&z=3&hl=en&output=embed";

// misure del progetto
let larghDesign = 1250;
let altDesign = 663;
let larghTesto = 240;
let altTesto = 176;
let interlinea = 16;

// layout mobile
let sogliaMobile = 700;
let altezzaMobile = 1660;

// riferimento viewport mobile
let larghMobile = 390;
let altViewportMobile = 844;

// colori
let coloreSfondoDestra = [31, 38, 66];
let coloreSfondoSinistra = [68, 75, 108];
let coloreFoto = [90, 98, 130];
let coloreTesto = [245, 238, 228];
let coloreAccento = [233, 86, 74];
let coloreSpento = [72, 80, 112];
let coloreLinee = [110, 118, 150];
let colorePollice = [240, 236, 230];

// gruppi di cause
let categorieCause = [
  { nome: "Armed Conflicts\n& Instability", voci: ["War", "Civil unrest", "Deliberate destruction of heritage", "Military training"] },
  { nome: "Urban\nDevelopment &\nInfrastructure", voci: ["Housing", "Commercial development", "Ground transport infrastructure", "Water infrastructure", "Major visitor accommodation and associated infrastructure", "Localised utilities", "Effects arising from use of transportation infrastructure", "Major linear utilities", "Interpretative and visitation facilities"] },
  { nome: "Illegal Activities", voci: ["Illegal activities"] },
  { nome: "Land Use &\nBiological Pressure", voci: ["Land conversion", "Livestock farming / grazing of domesticated animals", "Forestry /wood production", "Crop production", "Fishing/collecting aquatic resources", "Commercial hunting", "Invasive/alien terrestrial species", "Invasive / alien freshwater species"] },
  { nome: "Climate Change &\nNatural Phenomena", voci: ["Flooding", "Erosion and siltation/ deposition", "Desertification", "Earthquake", "Storms", "Water (rain/water table)", "Relative humidity", "Other climate change impacts", "Changes to oceanic waters", "Fire (widlfires)"] },
  { nome: "Management &\nInstitutional\nDeficiencies", voci: ["Management systems/ management plan", "Legal framework", "Financial resources", "Human resources", "Management activities", "Governance", "High impact research / monitoring activities"] },
  { nome: "Extractive\nActivities & Energy", voci: ["Mining", "Oil and gas", "Quarrying", "Renewable energy facilities"] },
  { nome: "Social Pressure,\nTourism & Pollution", voci: ["Identity, social cohesion, changes in local population and community", "Changes in traditional ways of life and knowledge system", "Society's valuing of heritage", "Impacts of tourism / visitor / recreation", "Surface water pollution", "Solid waste"] }
];

let dati;
let pronto = false;

// navigazione
let righePericolo = [];
let indiceSitoCorrente = 0;
let frecciaPrecedente;
let frecciaSuccessiva;

// dati del sito
let nome;
let paese;
let etichettaCategoria;
let coloreCategoria;
let annoInizio;
let annoPericolo;
let annoFine;
let titoloSize;
let canvasPagina;
let imgFoto;
let pgTesto;
let iframeMappa;
let maxScorrimento;
let scorrimento = 0;
let coloriCause = [];
let livello;
let etichettaLivello;

// responsive
let layoutMobile = false;
let scalaX = 1;
let scalaY = 1;


// CARICAMENTO CSV
function preload() {
  dati = loadTable(percorsoDati, ",", "header");
}


// SETUP
async function setup() {

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflowX = "hidden";
  document.body.style.background = "rgb(18,18,18)";

  document.body.style.overflowY = "hidden";

  layoutMobile = windowWidth < sogliaMobile;

  let altezzaCanvas = layoutMobile
    ? altezzaMobile * (windowHeight / altViewportMobile)
    : windowHeight;

  canvasPagina = createCanvas(windowWidth, altezzaCanvas);

  canvasPagina.position(0, 0);
  canvasPagina.style("display", "block");

  textFont("futura-pt, sans-serif");

  if (dati === undefined) {
    dati = await loadTable(percorsoDati, ",", "header");
  }

  // raccolta di tutti i siti in pericolo
  righePericolo = [];

  for (let i = 0; i < dati.getRowCount(); i++) {

    if (
      dati.getString(i, "Danger").trim().toUpperCase() === "TRUE"
    ) {
      righePericolo.push(i);
    }
  }

  // ricerca del sito
  let numRiga = trovaRiga(getURLParams().id);

  indiceSitoCorrente = righePericolo.indexOf(numRiga);

  if (indiceSitoCorrente < 0) {
    indiceSitoCorrente = 0;
  }

  // dati del sito
  nome = dati.getString(numRiga, "Name");
  paese = dati.getString(numRiga, colonnaStato);

  annoInizio = parseInt(
    dati.getString(numRiga, "Year_Inscription")
  );

  annoPericolo = parseInt(
    dati.getString(numRiga, "Danger_Year").replace("Y ", "")
  );

  annoFine = year();

  titoloSize = nome.length > 45 ? 40 : 58;

  // categoria
  let categoria = dati.getString(numRiga, colonnaCategoria);

  etichettaCategoria = "Cultural Site";
  coloreCategoria = [240, 170, 70];

  if (categoria === "Natural") {

    etichettaCategoria = "Natural Site";
    coloreCategoria = [178, 222, 94];

  } else if (categoria === "Mixed") {

    etichettaCategoria = "Mixed Site";
    coloreCategoria = [150, 170, 240];
  }

  // cause
  let minacce = dati.getString(numRiga, "Danger_Threats").split(";");

  let conteggi = [];
  let massimo = 0;
  let principale;

  for (let i = 0; i < categorieCause.length; i++) {

    let n = 0;

    for (let j = 0; j < categorieCause[i].voci.length; j++) {

      if (minacce.includes(categorieCause[i].voci[j])) {
        n++;
      }
    }

    conteggi.push(n);

    if (n > massimo) {
      massimo = n;
      principale = i;
    }
  }

  // colori dei gruppi
  coloriCause = [];

  for (let i = 0; i < categorieCause.length; i++) {

    let colore = coloreSpento;

    if (i === principale) {
      colore = coloreAccento;
    } else if (conteggi[i] > 0) {
      colore = coloreTesto;
    }

    coloriCause.push(colore);
  }

  // livello di pericolo
  livello = parseFloat(
    dati.getString(numRiga, colonnaLivello).replace(",", ".")
  );

  if (isNaN(livello)) {
    livello = 0;
  }

  livello = constrain(livello, 0, 5);

  etichettaLivello = dati.getString(numRiga, colonnaEtichetta);

  // descrizione
  textSize(11);

  let righe = spezzaTesto(
    dati.getString(numRiga, colonnaTesto).replace(/\s+/g, " "),
    larghTesto
  );

  maxScorrimento = max(
    0,
    righe.length * interlinea - altTesto
  );

  pgTesto = createGraphics(
    larghTesto,
    max(altTesto, righe.length * interlinea)
  );

  pgTesto.textFont("sans-serif");
  pgTesto.textSize(11);
  pgTesto.textAlign(LEFT, TOP);
  pgTesto.fill(coloreTesto);

  for (let i = 0; i < righe.length; i++) {
    pgTesto.text(righe[i], 0, i * interlinea);
  }

  // mappa
  iframeMappa = createElement("iframe");

  iframeMappa.attribute("src", linkMappa);
  iframeMappa.attribute("title", "Mappa di " + nome);

  iframeMappa.style("border", "0");

  // fotografia
  let urlImmagine = dati.getString(numRiga, colonnaImmagine);

  if (urlImmagine !== "") {

    imgFoto = createImg(urlImmagine, "Foto di " + nome);

    imgFoto.attribute("referrerpolicy", "no-referrer");
    imgFoto.style("object-fit", "cover");

    imgFoto.elt.onerror = function () {
      imgFoto.hide();
    };
  }

  pronto = true;

  aggiornaImpaginazione();

  creaFrecceNavigazione();
}


// RICERCA DEL SITO
function trovaRiga(idScelto) {

  for (let i = 0; i < righePericolo.length; i++) {

    let numRiga = righePericolo[i];

    if (
      idScelto !== undefined &&
      dati.getString(numRiga, "ID") === idScelto
    ) {
      return numRiga;
    }
  }

  return righePericolo.length > 0
    ? righePericolo[0]
    : 0;
}


// CREAZIONE FRECCE
function creaFrecceNavigazione() {

  if (righePericolo.length <= 1) return;

  frecciaPrecedente = createButton("‹");
  frecciaSuccessiva = createButton("›");

  // stile comune
  let frecce = [frecciaPrecedente, frecciaSuccessiva];

  for (let i = 0; i < frecce.length; i++) {

    frecce[i].style("position", "fixed");
    frecce[i].style("width", "clamp(36px, 4vw, 56px)");
    frecce[i].style("height", "clamp(44px, 7vh, 64px)");

    frecce[i].style("background", "rgba(31,38,66,0.9)");
    frecce[i].style("color", "rgb(245,238,228)");
    frecce[i].style("border", "1px solid rgb(110,118,150)");
    frecce[i].style("border-radius", "8px");

    frecce[i].style("font-size", "clamp(26px, 3vw, 42px)");
    frecce[i].style("cursor", "pointer");
    frecce[i].style("z-index", "1000");
    frecce[i].style("padding", "0");
    frecce[i].style("line-height", "1");
    frecce[i].style("transform", "translateY(-50%)");
  }

  // posizione relativa alla viewport
  frecciaPrecedente.style("left", "1vw");
  frecciaPrecedente.style("top", "50vh");

  frecciaSuccessiva.style("right", "1vw");
  frecciaSuccessiva.style("top", "50vh");

  frecciaPrecedente.mousePressed(function () {
    navigaSito(-1);
  });

  frecciaSuccessiva.mousePressed(function () {
    navigaSito(1);
  });
}


// NAVIGAZIONE
function navigaSito(direzione) {

  if (righePericolo.length === 0) return;

  indiceSitoCorrente += direzione;

  if (indiceSitoCorrente < 0) {
    indiceSitoCorrente = righePericolo.length - 1;
  }

  if (indiceSitoCorrente >= righePericolo.length) {
    indiceSitoCorrente = 0;
  }

  let nuovaRiga = righePericolo[indiceSitoCorrente];

  let nuovoID = dati.getString(nuovaRiga, "ID");

  let nuovoIndirizzo = new URL(window.location.href);

  nuovoIndirizzo.searchParams.set("id", nuovoID);

  window.location.href = nuovoIndirizzo.toString();
}


// SUDDIVISIONE TESTO
function spezzaTesto(testo, larghezza) {

  let parole = testo.split(" ");
  let righe = [];
  let corrente = "";

  for (let i = 0; i < parole.length; i++) {

    let prova = corrente === ""
      ? parole[i]
      : corrente + " " + parole[i];

    if (textWidth(prova) > larghezza && corrente !== "") {

      righe.push(corrente);
      corrente = parole[i];

    } else {

      corrente = prova;
    }
  }

  righe.push(corrente);

  return righe;
}


// POSIZIONE FOTO
function posizionaFoto() {

  if (imgFoto === undefined) return;

  if (layoutMobile) {

    imgFoto.position(0, 0);

    imgFoto.size(
      windowWidth,
      230 * scalaY
    );

  } else {

    imgFoto.position(0, 0);

    imgFoto.size(
      399 * scalaX,
      330 * scalaY
    );
  }
}


// POSIZIONE MAPPA
function posizionaMappa() {

  if (layoutMobile) {

    iframeMappa.position(
      12 * scalaX,
      1270 * scalaY
    );

    iframeMappa.size(
      (larghMobile - 24) * scalaX,
      300 * scalaY
    );

  } else {

    iframeMappa.position(
      911 * scalaX,
      247 * scalaY
    );

    iframeMappa.size(
      268 * scalaX,
      364 * scalaY
    );
  }
}


// AGGIORNAMENTO IMPAGINAZIONE
function aggiornaImpaginazione() {

  if (layoutMobile) {

    scalaX = windowWidth / larghMobile;
    scalaY = windowHeight / altViewportMobile;

  } else {

    scalaX = windowWidth / larghDesign;
    scalaY = windowHeight / altDesign;
  }

  if (pronto) {

    posizionaFoto();
    posizionaMappa();
  }
}


// DISEGNO PRINCIPALE
function draw() {

  background(18);

  if (!pronto) return;

  push();

  if (layoutMobile) {

    scale(scalaX, scalaY);

    disegnaLayoutMobile();

  } else {

    scale(scalaX, scalaY);

    translate(0, -34);

    disegnaSfondi();
    disegnaFoto();
    disegnaDescrizione();
    disegnaTimeline();
    disegnaTitolo();
    disegnaLivello();
    disegnaCause();
    disegnaCorniceMappa();
  }

  pop();
}


// SFONDI
function disegnaSfondi() {

  noStroke();

  fill(coloreSfondoDestra);
  rect(399, 34, 851, 663);

  fill(coloreSfondoSinistra);
  rect(0, 364, 399, 333);
}


// SFONDO FOTO
function disegnaFoto() {

  fill(coloreFoto);
  rect(0, 34, 399, 330);
}


// DESCRIZIONE
function disegnaDescrizione() {

  let h = min(altTesto, pgTesto.height);

  image(
    pgTesto,
    67, 420,
    larghTesto, h,
    0, scorrimento,
    larghTesto, h
  );

  // binario
  fill(coloreLinee);
  rect(331, 420, 12, altTesto, 6);

  // cursore
  let altPollice = max(
    24,
    altTesto * altTesto / pgTesto.height
  );

  let yPollice = maxScorrimento > 0
    ? lerp(
        420,
        420 + altTesto - altPollice,
        scorrimento / maxScorrimento
      )
    : 420;

  fill(colorePollice);
  rect(331, yPollice, 12, altPollice, 6);
}


// TIMELINE
function disegnaTimeline() {

  let frazione = constrain(
    (annoPericolo - annoInizio) /
    max(1, annoFine - annoInizio),
    0,
    1
  );

  let xMezzo = lerp(41, 363, frazione);

  noStroke();

  fill(coloreTesto);
  rect(41, 651, xMezzo - 41, 8, 4);

  fill(coloreAccento);
  rect(xMezzo, 651, 363 - xMezzo, 8, 4);

  textSize(12);
  textAlign(LEFT, CENTER);
  fill(coloreTesto);

  if (frazione > 0.12) {
    text(annoInizio, 41, 673);
  }

  if (frazione < 0.88) {
    textAlign(RIGHT, CENTER);
    text(annoFine, 363, 673);
  }

  textAlign(CENTER, CENTER);
  fill(coloreAccento);
  text(annoPericolo, xMezzo, 673);
}


// TITOLO E INFORMAZIONI
function disegnaTitolo() {

  // indicatore paese
  fill(coloreTesto);

  circle(439, 66, 15);
  triangle(432, 70, 446, 70, 439, 86);

  fill(coloreSfondoDestra);
  circle(439, 66, 6);

  // paese
  fill(coloreTesto);
  textAlign(LEFT, CENTER);
  textSize(21);
  text(paese, 460, 71);

  // categoria
  fill(coloreCategoria);
  circle(636, 71, 24);

  fill(coloreTesto);
  text(etichettaCategoria, 654, 71);

  // nome sito
  textAlign(LEFT, TOP);
  textStyle(BOLD);

  textSize(titoloSize);
  textLeading(titoloSize);

  text(nome, 432, 100, 790, 140);

  textStyle(NORMAL);

  // linea
  stroke(coloreLinee);
  line(431, 250, 1212, 250);

  noStroke();
}


// LIVELLO DI PERICOLO
function disegnaLivello() {

  fill(coloreTesto);
  textAlign(LEFT, CENTER);
  textSize(15);

  text("Danger Level:", 432, 288);

  let xValore = 432 + textWidth("Danger Level: ");

  fill(coloreAccento);
  textStyle(BOLD);
  textSize(22);

  text(etichettaLivello, xValore, 287);

  textStyle(NORMAL);

  // cinque triangoli
  for (let i = 0; i < 5; i++) {

    let x = 453 + i * 70;

    if (i < round(livello)) {

      noStroke();
      fill(coloreAccento);

    } else {

      noFill();
      stroke(coloreAccento);
      strokeWeight(2);
    }

    triangle(
      x, 323,
      x - 22, 363,
      x + 22, 363
    );
  }

  noStroke();
  strokeWeight(1);

  fill(coloreAccento);
  textSize(9);

  text(livello.toFixed(2) + " / 5", 776, 358);
}


// OTTO GRUPPI DI CAUSE
function disegnaCause() {

  fill(coloreAccento);
  textAlign(LEFT, CENTER);
  textSize(22);

  text("Main Causes of Danger", 432, 425);

  for (let i = 0; i < categorieCause.length; i++) {

    let x = 457 + (i % 4) * 104;
    let y = 485 + floor(i / 4) * 111;

    // quadrato
    fill(coloriCause[i]);

    rect(
      x - 27,
      y - 27,
      54,
      54,
      10
    );

    // numero
    fill(coloreSfondoDestra);

    textAlign(CENTER, CENTER);
    textSize(22);

    text(i + 1, x, y);

    // nome
    fill(coloriCause[i]);

    textAlign(CENTER, TOP);
    textSize(9);
    textLeading(11);

    text(
      categorieCause[i].nome,
      x,
      y + 40
    );
  }
}


// CORNICE MAPPA
function disegnaCorniceMappa() {

  noStroke();

  fill(coloreSfondoSinistra);

  rect(905, 275, 280, 376);
}


// LAYOUT MOBILE
function disegnaLayoutMobile() {

  // larghezza logica mobile
  let w = larghMobile;
  let margine = 24;

  // sfondo
  background(coloreSfondoDestra);

  fill(coloreSfondoSinistra);
  rect(0, 230, w, 1430);

  fill(coloreSfondoDestra);
  rect(0, 230, w, 370);

  // paese
  fill(coloreTesto);

  textAlign(LEFT, CENTER);
  textSize(14);

  text(paese, margine, 260);

  // categoria
  fill(coloreCategoria);

  circle(margine + 7, 291, 14);

  fill(coloreTesto);
  textSize(14);

  text(etichettaCategoria, margine + 22, 291);

  // titolo
  fill(coloreTesto);

  textAlign(LEFT, TOP);
  textStyle(BOLD);

  let dimensioneTitolo = w < 380 ? 27 : 32;

  textSize(dimensioneTitolo);
  textLeading(dimensioneTitolo + 2);

  text(
    nome,
    margine,
    320,
    w - margine * 2,
    125
  );

  textStyle(NORMAL);

  // linea
  stroke(coloreLinee);

  line(
    margine,
    455,
    w - margine,
    455
  );

  noStroke();

  // timeline
  let frazione = constrain(
    (annoPericolo - annoInizio) /
    max(1, annoFine - annoInizio),
    0,
    1
  );

  let xInizio = margine;
  let xFine = w - margine;

  let xPericolo = lerp(
    xInizio,
    xFine,
    frazione
  );

  fill(coloreTesto);
  rect(xInizio, 485, xPericolo - xInizio, 7, 4);

  fill(coloreAccento);
  rect(xPericolo, 485, xFine - xPericolo, 7, 4);

  textSize(11);

  fill(coloreTesto);
  textAlign(LEFT, TOP);
  text(annoInizio, xInizio, 500);

  textAlign(RIGHT, TOP);
  text(annoFine, xFine, 500);

  textAlign(CENTER, TOP);
  fill(coloreAccento);
  text(annoPericolo, xPericolo, 500);

  // descrizione
  fill(coloreTesto);

  textAlign(LEFT, CENTER);
  textSize(18);

  text("Description", margine, 565);

  let larghezzaDescrizione = w - margine * 2 - 18;

  let h = min(
    altTesto,
    pgTesto.height
  );

  image(
    pgTesto,
    margine, 610,
    larghezzaDescrizione, h,
    0, scorrimento,
    larghTesto, h
  );

  // barra scorrimento
  fill(coloreLinee);

  rect(
    w - margine - 10,
    610,
    10,
    altTesto,
    5
  );

  let altPollice = max(
    24,
    altTesto * altTesto / pgTesto.height
  );

  let yPollice = maxScorrimento > 0
    ? lerp(
        610,
        610 + altTesto - altPollice,
        scorrimento / maxScorrimento
      )
    : 610;

  fill(colorePollice);

  rect(
    w - margine - 10,
    yPollice,
    10,
    altPollice,
    5
  );

  // livello di pericolo
  fill(coloreTesto);

  textAlign(LEFT, CENTER);
  textSize(17);

  text("Danger Level:", margine, 830);

  fill(coloreAccento);

  textStyle(BOLD);
  textSize(18);

  text(etichettaLivello, margine + 116, 830);

  textStyle(NORMAL);

  // triangoli
  let spazio = (w - margine * 2) / 5;

  for (let i = 0; i < 5; i++) {

    let x = margine + spazio * (i + 0.5);

    if (i < round(livello)) {

      noStroke();
      fill(coloreAccento);

    } else {

      noFill();
      stroke(coloreAccento);
      strokeWeight(2);
    }

    triangle(
      x, 865,
      x - 17, 897,
      x + 17, 897
    );
  }

  noStroke();

  fill(coloreAccento);

  textAlign(RIGHT, CENTER);
  textSize(10);

  text(
    livello.toFixed(2) + " / 5",
    w - margine,
    910
  );

  // gruppi di cause
  fill(coloreAccento);

  textAlign(LEFT, CENTER);
  textSize(19);

  text(
    "Main Causes of Danger",
    margine,
    955
  );

  let colonna = (w - margine * 2) / 2;

  for (let i = 0; i < categorieCause.length; i++) {

    let x = margine + colonna * (i % 2 + 0.5);

    let y = 1015 + floor(i / 2) * 62;

    // quadrato
    fill(coloriCause[i]);

    rect(
      x - 20,
      y - 20,
      40,
      40,
      8
    );

    // numero
    fill(coloreSfondoDestra);

    textAlign(CENTER, CENTER);
    textSize(18);

    text(i + 1, x, y);

    // nome
    fill(coloriCause[i]);

    textAlign(LEFT, CENTER);
    textSize(9);
    textLeading(11);

    text(
      categorieCause[i].nome.replace(/\n/g, " "),
      x - colonna / 2 + 46,
      y - 14,
      colonna - 50,
      32
    );
  }

  // mappa
  fill(coloreSfondoSinistra);

  rect(
    12,
    1260,
    w - 24,
    320
  );

  fill(coloreTesto);

  textAlign(LEFT, CENTER);
  textSize(17);

  text("Location", margine, 1235);
}


// COORDINATE DEL MOUSE
function xPagina() {

  return mouseX / scalaX;
}


function yPagina() {

  if (layoutMobile) {
    return mouseY / scalaY;
  }

  return mouseY / scalaY + 34;
}


// SCORRIMENTO DESCRIZIONE
function mouseWheel(evento) {

  if (!pronto) return;

  let x0 = layoutMobile ? 24 : 67;

  let x1 = layoutMobile
    ? larghMobile - 24
    : 343;

  let y0 = layoutMobile ? 610 : 420;

  let x = xPagina();
  let y = yPagina();

  if (
    x > x0 &&
    x < x1 &&
    y > y0 &&
    y < y0 + altTesto
  ) {

    scorrimento = constrain(
      scorrimento + evento.delta * 0.5 / scalaY,
      0,
      maxScorrimento
    );

    return false;
  }
}


// RIDIMENSIONAMENTO FINESTRA
function windowResized() {

  layoutMobile = windowWidth < sogliaMobile;

  let altezzaCanvas = layoutMobile
    ? altezzaMobile * (windowHeight / altViewportMobile)
    : windowHeight;

  resizeCanvas(
    windowWidth,
    altezzaCanvas
  );

  aggiornaImpaginazione();

  document.body.style.overflowX = "hidden";

  document.body.style.overflowY = layoutMobile
    ? "auto"
    : "hidden";
}