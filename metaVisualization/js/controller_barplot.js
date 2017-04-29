class controller_barplot{

  constructor (){
    let self=this
    this.dataUrl = "../data/data_org.csv"
    this.checked = 0
    this.colorArray = ["#d62728", "#1f77b4", "#2ca02c", "#9467bd", "#ff7f0e", "#FFFF00", "#b2b2ff", "#8c564b",
                "#f7b6d2", "#c7c7c7", "#74c476", "#d6616b", "#6b6ecf", "#e377c2", "#31a354",
                "#e7ba52", "#000033", "#bd9e39", "#2ca02c", "#3232ff", "#636363", "#74c476"]
    this.init()
  }

  init(){
    let self = this
      d3.csv(self.dataUrl,function(error, dataset){
        if(error) throw error
        if(dataset["columns"])
          delete dataset["columns"]
        self.data = dataset
        self.loadDataCallback()
      }) 
  }

  loadDataCallback(){
    let self = this
    self.groupNames = self.getGroupNames()
    self.parentGroupNames = self.getParentGroupNames()
    self.sampleNames = self.getSampleNames()
    self.dataset = self.formatData()
    self.datasetGrouped = self.formatDatabyGroup()
    self.color = self.colorArray.slice(0,self.sampleNames.length)
    // console.log("color",self.color)
    self.createModePanel()
    self.createParamsPanel()
    /************by default******************/
    self.createPlot(self.dataset, self.color)
    /****************************************/

  }

  createPlot(data, color, length){
    // console.log("color",color)
    // console.log("createplot", data)
    var barplot = new visualizer_barplot(data, color)
  }

  createModePanel(){
      let self = this
      let modePanel = d3.select(".params")
                        .append('div')
                        .attr('class','modePanel')
      modePanel.append("h2")
                    .text("Mode")
      let modes = ["Separated","Grouped"]
      modes.forEach(function(m){
          let container = modePanel.append("div")
                                .attr("class","container"+m)
          container.append('input')
            .attr('type','radio')
            .attr('value',m)
            .attr('name','mode')
            .attr('checked',function(){
              if(m=="Separated")
                return true
            })
            .on('click', function(){
              if(m=="Separated"){
                self.createParamsPanel()
              }
              else{
                self.removeGroupPanel()
              }
            })
          container.append('label')
                .html(m)
      })
  }

  removeGroupPanel(){
      let panel0 = document.getElementById("groupPanel")
      if(panel0!==null)
        panel0.parentNode.removeChild(panel0)
  }

  createParamsPanel(paramsPanel){
      let self = this
      let optcolor = self.colorArray
      let panel0 = document.getElementById("paramsPanel")
      if(panel0!==null)
        panel0.parentNode.removeChild(panel0)
      self.paramsPanel = d3.select(".params")
                          .append("div")
                          .attr("class","paramsPanel")
                          .attr("id","paramsPanel")
      $('#paramsPanel').empty()
      let panel = self.paramsPanel
      let groupPanel = panel.append("div")
                            .attr("class","groupPanel")
                            .attr("id","groupPanel")
      groupPanel.append("h2")
            .text("Groups")
        self.parentGroupNames.filter(function(d){
                          return d!=="avg"
            })
            .forEach(function(g){
                let container = groupPanel.append("div")
                                    .attr("class", "container"+g)
                container.append("label")
                      .attr("for", g)
                      .attr("class", g)
                      .text(g)
                container.append("input")
                      .attr("type", "checkbox")
                      .attr("checked", true)
                      .attr("class", "check"+g)
                      .attr("id", "a"+self.parentGroupNames.indexOf(g))
                      .attr("float","left")          
            })

        let samplePanel = panel.append("div")
                            .attr("class", "samplePanel")
                            .attr("id","samplePanel")
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
            container.append("select")
                      .attr("class","select"+s)
                      .attr("id","select"+s)
            container.select(".select"+s)
                      .selectAll(".options")
                      .data(optcolor)
                      .enter()
                      .append("option")
                      .attr("class","option"+s)
                      .text(function(d){
                        return d
                      })
            container.append("br")
        })
        for(let i in self.sampleNames){
            d3.select("#select"+self.sampleNames[i]).property('value',optcolor[i])
        }
        let butRedraw = panel.append("div")
                          .attr("id","button")
                          .append("input")
                          .attr("type", "button")
                          .attr("name", "redraw")
                          .attr("value", "Redraw")
                          .on("click", function(d){
                              let newData = []
                              let panel0 = document.getElementById("groupPanel")
                              if(panel0!==null){     
                                  let remainedGroupes = []
                                  for(let i in self.parentGroupNames){
                                      let checked = groupPanel.select("#a"+i)
                                                              .property("checked")
                                      if(checked){
                                          remainedGroupes.push(self.parentGroupNames[i])
                                      }
                                  }
                                  newData = self.reformatDataByGroup(remainedGroupes)
                              }
                              else{
                                  let tmp = $.extend(true,{},self.datasetGrouped)
                                  for(let i in tmp){
                                    newData.push(tmp[i])
                                  }
                                  console.log("newData",newData)
                              }
                              let remainedSamples = []
                              let color = []
                              for(let i in self.sampleNames){
                                let checked = samplePanel.select("#a"+i)
                                                        .property("checked")
                                if(checked){
                                  color.push(samplePanel.select(".select"+self.sampleNames[i])
                                                    .property("value"))
                                  remainedSamples.push(self.sampleNames[i])
                                }
                              }
                              newData = self.reformatDataBySample(newData,remainedSamples)
                              self.createPlot(newData, color) 
                          })
  }

  formatDatabyGroup(){
      let self = this
      let tmp = $.extend(true,{},self.dataset)
      console.log("tmp",tmp)
      let names = self.parentGroupNames
      let tmp2 = []
      for(let i in names){
        let count = 0
        tmp2[i] = {}
        tmp2[i]['name'] = names[i]
        self.sampleNames.forEach(function(s){
          tmp2[i][s] = 0
        })
        for(let j in tmp){
          if(tmp[j]['name'].substring(0,6)===names[i]){
            self.sampleNames.forEach(function(s){
              tmp2[i][s] += parseFloat(tmp[j][s])
            })
            count += 1
          }
        }
        self.sampleNames.forEach(function(s){
            tmp2[i][s] /= count
        })
      }
      console.log("tmp2",tmp2)
      return tmp2
  }

  formatData(){
    let self = this
    let tmp = $.extend(true,{},self.data)
    let groupNames = self.groupNames
    let speciesNames = self.sampleNames
    // console.log(groupNames,speciesNames)
    let tmp2 = []
    for(let i in groupNames){
      tmp2[i]={}
      tmp2[i]['name'] = groupNames[i]
      for(let j in speciesNames){
        tmp2[i][speciesNames[j]] = tmp[j][groupNames[i]]
      }
    }
    return tmp2
  }

  reformatDataBySample(data, samples){
    let self = this
    let tmp = $.extend(true,{},data)
    let tmp2=[]
    // console.log(tmp)
    for(let i in tmp){
      tmp2[i]={}
      tmp2[i]['name'] = tmp[i]['name']
      // tmp2[i]['rates'] = tmp[i]['rates']
      samples.forEach(function(s){
        tmp2[i][s] = tmp[i][s]
      })
    }
    console.log("tmp2",tmp2)
    return tmp2
  }

  reformatDataByGroup(groups){
    let self = this
    // console.log(data)
    // console.log(groups)
    let tmp = $.extend(true,{},self.dataset)
    let tmp2=[]
    for(let i in tmp){
      if(groups.indexOf(tmp[i]['name'].substring(0,6))!==-1){
        tmp2.push(tmp[i])
      }
    }
    console.log("tmp2",tmp2)
    return tmp2
  }

  getSampleNames(){
    let self = this
    let tmp = []
    for(let k in self.data){
      let tmpname = self.removeSpecialChars(self.data[k]['name'])
      tmp.push(tmpname)
    }
    return tmp
  }

  getParentGroupNames(){
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

  getGroupNames(){
    let self = this
    let tmp = d3.keys(self.data[0]).filter(function(k){return k!=="name"&&k!=="rates"})
    return tmp
  }

  removeSpecialChars(str) {
    return str.replace(/(?!\w|\s)./g, '')
      .replace(/\s+/g, ' ')
      .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2')
  }
  
}

$(() => {
  var controller = new controller_barplot()
})

