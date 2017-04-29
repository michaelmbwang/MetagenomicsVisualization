class visualizer_heatmap{

constructor (d1,d2,d3,c1){
 	this.data = d1
 	this.datalefttree = d2
 	this.datatoptree = d3
 	this.colorArrayHeatmap = c1
 	// console.log(this.data, this.datalefttree, this.datatoptree)
	this.init()
}

init(){
	let self = this
	// let width=1600,
	// 	height=1200
	self.width=1600
	self.height=1200
	let svg = d3.select(".plot")
				.append("svg")
				.attr("class","svg")
				.attr("width",self.width)
				.attr("height",self.height)
	// let parameters={width:1200, height:1200, marginTop: 100, marginLeft:100, marginRight:200, margin}
	let heatmapParams = {width:1000, height:600, marginTop:100, marginBottom:60, marginRight:80, marginLeft:100}
	let boxplotParams = {width:200, height:600, marginTop:100, marginBottom:50, marginRight:0, marginLeft:(heatmapParams.width+heatmapParams.marginLeft+heatmapParams.marginRight)}
	let barplotParams = {width:1000, height:200, marginTop: (heatmapParams.marginTop+heatmapParams.height+heatmapParams.marginBottom), marginBottom:50, marginLeft: heatmapParams.marginLeft}
	this.draw(svg, heatmapParams, boxplotParams, barplotParams, this.data, this.datalefttree, this.datatoptree)
}

//*************************draw heatmap***********************************
draw(svg, params1, params2, params3, dataset1, dataset2, dataset3){
	let self = this
	//****************************************tooltip****************************************
	let tooltip = d3.select("body")
					.append("div")
					.attr("class", "ttip")
	//****************************************draw heatmap****************************************
	let colorScaleHeatmap = d3.scaleQuantize().domain([0,100]).range(self.colorArrayHeatmap.reverse())
	let orderRow = dataset1.map(function (d){return d.name})
	let orderRowIndex = [9,7,5,15,2,11,12,10,8,17,18,1,16,14,4,13,3,6]
	orderRow = orderRowIndex.map(x => orderRow[parseInt(x)-1])
	this.rowNum = orderRow.length
	let orderColumn = Object.keys(dataset1[0]).filter(function(d){return d !== "name"})
	let orderColumnIndex = [17,157,12,88,42,44,85,132,18,71,9,43,53,69,119,149,63,24,67,40,92,4,55,58,68,2,49,72,111,91,74,76,77,96,145,8,73,84,75,128,13,21,26,130,115,54,66,86,47,57,112,51,117,41,52,60,121,82,146,118,124,32,120,31,103,131,174,34,105,110,180,142,172,100,197,5,27,79,89,176,36,46,129,33,114,22,101,159,59,109,7,83,61,37,168,14,102,1,185,187,16,23,70,137,143,64,65,38,147,194,104,190,29,19,166,171,39,11,20,30,6,95,45,135,56,170,10,199,94,126,186,3,78,178,163,183,108,81,106,127,188,25,99,93,80,169,90,161,153,50,141,150,134,140,160,173,156,193,181,28,148,155,138,182,162,191,139,152,133,167,200,125,179,184,97,189,136,116,123,113,158,87,165,195,198,98,154,122,107,196,15,177,164,175,48,144,192,151,35,62]
	orderColumn = orderColumnIndex.map(x => orderColumn[parseInt(x)-1])
	this.columnNum = orderColumn.length
	let cellWidth = params1.width / orderColumn.length
	let cellHeight = params1.height / orderRow.length
	let rowLabels = []
	let columnLabels = []
	
	//draw left tree dendrogram
	let dataLeftTree = this.formatTreeData(dataset2,this.rowNum)
	let clusterLeftTree = d3.cluster()
							.size([params1.height,params1.marginLeft])
							.separation(function(a,b){
								return 1
							})
	let hierarchyLeftTree = d3.hierarchy(dataLeftTree, d => {
		let result = []
		if (d.V1) result.push(d.V1)
		if (d.V2) result.push(d.V2)
		return result
	}).sort((a, b) => orderRowIndex.indexOf(a.data.node)-orderRowIndex.indexOf(b.data.node))
	// orderRow = hierarchyLeftTree.leaves().map(x => orderRow[-parseInt(x.data.node)-1])
	let nodeLeftTree = clusterLeftTree(hierarchyLeftTree)
	console.log("nodeLeftTree",nodeLeftTree)
	let corLeftTree=[]
	corLeftTree = this.formatLeftTree(corLeftTree, nodeLeftTree)
	console.log("corLeftTree",corLeftTree)
	let treeLeft = svg.append("g")
						.attr("class","treeLeft")
						.attr("width",params1.marginLeft)
						.attr("height",params1.height)
						.attr("transform", "translate(0," + params1.marginTop+")")
	// let branchTreeLeft = treeLeft.selectAll(".branchTreeLeft")
	// 							.data(corLeftTree)
	// 							.enter()
	// 							.append("path")
	// 							.attr("class","branchTreeLeft")
	// 							.attr("d",function(d){return d3.line()(d.cors)})
	
	let highlightRows = []
	let treeNoLeft = 0
	let leafNoLeft = this.rowNum - 1
	let drawLeftTree = (node) => {
		if(node.children){
			node["treeNo"] = treeNoLeft
			treeNoLeft = treeNoLeft + 1
			// console.log("node",node)
			let element = treeLeft.append("path")
					.attr("class", "branchTreeLeft")
					.datum($.extend(true, node, {"treeNo": treeNoLeft}))
					.attr("d",function(d){
						// console.log(d)
						return d3.line()([[d.children[1].y, d.children[1].x], [d.y, d.children[1].x], 
											[d.y,d.children[0].x], [d.children[0].y, d.children[0].x]])
					})
					.attr("stroke", "gray")
					.attr("fill", "none")
			element.on("mousemove", function(d){
				let branches=[]
				branches = self.getBranches(branches, d)
				treeLeft.selectAll(".branchTreeLeft")
					.attr("stroke", function(t){
						if(branches.indexOf(t.treeNo)!==-1)
							return "#565656"
					})
					.attr("stroke-width", function(t){
						if(branches.indexOf(t.treeNo)!==-1)
							return "4px"
					})
			})
			element.on("mouseout", function(d){
				treeLeft.selectAll(".branchTreeLeft")
					.attr("stroke","gray")
					.attr("stroke-width", "2px")
			})
			element.on("click", function(d){
				let leaves=[]
				leaves= self.getLeaves(leaves, d)
				console.log("leaves",leaves)
				console.log("highlightRows",highlightRows)
				if(self.compareArray(highlightRows,leaves)){
					console.log("EQUAL!")
					highlightRows=[]
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightColumns.length!==0){
								if(highlightColumns.indexOf(c.column)!==-1)
									return 1
								else
									return 0.3
							}
							else{
								return 1
							}
						})
				}
				else{
					highlightRows=leaves
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightColumns.length!==0){
								if(highlightColumns.indexOf(c.column)!==-1 || highlightRows.indexOf(c.row)!==-1)
									return 1
								else 
									return 0.3
							}
							else{
								if(leaves.indexOf(c.row)!==-1)
											return 1
										else
											return 0.3
							}
						})
				}
			})
			if(node.children[1]){
				drawLeftTree(node.children[1], treeNoLeft, leafNoLeft)
			}
			if(node.children[0]){
				drawLeftTree(node.children[0], treeNoLeft, leafNoLeft)
			}
		}
		else{
			node["leafNo"] = leafNoLeft
			leafNoLeft = leafNoLeft - 1
		}
	}
	
	//draw top tree dendrogram
	let dataTopTree = this.formatTreeData(dataset3,this.columnNum)
	let clusterTopTree = d3.cluster()
							.size([params1.width,params1.marginTop])
							.separation(function(a,b){
								return 1
							})
	let hierarchyTopTree = d3.hierarchy(dataTopTree, d => [d.V1, d.V2].filter(x => x))
							.sort((a, b) => {
								// console.log(orderColumnIndex.indexOf(-parseInt(a.data.node)),orderColumnIndex.indexOf(-parseInt(b.data.node)))
								// console.log("node",parseInt(a.data.node),b.data.node)
								// console.log("data",a.data,b.data)
								// console.log("leaves",a.leaves()[0],b.leaves()[0])
								let leafa = a.leaves()[0]
								let leafb = b.leaves()[0]
								// console.log("leavesnode",orderColumnIndex.indexOf(-parseInt(leafa.data.node)),orderColumnIndex.indexOf(-parseInt(leafb.data.node)))
								// return orderColumnIndex.indexOf(-parseInt(a.data.node)) - orderColumnIndex.indexOf(-parseInt(b.data.node))
								return orderColumnIndex.indexOf(-parseInt(leafa.data.node)) - orderColumnIndex.indexOf(-parseInt(leafb.data.node))
							})
	
	let nodeTopTree = clusterTopTree(hierarchyTopTree)
	let corTopTree = []
	corTopTree = this.formatTopTree(corTopTree, nodeTopTree)
	let treeTop = svg.append("g")
						.attr("class","treeTop")
						.attr("width",params1.width)
						.attr("height",params1.marginTop)
						.attr("transform", "translate(" + params1.marginLeft+",0)")
	// let branchTreeTop = treeTop.selectAll(".branchTreeTop")
	// 							.data(corTopTree)
	// 							.enter()
	// 							.append("path")
	// 							.attr("class","branchTreeTop")
	// 							.attr("d",function(d){return d3.line()(d)})
	let highlightColumns = []
	let treeNoTop = 0
	let leafNoTop = this.columnNum - 1
	let drawTopTree = (node) => {
		if(node.children){
			node["treeNo"] = treeNoTop
			treeNoTop = treeNoTop + 1
			// console.log("node",node)
			let element = treeTop.append("path")
					.attr("class", "branchTreeTop")
					.datum($.extend(true, node, {"treeNo": treeNoTop}))
					.attr("d",function(d){
						// console.log(d)
						return d3.line()([[node.children[1].x, node.children[1].y], [node.children[1].x, node.y],
										 [node.children[0].x,node.y], [node.children[0].x, node.children[0].y]])
					})
					.attr("stroke", "gray")
					.attr("fill", "none")
			element.on("mousemove", function(d){
				let branches=[]
				branches = self.getBranches(branches, d)
				treeTop.selectAll(".branchTreeTop")
					.attr("stroke", function(t){
						if(branches.indexOf(t.treeNo)!==-1)
							return "#565656"
					})
					.attr("stroke-width", function(t){
						if(branches.indexOf(t.treeNo)!==-1)
							return "4px"
					})
			})
			element.on("mouseout", function(d){
				treeTop.selectAll(".branchTreeTop")
					.attr("stroke","gray")
					.attr("stroke-width", "2px")
			})
			element.on("click", function(d){
				let leaves=[]
				leaves= self.getLeaves(leaves, d)
				console.log("leaves",leaves)
				if(self.compareArray(highlightColumns,leaves)){
					console.log("EQUAL!")
					highlightColumns=[]
					console.log("highlightColumns",highlightColumns)
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightRows.length!==0){
								if(highlightRows.indexOf(c.row)!==-1)
									return 1
								else
									return 0.3
							}
							else{
								return 1
							}
						})
				}
				else{
					highlightColumns=leaves
					console.log("highlightColumns",highlightColumns)
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightRows.length!==0){
								if(highlightRows.indexOf(c.row)!==-1 || highlightColumns.indexOf(c.column)!==-1)
									return 1
								else
									return 0.3
							}
							else{
								if(leaves.indexOf(c.column)!==-1)
										return 1
								else
									return 0.3
							}
						})
				}
			})
			if(node.children[1]){
				drawTopTree(node.children[1], treeNoTop, leafNoTop)
			}
			if(node.children[0]){
				drawTopTree(node.children[0], treeNoTop, leafNoTop)
			}
		}
		else{
			node["leafNo"] = leafNoTop
			leafNoTop = leafNoTop - 1
		}
	}
	console.log("nodeTopTree",nodeTopTree)
	//heatmap
	let heatmap = svg.append("g")
							.attr("class","heatmap")
							.attr("width",params1.width)
							.attr("height",params1.height)
							.attr("transform","translate(" + params1.marginLeft + "," + params1.marginTop+")");
	for(let r in orderRow){
		let currentName = orderRow[r]
		// console.log(currentName)
		rowLabels.push(currentName)
		for(let c in orderColumn){
			let currentGroup = orderColumn[c]
			let currentData = dataset1.filter(function(d){return d.name == currentName})[0][currentGroup]
			let rect = heatmap.append("rect")
					.attr("class","cell")
					.attr("x", c * cellWidth)
					.attr("y", r * cellHeight)
					.attr("width", cellWidth)
					.attr("height", cellHeight)
					.attr("fill", colorScaleHeatmap(currentData))
					.datum(function(d){
						return {
							row: parseInt(r),
							column: parseInt(c)
						}
					})
				rect.on("mousemove",function(d){
						console.log(currentData)
						tooltip.style("left",d3.event.pageX+10+"px")
		                tooltip.style("top",d3.event.pageY-25+"px")
		                tooltip.style("display","inline-block")
		                let tipstring = currentGroup + "<br>" + currentName + "<br>" + currentData +"%"
		                tooltip.style("width",(tipstring.length*3+'px')) //hardCode!
		                tooltip.html(tipstring)
					})
				rect.on("mouseout",function(d){
		              tooltip.style("display","none");
		            });
			if(r == 0){
				// console.log(currentGroup)
				columnLabels.push(currentGroup)
			}
		}
	}
	// console.log(columnLabels)
	drawLeftTree(nodeLeftTree, treeNoLeft, leafNoLeft)
	drawTopTree(nodeTopTree, treeNoTop, leafNoTop)

//**************************************draw boxplot*********************************//
	// console.log("dataset1 at boxplot",dataset1)
	let categories = this.getCategories(dataset1)
	let colorBoxplot = d3.scaleOrdinal().range(["#d62728", "#1f77b4", "#2ca02c", "#9467bd", "#ff7f0e", "#FFFF00", "#b2b2ff", "#8c564b",
                "#f7b6d2", "#c7c7c7", "#74c476", "#d6616b", "#6b6ecf", "#e377c2", "#31a354",
                "#e7ba52", "#000033", "#bd9e39", "#2ca02c", "#3232ff", "#636363", "#74c476"])
    colorBoxplot.domain(categories)
	// console.log("colorBoxplot.domain()",colorBoxplot.domain())
	let datasetLogBoxplot = this.logBoxplotData(dataset1)
	// console.log("datasetLogBoxplot",datasetLogBoxplot)
	let datasetBoxplot = this.formatBoxplotData(datasetLogBoxplot)
	// console.log("datasetBoxplot",datasetBoxplot)
	datasetBoxplot = this.sortDataBoxplot(datasetBoxplot, orderRow)
	// console.log("sorted datasetBoxplot",datasetBoxplot)
	let dataField = "value"	
	let boxRange = this.getBoxplotRange(datasetBoxplot)
	// console.log("boxrange=",boxRange)
	let boxplot = svg.append("g")
					.attr("class", "boxPlot")
					.attr("x", params2.width)
					.attr("y", params2.height)
					.attr("transform", "translate(" + params2.marginLeft + "," + params2.marginTop + ")")	
	// console.log("datasetBoxplot[0]",datasetBoxplot[0])
	// console.log("datasetBoxplot[0].values.length",datasetBoxplot[0].values.length)
	let boxWidth = params2.width,
		boxMargin = cellHeight/10,
		boxHeight = (cellHeight-2*boxMargin)/datasetBoxplot[0].values.length
		// console.log("cellHeight=",cellHeight, "boxHeight",boxHeight)
		// console.log(datasetBoxplot[0].values.length)
		// margin = {top:0,right:0,bottom:0,left:0}
	let chart = d3.box()
				.value(function(d){
					// console.log("d=",d)
					return d[dataField]
				})
				.width(boxWidth)
				.height(boxHeight)
				.color(colorBoxplot)
				.domain([boxRange[0], boxRange[1]])
				// .colorDomain(colorBoxplot.domain())
	for(let i in datasetBoxplot){
		// console.log("i=",i)
		// console.log("species=",datasetBoxplot[i])
		let tmp = datasetBoxplot[i].values
		for(let j in tmp){
			// console.log('j=',j)
			// console.log("tmp[j]=",tmp[j])
			// console.log("tmp[j].groupValues=",tmp[j].groupValues)
			// console.log(arraySpecies[i])
			if(tmp[j].groupValues.length){
				// console.log("groupValues",tmp[j].groupValues)
				boxplot.datum(tmp[j].groupValues)
					.append("g")
					.attr("class","box")
					.attr("transform","translate(0,"+(i*cellHeight+boxMargin+j*boxHeight)+")")
					.call(chart)
			}
		}
	}
	let xScaleBoxplot = d3.scaleLinear()
						.domain([boxRange[0], boxRange[1]])
						.range([0,boxWidth])
	let xAixsBoxplot = d3.axisTop()
						.scale(xScaleBoxplot)
						// .ticks(10)
						.tickFormat(this.tickFormatter)
	boxplot.append('g')
		.attr("class","xAxisBoxplot")
		.attr("transform","translate(0," + 0 + ")")
		.call(xAixsBoxplot)

//**************************************draw barplot*********************************//
	let datasetBarplot = this.formatBarplotData(dataset1)
	datasetBarplot = this.sortDataBarplot(datasetBarplot, orderColumn)
	datasetBarplot = this.reformatDataBarplot(datasetBarplot, orderRow.reverse())
	// console.log("datasetBarplot=",datasetBarplot)
	let xScaleBarplot = d3.scaleBand().rangeRound([0, params3.width])
	xScaleBarplot.domain(datasetBarplot.map(x=>x.name))
	let yScaleBarplot = d3.scaleLinear().rangeRound([params3.height, 0])
	let yAxisBarplot = d3.axisLeft()
				.scale(yScaleBarplot)
				.tickFormat(d3.format(".0%"))
	let colorBarplot = d3.scaleOrdinal().range(["#d62728", "#1f77b4", "#2ca02c", "#9467bd", "#ff7f0e", "#FFFF00", "#b2b2ff", "#8c564b",
							                "#f7b6d2", "#c7c7c7", "#74c476", "#d6616b", "#6b6ecf", "#e377c2", "#31a354",
							                "#e7ba52", "#000033", "#bd9e39", "#2ca02c", "#3232ff", "#636363", "#74c476"])
	colorBarplot.domain(d3.keys(datasetBarplot[0]).filter(function(key){return key !== "name" && key!=="rates"}))
	// console.log("datasetBarplot[0]",datasetBarplot[0])
	// console.log("colorBarplot.domain()",colorBarplot.domain())
	// console.log("datasetBarplot with rates =",datasetBarplot)
	let barplot = svg.append("g")
					.attr("class","barplot")
					.attr("transform","translate("+params3.marginLeft+","+params3.marginTop+")")
	let bar = barplot.selectAll(".bar")
					.data(datasetBarplot)
					.enter()
					.append("g")
					.attr("class","bar")
					.attr("transform", function(d){
						// console.log(xScaleBarplot(d.name))
						return "translate(" + xScaleBarplot(d.name) + ",0)"
					})
	let barEnter = bar.selectAll("rect")
					.append("rect")
					.data(function(d){return d.rates})
					.enter()
					.append("rect")
					.attr("width", cellWidth)
					.attr("y", function(d){return yScaleBarplot(d.y1)})
					.attr("height", function(d){
						// console.log("height=",yScaleBarplot(d.y0)-yScaleBarplot(d.y1))
						return yScaleBarplot(d.y0)-yScaleBarplot(d.y1)
					})
					.attr("fill", function(d){
						// console.log("d.name", d.name)
						// console.log("colorBarplot.domain()",colorBarplot.domain())
						return colorBarplot(d.name)
					})
	barEnter.on("mousemove", function(d,i){
		// console.log("d",d," d.amount=",d.amount)
		tooltip.style("left", d3.event.pageX+"px")
		tooltip.style("top", d3.event.pageY+"px")
		tooltip.style("display", "inline-block")
		let str = d.group+"<br>"+d.name+"<br>"+d.amount+"%"
		tooltip.html(str)
	})
	barEnter.on("mouseout", function(d){
		tooltip.style("display", "none")
	})
	//draw yAxis
	barplot.append("g")
		.attr("class","yAxisBarplot")
		.attr("transform", "translate(" + (-5) + ",0)")			
		.call(yAxisBarplot)

//**************************************draw label*********************************//
	let labelRow = svg.append("g")
					.attr("class","labelRow")
					.selectAll(".labelRow")
					.data(rowLabels)
					.enter()
					.append("text")
					.text(function(d){return d})
					.attr("x", orderColumn.length*cellWidth+5+params1.marginLeft)
					.attr("y", function(d,i){
						// console.log(this.getBBox());
						return i * cellHeight + cellHeight/2 + this.getBBox().height/2 + params1.marginTop;
					})
					.datum(function(d,i){
						return $.extend(true,d,{
							row: i
						})
					})
	let highlightRow = null
	labelRow.on("click", function(d,i){
				if(highlightRow == i){
					highlightRow = null;
					// checkHightlightColumn = false;
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightColumn!==null){
								if(c.column==highlightColumn)
									return 1
								else
									return 0.3
							}
							else{
									return 1
							}
						})
				}
				else{
					highlightRow = i
					// checkHightlightColumn = true;
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightColumn!==null){
								if(c.row==d.row || c.column==highlightColumn)
									return 1
								else 
									return 0.3
							}
							else{
								if(c.row==d.row)
									return 1
								else 
									return 0.3
							}
						})
				}				
			})
	let labelColumn = svg.append("g")
						.attr("class","labelColumn")
						.selectAll(".labelColumn")
						.data(columnLabels)
						.enter()
						.append("text")
						.attr("class","labelColumnText")
						.text(function(d){
							return d;
						})
	labelColumn.attr("x", function(d,i){
				return i*cellWidth - cellWidth/2 + labelColumn.node().getBBox().height/2 + params1.marginLeft;
				})
				.attr("y", params1.height+20+params1.marginTop)
				.attr("transform",function(d,i){
					return "rotate(90," + (i*cellWidth-cellWidth/2+labelColumn.node().getBBox().height/2+params1.marginLeft) + "," + (params1.height+20+params1.marginTop) + ")";
				})
				.datum(function(d,i){
					return $.extend(true,d,{
						column: i
					})
				})
	let highlightColumn = null
	labelColumn.on("click", function(d,i){
				if(highlightColumn == i){
					highlightColumn = null;
					// checkHightlightColumn = false;
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightRow!==null){
								if(c.row==highlightRow)
									return 1
								else
									return 0.3
							}
							else{
									return 1
							}
						})
				}
				else{
					highlightColumn = i
					// checkHightlightColumn = true;
					heatmap.selectAll(".cell")
						.attr("opacity", function(c){
							if(highlightRow!==null){
								if(c.column==d.column || c.row==highlightRow)
									return 1
								else 
									return 0.3
							}
							else{
								if(c.column==d.column)
									return 1
								else 
									return 0.3
							}
						})
				}
		})
	let labelCluster = svg.append("g")
						.attr("class", "labelCluster")
						.selectAll(".labelCluster")
						.data(columnLabels)
						.enter()
						.append("line")
						.attr("x1", function(d,i){
						return cellWidth/2 + i*cellWidth
						})
						.attr("y1", 0)
						.attr("x2", function(d,i){
							return cellWidth/2 + i*cellWidth
						})
						.attr("y2", function(d,i){
							return 20
						})
						.attr("transform", "translate("+params1.marginLeft+","+(params1.height+params1.marginTop)+")")
						.attr("stroke", function(d){
							return colorBoxplot(d.substring(0,6))
						})

//**************************************draw legend*********************************//
	let legendHeatmap = heatmap.append("g")
							.attr("class","legendHeatmap")
							
							.attr("transform","translate(1200, 750)")
	let legendHeatmapWidth = 30
	let legendHeatmapHeight = 5
	for(let i in self.colorArrayHeatmap){
		legendHeatmap.append("rect")
					.attr("x",0)
					.attr("y",-i*legendHeatmapHeight)
					.attr("width",legendHeatmapWidth)
					.attr("height",legendHeatmapHeight)
					.attr("transform","rotate(-45)")
					.attr("fill", self.colorArrayHeatmap[i])
	}
	let legendWidth = 2*cellWidth,
		legendHeight = 2*cellWidth,
		legendInter = 3*cellWidth,
		critical = Math.floor(params3.height/legendInter)-1 //params3.height == params2.width
	// console.log("colorBarplot.domain()", colorBarplot.domain())
	let legendBarplot = barplot.selectAll(".legendBarplot")
						.data(colorBarplot.domain())
						.enter()
						.append("g")
						.attr("class", "legendBarplot")
						.attr("transform", function(d,i){
							if(i>critical)
								return "translate(" + (params3.width+legendInter+80) + ","
											+ (critical*legendInter-(i-critical-1)*legendInter) + ")"
							else
								return "translate(" + (params3.width+legendInter) + ","
										+ i*legendInter + ")"
						})
	legendBarplot.append("rect")
				.attr("width", legendWidth)
				.attr("height", legendHeight)
				.attr("fill", colorBarplot)

	legendBarplot.append("text")
				.attr("transform", function(d,i){
					return "translate(" + legendWidth + ",8)"
				})
				.text(function(d){
					return d
				})
	// console.log("colorBoxplot.domain()", colorBoxplot.domain())
	let legendBoxplot = boxplot.selectAll(".legendBoxplot")
						.data(colorBoxplot.domain())
						.enter()
						.append("g")
						.attr("class", "legendBoxplot")
						.attr("transform", function(d,i){
							// console.log("d",d,"i",i)
							if(i>critical)
								return "translate(" + (params2.width-(i-1)*legendInter) + ","
											+ (params2.height+2*legendInter) +")"
							else
								return "translate(" + (i*(legendInter+35)) + ","
											+ (params2.height+legendInter) + ")"
						})
	legendBoxplot.append("rect")
				.attr("width", legendWidth)
				.attr("height", legendHeight)
				.attr("fill", colorBoxplot)
	legendBoxplot.append("text")
				.attr("transform", "translate(" + legendWidth + ",8)")
				.text(function(d){
					return d
				})
	let butExport = d3.select(".params")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "redraw")
                      .attr("value", "Export")
                      .on("click", function(d){
                          var svgString = getSVGString(svg.node());
                          svgString2Image( svgString, 2*self.width, 2*self.height, 'png', save ); // passes Blob and filesize String to the callback
                          function save( dataBlob, filesize ){
                            saveAs( dataBlob, 'integratedheatmap.png' ); // FileSaver.js function
                          }
                      })
}

formatLeftTree(cor,node){
	if(node.children){
		cor.push({cors:[[node.children[1].y, node.children[1].x], [node.y, node.children[1].x], [node.y,node.children[0].x], [node.children[0].y, node.children[0].x]], node})
		if(node.children[1]){
			this.formatLeftTree(cor,node.children[1])
		}
		if(node.children[0]){
			this.formatLeftTree(cor,node.children[0])
		}
	}
	return cor
}

getBranches(branches, node){
	if(node.children){
		branches.push(node.treeNo)
		if(node.children[1])
			this.getBranches(branches, node.children[1])
		if(node.children[0])
			this.getBranches(branches, node.children[0])

	}
	return branches
}

getLeaves(leaves, node){
	if(!node.children)
		leaves.push(node.leafNo)
	else{//if(node.children){
		if(node.children[1])
			this.getLeaves(leaves, node.children[1])
		if(node.children[0])
			this.getLeaves(leaves, node.children[0])

	}
	return leaves
}

formatTopTree(cor,node){
	if(node.children){
		// cor.push([[node.children[1].y, node.children[1].x], [node.y, node.children[1].x], [node.y,node.children[0].x], [node.children[0].y, node.children[0].x]])
		cor.push([[node.children[1].x, node.children[1].y], [node.children[1].x, node.y], [node.children[0].x,node.y], [node.children[0].x, node.children[0].y]])
		if(node.children[1]){
			this.formatTopTree(cor,node.children[1])
		}
		if(node.children[0]){
			this.formatTopTree(cor,node.children[0])
		}
	}
	return cor
}

formatTreeData(dataset, num){
	let data=dataset
	for (let i = 1; i <= num; i++)
		data.push({node: "-" + i})

	let dict = {}
	for (let i = 0; i < data.length; i++) {
		dict[data[i].node] = data[i]
	}
	for (let i = 0; i < data.length; i++) {
		let node = data[i]
		if (node.V1) {
			node.V1 = dict[node.V1]
			node.V2 = dict[node.V2]
		}
	}
	let checkLen = (x) => {
		if (!x) {
			return 1
		}
		return checkLen(x.V1) + checkLen(x.V2)
	}
	for (let i = 0; i < data.length; i++) {
		data[i].size = checkLen(data[i])
	}
	let root = data.reduce((x, y) => x.size > y.size ? x : y)
	// console.log(root)
	return root
}

getCategories(data){
	// console.log(Object.keys(data[0]).filter(x=>{return x!=="name"}))
	let tmp = []
	Object.keys(data[0]).filter(k=>{return k!=="name"}).map(k => {
		if(tmp.indexOf(k.substring(0,6))==-1){
			tmp.push(k.substring(0,6))
		}
	})
	// console.log("tmp=",tmp)
	return tmp
}	

logBoxplotData(data){
	let tmp = $.extend(true, {}, data)
	for(var i in tmp){
        // console.log(data[i])
        for(var k in tmp[i]){
            if (parseFloat(tmp[i][k])){
                tmp[i][k] = Math.log(parseFloat(tmp[i][k])/100)*(-1)
        	}
    	}
    }
    delete tmp.columns
    return tmp
}

formatBoxplotData(data){
    // console.log(data)
    let array =[]
    for(let i in data){
        // console.log(data[i])
        let tmp = data[i]
        // console.log(tmp.name)
        let tmp2 =[]
        for(let k in data[i]){
            if (tmp.hasOwnProperty(k)&&k!=="name"){
                if(parseFloat(tmp[k])!==0){
                    let tmp3={
                        groupNo: k.substring(0,6),
                        ID: k,
                        value: parseFloat(tmp[k])
                    }
                    // console.log(tmp2)
                    tmp2.push(tmp3)
                }
            }
        }
        // console.log("tmp3=",tmp3)
        let tmparray=[]
        for(let l in tmp2){
            // console.log(tmp3[l])
            let gno = parseInt(tmp2[l].groupNo.charAt(5))
            if(tmparray[gno-1]==null){
                tmparray[gno-1]=[]
            }else{
                tmparray[gno-1].push(tmp2[l])
            }
        }
        // console.log("tmparray=",tmparray)
        let tmparray2=[]
        for(let m in tmparray){
            let tmpobj2 = {
                groupNo: parseInt(m)+1,
                groupValues: tmparray[m]
            }
            // console.log("tmpobj2=",tmpobj2)
            tmparray2.push(tmpobj2)
        }
        // console.log("tmparray2=",tmparray2)
        let tmpobj = {
            name: tmp.name,
            values: tmparray2
        }
        // console.log(tmpobj)
        array.push(tmpobj)
    }
    // console.log("final data=",array)
    return array
}

sortDataBoxplot(data, order){
	// console.log(data,order)
	let newData=[]
	order.forEach(x => data.forEach(y => (y.name == x) ? newData.push($.extend(true,{},y)) : 0))
	// console.log(newData)
	return newData
}

getBoxplotRange(data){
    let min = Infinity
    let max = -Infinity
    for(let i in data){
    	for(let j in data[i].values){
    		for(let k in data[i].values[j].groupValues){
    			let tmp = data[i].values[j].groupValues[k].value
    			if (tmp<min)
    				min = tmp
    			if (tmp>max)
    				max=tmp
    		}
    	}
    }
    return [min,max]
}

tickFormatter(d) {
    if (d !== (d | 0)) {
        // format non-integers as 1-decimal float
        return d3.format('0.1f')(d);
    } else if (d < 1000) {
        // format just as integers
        return d3.format('d')(d);
    } else if (d < 10000 && (d % 1000 === 0)) {
        // format using SI, to 1 significant digit
       return d3.format('0.1s')(d);
    } else {
        // format using SI, to 2 significant digits
        return d3.format('0.2s')(d);
    }
}

formatBarplotData(data){
	// console.log(data)
	let tmp=[]
	for(let k in data[0]){
		if(data[0].hasOwnProperty(k)&&k!=="name"){
			let tmp2 = {
				name:k,
			}
			tmp.push(tmp2)
		}
	}
	// console.log(tmp[0],tmp[0].name,data[0][tmp[0].name])
	for(let t in tmp){
		// tmp[t].values=[]
		// console.log(data[0][tmp[t].name])
		for(let d in data){
			if(t == 0){
				// console.log("data[d]",data[d])
				// console.log(data[d][tmp[t].name])
			}
			tmp[t][data[d].name] = parseFloat(data[d][tmp[t].name])
		}
	}
	// console.log(tmp)
	return tmp
}

sortDataBarplot(data, orderCol){
	// console.log("data=",data,"order=",order)
	let tmp = []
	for(let i in orderCol){
		for(let d in data){
			if (data[d].name == orderCol[i]){
				tmp[i] = $.extend(true,{},data[d])
				// let all = 0
				// let keys = Object.keys(tmp[i]).filter(x => {return x!=="name"&&x!=="rates"})
				// for(let k in keys){
				// 	all = (all + parseFloat(tmp[i][keys[k]]))
				// }
				// console.log("all",all)
				// tmp[i].total = all 
				break
			}
		}
	}
	// console.log("tmp",tmp)
	return tmp
}

reformatDataBarplot(data, orderRow){
	let tmp = []
	data.forEach(function(d){
		tmp.push($.extend(true, {}, d))
	})
	tmp.forEach(function(d){
		let y0 = 0;
		// console.log(d)
		d.rates = orderRow.map(function(n){
			return {
				name: n,
				group: d.name,
				y0: y0,
				y1: y0 += +d[n],
				amount: d[n]
			}
		})
		d.rates.forEach(function(d){
			d.y0 /= y0
			d.y1 /= y0
		})
	})
	// console.log("tmp",tmp)
	return tmp
}

compareArray(array1, array2){
	return array1.length==array2.length && array1.every(function(e,i){return e==array2[i]})
}

}