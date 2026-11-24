// VARIABILI GLOBALI UTILI
  // Tempio
    // Coordinate di partenza 
      let marginiVerticali;
      let marginiOrizzontali;
      let xInizioTempio;
      let yInizioTempio;

      let larghezzaTempio;
      let altezzaTempio;
      let larghezzaMaxTempio = 1000; // dimensione massima su schermi grandi
      let altezzaMaxTempio = 680;

    // Colori palette Tempio
      let coloreSfondo = "#0B2545";
      let coloreTempioChiaro = "#3b587b";
      let coloreTempioScuro = "rgb(20, 31, 43)";
    
    //Variabili dati
      let fontFutura;
      let datiSitoUnesco;

      let datiMacro = [
        { code: 'EUR', label: 'EUROPA', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
        { code: 'NA',  label: 'NORD AMERICA', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
        { code: 'APA', label: 'ASIA E PACIFICO', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
        { code: 'LAC', label: 'AMERICA LATINA', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
        { code: 'AFR', label: 'AFRICA', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
        { code: 'ARB', label: 'STATI ARABI', culturali: 0, naturali: 0, misti: 0, culturaliPericolo: 0, naturaliPericolo: 0, mistiPericolo: 0 },
      ];

// AGGIORNAMENTO SPAZI
function aggiornaCentraggioTempio() {
  let margineMinimo = 20;
// max => prende il numero più grande di quelli presenti.
// Adatta il tempio allo spazio disponibile mantenendo le proporzioni (~1300:800)
  let rapporto = 1300 / 800;
  let dispW = max(240, windowWidth - margineMinimo * 2);
  let dispH = max(200, windowHeight - margineMinimo * 2);

  larghezzaTempio = min(larghezzaMaxTempio, dispW, dispH * rapporto);
  altezzaTempio = larghezzaTempio / rapporto;

  marginiOrizzontali = (windowWidth - larghezzaTempio) / 2;
  marginiVerticali = (windowHeight - altezzaTempio) / 2;

  xInizioTempio = marginiOrizzontali;
  yInizioTempio = marginiVerticali;
}

// SETUP
  async function setup() {
  createCanvas(windowWidth, windowHeight);
  aggiornaCentraggioTempio();
  datiSitoUnesco = await loadTable ('assets/dataset.csv', ',', 'header');
 
  fontFutura = await loadFont ('assets/Futura Bold.otf');
  textFont(fontFutura);

  for (let r = 0; r < datiSitoUnesco.getRowCount(); r++) {
    let codiceArea = datiSitoUnesco.getString(r, 'Region_Code');
    let categoria  = datiSitoUnesco.getString(r, 'Category');
    let dangerRaw  = datiSitoUnesco.getString(r, 'Danger');
    let inPericolo = dangerRaw && dangerRaw.trim().toUpperCase() === 'TRUE';

  //ciclo per dividere i siti per categorie e per i siti in pericolo
  for (let i = 0; i < datiMacro.length; i++) {
    if (datiMacro[i].code === codiceArea) {
      if (categoria === 'Cultural') {
        datiMacro[i].culturali++;
        if (inPericolo) datiMacro[i].culturaliPericolo++;
      } else if (categoria === 'Natural') {
        datiMacro[i].naturali++;
        if (inPericolo) datiMacro[i].naturaliPericolo++;
      } else if (categoria === 'Mixed') {
        datiMacro[i].misti++;
        if (inPericolo) datiMacro[i].mistiPericolo++;
      }
    }
  }
}
}

// AGGIORNAMENTO E RIDIMENSIONAMENTO
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  aggiornaCentraggioTempio();
}

// RIASSUNTO FUNZIONI CHE DISEGNAMO
function draw () {
  background (coloreSfondo);
  
  // Variabili del Tempio
    let altezzaFrontone = altezzaTempio * 0.25;
    let spessoreBase = max(16, altezzaTempio * 0.03);
    let distanzaFrontoneColonne = max(6, altezzaTempio * 0.0125);     
    let altezzaColonne = altezzaTempio - altezzaFrontone - spessoreBase - distanzaFrontoneColonne;
    
    let yInizioColonne = yInizioTempio + altezzaFrontone + distanzaFrontoneColonne;
    let yInizioBase = yInizioColonne + altezzaColonne;
    let yFineBase = yInizioBase + spessoreBase;

  // Triangolo in alto
  disegnaFrontone (
    xInizioTempio,
    yInizioTempio,
    larghezzaTempio,
    altezzaFrontone
  );

  // ultima fascia in basso
  disegnaBase (
    xInizioTempio,
    yInizioBase,
    larghezzaTempio,
    spessoreBase
  );

  // Dentro c'è la funzione che crea la singola colonna
  disegnaColonne (
    xInizioTempio,
    yInizioColonne,
    larghezzaTempio,
    altezzaColonne,
    yInizioBase,
    spessoreBase
  );
  
}
// 1. DISEGNA FRONTONE
function disegnaFrontone (xInizioTempio, yInizioTempio,larghezzaTempio, altezzaFrontone) {
  push ();
    noStroke ();
    fill (coloreTempioChiaro);

    let xCentro = xInizioTempio + larghezzaTempio / 2;
    let angoloGradi = 12; // Inclinazione verso il basso ai lati
    let angoloRad = radians(angoloGradi);

    let spessoreFascia = max(10, altezzaFrontone * 0.125);
    let distanzaTraFasce = altezzaFrontone * 0.225;

    // Larghezza orizzontale finale (pk l'inclinazione rende il rettangolo più corto)
    let lunghezzaBraccio = (larghezzaTempio / 2) / cos(angoloRad);

    // Punta che si crea con l'inclinazione)
    let yPunta1 = yInizioTempio;
    let yPunta2 = yPunta1 + distanzaTraFasce;

    // FASCIA SUPERIORE
      // Lato sinistro: parte da xCentro e scende verso sinistra (-angoloRad)
      push();
      translate(xCentro, yPunta1); // ci spostiamo al centro, dove c'è la punta.
      rotate(-angoloRad); // ruoto per dare l'inclinazione
      rect(-lunghezzaBraccio, 0, lunghezzaBraccio, spessoreFascia); // parte dalla - lunghezza braccio fino al centro, larghezza e altezza.
      pop();

      // Lato destro: parte da xCentro e scende verso destra (+angoloRad)
      push();
      translate(xCentro, yPunta1);
      rotate(angoloRad);
      rect(0, 0, lunghezzaBraccio, spessoreFascia);
      pop();

    // FASCIA INFERIORE
    // Lato sinistro
      push();
      translate(xCentro, yPunta2);
      rotate(-angoloRad);
      rect(-lunghezzaBraccio, 0, lunghezzaBraccio, spessoreFascia);
      pop();

      // Lato destro
      push();
      translate(xCentro, yPunta2);
      rotate(angoloRad);
      rect(0, 0, lunghezzaBraccio, spessoreFascia);
      pop();

      // Taglio orizzontale (per fare il frontone come nel logo)
      let spostamentoTaglioOrizzontale = altezzaFrontone * 0.60;
      let yTgalioOrizzontale = yPunta2 + spostamentoTaglioOrizzontale
      let AltezzaRettangoloTaglio = altezzaFrontone;

      push ();
      noStroke ();
      fill (coloreSfondo);
      rect (xInizioTempio,yTgalioOrizzontale,larghezzaTempio, AltezzaRettangoloTaglio)
      pop ();

    // FASCIA ORIZZONTALE
      push();
      rectMode(CENTER);
      translate(xCentro, yPunta1 + altezzaFrontone);
      rect(0, 0, larghezzaTempio - 10, spessoreFascia);
      pop();

    pop();
}

// 2. IMPOSTA LA DISPOSIZIONE DELLE COLONNE
function disegnaColonne ( xInizioTempio, yInizioColonne, larghezzaTempio, altezzaColonne, yInizioBase, spessoreBase) {
  push ();
  noStroke ();

    let numeroColonne = datiMacro.length;
    let larghezzaColonna = larghezzaTempio * (160 / 1300);
    let margineLato = larghezzaTempio * (20 / 1300);

    // spazio tra una colonna e un'altra, sulla base della grandezza totale del Tempio
    // max => prende il numero più grande di quelli presenti.
    let larghezzaUtileColonne = max(0, larghezzaTempio - 2 * margineLato);
    let spazioTotaleColonne = numeroColonne * larghezzaColonna;

    let spazioResiduoTotale = max(0, larghezzaUtileColonne - spazioTotaleColonne); // Imporre 0 impedisce che lo spazio tra le colonne sia negativo (così non si sovrappongono).
    let distanzaTraColonne = spazioResiduoTotale / (numeroColonne - 1);

    // Ciclo for per disegnare le 6 colonne
    for (let i = 0; i < numeroColonne; i++){
      let ColonnaEDistanza = larghezzaColonna + distanzaTraColonne;
      let xColSinistra = (xInizioTempio + margineLato) + i * ColonnaEDistanza; // disegna all'inizio del Tempio
      let xCentroColonna = xColSinistra + larghezzaColonna / 2; //trova il centro orizzzontale 

    push ();
    // Porta l'origine (0, 0) sul centro in alto di ogni colonna
      translate(xCentroColonna, yInizioColonne);
      disegnaColonna (larghezzaColonna, altezzaColonne, yInizioBase - yInizioColonne, datiMacro[i], spessoreBase);
    pop();
  }
  pop ();
}

// 3. DISEGNA LA SINGOLA COLONNA
// (centrata su x = 0, parte da y = 0; perchè abbiamo fatto il traslate)
function disegnaColonna (larghezzaColonna, altezzaColonne, altezzaDisponibile, datiArea, spessoreBase) {
  push ();
  rectMode (CORNER);
  noStroke ();
    // Altezza totale disponibile fino alla base del tempio (o altezzaColonne)
    // max => prende il numero più grande di quelli presenti.
    let altezzaTotale = max(80, altezzaDisponibile);

    // Suddivisione verticale interna della colonna
    let altezzaCapitello = altezzaTotale * 0.105;
    let altezzaPiede = altezzaTotale * 0.063;
    let distanzaPiedeBase = max(4, altezzaTotale * 0.02);
    let distanzaFrontoneColonne = max(4, altezzaTotale * 0.02);

    let larghezzaCapitello = larghezzaColonna * 1.1;

    let yInizioFusto = altezzaCapitello + 10;
    let yFineFusto = altezzaTotale - distanzaPiedeBase - altezzaPiede;

    // 3.1 CAPITELLO COLONNA
      // formato da 5 parti (abacoAlto, abacoBasso, Corpo, FasceOrizzontali, CollarinoFusto)
      push ();
        noStroke ();
        fill (coloreTempioChiaro);

        // 3.1.1 abacoAlto (con estremi leggermente inclinati)
          let hAbacoAlto = altezzaCapitello * 0.24;
          let wAltoSopra = larghezzaCapitello * 0.88; // bordo superiore leggermente più stretto
          let wAltoSotto = larghezzaCapitello * 0.96; // base leggermente più ampia
          let yAbacoAlto = 0 + distanzaFrontoneColonne;

          quad(
            -wAltoSopra / 2, yAbacoAlto,                   // alto-sinistra
            wAltoSopra / 2, yAbacoAlto,                    // alto-destra
            wAltoSotto / 2, yAbacoAlto + hAbacoAlto,       // basso-destra
            -wAltoSotto / 2, yAbacoAlto + hAbacoAlto       // basso-sinistra
          );

        // 3.1.2 abacoBasso (fascia sottile subito sotto, separata da un piccolo stacco)
          let spazioStacco = max(1.5, altezzaCapitello * 0.06); // piccola riga/stacco orizzontale come nell'immagine
          let yAbacoBasso = yAbacoAlto + hAbacoAlto + spazioStacco;
          let hAbacoBasso = altezzaCapitello * 0.24;
          let wBassoSopra = larghezzaCapitello * 0.96;
          let wBassoSotto = larghezzaCapitello * 0.88;

          quad(
            -wBassoSopra / 2, yAbacoBasso,                // alto-sinistra
            wBassoSopra / 2, yAbacoBasso,                 // alto-destra
            wBassoSotto / 2, yAbacoBasso + hAbacoBasso,   // basso-destra
            -wBassoSotto / 2, yAbacoBasso + hAbacoBasso   // basso-sinistra
          );

        // 3.1.3 Corpo (parte centrale del capitello)
          let hCollarino = altezzaCapitello * 0.12;
          let yCorpo = yAbacoBasso + hAbacoBasso + spazioStacco;
          // Arriva fino a poco sopra il collarino, rispettando altezzaCapitello
          let yFineCorpo = max(yCorpo + 16, yInizioFusto - hCollarino);
          let hCorpo = yFineCorpo - yCorpo;

          let wCorpoSopra = max(10, wBassoSotto - larghezzaColonna * 0.06);
          let wCorpoSotto = larghezzaColonna * 0.60;
          let yMeta = yCorpo + hCorpo * 0.5;
          let wMeta = (wCorpoSopra + wCorpoSotto) * 0.45; // leggermente più stretto a metà per dare la curva

          fill(coloreTempioChiaro);
          // per creare una forma con i lati "curvilinei" devo usare una beginShape
          beginShape();
            // Lato destro (dall'alto verso il basso)
            vertex(-wCorpoSopra / 2, yCorpo);
            vertex( wCorpoSopra / 2, yCorpo);
            vertex( wMeta / 2, yMeta);
            vertex( wCorpoSotto / 2, yFineCorpo);

            // Lato sinistro (dal basso verso l'alto)
            vertex(-wCorpoSotto / 2, yFineCorpo);
            vertex(-wMeta / 2, yMeta);
          endShape(CLOSE);

        // 3.1.4 FasceOrizzontali
          push ();
          noStroke();
          fill(coloreSfondo);
          let hFascia = spazioStacco;
          let wFascia = (wCorpoSopra + wCorpoSotto) / 2;
          rect(-wFascia / 2, yCorpo + hCorpo * 0.35, wFascia, hFascia);
          pop ();

        // 3.1.5 Collarino Fusto (fascia finale che chiude il capitello)
          let wCollarino = max(8, wFascia - larghezzaColonna * 0.09);
          let yCollarino = yFineCorpo + spazioStacco;
          rect(-wCollarino / 2, yCollarino, wCollarino, hCollarino);
      pop ();

    // 3.2 FUSTO COLONNA
      push ();
        stroke(coloreTempioChiaro);
        let spessoreLineaFusto = max(1.5, larghezzaColonna * 0.01875);
        strokeWeight(spessoreLineaFusto);

        let numeroLinee = 6;
        let larghezzaFasciaLinee = larghezzaColonna / 2;
        let xInizioFusto = -larghezzaFasciaLinee / 2;
        let spazioTraLinee = larghezzaFasciaLinee / (numeroLinee - 1);

        // ciclo for che disegna tutte le linee
        for (let j = 0; j < numeroLinee; j++) {
          let xLinea = xInizioFusto + j * spazioTraLinee;
          line(xLinea, yInizioFusto + spazioStacco, xLinea, yFineFusto + 3);
        }
      pop ();

    //BARRE DATI
      push();
        noStroke();
        rectMode (CORNER);

        let valoreMax = 500; // Valore di riferimento massimo sulla scala dei dati: Il numero massimo di siti corrispondono all'altezza massima disponibile
        // Calcola l'altezza massima che può raggiungere una barra lungo il fusto:
        // prende la distanza tra la base delle linee (yFineFusto + 3) e il loro inizio alto (yInizioFusto + spazioStacco),
        let altezzaMaxBarre = max(10, (yFineFusto + 3) - (yInizioFusto + spazioStacco));
        
        let serie = [
        { val: datiArea.culturali, pericolo: datiArea.culturaliPericolo, col: '#EBBF44' },
        { val: datiArea.naturali,  pericolo: datiArea.naturaliPericolo,  col: '#B8DD62' },
        { val: datiArea.misti,     pericolo: datiArea.mistiPericolo,     col: '#65DAE3' }
      ];

        // Spazi centrali tra le linee: indici 1, 2 e 3 (su 5 spazi totali tra 6 linee)
        let colorePericolo = '#ff1500';
        let indiciSpaziCentrali = [1, 2, 3];
        let larghezzaBarra = max(2, spazioTraLinee - 3); // larghezza tra una linea e l'altra (tolto lo spessore linea)

        for (let b = 0; b < serie.length; b++) {
          let hBarra = map(serie[b].val, 0, valoreMax, 0, altezzaMaxBarre);
          hBarra = constrain(hBarra, 4, altezzaMaxBarre);

          let hPericolo = 0;
          if (serie[b].pericolo > 0) {
            hPericolo = map(serie[b].pericolo, 0, valoreMax, 0, altezzaMaxBarre);
            hPericolo = constrain(hPericolo, 3, hBarra);
          }

          let indiceSpazio = indiciSpaziCentrali[b];
          let xBarra = xInizioFusto + indiceSpazio * spazioTraLinee + 1.5;
          let yBaseBarra = yFineFusto + 4 - hBarra;

          // Stesso raggio leggero per la cima di tutte le barre (massimo 3px)
          let raggioAlto = min(3, larghezzaBarra * 0.25);
          // Raggio specifico per le barre 
          let raggioAltoBarra = min(raggioAlto, hBarra / 2);
          let raggioAltoRosso = min(raggioAlto, hPericolo / 2);

          if (hPericolo > 0) {
            // Parte inferiore/principale della categoria (dove appoggia il rosso)
            fill(serie[b].col);
            rect(xBarra, yBaseBarra, larghezzaBarra, hBarra, raggioAlto, raggioAlto, 0, 0);

            // Segmento rosso in pericolo sopra la barra (arrotondato solo in alto)
            fill(colorePericolo);
            rect(xBarra, yBaseBarra, larghezzaBarra, hPericolo, raggioAltoRosso, raggioAltoRosso, 0, 0);
          } else {
            // Nessun sito in pericolo: barra arrotondata solo in alto
            fill(serie[b].col);
            rect(xBarra, yBaseBarra, larghezzaBarra, hBarra, raggioAltoBarra, raggioAltoBarra, 0, 0);
          }
        }
      pop();


    // 3.3 PIEDE COLONNA
      push ();
        noStroke();
        fill(coloreTempioChiaro);

        let staccoPiede = 3;
        let y0 = yFineFusto; 
        let hUtilePiede = max(12, altezzaPiede - staccoPiede * 3);

        // 1. Gradino orizzontale
        let y1 = y0 + hUtilePiede * 0.20 + staccoPiede;
        let h1 = hUtilePiede * 0.2;
        let w1 = larghezzaColonna * 0.60;
        rect(-w1 / 2, y1 - staccoPiede , w1, 6);

        // 2. Tratto trapezoidale inclinato verso l'esterno
        let y2 = y1 + h1 + staccoPiede;
        let h2 = hUtilePiede * 0.34;
        let w2Sopra = w1 * 0.92;
        let w2Sotto = larghezzaCapitello * 0.80;
        quad(
          -w2Sopra / 2, y2,
           w2Sopra / 2, y2,
           w2Sotto / 2, y2 + h2,
          -w2Sotto / 2, y2 + h2
        );

        // 3. Base finale del piede
        let y3 = y2 + h2 + staccoPiede;
        let w3 = larghezzaCapitello * 0.84;
        rect(-w3 / 2, y3, w3, hUtilePiede * 0.20);
       pop ();
  pop ();

  push();
      textFont(fontFutura);
      fill('#FDF0D6');
      textAlign(CENTER, CENTER);
      textSize(max(9, larghezzaColonna * 0.075));
      text(datiArea.label, 0, altezzaTotale + spessoreBase / 2);
  pop();
}


// 3. DISEGNA BASE 
function disegnaBase (xInizioTempio, yInizioBase,larghezzaTempio, spessoreBase) {
  push ();
    noStroke ();
    fill (coloreTempioChiaro);
    let spessoreFascia = 25;
    // FASCIA ORIZZONTALE
      rect(xInizioTempio, yInizioBase, larghezzaTempio, spessoreBase);
  pop();
}