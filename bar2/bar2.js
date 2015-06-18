/** 
    bar chart
**/
window.D3Sample = window.D3Sample || {};

D3Sample.BarChart = (function(){

    // test if something is integer
    var isInt = function(n){
        return typeof n== "number" && isFinite(n) && n%1===0;
    }

    /** format money such that
        large numbers over 1k use magnitude
        don't show in between numbers such as 1.5
    */ 
    var formatMoney = function(d){
        var formatCurrency = d3.format("$.0f"); // remove decimals
        var formatLargeCurrency = d3.format("$s.0f"); // remove decimal use scale
        var result;

        if (isInt(d)){
            result = formatCurrency(d);
            if (d >= 1000) {
                result = formatLargeCurrency(d);
            }
        } else {
            d = "";
        }  
         return result;
    };

    var makeBarChart = function(){
        var data = D3Sample.DATA;

        // pad data if less than 4 
        if (data.length < 4) {
            var diff = 4 - data.length;
            for (var i=0; i < diff; i++) {
                data.push(['xxxpadxxx'+i, 0]);
            }
        }

        var trueWidth = 310;
        var trueHeight = 180;
        var margin = {top: 20, right: 20, bottom: 20, left: 50};

        var width = trueWidth - margin.left - margin.right,
            height = trueHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.1)
            .domain(data.map(function(d) {  return d[0]; }));
    
        var maxY = d3.max(data, function(d) { return parseFloat(d[1], 10); });
        if (maxY == 0) { maxY = 1; } // data is all 0 for y
        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, maxY]);
      
        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(0)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickFormat(formatMoney);

        var svg = d3.select("#bar-chart")
            .attr("width", trueWidth)
            .attr("height", trueHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
            .attr('class', 'd3-tip offer-tip')
            .offset([-10, 0])
            .html(function(d, i) { return "<strong>" + d[0] + "</strong><br />$"+ parseInt(d[1], 10) + " total"; });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)");

        // draw y-axis grid lines
        svg.selectAll("line.y")
          .data(y.ticks(5))
          .enter().append("line")
          .attr("class", "gridline")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y)
          .attr("y2", y);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d,i){ 
                var classString = "bar bar" + (i+1);
                if (!(d[1] > 0)) { 
                    var testString = d[0].toString();
                    if (testString.indexOf("xxxpadxxx") > -1) {
                        classString += " invis";
                    } else {
                        classString += " fake";
                    }
                }
                return classString;
            })
            .attr("data", function(d, i){ return i+1; })
            .attr("data-name", function(d, i){ return d[2]; })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .attr("x", function(d) { 
                return x(d[0]);
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { 
                    return y(d[1]); 
            })
            .attr("height", function(d) {  
                if (d[1] > 0) { 
                    return height - y(d[1]);
                } else { 
                    return 5;
                } 
            });

        svg.call(tip);

        // hack to change tip color 
        var thisTip = $(".offer-tip");
        var previousTip = '';

        var addTipClass = function(){
            var currentTip = "otip-"+ $(this).attr("data");
            $(thisTip).removeClass(previousTip);
            previousTip = currentTip;
            $(thisTip).addClass(currentTip);
        };

        var linkToPeople = function(){
            var linkname = $(this).data("name");
            window.location.href = Tugboat.DATA.offer_link + linkname;
        };

        var allthebars = $("#bar-chart .bar");
        
        $(allthebars).mouseover(addTipClass);
        $(allthebars).click(linkToPeople);
    };

    // ----------------- public

    PublicMethods = {
        init : function(){
            makeBarChart();
        }
    };

    return PublicMethods;

}());

// on doc ready
$(function () {
    D3Sample.BarChart.init();
});
