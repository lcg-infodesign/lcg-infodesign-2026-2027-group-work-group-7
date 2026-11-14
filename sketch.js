let imgFrontone;
let imgBaseColonna;
let imgGradinate;

let datiMacro = [
  {code: 'EUR', label: 'EUROPA & NORTH AMERICA', culturali:0, naturali: 0, misti:0},
  {code: 'ASIA', label: 'ASIA', culturali:0, naturali: 0, misti:0},
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

  image(imgFrontone, margineSx -20, height *0.05, larghezzaTempio+40, height *0.7);
  image(imgGradinate, margineSx -15, yZero-200, larghezzaTempio+30, 600);
}