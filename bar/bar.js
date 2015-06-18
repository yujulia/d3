/** 
    bar chart
**/
window.D3Sample = window.D3Sample || {};

D3Sample.BarChart = (function(){

    var getDate = function(dateString){
        var splitDate = dateString.split("-");
        return new Date(splitDate[0], parseInt(splitDate[1])-1, parseInt(splitDate[2]));
    };

    // test if something is integer
    var isInt = function(n){
        return typeof n== "number" && isFinite(n) && n%1===0;
    }

    /** passed a date string, convert it into a d3 formatted date string
    */
    var getDateFormatted = function(dateString ) {
        var splitDate = dateString.split("-");
        var format = d3.time.format("%A, %B %e");    
        return format(getDate(dateString)); // returns a string
    };

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

        var trueWidth = 310;
        var trueHeight = 160;
        var margin = {top: 20, right: 20, bottom: 20, left: 55};

        var width = trueWidth - margin.left - margin.right,
            height = trueHeight - margin.top - margin.bottom;

        var barWidth = width/data.length - 1; // how wide we want bar to be

        var minDate = getDate(data[0][0]);
        var maxDate = getDate(data[data.length-1][0]);
        var x = d3.time.scale()
            .domain([minDate, maxDate])
            .rangeRound([0, width], 0.1);
    
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

        var formatDate = function(d){
            return "<strong>$" + parseInt(d[1], 10) + "</strong> in transactions <br /> on "+ getDateFormatted(d[0]);
        }

        var tip = d3.tip()
            .attr('class', 'd3-tip transaction-tip')
            .offset([-10, 0])
            .html(function(d) { return formatDate(d); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)");

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function(d){ 
                var classString = "bar";
                if ((d[1] == 0)) { 
                    classString += " zero";
                }
                return classString;
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .attr("x", function(d, i) { 
                return x(getDate(d[0]));
            })
            .attr("width", barWidth)  
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { 
                var h = height - y(d[1]);
                if (h == 0) {
                    h = 5; // use 5 height
                }
                return h; 
            });

        svg.call(tip);
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
