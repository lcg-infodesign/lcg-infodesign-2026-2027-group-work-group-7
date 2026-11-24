
// configurazione
let percorsoDati = "assets/UNESCO_dataset.csv";
let centroLon = 17;
let centroLat = 0;
let zoomSito = 4.5;
let velocita = 0.08;
let larghPannello = 525;
let altPannello = 470;

let dati;
let numSiti;
let contornoAfrica;

let selezionato = -1;
let sitoPannello = 0;
let camLon = centroLon;
let camLat = centroLat;
let camScala;
let scalaBase;
let pannello = 0;

let cx;
let cy;
let panelX;
let panelY;
let panelS;

// colonne del dataset UNESCO
let colNome = "Name";
let colPaese = "States_Parties";
let colAnno = "Year_Inscription";
let colCategoria = "Category";
let colDescrizione = "Short_Description";
let colCause = "Danger_Justification";
let colCoordinate = "Geo_Point_2D";

function preload() {
  dati = loadTable(percorsoDati, "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont("sans-serif");

  numSiti = dati.getRowCount();
  scalaBase = height / 80;
  camScala = scalaBase;

  // sagoma semplificata Africa
  contornoAfrica = [
    [-5.9, 35.8], [-2, 35.1], [3, 36.8], [10, 37.3], [11, 35], [10.2, 33.5],
    [15, 32.3], [20, 32.2], [20, 30.9], [25, 31.6], [32, 31.3], [32.5, 30],
    [33.5, 27.5], [35.5, 24], [37.2, 21], [37.4, 18.5], [39.5, 15.5],
    [43.1, 12.7], [44.5, 10.4], [51.2, 11.8], [49.5, 6], [47, 3], [43.5, -1],
    [41.5, -2.5], [39.5, -5], [39.2, -7], [40.5, -11], [40.6, -15],
    [36.5, -19], [35, -22], [35.5, -24], [32.9, -26], [32.5, -28.5],
    [30, -31.5], [27, -33.5], [22, -34.2], [18.5, -34.2], [17.5, -31],
    [15, -27], [14.5, -22.5], [11.8, -17], [13.5, -12], [12.3, -6], [9, -1],
    [9.5, 3.5], [6, 4.3], [2.5, 6.3], [-2, 4.8], [-7.5, 4.4], [-11, 6.8],
    [-13.5, 9.5], [-17.5, 14.7], [-16.5, 19], [-17, 21], [-15, 26.5],
    [-10, 29], [-9.8, 31], [-8, 34]
  ];
}

// lettura longitudine dal campo Geo_Point_2D
function leggiLon(riga) {
  let coordinate = dati.getString(riga, colCoordinate).split(",");
  return float(coordinate[1]);
}

// lettura latitudine dal campo Geo_Point_2D
function leggiLat(riga) {
  let coordinate = dati.getString(riga, colCoordinate).split(",");
  return float(coordinate[0]);
}

function draw() {
  background(245);

  let obLon = centroLon;
  let obLat = centroLat;
  let obScala = scalaBase;
  let obPannello = 0;

  if (selezionato >= 0) {
    sitoPannello = selezionato;
    obLon = leggiLon(selezionato);
    obLat = leggiLat(selezionato);
    obScala = scalaBase * zoomSito;
    obPannello = 1;
  }

  // easing indipendente dal frame rate
  let k = 1 - pow(1 - velocita, deltaTime / 16.67);
  camLon = lerp(camLon, obLon, k);
  camLat = lerp(camLat, obLat, k);
  camScala = lerp(camScala, obScala, k);
  pannello = lerp(pannello, obPannello, k);

  panelS = min(width * 0.4 / larghPannello, height * 0.68 / altPannello);
  panelX = lerp(width, width * 0.96 - larghPannello * panelS, pannello);
  panelY = height * 0.14;
  cx = lerp(width * 0.5, (width * 0.96 - larghPannello * panelS) * 0.5, pannello);
  cy = height * 0.5;

  disegnaMappa();
  disegnaSiti();

  if (pannello > 0.01) {
    disegnaPannello();
  }
}

function schermoX(lon) {
  return cx + (lon - camLon) * camScala;
}

function schermoY(lat) {
  return cy - (lat - camLat) * camScala;
}

function disegnaMappa() {
  noStroke();
  fill(74, 133, 96);
  beginShape();
  for (let i = 0; i < contornoAfrica.length; i++) {
    vertex(schermoX(contornoAfrica[i][0]), schermoY(contornoAfrica[i][1]));
  }
  endShape(CLOSE);
}

function disegnaSiti() {
  noStroke();

  for (let numRiga = 0; numRiga < numSiti; numRiga++) {
    let x = schermoX(leggiLon(numRiga));
    let y = schermoY(leggiLat(numRiga));

    if (numRiga === selezionato) {
      fill(251, 176, 64);
      triangle(x, y - 18, x - 18, y + 14, x + 18, y + 14);
    } else {
      fill(224, 58, 47);
      circle(x, y, 12);
    }
  }
}

function chip(testo, y, r, g, b) {
  fill(r, g, b);
  rect(257, y, 92, 22, 11);
  fill(30);
  textAlign(CENTER, CENTER);
  textSize(10);
  text(testo, 303, y + 11);
  textAlign(LEFT, TOP);
}

function disegnaPannello() {
  let nome = dati.getString(sitoPannello, colNome);
  let paese = dati.getString(sitoPannello, colPaese);
  let anno = dati.getString(sitoPannello, colAnno);
  let categoria = dati.getString(sitoPannello, colCategoria);
  let descrizione = dati.getString(sitoPannello, colDescrizione);
  let cause = dati.getString(sitoPannello, colCause);

  push();
  translate(panelX, panelY);
  scale(panelS);
  noStroke();

  fill(130, 36, 29);
  rect(0, 0, larghPannello, altPannello);

  // pulsante indietro
  fill(245);
  circle(30, 26, 16);
  fill(60);
  textAlign(CENTER, CENTER);
  textSize(10);
  text("<", 30, 25);

  // titolo
  fill(0);
  textAlign(LEFT, TOP);
  textSize(30);
  textLeading(32);
  text(nome, 24, 52, larghPannello - 48, 70);

  // scheda
  fill(243, 230, 216);
  rect(16, 120, larghPannello - 32, 334, 18);

  // immagine segnaposto
  fill(188, 172, 157);
  rect(52, 140, 185, 175, 18);

  chip(paese, 140, 205, 190, 175);
  chip(anno, 170, 205, 190, 175);
  chip(categoria, 200, 251, 176, 64);

  fill(30);
  textSize(11);
  textLeading(13);
  text(descrizione, 44, 335, larghPannello - 88, 56);

  if (cause && cause.length > 0) {
    fill(205, 190, 175);
    rect(36, 392, larghPannello - 72, 44, 12);
    fill(30);
    textSize(10);
    textLeading(12);
    text("CAUSE: " + cause, 46, 398, larghPannello - 92, 34);
  }

  // frecce e contatore
  fill(90, 60, 50);
  triangle(30, 126, 25, 134, 35, 134);
  triangle(25, 440, 35, 440, 30, 448);
  textAlign(RIGHT, BOTTOM);
  textSize(10);
  text((sitoPannello + 1) + " / " + numSiti, larghPannello - 30, 450);

  pop();
  textAlign(LEFT, TOP);
}

function cambiaSito(passo) {
  selezionato = (selezionato + passo + numSiti) % numSiti;
}

function mousePressed() {
  if (selezionato >= 0) {
    let lx = (mouseX - panelX) / panelS;
    let ly = (mouseY - panelY) / panelS;

    if (lx >= 0 && lx <= larghPannello && ly >= 0 && ly <= altPannello) {
      if (dist(lx, ly, 30, 26) < 14) {
        selezionato = -1;
      } else if (dist(lx, ly, 30, 130) < 14) {
        cambiaSito(-1);
      } else if (dist(lx, ly, 30, 444) < 14) {
        cambiaSito(1);
      }
      return;
    }
  }

  for (let numRiga = 0; numRiga < numSiti; numRiga++) {
    let dx = mouseX - schermoX(leggiLon(numRiga));
    let dy = mouseY - schermoY(leggiLat(numRiga));

    if (dx * dx + dy * dy < 196) {
      selezionato = numRiga;
      return;
    }
  }
}

function keyPressed() {
  if (selezionato < 0) {
    return;
  }

  if (keyCode === UP_ARROW) {
    cambiaSito(-1);
  } else if (keyCode === DOWN_ARROW) {
    cambiaSito(1);
  } else if (keyCode === ESCAPE) {
    selezionato = -1;
  }
}

function windowResized() {
  let vecchiaScala = scalaBase;
  resizeCanvas(windowWidth, windowHeight);
  scalaBase = height / 80;
  camScala = camScala * scalaBase / vecchiaScala;
}
