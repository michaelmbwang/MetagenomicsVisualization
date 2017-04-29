class controller_heatmap{

  constructor (){
    let dataUrl1 = "../data/data_org.csv"
    let dataUrl2 = "../data/lefttree.csv"
    let dataUrl3 = "../data/toptree.csv"
    this.dataUrl = [dataUrl1,dataUrl2,dataUrl3]
    let dataheatmap
    let datatoptree
    let datalefttree
    this.data=[dataheatmap,datalefttree,datatoptree]
    this.checked=0
    this.colorArray = ["#ff4040","#ff5353","#ff6666","#ff7979","#ff8c8c","#ff9f9f","#ffb2b2","#ffc5c5","#ffd8d8","#ffebeb","#ffffff","#ecf0fc","#d9e1f9","#c6d2f6","#b3c3f3","#a0b4f0","#8da5ed","#7a96ea","#6687e7","#5478e4","#4169e1"]
    this.init();
  }

  init(){
    let self = this
    for(let i in self.dataUrl){
      // console.log("url", self.dataUrl[i])
      d3.csv(self.dataUrl[i],function(dataset){
        // if(error) throw error
        // console.log(self.dataUrl[i],dataset)
        self.data[i] = dataset
        self.loadDataCallback()
      }) 
    }
  }

  loadDataCallback(){
    let self = this
    self.checked = self.checked + 1
    if(self.checked == 3){
      // console.log("data[0]",this.data[0],"data[1]",this.data[1],"data[2]",this.data[2])
      self.createParamsPanel()
      self.createPlot(self.colorArray);
    }
  }

  createPlot(colorArrayHeatmap){
      var hssplot = new visualizer_heatmap(this.data[0], 
                                          this.data[1], 
                                          this.data[2], 
                                          colorArrayHeatmap
                                          )
  }

  createParamsPanel(){
      let self = this
      // let heatmapPanel = d3.select(".params")
      //                     .append("div")
      //                     .attr("class","heatmapPanel")
      // heatmapPanel.append("h2")
      //           .text("Heatmap Panel")
      // let heatmapColorPanel = heatmapPanel.append("div")
      //                               .attr("class","heatmapColorPanel")
      let boxplotPanel = d3.select(".params")
                          .append("div")
                          .attr("class","boxplotPanel")
      // boxplotPanel.append("h2")
      //           .text("Boxplot Panel")
      boxplotPanel.append("p")
                  .text("Note: The value of the entry in boxplot here has been taken logarithm")
      let butRedraw = d3.select(".params")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "redraw")
                      .attr("value", "Redraw")
                      .on("click", function(d){})
      // let butExport = d3.select(".params")
      //                 .append("input")
      //                 .attr("type", "button")
      //                 .attr("name", "redraw")
      //                 .attr("value", "Export")
      //                 .on("click", function(d){
      //                     var svgString = getSVGString(svg.node());
      //                     svgString2Image( svgString, 2*width, 2*height, 'png', save ); // passes Blob and filesize String to the callback
      //                     function save( dataBlob, filesize ){
      //                       saveAs( dataBlob, 'integratedheatmap.png' ); // FileSaver.js function
      //                     }
      //                 })
  }

}

$(() => {
  var controller = new controller_heatmap()
})
