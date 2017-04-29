d3.box = function() {
    let width = 1,
        height = 1,
        duration = 0,
        domain = null,
        value = Number,
        whiskers = boxWhiskers,
        quartiles = boxQuartiles,
        outlierData = null,
        tickFormat = null,
        color = null
        
    function box(g) {
        g.each(function(d, i) {
            // console.log("domain=",domain())
            // sort the data objects by the value function
            let colorIndex = d[0].groupNo
            // console.log("colorIndex",colorIndex)
            d = d.sort(function(a, b) {
                if (value(a) > value(b)) {
                    return 1;
                }
                if (value(a) < value(b)) {
                    return -1;
                }
                if (value(a) === value(b)) {
                    return 0;
                }
            });

            let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "ttip")  

            let g = d3.select(this).attr('class', 'boxplot'),
                justVals = d.map(value),
                n = d.length,
                min = justVals[0],
                max = justVals[n - 1];

            // Compute quartiles. Must return exactly 3 elements.
            let quartileVals = justVals.quartiles = quartiles(justVals);

            // Compute whiskers. Must return exactly 2 elements, or null.
            let whiskerIndices = whiskers && whiskers.call(this, justVals, i),
                whiskerData = whiskerIndices && whiskerIndices.map(function(i) {
                    return d[i];
                });
                // console.log("whisker=",whiskerData)

            // Compute outliers. If no whiskers are specified, all data are 'outliers'.
            // The outliers are actual data objects, because I'm not concerned with transitions.
            let outlierData = whiskerIndices ?
                d.filter(function(d, idx) {
                    return idx < whiskerIndices[0] || idx > whiskerIndices[1];
                }) : d.filter(function() {
                    return true;
                });

            // Compute the new x-scale.
            // let xScale = d3.scale.linear()
            let xScale = d3.scaleLinear()
                .domain(domain && domain.call(this, justVals, i) || [min, max])
                .range([0, width]);

            // Note: the box, median, and box tick elements are fixed in number,
            // so we only have to handle enter and update. In contrast, the outliers
            // and other elements are letiable, so we need to exit them!
            // (Except this is a static chart, so no transitions, so no exiting)

            // Update center line: the horizontal line spanning the whiskers.
            let center = g.selectAll('line.center')
                .data(whiskerData ? [whiskerData] : []);

            center.enter().insert('line', 'rect')
                .attr('class', 'center-line')
                .attr('x1', function(d) {
                    // console.log("d[0]=",d[0])
                    // console.log("value(d[0])=",value(d[0]))
                    // console.log("Xscale value(d[0])=",xScale(value(d[0])))
                    // return xScale(value(d[0]))
                    return xScale(value(d[0]))
                })
                .attr('y1', height / 2)
                .attr('x2', function(d) {
                    // console.log("d[1]=",d[1])
                    return xScale(value(d[1]));
                })
                .attr('y2', height / 2);
           
            // whole innerquartile box. data attached is just quartile values.
            let q1q3Box = g.selectAll('rect.q1q3box')
                .data([quartileVals]);

            q1q3Box.enter().append('rect')
                .attr('class', 'box whole-box')
                .attr('y', 0)
                .attr('x', function(d) {
                    return xScale(d[0]);
                })
                .attr("fill",function(d){
                    return color(colorIndex)
                })
                .attr('height', height)
                .attr('width', function(d) {
                    return xScale(d[2]) - xScale(d[0]);
                });

            q1q3Box.on("mousemove",function(d){
                console.log('d is', d); 
                // console.log('group is',group); //group is null
                tooltip.style("left",d3.event.pageX+10+"px");
                tooltip.style("top",d3.event.pageY-25+"px");
                tooltip.style("display","inline-block");
                // let elements=document.querySelectorAll(':hover');
                // l=elements.length;
                // l=l-1;
                // element=elements[l].__data__;
                // value=element.y1-element.y0;
                tipstringMax='1st quartile = '+NumFormat(d[0])+'%';
                tipstring=str0+'1st quartile = '+NumFormat(d[0])+'%'+'<br>'+'median = '+NumFormat(d[1])+'%'+'<br>'+'3rd quartile = '+NumFormat(d[2])+'%'+'</br>'
                tooltip.style("width",(tipstringMax.length*6+'px')); //hardCode!
                // console.log("width=",(tipstring.length*125/71+'px'));
                tooltip.html(tipstring);
            });

            q1q3Box.on("mouseout",function(d){
              tooltip.style("display","none");
            });

            // add a median line median line.
            let medianLine = g.selectAll('line.median')
                .data([quartileVals[1]]);

            medianLine.enter().append('line')
                .attr('class', 'median')
                .attr('x1', xScale)
                .attr('y1', 0)
                .attr('x2', xScale)
                .attr('y2', height);

            // Whiskers. Attach actual data object
            let whiskerG = g.selectAll('line.whisker')
                .data(whiskerData || [])
                .enter().append('g')
                .attr('class', 'whisker');

            whiskerG.append('line')
                .attr('class', 'whisker')
                .attr('x1', function(d) {
                    return xScale(value(d));
                })
                .attr('y1', height / 6)
                .attr('x2', function(d) {
                    return xScale(value(d));
                })
                .attr('y2', height * 5 / 6);

            whiskerG.append('text')
                .attr('class', 'label')
                .text(function(d) {
                    return Math.round(value(d));
                })
                .attr('x', function(d) {
                    return xScale(value(d));
                });

            whiskerG.append('circle')
                .attr('class', 'whisker')
                .attr('cx', function(d) {
                    return xScale(value(d));
                })
                .attr('cy', height / 2)
                .attr('r', 1);

            // Update outliers.
            let outlierG = g.selectAll('g.outlier')
                .data(outlierData)
                .enter().append('g')
                .attr('class', 'outlier');

            outlierG.append('circle')
                .attr('class', 'outlier')
                .attr('r', 2)
                .attr("fill", function(d){
                    return color(colorIndex)
                })
                .attr('cx', function(d) {
                    return xScale(value(d));
                })
                .attr('cy', height / 2);

            outlierG.append('text')
                .attr('class', 'label')
                .text(function(d) {
                    return value(d);
                })
                .attr('x', function(d) {
                    return xScale(value(d));
                });
        });
    }

    box.color = function(x){
        if (!arguments.length) {
            return color;
        }
        color = x;
        return box;
    }

    box.width = function(x) {
        if (!arguments.length) {
            return width;
        }
        width = x;
        return box;
    };

    box.height = function(x) {
        if (!arguments.length) {
            return height;
        }
        height = x;
        return box;
    };

    box.tickFormat = function(x) {
        if (!arguments.length) {
            return tickFormat;
        }
        tickFormat = x;
        return box;
    };

    box.duration = function(x) {
        if (!arguments.length) {
            return duration;
        }
        duration = x;
        return box;
    };

    box.domain = function(x) {
        if (!arguments.length) {
            return domain;
        }
        // domain = x == null ? x : d3.functor(x);
        domain = x == null ? x : functor(x)
        return box;
    };

    box.value = function(x) {
        if (!arguments.length) {
            return value;
        }
        value = x;
        return box;
    };

    box.whiskers = function(x) {
        if (!arguments.length) {
            return whiskers;
        }
        whiskers = x;
        return box;
    };

    box.quartiles = function(x) {
        if (!arguments.length) {
            return quartiles;
        }
        quartiles = x;
        return box;
    };

    // just a getter. no setting outliers.
    box.outliers = function() {
        return outlierData;
    };

    return box;
}

function functor(v) {
    return typeof v === "function" ? v : function() { return v; };
}

function boxWhiskers(d) {
    let q1 = d.quartiles[0],
        q3 = d.quartiles[2],
        iqr = (q3 - q1) * 1.5,
        i = -1,
        j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
}

function boxQuartiles(d) {
    return [
        d3.quantile(d, 0.25),
        d3.quantile(d, 0.5),
        d3.quantile(d, 0.75)
    ];
}

function NumFormat(d){
  return Number(d).toFixed(3);
}