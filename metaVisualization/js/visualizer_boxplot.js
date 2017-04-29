class visualizer_boxplot{

constructor(d, c, l){
  let self = this
  this.metadataset=[]
  let tmp = $.extend(true, {}, d)
  // console.log("visualizertmp", tmp)
  for(let i in tmp){
    self.metadataset.push(tmp[i])
  }
  // console.log("visualizerdata",this.metadataset)
  this.color = d3.scaleOrdinal().range(c)
  this.numOfGroups = l
  this.init()
}

init(){
  let self = this
  d3.selectAll("svg").remove()
  let metadataset = self.metadataset
  self.metaNames=[]; //store meta names
  self.metaGroupNames=[]; //store ordered group names 
  self.metaGroupValues=[]; //store values in order of group names
  let min = Infinity,
      max = -Infinity;
    metadataset.forEach(function(x) {
      let category=x.name,
        tmp=x
      delete x.name;
      let data={name:category,value:tmp};
      self.metaNames.push(category);
      let tmpNames, tmpValues;
      [tmpNames, tmpValues] = self.groupByIndex(tmp);
      self.metaGroupNames.push(tmpNames);
      self.metaGroupValues.push(tmpValues);
    });
    let dataset = self.formatNewDataset()
    self.drawBoxPlot(dataset);
}

sortMetaData(dataset){
  let self = this
  let Categories = d3.map(dataset, function(d){return d.x;}).keys();
  let Groups = d3.map(dataset, function(d){return d.Group;}).keys();
  let dataarray = [];
  // let tmp = [];
  Categories.forEach(function(cat) {
      let data_tmp = []
      Groups.forEach(function(group) {
        let tmp = [];
        dataset.forEach(function(d) {
          if(d.x == cat && d.Group == group){
            tmp.push(d.y);
          }; 
        });
        data_tmp.push({group: group, value: tmp});
      });
    dataarray.push({Categories: cat, Data: data_tmp});
  });
  let means=[];
  dataarray.forEach(function (d){
    let totalValue=0;
    let totalCount=0;
    d.Data.forEach(function(i){
      i.value.forEach(function(v){
          totalValue+=v;
          totalCount+=1;
      });
    });
    means.push({Categories:d.Categories,meanValue:totalValue/totalCount});
  });
  //descending sort
  means.sort(function(a,b){return (a.meanValue < b.meanValue) ? 1 : ((b.meanValue < a.meanValue) ? -1 : 0);});
  let selectedCategories=[];
  for( let i=0; means[i].meanValue>1; i++ ){
    for( let j=0; j<self.metaNames.length; j++ ){
      if (String(means[i].Categories)==String(self.metaNames[j])){
        selectedCategories.push[j];
      }
    }
  }
  // console.log('selectedCategories =',selectedCategories);
  self.drawBoxPlot(dataset);
}

formatNewDataset(){
  let self = this
  let newCollection=[];
      for(let i=0;i<self.metaGroupValues.length;i++){
        for(let j=0;j<self.metaGroupValues[i].length;j++){
          for(let k=0;k<self.metaGroupValues[i][j].length;k++){
            let group=j+1; //group division #
            let value=parseFloat(self.metaGroupValues[i][j][k]);
            let category = self.metaNames[i];
            let newDataEntry={Group:group, y:value, x:category};
            newCollection.push(newDataEntry);
          }
        }
      }
  return newCollection;

}

//constructior metaDataEntry for format new dataset
metaDataEntry(subGroup, amount, group) {
    this.Group=subGroup;
    this.y=amount
    this.x=group
 }

contain(array,value){
  for (let i=0;i<array.length;i++){
    if (value==array[i])
      return true;
  }
  return false;
}

groupByIndex(collection) {
  let self = this
  let indexArray=[], sortedGroupNames=[], sortedGroupValues=[];
  Object.keys(collection).forEach(function(k){
    let index=parseInt(k.charAt(5)); 
    if ( !self.contain(indexArray,parseInt(index)) ){
      indexArray[index-1]=[];
    }
  });
  for(let item in collection){
    let index=parseInt(item.charAt(5)); 
    indexArray[index-1].push([item,collection[item]]);
  }
  for(let i=0;i<indexArray.length;i++){
    indexArray[i].sort(function(a,b){
      return a[1]-b[1];
    });
  }
  for(let i=0;i<indexArray.length;i++){
    sortedGroupNames[i]=[];
    sortedGroupValues[i]=[];
    for(let j=0;j<indexArray[i].length;j++){
      sortedGroupNames[i][j]=indexArray[i][j][0];
      sortedGroupValues[i][j]=indexArray[i][j][1];
    }
  }
  return [sortedGroupNames,sortedGroupValues];
}
  
drawBoxPlot(dataset){
  // console.log("drawboxplotdataset",dataset)
  let self = this
  let margin = {top: 50, right: 100, bottom: 100, left: 100},
      width = 1600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom
	let labels2 = true;
	let min = Infinity,
	    max = -Infinity;    
	let x0 = d3.scaleBand()
            .range([0, width], .2);
  let x_1 = d3.scaleBand();  
	let y_0 = d3.scaleLinear()
		          .range([height + margin.top, 0]); 
	let xAxis1 = d3.axisBottom()
                     .scale(x0)
	let yAxis1 = d3.axisLeft()
	    .scale(y_0)
	    .tickFormat(d3.format(".2s"));
	let svg = d3.select(".plot").append("svg")
	            .attr("class", "box")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
	            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  let Categories = d3.map(dataset, function(d){return d.x;}).keys();
  let Groups = d3.map(dataset, function(d){return d.Group;}).keys();
  let dataarray = [];
	Categories.forEach(function(cat) {
	    let data_tmp = []
	    Groups.forEach(function(group) {
	        let tmp = [];
	      	dataset.forEach(function(d) {
		        if(d.x == cat && d.Group == group){
		        	tmp.push(d.y);
		        }; 
	    	});
	      data_tmp.push({group: group, value: tmp});
		});
		dataarray.push({Categories: cat, Data: data_tmp});
	});
  min = d3.min(dataset, function(d){ return d.y }) ;
  max = d3.max(dataset, function(d){ return d.y }) ;
	x0.domain(dataset.map(function(d) { return d.x; }));
	x_1.domain(Groups)
    .range([0, x0.bandwidth()]);
  y_0.domain([min, max]);
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + (height + margin.top) + ")")
	    .call(xAxis1);
	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis1)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Percentage");
   
	let boxplot = d3.box()
		.whiskers(this.iqr(1.5))
		.width(x_1.bandwidth())
		.height(height + margin.top)	
		.domain([min, max])
		.showLabels(labels2)
    .color(self.color)

  // console.log("dataarray",dataarray)
  let state = svg.selectAll(".state2")
	    .data(dataarray)
	    .enter().append("g")
	    .attr("class", "state")
	    .attr("transform", function(d) { return "translate(" + x0(d.Categories)  + ",0)" } );
	   
	state.selectAll(".box")
	    .data(function(d) { 
        // console.log('d.Data is',d.Data);
        return d.Data; 
      })
		  .enter().append("g")
		  .attr("transform", function(d) { 
        // console.log("x_1(d.group)",x_1(d.group))
        return "translate(" +  x_1(d.group)  + ",0)" } )
	    .call(boxplot);

  //draw legend on the right side of the plot
  let legend = svg.selectAll(".legend")
        .data(self.color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          // return "translate(0," + (height-margin.bottom-i*20) + ")";
          return "translate(0," + (height-margin.bottom-i*20) + ")";
        });

    legend.append("rect")
        .attr("x", width)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", self.color);

    legend.append("text")
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
                          svgString2Image( svgString, 3200, 1200, 'png', save ); // passes Blob and filesize String to the callback
                          function save( dataBlob, filesize ){
                            saveAs( dataBlob, 'boxplot.png' ); // FileSaver.js function
                          }
                      })
}

//returns a function to compute the interquartile range.
iqr(k) {
  return function(d) {
  // return function(d, i) {
    let q1 = d.quartiles[0],
        q3 = d.quartiles[2],
        iqr = (q3 - q1) * k,
        i = -1,
        j = d.length;
    // console.log('q1='+q1+' q3='+q3+' iqr='+iqr); //all decimals here, no problem
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}

}
