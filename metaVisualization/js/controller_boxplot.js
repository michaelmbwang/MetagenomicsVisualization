class controller_boxplot{

  constructor (){
    this.dataUrl = "../data/data_org.csv"
    this.checked=0
    this.colorArray = ["#d62728", "#1f77b4", "#2ca02c", "#9467bd", "#ff7f0e", "#FFFF00", "#b2b2ff", "#8c564b",
                "#f7b6d2", "#c7c7c7", "#74c476", "#d6616b", "#6b6ecf", "#e377c2", "#31a354",
                "#e7ba52", "#000033", "#bd9e39", "#2ca02c", "#3232ff", "#636363", "#74c476"]
    this.init()
  }

  init(){
    let self = this
      d3.csv(self.dataUrl,function(error, dataset){
        if(error) throw error
        // console.log(i,dataset)
        if(dataset["columns"])
          delete dataset["columns"]
        self.data = dataset
        self.loadDataCallback()
      }) 
  }

  loadDataCallback(){
    let self = this
      self.data = self.sortSamplesByContent()
      console.log("self.data", self.data)
      self.dataLog = self.formatDataLog()
      console.log("self.dataLog", self.dataLog)
      self.sampleNames = self.getSampleNames(self.dataset)
      console.log("sampleNames",self.sampleNames)
      console.log("sampleNamesself.data", self.data)
      self.groupNames = self.getGroupNames(self.dataset)
      console.log("groupNames",self.groupNames)
      console.log("getGroupNamesself.data", self.data)
      self.color = self.colorArray.slice(0,self.groupNames.length)
      console.log("color",self.color)
      self.createParamsPanel(self.colorArray)
      /************by default******************/
      self.createPlot(self.data, self.color, self.groupNames.length)
      /****************************************/

  }

  createPlot(data, color, length){
    // console.log("color",color)
    console.log("createplot", data)
    var boxplot = new visualizer_boxplot(data, color, length)
  }

  createParamsPanel(optcolor){
    let self = this
    let modePanel = d3.select(".params")
                        .append('div')
                        .attr('class','modePanel')
      modePanel.append("h2")
                    .text("Mode")
      let modes = ["Normal","Logarithm(-log_10)"]
      modes.forEach(function(m){
          let container = modePanel.append("div")
                                .attr("class","container"+m)
          container.append('input')
            .attr('type','radio')
            .attr('value',m)
            .attr('name','mode')
            .attr('checked',function(){
              if(m=="Normal")
                return true
            })
          container.append('label')
                .html(m)
      })

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
                    container.append("input")
                            .attr("type", "checkbox")
                            .attr("checked", true)
                            .attr("class", "check"+g)
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
    let samplePanel = d3.select(".params")
                        .append("div")
                        .attr("class", "samplePanel")
    samplePanel.append("h2")
              .text("Samples")
    self.sampleNames.forEach(function(s){
        let container = samplePanel.append("div")
                                .attr("class", "container"+s)
        container.append("label")
                  .attr("for", s)
                  .attr("class", s)
                  .text(s)
        container.append("input")
                  .attr("type", "checkbox")
                  .attr("checked", true)
                  .attr("class", "check"+s)
                  .attr("id", "a"+self.sampleNames.indexOf(s))
                  .attr("float","left")
        container.append("br")
    })

    let butRedraw = d3.select(".params")
                      .append("input")
                      .attr("type", "button")
                      .attr("name", "redraw")
                      .attr("value", "Redraw")
                      .on("click", function(d){
                          let mode = d3.select("input[name='mode']:checked").node().value
                          let data = [];
                          console.log("mode=",mode)
                          if(mode==='Logarithm(-log_10)'){
                              data = self.dataLog
                          }
                          else{
                              data = self.data
                          }
                          let remainedGroups = []
                          let color = []
                          for(let i in self.groupNames){
                            let checked = colorPanel.select(".check"+self.groupNames[i])
                                                    .property("checked")
                            if(checked){
                              color.push(colorPanel.select(".select"+self.groupNames[i])
                                                .property("value"))
                              remainedGroups.push(self.groupNames[i])
                            }
                          }
                          data = self.reformatDataByGroup(data, remainedGroups)
                          let remainedSamples = []
                          for(let i in self.sampleNames){
                            // console.log("class",samplePanel.select("#a"+i).attr("class"))
                            // console.log("checked",samplePanel.select("#a"+i).property("checked"))
                            let checked = samplePanel.select("#a"+i)
                                                    .property("checked")
                            if(checked){
                              remainedSamples.push(self.sampleNames[i])
                            }
                          }
                          console.log("remainedSamples",remainedSamples)
                          let newData = self.reformatDataBySample(data, remainedSamples)
                          console.log("newData",newData, "newColor", color)
                          self.createPlot(newData, color, remainedGroups.length) 
                      })

  }

  formatDataLog(){
    let self = this
    let tmp = $.extend(true, {}, self.data)
    console.log("tmp",tmp)
    let tmp2 = []
    for(let i in tmp){
      tmp2[i]={}
      d3.keys(tmp[i]).forEach(function(k){
          if(k!=='avg'&&k!=='name'&&parseFloat(tmp[i][k])!==0)
            tmp[i][k] = Math.log(parseFloat(tmp[i][k])/100)*(-1)
          if(k==='avg')
            tmp[i][k] = tmp[i][k]
      })
      tmp2[i]=tmp[i]
    }
    console.log("tmp2",tmp2)
    return tmp2
  }

  reformatDataByGroup(data, groups){
    let self = this
    console.log("reformatself.data",data)
      let tmp = $.extend(true, {}, data)
      console.log("tmp",tmp)
      let tmp2=[]
      for(let i in tmp){
        tmp2.push(tmp[i])
      }
      console.log("tmp2", tmp2)
      tmp2.forEach(function(d){
          d3.keys(d).forEach(function(k){
              if (groups.indexOf(k.substring(0,6))==-1 && k!="name")
                  delete d[k]
          })
      })
      // console.log("tmp2",tmp2)
      return tmp2
  }

  reformatDataBySample(data, samples){
    let self = this
    let tmp = []
    data.forEach(function(d){
      if(samples.indexOf(d.name)!==-1){
        tmp.push(d) 
      }
    })
    return tmp
  }

  getSampleNames(){
    let self = this
    let tmp = []
    self.data.forEach(function(d){
      tmp.push(d.name)
    })
    return tmp
  }

  getGroupNames(){
    let self = this
    let groupNo=[];
    // console.log("data[0]",self.data)
    d3.keys(self.data[0])
      .filter(function(k){
        return k!=="name" && k!=="avg"
      })
      .forEach(function(k){
        groupNo.push(k.substring(0,6))
    })
    let unique = groupNo.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });
    return unique;
  }

  sortSamplesByContent(){
    let self = this
    console.log("sort_self.data", self.data)
    let tmp = $.extend(true, {}, self.data)
    let tmp2 = []
    for(let i in tmp){
      tmp2.push(tmp[i])
    }
    tmp2.forEach(function(d){
      let total = 0
      d3.keys(d)
        .filter(function(k){
        return k!=="name"
        })
        .forEach(function(k){
          total = total + parseFloat(d[k])
        })
      d["avg"] = total/(d3.keys(d).length-1)
    })
    tmp2.sort(function(a,b){
      if(a.avg < b.avg)
        return 1
      else
        return -1
      return 0
    })
    // console.log("tmp2",tmp2)
    return tmp2
  }

}

$(() => {
  var controller = new controller_boxplot()
})

