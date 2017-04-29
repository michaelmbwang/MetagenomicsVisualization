d3.box = function() {
  let width = 1,
      height = 1,
      duration = 0,
      domain = null,
      value = Number,
      whiskers = boxWhiskers,
      quartiles = boxQuartiles,
      showLabels = true, // whether or not to show text labels
      numBars = 4,
      curBar = 1,
      tickFormat = null,
      group = null,
      category = null,
      color = null
  // For each small multiple…
  function box(g) {
    g.each(function(data, i) {

      let d = data.value;
      // console.log('d is',d); //d is value[]
      // console.log("width",width, "height",height)
      let group = data.group;
      str0='Group '+group+'<br>';
      // console.log('group is',group); //group is 1,2,3,4,5

      let g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1];
      // console.log('min=',min);
      // console.log('max=',max);

      // Compute quartiles. Must return exactly 3 elements.
      let quartileData = d.quartiles = quartiles(d);
      // console.log('quartileData=',quartileData);

      // Compute whiskers. Must return exactly 2 elements, or null.
      let whiskerIndices = whiskers && whiskers.call(this, d, i),
          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });
      // console.log('whiskers=',whiskers);
      // console.log('whiskerIndices=',whiskerIndices);
      // console.log('whiskerData=',whiskerData);

      // Compute outliers. If no whiskers are specified, all data are "outliers".
      // We compute the outliers as indices, so that we can join across transitions!
      let outlierIndices = whiskerIndices
          ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
          : d3.range(n);
          outlierData=outlierIndices&&outlierIndices.map(function(i){return d[i];});

      // console.log('outlierIndices=',outlierIndices);
      // console.log('outlierData=',outlierData);
      // Compute the new x-scale.
      let x1 = d3.scaleLinear()
          .domain(domain && domain.call(this, d, i) || [min, max])
          .range([height, 0]);
      // console.log("x1(d[0])",x1(d[0]))
      // console.log("x1(d[1])",x1(d[1]))
      // console.log("x1(d[2])",x1(d[2]))
      // console.log("x1.range()",x1.range())
      // console.log("x1.domain()",x1.domain())
      // console.log("min",min,"max",max)
      // Retrieve the old x-scale, if this is an update.
      let x0 = this.__chart__ || d3.scaleLinear()
          .domain([0, Infinity])
          .range(x1.range());
      // console.log("x0(d[0])",x0(d[0]))
      // console.log("x0(d[1])",x0(d[1]))
      // console.log("x0(d[2])",x0(d[2]))

      // Stash the new scale.
      // this.__chart__ = x1;

      // Note: the box, median, and box tick elements are fixed in number,
      // so we only have to handle enter and update. In contrast, the outliers
      // and other elements are letiable, so we need to exit them! letiable
      // elements also fade in and out.

      // Update center line: the vertical line spanning the whiskers.
      let center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : []);

      //vertical central line
      center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("y1", function(d) { return x0(d[0]); })
          .attr("x2", width / 2)
          .attr("y2", function(d) { return x0(d[1]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      // prepare the toolTip bits, initial display is hidden
      let toolTip = d3.select(".plot")
                      .append("div")
                      .attr("class", "ttip");

      // Update innerquartile box.
      let box = g.selectAll("rect.box")
          .data([quartileData]);

      // console.log('data group is',data.group);
      // console.log('color(data.group) is', color(data.group));
      box.enter().append("rect")
          .attr("class", "box")
          .attr("fill", color(data.group)) 
          .attr("x", 0)
          .attr("y", function(d) { return x0(d[2]); })
          .attr("width", width)
          .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
          .transition()
          .duration(duration)
          .attr("y", function(d) { return x1(d[2]); })
          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); })
      box.on("mouseover", function(d){
          console.log('d is', d); 
          // console.log('group is',group); //group is null
          toolTip.style("left",d3.event.pageX+10+"px");
          toolTip.style("top",d3.event.pageY-25+"px");
          toolTip.style("display","inline-block");
          let elements=document.querySelectorAll(':hover');
          l=elements.length;
          l=l-1;
          element=elements[l].__data__;
          value=element.y1-element.y0;
          tipstringMax='1st quartile = '+NumFormat(d[0])+'%';
          tipstring=str0+'1st quartile = '+NumFormat(d[0])+'%'+'<br>'+'median = '+NumFormat(d[1])+'%'+'<br>'+'3rd quartile = '+NumFormat(d[2])+'%'+'</br>'
          toolTip.style("width",(tipstringMax.length*6+'px')); //hardCode!
          // console.log("width=",(tipstring.length*125/71+'px'));
          toolTip.html(tipstring);
      })
      box.on("mousemove",function(d){
          console.log('d is', d); 
          // console.log('group is',group); //group is null
          toolTip.style("left",d3.event.pageX+10+"px");
          toolTip.style("top",d3.event.pageY-25+"px");
          toolTip.style("display","inline-block");
          let elements=document.querySelectorAll(':hover');
          l=elements.length;
          l=l-1;
          element=elements[l].__data__;
          value=element.y1-element.y0;
          tipstringMax='1st quartile = '+NumFormat(d[0])+'%';
          tipstring=str0+'1st quartile = '+NumFormat(d[0])+'%'+'<br>'+'median = '+NumFormat(d[1])+'%'+'<br>'+'3rd quartile = '+NumFormat(d[2])+'%'+'</br>'
          toolTip.style("width",(tipstringMax.length*6+'px')); //hardCode!
          // console.log("width=",(tipstring.length*125/71+'px'));
          toolTip.html(tipstring);
      });
      box.on("mouseout",function(d){
        toolTip.style("display","none");
      });

      // Update median line.
      let medianLine = g.selectAll("line.median")
          .data([quartileData[1]]);

      medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
          // .attr("stroke","blue")
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      medianLine.on("mousemove",function(d){
        toolTip.style("left",d3.event.pageX+10+"px");
        toolTip.style("top",d3.event.pageY-25+"px");
        toolTip.style("display","inline-block");
        // let elements=document.querySelectorAll(':hover');
        // l=elements.length;
        // l=l-1;
        // element=elements[l].__data__;
        // value=element.y1-element.y0;
        tipstring=str0+'median = '+NumFormat(d)+'%';
        // console.log('length is',tipstring.length);
        toolTip.style("width",(tipstring.length*6+'px'));
        toolTip.html(tipstring);
      });

      medianLine.on("mouseout",function(d){
        toolTip.style("display","none");
      });

      // Update whiskers.
      let whisker = g.selectAll("line.whisker")
          .data(whiskerData || []);
      // console.log("width=",width)
      whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", 0 + width)
          .attr("y2", x0)
          // .attr("stroke","red")
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.on("mousemove",function(d){
        toolTip.style("left",d3.event.pageX+10+"px");
        toolTip.style("top",d3.event.pageY-25+"px");
        toolTip.style("display","inline-block");
        let elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        // console.log('i=',i);
        // console.log('d=',d);
        // console.log('whiskerData[0]=',whiskerData[0]);
        tipstr1=str0+'minmum = '+NumFormat(d)+'%';
        tipstr2=str0+'maximum = '+NumFormat(d)+'%';
        toolTip.style("width",(tipstr2.length*7+'px'));//hardCode!
        if(d==whiskerData[0]){
          toolTip.html(tipstr1);
        }
        else{
          toolTip.html(tipstr2);
        }
      });

      whisker.on("mouseout",function(d){
        toolTip.style("display","none");
      });

      // Update outliers.
      let outlier = g.selectAll(".outlier")
                     .data(outlierIndices, Number);
      // console.log('testing is',Number(outlierData).toFixed(3)); //some group data doesn't have outliers

      outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 3)
          .attr("cx", width / 2)
          .attr("cy", function(i) { return x0(d[i]); })
          .style("fill",color(data.group))
          .transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 0.2);

      outlier.on("mousemove",function(i){
        toolTip.style("left",d3.event.pageX+10+"px");
        toolTip.style("top",d3.event.pageY-25+"px");
        toolTip.style("display","inline-block");
        let elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        // console.log('oulier i=',i);
        tipstring=str0+'outlier='+NumFormat(d[i])+'%'
        toolTip.html(tipstring);
      });

      outlier.on("mouseout",function(d){
        toolTip.style("display","none");
      });

      // Compute the tick format.
      let format = tickFormat || x1.tickFormat(8);
    });
  }

  box.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box;
  };

  box.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box;
  };

  box.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box;
  };

  box.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box;
  };

  box.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : functor(x);
    return box;
  };

  box.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return box;
  };

  box.whiskers = function(x) {
    if (!arguments.length) return whiskers;
    whiskers = x;
    return box;
  };
  
  box.showLabels = function(x) {
    if (!arguments.length) return showLabels;
    showLabels = x;
    return box;
  };

  box.quartiles = function(x) {
    if (!arguments.length) return quartiles;
    quartiles = x;
    return box;
  }

  box.color = function(x){
      if (!arguments.length) {
          return color;
      }
      color = x;
      return box;
  }

  return box;
};

function functor(v) {
  return typeof v === "function" ? v : function() { return v; };
}

function boxWhiskers(d) {
  return [0, d.length - 1];
}

function boxQuartiles(d) {
  //all decimals here, no problem
  // console.log('d3.quantile(d, .25)='+d3.quantile(d, .25)+' d3.quantile(d, .5)='+d3.quantile(d, .5)+' d3.quantile(d, .75)'+d3.quantile(d, .75));
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}

function formattoolTip(str){
  str0='Group '+group+'<br>';

};

function NumFormat(d){
  return Number(d).toFixed(3);
}
