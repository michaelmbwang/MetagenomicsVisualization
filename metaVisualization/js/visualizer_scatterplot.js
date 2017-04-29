class visualizer_scatterplot{

constructor (d, color, l){
  this.dataset = d
  this.colorset = color
  this.numOfGroups = l
  this.init()
}

//set margin, svg width, height
init(){
  let self = this
  d3.selectAll("svg")
    .remove()
  self.colorSet = self.colorset.slice(0,self.numOfGroups);
  let color = d3.scaleOrdinal().range(self.colorSet);
  let extremeValues = self.calculateAxisDomain(self.dataset);
  self.drawScatterPlot(self.dataset,extremeValues,color);
}

calculateAxisDomain(dataset){
  let max=parseFloat(dataset[0].Axis1),
      min=parseFloat(dataset[0].Axis1);
  dataset.forEach(function(d){
    let x1 = parseFloat(d.Axis1)
    let x2 = parseFloat(d.Axis2)
    if(x1>max)
      max=x1
    if(x2>max)
      max=x2
    if(x1<min)
      min=x1
    if(x2<min)
      min=x2
  });
  max=Math.ceil(max);
  min=Math.floor(min);
  return [min,max];
}

drawScatterPlot(dataset,extrem, color){
  let margin = {top: 40, right: 100, bottom: 100, left: 40},
      width = 800 - margin.left - margin.right, //width and height are already substracted by 2
      height = 800 - margin.top - margin.bottom
  // set x axis sacle
  let xScale = d3.scaleLinear()
        .domain([extrem[0],extrem[1]])
        .range([0, width]);
  // set y axis scale
  let yScale = d3.scaleLinear()
          .domain([extrem[0],extrem[1]])
          .range([height,0]);
  // set x axis accessor
  let xAxis1 = d3.axisBottom()
          .scale(xScale)
  let xAxis2 = d3.axisTop()
          .scale(xScale)
  // set y axis accessor
  let yAxis1 = d3.axisLeft()
          .scale(yScale)
  let yAxis2 = d3.axisRight()
          .scale(yScale)
  // set svg container
  let svg = d3.select(".plot")
              // .select("svg")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // append x axis to svg; no let to be assigned
  svg.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis1)
          .append("text")
          .attr("transform","translate(" + width + ", 10)")
          .attr("x",0)
          .attr("y",20)
          .style("text-anchor", "end")
          .text("Axis1");

  svg.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + 0 + ')')
          .call(xAxis2)
          .append("text")
          .attr("transform","translate(" + width + ", 0)")
          .attr("x",0)
          .attr("y",-20)
          .style("text-anchor", "end")
          .text("Axis1");
  // append y axis to svg
  svg.append('g')
        .attr('class', 'axis')
        .call(yAxis1)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -20)
        .style("text-anchor", "end")
        .text("Axis2");

  svg.append('g')
        .attr('class', 'axis')
        .call(yAxis2)
        .attr('transform', 'translate('+height+',0)')
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 20)
        .style("text-anchor", "end")
        .text("Axis2");
  //tooltip
  let tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "ttip");
  //droplines
  let droplines = svg.append("g") 
                .attr("class","droplines")
                .style("display", "none");
  //append the x line
  droplines.append("line")
        .attr("class", "x")
  //append the y line
  droplines.append("line")
        .attr("class", "y")
  //scatters
  let scatter = svg.selectAll(".scatter")
                   .data(dataset)
                   .enter()
                   .append("circle","text")
                   .attr("class","scatter")
                   .attr("cx",function(d){
                      return xScale(parseFloat(d.Axis1));
                    })
                   .attr("cy",function(d){
                      return yScale(parseFloat(d.Axis2));
                    })
                   .attr("r", 3)
                   .attr("opacity", 0.8)
                   .attr("fill",function(d){
                      return color(parseInt(d.name.charAt(5)));
                   })
                   // .attr("name", function(d){
                   //    return d.name
                   // })
  scatter.on("mouseover",function(d){
    droplines.style("display", null)
  })
  scatter.on("mousemove",function(d){
      svg.selectAll(".scatter")
            .attr("r", function(s){
              if(d.name == s.name)
                return 4
              return 3
            })
            .attr("opacity", function(s){
              if(d.name == s.name)
                return 1
              return 0.5
            })
      let x = d3.mouse(this)[0]
      let y = d3.mouse(this)[1]
      droplines.select(".x")
          .style("stroke",color(parseInt(d.name.charAt(5))))
          .attr("x1",x)
          .attr("x2",x)
          .attr("y1",y)
          .attr("y2",height)
      droplines.select(".y")
          .style("stroke",color(parseInt(d.name.charAt(5))))
          .attr("x1",0)
          .attr("x2",x)
          .attr("y1",y)
          .attr("y2",y)
      tooltip.style("left", (d3.event.pageX+10)+"px");
      tooltip.style("top", (d3.event.pageY-20)+"px");
      tooltip.style("display","inline-block");
      let tipstring=d.name+"<br>Axis1="+d.Axis1+"<br>Axis2="+d.Axis2;
      tooltip.html(tipstring);
  });
  scatter.on("mouseout",function(d){
      svg.selectAll(".scatter")
        .attr("r", 3)
        .attr("opacity", 0.8)
      tooltip.style("display","none");
      droplines.style("display", "none");
  });
  //draw legend on the right side of the plot
  let colorList = color.domain().slice().reverse();
  // console.log("colorList="+colorList);
  let legend = svg.selectAll(".legend")
                  .data(colorList)
                  .enter()
                  .append("g")
                  .attr("class", "legend")
                  .attr("transform", function (d, i) {
                    // console.log("d="+d+" i="+i);
                    return "translate(20," + (height-margin.bottom-i*20) + ")";
                  });
  let legendItem = legend.append("rect")
                          .attr("x",width)
                          .attr("width",10)
                          .attr("height",10)
                          .attr("fill","black")
  let legendSquare = legend.append("rect")
                            .attr("x", width)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", color);
  let legendText = legend.append("text")
                         .attr("x", width + 10)
                         .attr("y", 5)
                         .attr("width", 40)
                         .attr("dy", ".35em")
                         .style("text-anchor", "start")
                         .text(function (d) {
                            return 'Group'+d;
                         });  
  let butExport = d3.select(".params")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "redraw")
                      .attr("value", "Export")
                      .on("click", function(d){
                          var svgString = getSVGString(svg.node());
                          svgString2Image( svgString, 1600, 1600, 'png', save ); // passes Blob and filesize String to the callback
                          function save( dataBlob, filesize ){
                            saveAs( dataBlob, 'scatter.png' ); // FileSaver.js function
                          }
                      })                       
}

}

