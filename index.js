// variable that stores the mindmap data
let mindMapDat;

// listing emotions
let emotAll = [
  "Angry", "Bored", "Calm", "Confident", "Distracted", "Energetic", "Excited", "Focused",
  "Happy", "Lazy", "Lonely", "Loved", "Not smart", "Sad", "Safe", "Scared", "Shy", "Smart",
  "Worried"
];

let emotPos = [
    "Calm", "Confident", "Energetic", "Excited", "Focused", "Happy", "Loved", "Safe", "Smart"
];

let emotNeg = [
  "Bored", "Angry", "Distracted", "Lazy", "Lonely", "Not smart", "Sad", "Scared", "Shy", "Worried"
];

let emotX = [
    "Bored", "Angry", "Distracted", "Lazy", "Lonely", "Calm", "Confident", "Energetic", "Excited"
];

let emotY = [
    "Not smart", "Sad", "Scared", "Shy", "Worried", "Focused", "Happy", "Loved", "Safe", "Smart"
];

let emotOrd = emotPos.concat(emotNeg)

function typeExplain(type){
  if (type == "Most Days"){
    return 'On most days, I feel'
  }
  else if (type == "Home"){
    return 'At home, I feel'
  }
  else if (type == "School"){
    return 'In school, I feel'
  }
  else if (type == "Classroom"){
    return 'In the classroom, I feel'
  }
}

async function readAndDraw(){
  mindMapDat = await d3.csv('mmAll.csv')
  // console.log(mindMapDat)
  // drawMindMap(mindMapDat, 'School - Baseline', 'mindMapBaseline');
  // drawMindMap(mindMapDat, 'School - Endline', 'mindMapEndline');
  drawMindmaps(mindMapDat, 'Most Days');
  //drawMindMap(mindMapDat, 'Most Days - Baseline', 'mindMapBaseline');
  //drawMindMap(mindMapDat, 'Most Days - Endline', 'mindMapEndline');

  d3.selectAll('.selector').on('input', function(d, i){
    let type = getValSel('.selector.type');

    console.log(typeExplain(type));

    d3.select('h4.controlExplain.QuestType')
      .text(typeExplain(type));

    let city = getValSel('.selector.citySelect')
    city = city == "null" ? null : city;
    let sex = getValSel('.selector.sexSelect')
    sex = sex == "null" ? null : sex;
    let program = getValSel('.selector.programSelect');
    program = program == "null" ? null : program;
    let yoi = getValSel('.selector.yoiSelect');
    yoi = yoi == "null" ? null : yoi;
    let ageGrp = getValSel('.selector.ageGrpSelect');
    ageGrp = ageGrp == "null" ? null : ageGrp;

    mindMapDatFilt = Rearr(mindMapDat, {
      City: city,
      Sex: sex,
      Program: program,
      YOI: yoi,
      ageGrp: ageGrp
    })

    console.log(city, sex, program, yoi, ageGrp);
    console.log(mindMapDatFilt)

    //console.log(type);
    drawMindmaps(mindMapDatFilt, type);
    // drawMindMap(mindMapDat, type + ' - Baseline', 'mindMapBaseline');
    // //drawMindMap(mindMapDat, type + ' - Endline', 'mindMapEndline');
  })
}

function drawMindmaps(data, prefix) {
  drawMindMap(data, prefix + ' - Baseline', 'mindMapBaseline');
  drawMindMap(data, prefix + ' - Endline', 'mindMapEndline');
}

function getValSel(selection){
  return d3.select(selection).node().value
}

let radScale //= d3.scaleSqrt().domain([0, 10]).range([1, 16]);

function drawMindMap(data, varName, className){
  // remove any previous SVGs in body
  d3.select('body').select('svg' + '.' + className).remove()

  // setup params
  let widthSVG = 500;
  let heightSVG = 550;
  let margin = {top: 150, right: 20, bottom: 20, left: 100},
      width = widthSVG - margin.left - margin.right,
      height = heightSVG - margin.top - margin.bottom;

  let svgG = d3.select('body').append('svg')
      .classed(className, true)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  let x = d3.scaleBand()
    .domain(emotOrd)
    .range([0, width]);

  let y = d3.scaleBand()
    .domain(emotOrd)
    .range([0, height]);

  let summarised = summarise(data, varName);

  let lengths = summarised.map(d => d.values.length);

  //console.log(d3.max(lengths));

  radScale = d3.scaleSqrt().domain([0, 13]).range([1, 17]);

  if (className == 'mindMapBaseline')

  makeNestCircLegend(CSSSelect = 'svg', [50, 40], [2, 7, 15], radScale, '')

  console.log(summarised);

  svgG.append('text')
      .text(className == 'mindMapBaseline' ? 'Baseline' : 'Endline')
      .attr('x', width/ 2)
      .attr('y', -110)
      .style('text-anchor', 'middle')
      .style('font-size', '20px');

  svgG.selectAll('circle')
      .data(summarised)
      .enter()
      .append('circle')
      .attr('cx', d => {
        // let emot = d[['Classroom - Baseline']];
        // let emotX = emot.split(" : ")[0]
        return x(d.X)
      })
      .attr('cy', d => {
        // let emot = d[['Classroom - Baseline']];
        // let emotY = emot.split(" : ")[1]
        return y(d.Y)
      })
      .attr('r', 0)
      .style('fill-opacity', 0.7)
      .style('fill', d => {
        if (d.score == 0){
          return 'red';
        }
        else if (d.score == 1){
          return 'grey';
        }
        else {
          return 'purple';
        }
      })
      .transition()
      .duration(750)
      .attr('r', d => radScale(d.values.length))

    svgG.append('g')
      .attr('class', 'XAxisTextG')
      .selectAll('text')
      .data(emotOrd)
      .enter()
      .append('text')
      .attr('x', -30)
      .attr('y', d => y(d) + 5)
      .text(d => d)
      .style('text-anchor', 'end')
      .style('font-size', '14px');

    svgG.append('g')
      .attr('class', 'YAxisTextG')
      .selectAll('text')
      .data(emotOrd)
      .enter()
      .append('text')
      //.attr('y', -30)
      //.attr('x', d => x(d))
      .attr('transform', d => 'translate('+ (x(d) + 5) +','+ (-30) +')' + 'rotate(270)')
      .text(d => d)

      .style('text-anchor', 'start')
      .style('font-size', '14px');

    svgG.selectAll('circle')
        .on('mouseover', mouseOvOut(true))
        .on('mouseout', mouseOvOut(false))

    function mouseOvOut(mouseover){
      return function(d, i){
        let datum = d3.select(this).data()[0].key;
        let yEmotion = datum.split(" : ")[0];
        let xEmotion = datum.split(" : ")[1];
        //console.log(xEmotion, yEmotion);

        if (mouseover == true){
          d3.select(this).append('title')
            .text(function(d){
              return d.values.length;
            });
        }
        else {
          d3.select('title').remove();

        }


        svgG.select('g.XAxisTextG')
          .selectAll('text')
          .filter(d => d === xEmotion)
          //.transition()
          //.duration(500)
          .style('font-weight', mouseover ? 700 : 300);

        svgG.select('g.XAxisTextG')
          .selectAll('text')
          .filter(d => d !== xEmotion)
          .transition()
          //.duration(500)
          .style('fill', mouseover ? 'grey' : 'black');

        svgG.select('g.YAxisTextG')
          .selectAll('text')
          .filter(d => d === yEmotion)
          //.transition()
          //.duration(500)
          .style('font-weight', mouseover ? 700 : 300);

        svgG.select('g.YAxisTextG')
          .selectAll('text')
          .filter(d => d !== yEmotion)
          .transition()
          //.duration(500)
          .style('fill', mouseover ? 'grey' : 'black');
      }
    }

}


readAndDraw();

function intersect(arr1, arr2){
  let result = arr1.filter(function(n) {
    return arr2.indexOf(n) > -1;
  });

  return result;
}

function summarise(data, varName){
  let sumData = d3.nest()
                  .key(function(d) { return d[[varName]]; })
                  .entries(data);

  sumData.forEach(entry => {
    entry.X = entry.key.split(" : ")[0];
    entry.Y = entry.key.split(" : ")[1];
    entry.Xscore = emotPos.includes(entry.X);
    entry.Yscore = emotPos.includes(entry.Y);
    entry.score = entry.Xscore + entry.Yscore;
  })

  return sumData;
}

function Rearr(data, filtObj){
  // filter function
  function filtFunc(d, type){
    // individual logicals
    let cityLog =  filtObj.City == null ? true : d.City == filtObj.City ;
    let sexLog = filtObj.Sex == null ? true : d.Gender == filtObj.Sex;
    let progLog = filtObj.Program == null ? true : d.Program == filtObj.Program;
    let yoiLog = filtObj.YOI == null ? true : d["Year of Intervention"] == filtObj.YOI;
    let ageGrpLog = filtObj.ageGrp == null ? true : filterAge(d, filtObj.ageGrp);

    function filterAge(entry, option){
      if (option == "Under 10") {
        return entry["Age"] <= 10;
      }
      else if (option == "Under 12"){
        return entry["Age"] > 10 & d["Age"] <= 12
      }
      else {
        return entry["Age"] > 12;
      }
    }


    // combined logical
    let logical =  cityLog & sexLog & progLog & yoiLog & ageGrpLog;
    if (type == "filt"){
      d.filt = logical ? true : false;
      return logical
    }
    else {
      return !logical
    }
  }

  let filtDat = data.filter(d => filtFunc(d, "filt"));
  //let nonFiltDat = data.filter(d => filtFunc(d, "nonFilt"));


  return filtDat
}

function makeNestCircLegend(CSSSelect = 'svg', transformArray, bubArray, bubScale, legendTitle){
  // appending a legendgroup
  let legendGroup = d3.select(CSSSelect)
                   .append('g')
                   .classed('legendGroup', true)
                   .attr('transform', `translate(${transformArray[0]}, ${transformArray[1]})`)

  //console.log(legendGroup);

  legendGroup.append('text')
           .text(legendTitle)
           .classed('legendTitle', true)
           .attr('dx', 40)
           .style('font-size', '12px')
           .style('text-anchor', 'start');

  let radius = bubScale(d3.max(bubArray));
  // hard code params such as Padding and font size for now
  let legLabelPadding = 5;
  let legLabFontSize = 10;

  const circGroups = legendGroup.selectAll('circle')
           .data(bubArray)
           .enter()
           .append('g')
           .classed('circLegendGroup', true)
           .attr('transform', d => `translate(0, ${radius - radScale(d)})`);

  circGroups.append('circle')
           .attr('r', d => radScale(d))
           .style('stroke', 'black')
           .style('fill', 'none')
           .style('stroke-width', '0.75px');

  circGroups.append('text')
           .text(d => d)
           .attr('dx', radius + legLabelPadding)
           .attr('dy', d => -(radScale(d) - legLabFontSize/2))
           .style('fill', 'black')
           //.style('font-family', 'Montserrat')
           .style('font-size', `${legLabFontSize}px`)
}
