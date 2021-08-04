define(["jquery", "qlik", "./libraries/d3.v4.min", "css!./d3PieChart.css", "./initialproperties", "./properties", "./libraries/contents"],
    function ($, qlik, d3, css, initprops, props) {
        "use strict";
        return {
            initialProperties: initprops,
            definition: props,
            support: {
                snapshot: true,
                export: true,
                exportData: true
            },
            paint: function ($element, layout) {
                //console.log("> paint");
                var hypercube = layout.qHyperCube;
                var self = this;
                
                //Push data from the hypercube to the data array - 1 Dimension / 1 Measure
                
                var data = [];
                hypercube.qDataPages[0].qMatrix.forEach(function (qData) {
                    data.push({
                        "dValues": qData[0].qText,
                        "mValues": qData[1].qNum,
                        "fmValues": qData[1].qText, //formatted values (1 = 100%)
                        "dIndex": qData[0].qElemNumber,
                        "dID": layout.qInfo.qId + qData[0].qElemNumber
                    })
                });

                const labelFontSize = layout.props.label.size;
                const donutSize = layout.props.donut.size;
                const labelFontColor = layout.props.label.fontColor.color;
                const donutStrokeSz = layout.props.donut.strokeSize;
                const donutStrokeClr = layout.props.donut.strokeColor.color;
                const innerRad = layout.props.donut.innerRadius/100;

                var src = colors.filter(function(d) {
                  return d.id === layout.colors
                })[0].src;
                console.log(src)
        
                //Assign a unique ID to the $element wrapper
                var id = "ID_D3_" + layout.qInfo.qId;

                var classDim = layout.qInfo.qId + hypercube.qDimensionInfo[0].qFallbackTitle.replace(/\s+/g, '-');

                $element.attr("id", id);
                $element.attr("class", "d3PieChart");
                //Empty the extension content
                $("#" + id).empty();

                var dimensions = ({  
                    height: $element.height(),
                    width: $element.width(),  
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                      } 
                    });
                
                var radius = (Math.min(dimensions.height,dimensions.width)/2)*(donutSize / 100)*0.7

                var svg = d3.select("#" + id)
                  .append("svg")
                  .attr("width", dimensions.width)
                  .attr("height", dimensions.height)
                  .append("g")
                  .attr("transform", "translate(" + dimensions.width/2 + "," + dimensions.height/2 + ")")
                  ;
                
                
                var pie = d3.pie()
                  .sort(null)
                  .value(function(d) { return d.mValues; });

                

                var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
                
                var data_ready = pie(data);
                
                var arc = d3.arc()
                .innerRadius(radius*(innerRad))         // This is the size of the donut hole
                .outerRadius(radius)
              
              // Another arc that won't be drawn. Just for labels positioning
                var outerArc = d3.arc()
                .innerRadius(radius * 1.1)
                .outerRadius(radius * 1.1)
                
                svg
                .selectAll('allSlices')
                .data(data_ready)
                .enter()
                .append('path')
                .attr("class", classDim)
	              .attr("id", function(d) { return d.data.dID; })
                .attr('d', arc)
                .attr("fill", function(d) { return color(d.data.dValues); })
                .attr("stroke", donutStrokeClr)
                .attr("stroke-width", donutStrokeSz)
                //.style("opacity", 0.7)
                .on('click', function (d) {
                  self.backendApi.selectValues(0, [d.data.dIndex], true)
                })
                .on("mouseover", function(d){
                  d3.selectAll($("path."+classDim+"#"+d.data.dID)).classed("highlight",true);
                  d3.selectAll($("path."+classDim+"[id!="+d.data.dID+"]")).classed("dim",true);
                  d3.selectAll($("tspan."+classDim+"#"+d.data.dID)).classed("text_highlight",true);
                  d3.selectAll($("tspan."+classDim+"[id!="+d.data.dID+"]")).classed("dim",true);
                  d3.selectAll($("polyline."+classDim+"#"+d.data.dID)).classed("text_highlight",true);
                  d3.selectAll($("polyline."+classDim+"[id!="+d.data.dID+"]")).classed("dim",true);
                }) 
                .on("mouseout", function(d){
                  d3.selectAll($("path."+classDim+"#"+d.data.dID)).classed("highlight",false);
                  d3.selectAll($("path."+classDim+"[id!="+d.data.dID+"]")).classed("dim",false);
                  d3.selectAll($("tspan."+classDim+"#"+d.data.dID)).classed("text_highlight",false);
                  d3.selectAll($("tspan."+classDim+"[id!="+d.data.dID+"]")).classed("dim",false);
                  d3.selectAll($("polyline."+classDim+"#"+d.data.dID)).classed("text_highlight",false);
                  d3.selectAll($("polyline."+classDim+"[id!="+d.data.dID+"]")).classed("dim",false);
                });
                

                svg
                .selectAll('allLabels')
                .data(data_ready)
                .enter()
                .append('text')
                  .attr("font-size", labelFontSize)
                  .attr("fill", labelFontColor)
                  .text( function(d) { ; return d.data.dValues } )
                  .attr('transform', function(d) {
                      var pos = outerArc.centroid(d);
                      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                      pos[0] = (dimensions.width/2) * (midangle < Math.PI ? 1 : -1);
                      return 'translate(' + pos + ')';
                  })
                  .attr('space', function(d) {
                    var pos = outerArc.centroid(d);
                    return  (dimensions.width/2) - Math.abs(pos[0]);
                  })
                  .style('text-anchor', function(d) {
                      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                      return (midangle < Math.PI ? 'end' : 'start')
                  })
                  .call(wrap, 50)
                  .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                    .attr("x", 0)
                    .attr("y", "0.8em")
                    .attr("fill-opacity", 0.7)
                    .text(d => d.data.fmValues.toLocaleString()))

                svg
                .selectAll('allPolylines')
                .data(data_ready)
                .enter()
                .append('polyline')
                  .attr("stroke", function(d) { return color(d.data.dValues); })
                  .style("fill", "none")
                  .attr("stroke-width", 1)
                  .attr("class",classDim)
                  .attr('id',function(d) { return d.data.dID; })
                  .attr('points', function(d) {
                    var posA = arc.centroid(d) // line insertion in the slice
                    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                    var posC = outerArc.centroid(d); // Label position = almost the same as posB
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    posC[0] = (dimensions.width/2) * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    return [posA, posB, posC]
                  })

                svg.selectAll("dot")
                    .data(data_ready)
                    .enter().append("circle")
                    .style("fill", function(d) { return color(d.data.dValues); })
                    .attr("r", 1.5)
                    .attr('transform', function(d) {
                        var pos = arc.centroid(d);
                        return 'translate(' + pos + ')';
                });
                

                //-------------------------------------------------------               
                // END d3 code
                //-------------------------------------------------------

                //-------------------------------------------------------               
                // START HELPER FUNCTIONS
                //-------------------------------------------------------
                function wrap(text, width) {
                  text.each(function() {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        lines = [], 
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        x=0,
                        y = 0,
                        tspan = text.text(null).append("tspan").attr("class",classDim).attr('id',function(d) { return d.data.dID; }).attr("x", x).attr("y", y+ "em");
                     var limit = text.attr('space'); 
                    while (word = words.pop()) {
                      line.push(word);
                      tspan.text(line.join(" "));
                      if (tspan.node().getComputedTextLength() > limit) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("class",classDim).attr('id',function(d) { return d.data.dID; }).attr("y", ++lineNumber * lineHeight + y + "em").text(word);
                      }
                    }
                    //Shift all the elements up (this keeps )
                    text.selectAll("tspan."+classDim)
                        .attr("dy",  (-1*lineNumber*lineHeight -0.05) + "em")
                  });
                }
                //-------------------------------------------------------               
                // END HELPER FUNCTIONS
                //-------------------------------------------------------


                // needed for exporting/snapshotting
                return qlik.Promise.resolve();
            }
        };
    });