let imgFrontone;
let imgBaseColonna;
let imgGradinate;

let datiMacro = [
  {code: 'EUR', label: 'EUROPA & NORTH AMERICA', culturali:0, naturali: 0, misti:0},
  {code: 'APA', label: 'ASIA', culturali:0, naturali: 0, misti:0},
  {code: 'LAC', label: 'AMERICA LATINA', culturali:0, naturali: 0, misti:0},
  {code: 'AFR', label: 'AFRICA', culturali:0, naturali: 0, misti:0},
  {code: 'ARB', label: 'STATI ARABI', culturali:0, naturali: 0, misti:0},
]

async function setup() {
  createCanvas(windowWidth, windowHeight);

  imgFrontone = await loadImage ('assets/frontone.png');
  imgBaseColonna = await loadImage('assets/base_colonna.png');
  imgGradinate = await loadImage('assets/gradinate.png');

  table = await loadTable ('assets/UNESCO_dataset.csv', ',', 'header');
  
  // il primo ciclo serve per fargli leggere le righe del database 
  // il secondo ciclo per catalogare il sito nella categoria
  for (let r=0; r < table.getRowCount(); r++) {
    let codiceArea = table.getString (r, 'Region_Code');
    let categoria = table.getString (r, 'Category');
  

  for (let i=0; i < datiMacro.length; i++) {
    if (datiMacro[i].code === codiceArea) {
      if(categoria === 'Cultural'){
        datiMacro[i].culturali++;
      } else if (categoria === 'Natural') {
        datiMacro[i].naturali++;
      } else if (categoria === 'Mixed'){
        datiMacro[i].misti++;
      }
    }
  }
}

  console.log(datiMacro);

}

function draw() {
  background('#FDF0D6');
  let margineSx = width * 0.12;
  let margineDx = width *0.82;
  let larghezzaTempio = margineDx -margineSx;

  let yTetto = height * 0.22;
  let yZero = height * 0.72;

  image(imgFrontone, margineSx -70, height *0.002, larghezzaTempio+140, height *0.9);
  image(imgGradinate, margineSx - 125, yZero-230, larghezzaTempio+250, 600);

  let larghezzaCorsia = larghezzaTempio / datiMacro.length;
  let valoreMax = 500;

  // ciclo per farlo fare per ogni colonna
  for (let i=0; i < datiMacro.length; i++) {
    let centroX = margineSx + larghezzaCorsia * (i+0.5);

    image (imgBaseColonna, centroX - 90, yZero+10, 180, 190);
  
    // i siti che nel ciclo di prima vengono catalogati qui ricevono un colore per la categoria
  let serie = [
    {val: datiMacro[i].culturali, col: '#106789'},
    {val: datiMacro[i].naturali, col: '#129348'},
    {val: datiMacro[i].misti, col: '#C12126'}
  ];

  let startX = centroX - 27;

  noStroke();
  for(let b=0; b< serie.length; b++) {
    // per decidere l'altezza della barra guarda la somma dei siti
    let altezzaBarra = map(serie[b].val, 0, valoreMax, 0, yZero - yTetto);
    
    fill(serie[b].col);
    rect(startX + (b* 20), yZero - altezzaBarra + 85, 14, max(altezzaBarra, 6), 7);
  }
  
  //testo dei paesi
  fill('#2B2520');
  textAlign (CENTER, CENTER);
  textSize (11);
  text(datiMacro[i].label, centroX, yZero + 137);
}
}