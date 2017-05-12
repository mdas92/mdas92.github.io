// Dimensions of sunburst.
var width = 1000;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// make `colors` an ordinal scale
var colors = {
"launch": "#d68b00",
"save": "#d68b00",
"corr": "#d68b00",
"resp": "#447145",
"cpvc": "#1e7145",
"fmr": "#1e8145", 
"cap": "#1e8145",
"prop": "#ff0079",
"publ": "#ff8aee",
"lms": "#8b008b",
"pvw": "#ff8ae1",
"qs": "#00bdea",
"open": "#00bdea",
"crea": "#00bdea",
"slid": "#00bdea",
"imp": "#000080",
"exp": "#000080",
"lib": "#000080",
"drft": "#2653fa",
"dvcap": "#2653fa",
"toc": "#734E84",
"hyp": "#734E84",
"aa": "#734E84",
"bv": "#734E84",
"grp": "#2b5797",
"eff": "#2b5797",
"state":"#2b5797",
"li": "#800000",
"wdgt": "#800000",
"media": "#800000",
"intn": "#800000",
"obj": "#800000",
"ss": "#800000",
"txt": "#800000",
"vid": "#800000",
"char": "#800000",
"svg": "#800000",
"aud": "#6845ab",
"tts": "#6845ab",
"dnd": "#7e9bca",
"them": "#008080",
"geo": "#008080",
"elb": "#9D1946",
"comm": "#9D1946",
"trip": "#9D1946",
"agg": "#9D1946",
"ppt": "#9D1946",
"ast": "#ff0000",
"stck": "#ff0000",
"math": "#808080"
};

//naming convention for legend
var naming=[
["CPVC","cpvc"],
["FMR","fmr"],
["Question_Slides","qs"],
["Learning_Interactions","li"],
["TOC","toc"],
["Application_Launch","launch"],
["Widget","wdgt"],
["Hyperlink","hyp"],
["PPT","ppt"],
["Import","imp"],
["LMS","lms"],
["Project_Corruption","corr"],
["Project_Creation","crea"],
["Export","exp"],
["Advanced_Actions","aa"],
["Branching_View","bv"],
["Import_Video","vid"],
["Characters","char"],
["Grouping","grp"],
["Effects","eff"],
["Roundtripping","trip"],
["Capture","cap"],
["Aggregator","agg"],
["Audio","aud"],
["TTS","tts"],
["Drag_Drop_Interaction","dnd"],
["Publish","publ"],
["Themes","them"],
["Properties","prop"],
["Library","lib"],
["ToolBar_Media_Objects","media"],
["ToolBar_Objects","obj"],
["ToolBar_Smartshapes","ss"],
["ToolBar_Text_Objects","txt"],
["ToolBar_Save","save"],
["Preview","pvw"],
["ToolBar_AddSlides","slid"],
["Responsive","resp"],
["Geolocation","geo"],
["ToolBar_Interaction_Object","intn"],
["elearning_brothers","elb"],
["Community","comm"],
["Project_Draft_Import","drft"],
["Open_Project","open"],
["SVG","svg"],
["Device_Capture","dvcap"],
["Assets","ast"],
["Math_Magic","math"],
["Adobe_Stock","stck"],
["States","state"]
];

var temp;
var clicked_array;
//check for click
var flag_click=0;
// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 
var percentage_calc = 100;
var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Use d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.

//var text = getText();
//var csv = d3.csv.parseRows(text);
//var json = buildHierarchy(csv);
d3.text("visit-sequences.csv", function(text) {
  var csv = d3.csv.parseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});
var fullSize=0;
// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  initializeBreadcrumbTrailSequencePoints();
  // make sure this is done after setting the domain
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });
    
   /* var uniqueNames = (function(a) {
        var output = [];
        a.forEach(function(d) {
            if (output.indexOf(d.name) === -1) {
                output.push(d.name);
            }
        });
        return output;
    })(nodes);
    
  // set domain of colors scale based on data
  colors.domain(uniqueNames);*/
  
  
        

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover)
	  .on("click", click);
	
  // Add the mouseleave handler to the bounding circle.
  
	  //console.log(flag_click);
d3.select("#container").on("mouseleave", mouseleave);
  
  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
  fullSize = totalSize;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
//console.log(d.value);
  var percentage = (percentage_calc * d.value / totalSize).toPrecision(4);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  //console.log(sequenceArray);
  //console.log(sequenceArray);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
 //console.log(flag_click);
  // Hide the breadcrumb trail
  console.log("mouse left");
  if(flag_click==0)
  {
  d3.select("#trail")
      .style("visibility", "hidden");

  d3.select("#pointstrail").style("visibility", "hidden");
  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .transition()
      .duration(1000)
      .style("visibility", "hidden");
  }
  else
  {
	/*d3.select("#trail")
      .style("visibility", "hidden");*/
	 //initializeBreadcrumbTrail();
	d3.selectAll("path").on("mouseover", null);
	
	d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });
		
	/*d3.select("#explanation")
      .transition()
      .duration(1000)
      .style("visibility", "hidden");*/
	  
	//intermediate_crumbs(clicked_array);
   mouseover(temp);
  }
}

function intermediate_crumbs(clicked_temp)
{
	var percentageString = "hello";
	updateBreadcrumbs(clicked_temp, percentageString);
}
var first_breadcrumb=1;
// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  console.log(path);
  if(flag_click==1 && first_breadcrumb==1)
  {
	 // console.log(path[(clicked_array.length)-2]);
	  path[(clicked_array.length)-2].value=path[(clicked_array.length)-2].value-path[(clicked_array.length)-1].value;
	  first_breadcrumb=0;
	  console.log("hello");
  }
  return path;
}
var trail;

function initializeBreadcrumbTrailSequencePoints() {
  // Add the svg area.
  trail = d3.select("#sequence_points").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "pointstrail");
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}
 var count=0;
// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
//initializeBreadcrumbTrail();
 //console.log(totalSize);
 var loop;
 //console.clear();
 //console.log(percentage_calc);
// console.log(totalSize);
 //console.log(factor);
 var arry=[];


 for(loop =0; loop<nodeArray.length;loop++)
 {
	 //console.log(nodeArray[loop]);
	 arry.push([nodeArray[loop].name,nodeArray[loop].value]);
	 //console.log(arry[loop]);
 }
 
  // Data join; key function combines name and depth (= position in sequence).
 
// console.log(d3.select("#trail").selectAll("g").data(nodeArray));
 // console.log(count);
  
  //console.log(d.path);
  //
   
  //
  //console.clear();
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) {
		 
		 count++;
		// console.log(d.name+ (d.depth+Math.random()));
		  return d.name + (d.depth+Math.random());});
	 //console.log(d3.select("#trail"));
	 //console.log(g);
	 count=0;

	 var g2 = d3.select("#pointstrail")
      .selectAll("g")
      .data(nodeArray, function(d) {
		 
		 count++;
		// console.log(d.name+ (d.depth+Math.random()));
		  return d.name + (d.depth+Math.random());});
	 
  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");
    var entering2 = g2.enter().append("svg:g");

  //console.log(entering);
  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });
entering2.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return "#000000"; });
	  
  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });
	  
entering2.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
	  .style("fill","#FFFFFF")
      .text(function(d) { 
	  //console.log(d.value);
	  return (100*d.value / (totalSize*factor)).toPrecision(3) + "%"; });
	  
  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  g2.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });
  
  // Remove exiting nodes.
  g.exit().remove();
  g2.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");
	  d3.select("#pointstrail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 210, h: 30, s: 3, r: 3
  };
  var wid=0;
  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w*6)
      .attr("height", 20 * (li.h + li.s));
  var j=-1;
  var k=0;
  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
		  if(j>=19)
		  {
			  j=j%19;
			  //j++;
			  wid++;
			  k+=20;
			  
		  }
		  else
		  {
			  j++;
		  }
		  //console.log(i,wid);
          return "translate("+ (li.w*wid+k) +"," + j * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
	  //.attr("transform","translate(0,0)")
      .style("fill", function(d) { 
	  //console.log(d.value);
	  return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { 
	  for(i=0;i<naming.length;i++)
	  {
		  if(d.key == naming[i][1])
			  return naming[i][0];
	  }
	  
	   });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};

var factor=1;
function click(d)
{
	//initializeBreadcrumbTrail();
	
	temp=d;
	//mouseover(temp);
	//console.log(temp);
	percentage_calc = (percentage_calc * d.value / totalSize).toPrecision(3);
clicked_array=getAncestors(temp);
first_breadcrumb=1;
console.log(d.length);

 // initializeBreadcrumbTrail();
  flag_click = 1;
  //console.log(flag_click);
  d3.select("#container").selectAll("path").remove();
  //d3.select("#togglelegend").on("click", toggleLegend);
/* vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);*/
	  
  var nodes = partition.nodes(d)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      }) ;
	  //console.log(nodes);
/* var uniqueNames = (function(a) {
        var output = [];
        a.forEach(function(d) {
            if (output.indexOf(d.name) === -1) {
                output.push(d.name);
            }
        });
        return output;
    })(nodes);
	
	//colors = d3.scale.category20();
    colors.domain(uniqueNames);
	drawLegend();*/

  var path = vis.data([d]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
	  .on("mouseover",mouseover)
      .on("click", click)
      .each(stash)
	      .transition()
	      .duration(500)
	      .attrTween("d", arcTween);
  // Get total size of the tree = value of root node from partition.
  //d3.select("#container").on("mouseleave", mouseleave);
  factor=fullSize/(path.node().__data__.value);
  totalSize = path.node().__data__.value;
 //console.log(path);
}

function arcTween(a){
                    var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
                    return function(t) {
                        var b = i(t);
                        a.x0 = b.x;
                        a.dx0 = b.dx;
						//console.log("he");
                        return arc(b);
                    };
                };

function arcTweenZoom(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
    yd = d3.interpolate(y.domain(), [d.y, 1]),
    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function (d, i) {
    return i ? function (t) {
      return arc(d);
    } : function (t) {
      x.domain(xd(t));
      y.domain(yd(t))
        .range(yr(t));
      return arc(d);
    };
  };
}				

function stash(d) {
                    d.x0 = 0;// d.x;
                    d.dx0 = 0;//d.dx;
                }; 