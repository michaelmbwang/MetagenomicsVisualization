class visualizer_barplot{

	constructor(d,c){
		self = this
		self.dataset = d
		self.color = d3.scaleOrdinal().range(c)
		self.init();
	}

	init(){
		let self = this
		d3.selectAll("svg").remove()
		self.drawStackBarPlot();
	}

	drawStackBarPlot(){
		let self = this
		let margin = {top: 50, right: 100, bottom: 100, left: 100},
				width = 1600 - margin.left - margin.right,
				height = 800 - margin.top - margin.bottom,
				that = this
		let data = self.dataset
		// console.log("data=",data)
		// console.log("data[0]=d",data[0])
		// let x = d3.scaleOrdinal().rangeRoundBands([0, width]);
		let x = d3.scaleBand().rangeRound([0, width]);

		let y = d3.scaleLinear().rangeRound([height, 0]);
		
		let xAxis = d3.axisBottom()
					.scale(x)
					
		let yAxis = d3.axisLeft()
					.scale(y)
					.tickFormat(d3.format(".0%"));	
		
		let svg = d3.select(".plot")
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			//filter
			// console.log(self.color.domain())
			self.color.domain(d3.keys(data[0])
				.filter(function (key) {
					return key !== "name";
				}));
			//assign color
		data.forEach(function (d) {
			let y0 = 0;
			d.rates = self.color.domain().map(function (name) { //the name here is phylum (e.g. Acidobacteria)
				// console.log("d[name]=",d[name])
				return {
					group: d["name"],
					name: name,
					y0: y0,
					y1: y0 += +d[name],
					amount: d[name]
				};
			});
			// console.log('d.rates is',d.rates)
			d.rates.forEach(function (r) {
				r.y0 /= 100;
				r.y1 /= 100;
			})
		})
			//sort by first spy content (Acidobacteria)
			// data.sort(function (a, b) {
			// 		return b.rates[0].y1 - a.rates[0].y1;
			// 	});
			// console.log("data with rates=",data)
			x.domain(data.map(function (d) {
					return d.name;
				}));
			svg.append("g")
					.attr("class", "xaxis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);
			//rotate xaxis labels
			svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
	          .attr("transform", function(d) {
	              return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
	        });
			svg.append("g")
					.attr("class", "yaxis")
					.call(yAxis);
		// prepare the tooltip bits, initial display is hidden
		let tooltip = d3.select("body").append("div").attr("class", "toolTip");
		
		// create groups for each series, rects for each segment 
		let bar = svg.selectAll(".name")
					.data(data).enter()
					.append("g")
					.attr("class", "name")
					.attr("transform", function (d) {
						// console.log("d=",d)
						return "translate(" + x(d.name) + ",0)";
					})				
		
			svg.selectAll(".x.axis .tick text")
	            .call(self.wrap, x.range());	
		
		let bar_enter = bar.selectAll("rect")
						.append("rect")
					    .data(function(d) { return d.rates; })
					    .enter()
						.append("rect")
						.attr("class","bar_enter")
						.attr("id",function(d){
							return d.group+d.name
						})
					    .attr("width", x.bandwidth())
					    .attr("y", function(d) { return y(d.y1); })
					    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
					    .style("fill", function(d) { return self.color(d.name); });

			bar_enter.on("mousemove", function(d,i){
				tooltip.style("left", d3.event.pageX+"px")
				tooltip.style("top", d3.event.pageY+"px")
				tooltip.style("display", "inline-block")
				let str = d.group+"<br>"+d.name+"<br>"+d.amount+"%"
				tooltip.html(str)
			})

			bar_enter.on("mouseout", function(d){
				tooltip.style("display", "none")
			})

		let legend = svg.selectAll(".legend")
					.data(self.color.domain().slice().reverse())
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function (d, i) {
						return "translate(0," + (height-margin.bottom-i*20) + ")"
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
						return d
					})
		// let buttest = d3.select(".export")
		// 				.select("input")
		// if(buttest!==null){
		// 	buttest.node().remove()
		// }
		let butExport = d3.select(".export")
						.selectAll("input")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "export")
                      .attr("class", "export")
                      .attr("value", "Export")
                      .on("click", function(){
                          var svgString = getSVGString(svg.node());
                          svgString2Image( svgString, 3200, 1600, 'png', save ); // passes Blob and filesize String to the callback
                          function save( dataBlob, filesize ){
                            saveAs( dataBlob, 'stackedbarplot.png' ); // FileSaver.js function
                          }
                      })

	}

	//rotate xAxis label
	wrap(text, width) {
		let self = this
	    text.each(function() {
	        let text = d3.select(this),
	                words = text.text().split(/\s+/).reverse(),
	                word,
	                line = [],
	                lineNumber = 0,
	                lineHeight = 1.1, // ems
	                y = text.attr("y"),
	                dy = parseFloat(text.attr("dy")),
	                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	        while (word = words.pop()) {
	            line.push(word);
	            tspan.text(line.join(" "));
	            if (tspan.node().getComputedTextLength() > width) {
	                line.pop();
	                tspan.text(line.join(" "));
	                line = [word];
	                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	            }
	        }
	    })
	}

	transGrouped(phydataset) {
		// console.log('testing')
		let data=[];
		for(let i=0;i<5;i++){
			data[i]=[];
			for(let j=0;j<18;j++){
				data[i][j]=parseFloat(0);
			}
		}
		let numOfSubGroup=new Array(5);
		for(let i=0;i<5;i++){
			numOfSubGroup[i]=parseInt(0);
		}
		for(let i=0;i<phydataset.length;i++){ // 200
			let obj=phydataset[i];
			let noOfGroup=parseInt(obj.name.charAt(5));
			numOfSubGroup[noOfGroup-1]+=parseInt(1);
			// if(Number.isInteger(noOfGroup))
			// 	console.log(noOfGroup);
			let noOfType=-1; //to get rid of the first name obj e.g. Group1_xx
			for(let item in obj){
				// console.log(noOfType);
				if(noOfType==-1){
					// console.log(obj[item]);
					noOfType++;
					continue;
				}
				else if(noOfType<18){
					let percentage = parseFloat(obj[item]);
					data[noOfGroup-1][noOfType]=data[noOfGroup-1][noOfType]+percentage;
					noOfType++;
					continue;
				}
				else
					break;
			}
		}
		for(let i=0;i<5;i++){
			for(let j=0;j<18;j++){
				data[i][j]=data[i][j]/numOfSubGroup[i];
			}
		}
		// console.log(data);
		let typeNames=[];
		let tmp=0;
		for(let itm in phydataset[0]){
			if(tmp>0){
				typeNames[tmp-1]=itm;
			}
			tmp++;
		}
		// console.log(typeNames);
		let newStr='[';
		for(let i=0;i<5;i++){
			newStr=newStr+'{"name":"Group'+(i+1)+'"';
			for(let j=0;j<18;j++){
				newStr=newStr+',"'+typeNames[j]+'":"'+data[i][j]+'"';
			}
			if(i<4)
				newStr+='},';
			else
				newStr+='}';
		}
		newStr+=']';
		data = JSON.parse(newStr);
		return data;
		drawStackBarPlot(data);
	}

}



