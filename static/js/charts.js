queue() // Javascript library for asynchronous loading.
    .defer(d3.csv, "/data/London-HPI-full-file-2018-10 .csv") // "defer" Tells the browser to load this data first before anything else. (type of data, path to data) 
    .defer(d3.json, "/data/london-boroughs.json")
    .await(makeCharts); // "await" tells the browser to load this function once the "defer" (data) has finsihed loading
    
// All graphs will be inside this function  and rendered once csv is loaded
function makeCharts(error, propertyData, geoData){ // "error" if the data doesn't load properly, "propertyData" is a variable where queue stores the csv data
    
    function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    }
    

    propertyData.forEach(function(d){
        d.AveragePrice = +d.AveragePrice;
        d.DetachedPrice = +d.DetachedPrice;
        d.SemiDetachedPrice = +d.SemiDetachedPrice;
        d.TerracedPrice = +d.TerracedPrice;
        d.FlatPrice = +d.FlatPrice;
    });
    
    
     var parseDate = d3.time.format("%m/%d/%Y").parse;
        propertyData.forEach(function(d){
            d.Date = parseDate(d.Date);
        });
     

    //   crossfilter Data
    var HPIdata = crossfilter(propertyData);  // crossfilter of csv data
    
    
    // all charts
    choroMap(HPIdata, geoData);
    lineChart(HPIdata);
    allRowChart(HPIdata);
    dataTable(HPIdata);
    pieChart(HPIdata);
    
    
    avgPricePerTypeNumber(HPIdata);

    dc.renderAll(); // tells browser to render all graphs
}

function choroMap(HPIdata, geoData){
    
    
    var regionDim = HPIdata.dimension(function(d){ return d.RegionName;});
    var avgPrice = regionDim.group().reduceSum(function(d){ return Math.round(d.AveragePrice / 12);});
    
    var centre = d3.geo.centroid(geoData);
    var projection = d3.geo.mercator().center(centre).scale(35000).translate([250,200]);
        
    var choroChart = dc.geoChoroplethChart("#map");
    
    choroChart
        .width(550)
        .height(400)
        .dimension(regionDim)
        .group(avgPrice)
        .title(function(d){
            return d.key + ': £' + d.value;})
        .projection(projection)
        .overlayGeoJson(geoData.features, "region", function(d){
            return d.properties.LAD13NM;
        });
        
}

function avgPricePerTypeNumber(HPIdata){
    
    var avgTypePrice = HPIdata.groupAll().reduce(
    
         // reduce add
        function(p, v){
            p.count++;
            p.total += v.DetachedPrice;
            p.average = p.total/p.count;
            return p;
        },
       
        
        //  reduce remove
        function(p, v){
            p.count--;
            if (p.count==0){
            p.total=0;
            p.avergage=0;
            } else {
            p.total -= v.DetachedPrice;
            p.average = p.total/p.count;
            }
            return p;
        },
        
        // reduce initial
        function(){
            return {count:0, total:0, average:0};
        }
    );


    dc.numberDisplay("#detached-number")
        .formatNumber(d3.format("$,.0f"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.average);
            }
        })
        .group(avgTypePrice);
}

function lineChart(HPIdata){
    
    console.log(new Date("2018"));
    
    function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    }
    
    
    var dateDim = HPIdata.dimension(function(d){ return d.Date});


    var AvgPriceGroup = dateDim.group().reduce(
        
        // reduce add
        function(p, v){
            p.count++;
            p.total += v.AveragePrice;
            p.average = p.total/p.count;
            return p;
        },
       
        
        //  reduce remove
        function(p, v){
            p.count--;
            if (p.count==0){
            p.total=0;
            p.avergage=0;
            } else {
            p.total -= v.AveragePrice;
            p.average = p.total/p.count;
            }
            return p;
        },
        
        // reduce initial
        function(){
            return {count:0, total:0, average:0};
        }
        
        
    );
    


    var lineChart = dc.lineChart("#area-chart")
    
    var minDate = dateDim.bottom(1)[0].Date;
    var maxDate = dateDim.top(1)[0].Date;

    lineChart 
        .width(null)
        .height(400)
        .margins({top: 10, right: 50, bottom: 80, left: 70})
        .dimension(dateDim)
        .group(AvgPriceGroup)
        .valueAccessor(function(d){return d.value.average;})
        .x(d3.time.scale().domain([minDate, maxDate]))
        .y(d3.scale.linear().domain([250000,1000000]))
        .elasticY(true)
        // .renderArea(true)
        // .renderDataPoints(true)
        .interpolate("basis")
        .yAxisLabel("Average price(£)");
        lineChart.yAxis().ticks(10);
}

function pieChart(HPIdata){
    
    var SalesVolumedim = HPIdata.dimension(function(d){  return d.Date;});
    
    // print_filter(SalesVolumedim);
    var Volumegroup = SalesVolumedim.group().reduceSum(function(d){ return  d.OldSalesVolume, d.NewSalesVolume;});
    
    dc.pieChart("#pie-chart")
        .width(null)
        .height(400)
        .dimension(SalesVolumedim)
        .group(Volumegroup);

}




function dataTable(HPIdata){
    
    var regionDim = HPIdata.dimension(dc.pluck("RegionName"));
    
    
    dc.dataTable("#data-table")
        .width(1000)
        .height(6000)
        .dimension(regionDim)
        .group(function(d){ return d.RegionName;})
        .size(10)
        .columns([
                "Date",
                "RegionName", 
                "DetachedPrice", 
                "SemiDetachedPrice", 
                "TerracedPrice"])
        .sortBy(function (d) {
            return d.Date;
         })
        .order(d3.ascending)
        .on("renderlet", function(table){
            table.selectAll(".dc-table-group").classed("info", true);
            
        });
   
}



function allRowChart(HPIdata){
    
    var allAvgPriceDim = HPIdata.dimension(dc.pluck("RegionName"));
    var avgPriceGroup = allAvgPriceDim.group().reduce(
        
        // reduce add
        function(p, v){
            p.count++;
            p.total += v.AveragePrice;
            p.average = p.total/p.count;
            return p;
        },
        
        //  reduce remove
        function(p, v){
            p.count--;
            if (p.count==0){
            p.total=0;
            p.avergage=0;
            } else {
            p.total -= v.AveragePrice;
            p.average = p.total/p.count;
            }
            return p;
        },
        
        // reduce initial
        function(){
            return {count:0, total:0, average:0};
        }
        
        
    );
       
    
    dc.rowChart("#row-chart")
        .width(null)
        .height(700)
        .dimension(allAvgPriceDim)
        .group(avgPriceGroup)
        .valueAccessor(function(d){return d.value.average;})
        .margins({top: 10, right: 50, bottom: 60, left: 50})
        .fixedBarHeight([15])
        .elasticX(true)
        .gap([2]);
        
};
