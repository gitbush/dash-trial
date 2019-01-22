queue() // Javascript library for asynchronous loading.
    .defer(d3.csv, "/data/London-HPI-full-file-2018-10 .csv") // "defer" Tells the browser to load this data first before anything else. (type of data, path to data) 
    .defer(d3.json, "/data/london-boroughs.json")
    .await(makeCharts); // "await" tells the browser to load this function once the "defer" (data) has finsihed loading
    
// All graphs will be inside this function  and rendered once csv is loaded
function makeCharts(error, propertyData, geoData){ // "error" if the data doesn't load properly, "salaryData" is a variable where queue stores the csv data
    
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
    
    NumberDisplayPerType(HPIdata);
    NumberDisplayPerType2(HPIdata);
    NumberDisplayPerType3(HPIdata);
    NumberDisplayPerType4(HPIdata);

    dc.renderAll(); // tells browser to render all graphs
}



function NumberDisplayPerType(HPIdata){
    
    var avgPriceGroup = HPIdata.groupAll().reduce(
    
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
        .formatNumber(d3.format(" $,.0f"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.average);
            }
        })
        .group(avgPriceGroup);
}


function NumberDisplayPerType2(HPIdata){
    
    
    var avgPriceGroup = HPIdata.groupAll().reduce(
    
             // reduce add
            function(p, v){
                p.count++;
                p.total += v.SemiDetachedPrice;
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
                p.total -= v.SemiDetachedPrice;
                p.average = p.total/p.count;
                }
                return p;
            },
            
            // reduce initial
            function(){
                return {count:0, total:0, average:0};
            }
            
        );
    
    


    dc.numberDisplay("#semi-detached-number")
        .formatNumber(d3.format("$,.0f"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.average);
            }
        })
        .group(avgPriceGroup);
}

function NumberDisplayPerType3(HPIdata){
    
    var avgPriceGroup = HPIdata.groupAll().reduce(
    
             // reduce add
            function(p, v){
                p.count++;
                p.total += v.TerracedPrice;
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
                p.total -= v.TerracedPrice;
                p.average = p.total/p.count;
                }
                return p;
            },
            
            // reduce initial
            function(){
                return {count:0, total:0, average:0};
            }
            
        );
    

    dc.numberDisplay("#terraced-number")
        .formatNumber(d3.format("$,.0f"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.average);
            }
        })
        .group(avgPriceGroup);
}


function NumberDisplayPerType4(HPIdata){
    
    
    var avgPriceGroup = HPIdata.groupAll().reduce(
    
             // reduce add
            function(p, v){
                p.count++;
                p.total += v.FlatPrice;
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
                p.total -= v.FlatPrice;
                p.average = p.total/p.count;
                }
                return p;
            },
            
            // reduce initial
            function(){
                return {count:0, total:0, average:0};
            }
            
        );
    
    


    dc.numberDisplay("#flat-number")
        .formatNumber(d3.format("$,.0f"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.average);
            }
        })
        .group(avgPriceGroup);
}