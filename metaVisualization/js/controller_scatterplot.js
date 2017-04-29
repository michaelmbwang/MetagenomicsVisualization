class controller_scatterplot{

  constructor (){
    let dataUrl1 = "../data/data_org.csv"
    let dataUrl2 = "../data/PCs.csv"
    // let dataUrl3 = "../data/PCA.csv"
    this.dataUrl = [dataUrl1, dataUrl2]
    let dataset
    let PCs
    // let PCA
    this.data=[dataset, PCs]
    this.checked=0
    this.colorArray = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', 
              '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',  
              '#98df8a', '#d62728', '#ff9896',  '#c5b0d5']
    
    this.init()
  }

  init(){
    let self = this
    for(let i in self.dataUrl){
      // console.log("url", self.dataUrl[i])
      d3.csv(self.dataUrl[i],function(error, dataset){
        if(error) throw error
        // console.log(i,dataset)
        self.data[i] = dataset
        self.loadDataCallback()
      }) 
    }
  }

  loadDataCallback(){
    let self = this
    if(self.checked<2)
      self.checked = self.checked + 1
    if(self.checked == 2){
      self.groupNames = self.calculateNumOfGroups(self.dataset);
      console.log("groupNames",self.groupNames)
      self.color = self.colorArray.slice(0,self.groupNames.length);
      console.log("color",self.color,"colorArray",self.colorArray)
      self.PCA = self.formatPCA()
      /************by default******************/
      self.createPlot("PC1", "PC2", self.color, self.groupNames.length)
      /****************************************/
    }
  }

  formatPCA(){
    let self = this
    let tmp = []
    let groupNames = d3.keys(self.data[0][0])
                      .filter(function(n){
                          return n!=="name"
                      })
    // console.log("groupNames", groupNames) 
    groupNames.forEach(function(k){
                  tmp.push({
                    name: k
                  })
                })
    let pcNos = d3.keys(self.data[1][0])
                  .filter(function(n){
                    return n!=="name"
                  })
    // console.log("pcNos", pcNos) 
    tmp.forEach(function(t){//loop group
      pcNos.forEach(function(n){
        let pc = 0
        self.data[1].forEach(function(p){//loop PCA
          // console.log("p",p)
          self.data[0].forEach(function(d){//loop dataset
            if(d.name==p.name){
              // console.log("d",d)
              pc = pc + parseFloat(p[n])*parseFloat(d[t.name])/100
            }
          })
        })
        t[n] = pc
      })
    })
    // console.log("tmp",tmp)
    self.createParamsPanel(pcNos, self.colorArray)
    return tmp
  }

  createPlot(x1, x2, color, length){
    console.log("color",color)
    let data = this.formatData(x1,x2)
    console.log(data)
    var scatterplot = new visualizer_scatterplot(data, color, length)
  }

  createParamsPanel(optpc,optcolor){
    let self = this
    let pcPanel = d3.select(".params")
                  .append("div")
                  .attr("class", "pcPanel")
    pcPanel.append("h2")
          .text("PCs")
    let axisNames = ['Axis1','Axis2']
    axisNames.forEach(function(a){
        let container = pcPanel.append("div")
                              .attr("class", "contianer"+a)
        container.append("label")
                  .text("Axis1")
                  .attr("class", a)
        container.append("select")
                .attr("class", "select"+a)
                .attr("id", "select"+a)
        container.select(".select"+a)
              .selectAll(".options")
              .data(optpc)
              .enter()
              .append("option")
              .attr("class", "options")
              .text(function(d){
                return d;
              })
    })
    for(let i in axisNames){
      d3.select("#select"+axisNames[i]).property("value",optpc[i])
    }
    let colorPanel = d3.select(".params")
                        .append("div")
                        .attr("class","colorPanel")
    colorPanel.append("h2")
              .text("Groups")
    self.groupNames.filter(function(d){
                      return d!=="avg"
                  })
                  .forEach(function(g){
                  // let group = g
                  let container = colorPanel.append("div")
                                          .attr("class","container"+g)
                    container.append("label")
                            .attr("for", g)
                            .attr("class", g)
                            .text(g)
                    // container.append("input")
                    //         .attr("type", "checkbox")
                    //         .attr("checked", true)
                    //         .attr("class", "check"+g)
                    container.append("select")
                            .attr("class", "select"+g)
                            .attr("id", "select"+g)
                    container.select(".select"+g)
                            .selectAll(".options")
                            .data(optcolor)
                            .enter()
                            .append("option")
                            .attr("class","option"+g)
                            .text(function(d){
                              return d;
                            })
                            .attr("background-color",function(d){
                              return "red";
                            })
                            .attr("color",function(d){
                              return "red";
                            })
                  })
    for(let i in self.groupNames){
      d3.select("#select"+self.groupNames[i]).property("value",optcolor[i])
    }
    let butRedraw = d3.select(".params")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "redraw")
                      .attr("value", "Redraw")
                      .on("click", function(d){
                          let x1 = pcPanel.select(".selectAxis1").property("value")
                          let x2 = pcPanel.select(".selectAxis2").property("value")
                          let color = []
                          for(let i in self.groupNames){
                            color[i] = colorPanel.select(".select"+self.groupNames[i])
                                                .property("value")
                          }
                          self.createPlot(x1, x2, color, self.groupNames.length) 
                      })

  }

  formatData(x1, x2){
    let self = this
    let tmp = []
    self.PCA.forEach(function(t){
      let tmp2 = {
        name: t.name
      }
      tmp2["Axis1"] = t[x1]
      tmp2["Axis2"] = t[x2]
      tmp.push(tmp2)
    })
    // console.log("tmp",tmp)
    return tmp
  }

  calculateNumOfGroups(){
    let self = this
    let groupNo=[];
    console.log("data[0]",self.data[0])
    d3.keys(self.data[0][0])
      .filter(function(k){
        return k!=="name"
      })
      .forEach(function(k){
        groupNo.push(k.substring(0,6))
    })
    let unique = groupNo.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });
    return unique;
  }


}

$(() => {
  var controller = new controller_scatterplot()
})
