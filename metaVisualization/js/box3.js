(function() {

// Inspired by http://informationandvisualization.de/blog/box-plot
d3.box2 = function() {
  var width = 1,
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
      group = null;
      category = null;

  // For each small multiple…
  function box2(g) {
    g.each(function(data, i) {

      // console.log('i is',i); //i is 0,1,2,3,4
      // var d = data.value.sort(d3.ascending);//already sorted
      // console.log('data is',data); //data is {group,value[]}
      var d = data.value;
      // if(d[])
      if(d==null){
        d[0]=0;
        d[1]=0;
        d[2]=0;
      }
      // console.log('d is',d); //d is value[]
      var group = data.group;
      str0='Group '+group+'<br>';
      // console.log('group is',group); //group is 1,2,3,4,5

      var g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1];
      // console.log('min=',min);
      // console.log('max=',max);

      // Compute quartiles. Must return exactly 3 elements.
      var quartileData = d.quartiles = quartiles(d);
      // console.log('quartileData=',quartileData);

      // Compute whiskers. Must return exactly 2 elements, or null.
      var whiskerIndices = whiskers && whiskers.call(this, d, i),
          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });
      // console.log('whiskers=',whiskers);
      // console.log('whiskerIndices=',whiskerIndices);
      // console.log('whiskerData=',whiskerData);

      // Compute outliers. If no whiskers are specified, all data are "outliers".
      // We compute the outliers as indices, so that we can join across transitions!
      var outlierIndices = whiskerIndices
          ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
          : d3.range(n);
          outlierData=outlierIndices&&outlierIndices.map(function(i){return d[i];});

      // console.log('outlierIndices=',outlierIndices);
      // console.log('outlierData=',outlierData);
      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain(domain && domain.call(this, d, i) || [min, max])
          .range([0,width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
     // .domain([0, max])
          .range(x1.range());

      // Stash the new scale.
      // this.__chart__ = x1;

      // Note: the box, median, and box tick elements are fixed in number,
      // so we only have to handle enter and update. In contrast, the outliers
      // and other elements are variable, so we need to exit them! Variable
      // elements also fade in and out.

      // Update center line: the horizontal line spanning the whiskers.
      var center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : []);

      //vertical horizontal line
      center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", function(d) { return x0(d[0]); })
          .attr("y1", height / 2)
          .attr("x2", function(d) { return x0(d[1]); })
          .attr("y2", height / 2)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("x1", function(d) { return x1(d[0]); })
          .attr("x2", function(d) { return x1(d[1]); });

      // prepare the tooltip bits, initial display is hidden
      var tooltip = d3.select("#boxplot_container").append("div").attr("class", "toolTip");

      // Update innerquartile box.
      var box = g.selectAll("rect.box")
          .data([quartileData]);

      // console.log('data group is',data.group);
      // console.log('color(data.group) is', color(data.group));
      box.enter().append("rect")
          .attr("class", "box")
          .attr("fill", color(data.group))
          // .attr("stroke",color("grey"))
          .attr("x", function(d) { return x0(d[0]); })
          .attr("y", 0)
          .attr("width", function(d) { return x0(d[2]) - x0(d[0]); })
          .attr("height", height)
          .transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]); })
          // .attr("y", 0)
          .attr("width", function(d) { return x1(d[2]) - x1(d[0]); })

      box.on("mousemove",function(d){
        // console.log('d is', d); 
        // console.log('group is',group); //group is null
        var elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        tipstringMax='1st quartile = '+NumFormat(d[0])+'%';
        tipstring=str0+'1st quartile = '+NumFormat(Math.pow(10,d[0])*100)+'%'+'<br>'+'median = '+NumFormat(Math.pow(10,d[1])*100)+'%'+'<br>'+'3rd quartile = '+NumFormat(Math.pow(10,d[2])*100)+'%'+'</br>'
        tooltip.style("width",(tipstringMax.length*6+'px')); //hardCode!
        tooltip.style("left",d3.event.pageX-(tipstringMax.length*6)/2+"px");
        tooltip.style("top",d3.event.pageY-80+"px");
        tooltip.style("display","inline-block");
        // console.log("width=",(tipstring.length*125/71+'px'));
        tooltip.html(tipstring);
      });

      box.on("mouseout",function(d){
        tooltip.style("display","none");
      });

      // Update median line.
      var medianLine = g.selectAll("line.median")
          .data([quartileData[1]]);

      // console.log("height=",height);
      medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", x0)
          .attr("y1", 0)
          .attr("x2", x0)
          .attr("y2", height)
          .attr("stroke","blue")
        .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1);

      medianLine.on("mousemove",function(d){
        var elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        tipstring=str0+'median = '+NumFormat(Math.pow(10,d)*100)+'%';
        // console.log('length is',tipstring.length);
        tooltip.style("width",(tipstring.length*6+'px'));
        tooltip.style("left",d3.event.pageX-(tipstringMax.length*6)/2+"px");
        tooltip.style("top",d3.event.pageY-50+"px");
        tooltip.style("display","inline-block");
        tooltip.html(tipstring);
      });

      medianLine.on("mouseout",function(d){
        tooltip.style("display","none");
      });

      // Update whiskers.
      var whisker = g.selectAll("line.whisker")
          .data(whiskerData || []);

      whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("y1", 0)
          .attr("x1", x0)
          .attr("y2", 0 + height)
          .attr("x2", x0)
          // .attr("stroke","red")
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 1);

      whisker.on("mousemove",function(d){
        var elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        // console.log('i=',i);
        // console.log('d=',d);
        // console.log('whiskerData[0]=',whiskerData[0]);
        tipstr1=str0+'minmum = '+NumFormat(Math.pow(10,d)*100)+'%';
        tipstr2=str0+'maximum = '+NumFormat(Math.pow(10,d)*100)+'%';
        // tooltip.style("width",(tipstr2.length*7+'px'));//hardCode!
        tooltip.style("display","inline-block");
        tooltip.style("top",d3.event.pageY-50+"px");
        if(d==whiskerData[0]){
          // console.log("tipstr1=",tipstr1)
          tooltip.style("width",(tipstr1.length*6+'px'));
          tooltip.style("left",d3.event.pageX-(tipstr1.length*6)/2+"px");
          tooltip.html(tipstr1);
        }
        else{
          tooltip.style("width",(tipstr2.length*6+'px'));
          tooltip.style("left",d3.event.pageX-(tipstr2.length*6)/2+"px");
          tooltip.html(tipstr2);
        }
      });

      whisker.on("mouseout",function(d){
        tooltip.style("display","none");
      });

      // Update outliers.
      var outlier = g.selectAll(".outlier")
                     .data(outlierIndices, Number);
      // console.log('testing is',Number(outlierData).toFixed(3)); //some group data doesn't have outliers

      outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 3)
          .attr("cy", height / 2)
          .attr("cx", function(i) { return x0(d[i]); })
          .style("fill",color(data.group))
          .transition()
          .duration(duration)
          .attr("cx", function(i) { return x1(d[i]); })
          .style("opacity", 0.2);

      outlier.on("mousemove",function(i){
        var elements=document.querySelectorAll(':hover');
        l=elements.length;
        l=l-1;
        element=elements[l].__data__;
        value=element.y1-element.y0;
        // console.log('oulier i=',i);
        tipstring=str0+'outlier='+NumFormat(Math.pow(10,d)*100)+'%'
        tooltip.style("left",d3.event.pageX-(tipstring.length*6)/2+"px");
        tooltip.style("top",d3.event.pageY-50+"px");
        tooltip.style("display","inline-block");
        tooltip.html(tipstring);
      });

      outlier.on("mouseout",function(d){
        tooltip.style("display","none");
      });

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(8);

    //   // Update box ticks.
    //   var boxTick = g.selectAll("text.box")
    //       .data(quartileData);
    //   if(showLabels == true) {
    //     boxTick.enter().append("text")
    //         .attr("class", "box")
    //         .attr("dy", ".3em")
    //         .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
    //         .attr("x", function(d, i) { return i & 1 ?  + width : 0 })
    //         .attr("y", x0)
    //         .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
    //         .text(format)
    //       .transition()
    //         .duration(duration)
    //         .attr("y", x1);
    //   }
     
    //   boxTick.transition()
    //       .duration(duration)
    //       .text(format)
    //       .attr("y", x1);

    //   // Update whisker ticks. These are handled separately from the box
    //   // ticks because they may or may not exist, and we want don't want
    //   // to join box ticks pre-transition with whisker ticks post-.
    //   var whiskerTick = g.selectAll("text.whisker")
    //       .data(whiskerData || []);
    //   if(showLabels == true) {
    //       whiskerTick.enter().append("text")
    //         .attr("class", "whisker")
    //         .attr("dy", ".3em")
    //         .attr("dx", 6)
    //         .attr("x", width)
    //         .attr("y", x0)
    //         .text(format)
    //         .style("opacity", 1e-6)
    //       .transition()
    //         .duration(duration)
    //         .attr("y", x1)
    //         .style("opacity", 1);
    //   }

    //   whiskerTick.transition()
    //       .duration(duration)
    //       .text(format)
    //       .attr("y", x1)
    //       .style("opacity", 1);

    //   whiskerTick.exit().transition()
    //       .duration(duration)
    //       .attr("y", x1)
    //       .style("opacity", 1e-6)
    //       .remove();
    });
    d3.timer.flush();
  }

  box2.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box2;
  };

  box2.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box2;
  };

  box2.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box2;
  };

  box2.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box2;
  };

  box2.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : d3.functor(x);
    return box2;
  };

  box2.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return box2;
  };

  box2.whiskers = function(x) {
    if (!arguments.length) return whiskers;
    whiskers = x;
    return box2;
  };
  
  box2.showLabels = function(x) {
    if (!arguments.length) return showLabels;
    showLabels = x;
    return box2;
  };

  box2.quartiles = function(x) {
    if (!arguments.length) return quartiles;
    quartiles = x;
    return box2;
  };

  return box2;
};

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

function formatTooltip(str){
  str0='Group '+group+'<br>';

};

function NumFormat(d){
  return Number(d).toFixed(3);
}

})();