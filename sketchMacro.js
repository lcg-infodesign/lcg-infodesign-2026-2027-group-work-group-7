// VARIABILI GLOBALI UTILI
  // Tempio
    // Coordinate di partenza 
      let marginiVerticali;
      let marginiOrizzontali;
      let xInizioTempio;
      let yInizioTempio;

      let larghezzaTempio = 1300;
      let altezzaTempio = 800;

    // Colori palette Tempio
      let coloreSfondo = "#0B2545";
      let coloreTempioChiaro = "#1e3a5c";
      let coloreTempioScuro = "rgb(20, 31, 43)";
    
    //Variabili dati
      let datiSitoUnesco;

// AGGIORNAMENTO SPAZI
function aggiornaCentraggioTempio() {
// max => prende il numero più grande di quelli presenti.
// Margine sinistro e destro uguali (minimo 20px se la finestra è stretta)
  marginiOrizzontali = max(20, (windowWidth - larghezzaTempio) / 2);

  // Margine alto e basso uguali (minimo 20px se la finestra è bassa)
  marginiVerticali = max(20, (windowHeight - altezzaTempio) / 2);

  xInizioTempio = marginiOrizzontali;
  yInizioTempio = marginiVerticali;
}

// SETUP
  async function setup() {
  createCanvas(windowWidth, windowHeight);
  aggiornaCentraggioTempio();
  datiSitoUnesco = await loadTable ('assets/dataset.csv', ',', 'header');
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
    let altezzaFrontone = 200;
    let spessoreBase = 25;
    let distanzaFrontoneColonne = 10
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

  // Dentro c'è la funzione che crea la singola colonna
  disegnaColonne (
    xInizioTempio,
    yInizioColonne,
    larghezzaTempio,
    altezzaColonne,
    yInizioBase
  );
  
  // ultima fascia in basso
  disegnaBase (
    xInizioTempio,
    yInizioBase,
    larghezzaTempio,
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

    let spessoreFascia = 25;
    let distanzaTraFasce = 45;

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
      let spostamentoTaglioOrizzontale = 120;
      let yTgalioOrizzontale = yPunta2 + spostamentoTaglioOrizzontale
      let AltezzaRettangoloTaglio = 200;

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
function disegnaColonne ( xInizioTempio, yInizioColonne, larghezzaTempio, altezzaColonne, yInizioBase) {
  push ();
  noStroke ();

    let numeroColonne = 6;
    let larghezzaColonna = 160;
    let margineLato = 20; // rientro uguale a sinistra e a destra rispetto al tempio

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
      disegnaColonna (larghezzaColonna, altezzaColonne, yInizioBase - yInizioColonne);
    pop();
  }
  pop ();
}

// 3. DISEGNA LA SINGOLA COLONNA
// (centrata su x = 0, parte da y = 0; perchè abbiamo fatto il traslate)
function disegnaColonna (larghezzaColonna, altezzaColonne, altezzaDisponibile) {
  push ();
  rectMode (CORNER);
  noStroke ();
    // Altezza totale disponibile fino alla base del tempio (o altezzaColonne)
    // max => prende il numero più grande di quelli presenti.
    let altezzaTotale = max(80, altezzaDisponibile);

    // Suddivisione verticale interna della colonna
    let altezzaCapitello = 50;
    let altezzaPiede = 30;
    let distanzaPiedeBase = 10;
    let distanzaFrontoneColonne = 10

    let larghezzaCapitello = larghezzaColonna * 1.1;

    let yInizioFusto = altezzaCapitello + 10;
    let yFineFusto = altezzaTotale - distanzaPiedeBase - altezzaPiede;

    // 3.1 CAPITELLO COLONNA
      // formato da 5 parti (abacoAlto, abacoBasso, Corpo, FasceOrizzontali, CollarinoFusto)
      push ();
        noStroke ();
        fill (coloreTempioChiaro);

        // 3.1.1 abacoAlto (con estremi leggermente inclinati)
          let hAbacoAlto = 12;
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
          let spazioStacco = 3; // piccola riga/stacco orizzontale come nell'immagine
          let yAbacoBasso = yAbacoAlto + hAbacoAlto + spazioStacco;
          let hAbacoBasso = 12;
          let wBassoSopra = larghezzaCapitello * 0.96;
          let wBassoSotto = larghezzaCapitello * 0.88;

          quad(
            -wBassoSopra / 2, yAbacoBasso,                // alto-sinistra
            wBassoSopra / 2, yAbacoBasso,                 // alto-destra
            wBassoSotto / 2, yAbacoBasso + hAbacoBasso,   // basso-destra
            -wBassoSotto / 2, yAbacoBasso + hAbacoBasso   // basso-sinistra
          );

        // 3.1.3 Corpo (parte centrale del capitello)
          let hCollarino = 6;
          let yCorpo = yAbacoBasso + hAbacoBasso + spazioStacco;
          // Arriva fino a poco sopra il collarino, rispettando altezzaCapitello
          let yFineCorpo = max(yCorpo + 16, yInizioFusto - hCollarino);
          let hCorpo = yFineCorpo - yCorpo;

          let wCorpoSopra = wBassoSotto - 10;
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
          let wCollarino = wFascia - 15;
          let yCollarino = yFineCorpo + spazioStacco;
          rect(-wCollarino / 2, yCollarino, wCollarino, hCollarino);
      pop ();

    // 3.2 FUSTO COLONNA
      push ();
        stroke(coloreTempioChiaro);
        strokeWeight(3);

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
        rect(-w3 / 2, y3, w3, 6);
       pop ();
  pop ();
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