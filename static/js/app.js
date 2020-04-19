//Build the metadata panel  
function buildSampleMetadata(incomingSampleData) {

    // Define a variable for the HTML element
    var sampleMetadataPanel = d3.select("#sample-metadata");

    //Clears any existing information 
    sampleMetadataPanel.html("");
   
    //d3 reads in the JSON
    d3.json("data/samples.json").then(function(data) {
        //console.log(sampleMetadataPanel);

        // Array of Objects
        var dataSamples = data.samples;
        //Getting data which is equal to selected name in the dropdown
        var dataResultArray = dataSamples.filter(sampleObj => sampleObj.names == incomingSampleData);
        //get labels
        var ptu_labels = dataResultArray[0].ptu_labels;
        //get values
        var ptu_values = dataResultArray[0].sample_values;
 
        var panelTag = sampleMetadataPanel.append("p")
        panelTag.text("AQI  :  " + dataResultArray[0].aqi);

        for (let index = 0; index < ptu_labels.length; index++) {            
            panelTag = sampleMetadataPanel.append("p")
            panelTag.text(ptu_labels[index] + " :  " + ptu_values[index]);
        }
        buildGauge(dataResultArray[0].aqi);        
        //Add each key/value pair to the panel and append the information into it
        /* Object.entries(sampleMetadata).forEach(function([key, value]) {
            console.log(key, value);
            d3.select("#sample-metadata").property("value");

            var panelTag = sampleMetadataPanel.append("p")
            panelTag.text(`${key}: ${value}`);
        }); */
        
    
    //console.log(sampleMetadata.wfreq);
 
   });
};

function buildGauge(aqiData) {

    console.log(aqiData);

    //let value = parseInt(aqiData)*(180/1000); // decides the span of the needle in each section
    let value = parseInt(aqiData)*(180/450); // decides the span of the needle in each section
    let degrees = 180 - value // needle degree based on each value 
    let radius = 0.5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians); // x coordinate of the needle
    let y = radius * Math.sin(radians); // y coordinate of the needle

    // setting up path to create a triangle 
    let mainPath = "M -.0 -0.025 L .0 0.025 L ",
        pathX = String(x),
        space = " ",
        pathY = String(y),
        pathEnd = " Z";
    let path = mainPath.concat(pathX, space, pathY, pathEnd);

    // plotly trace
    let gaugeData = [
        // needle center coordinate and shape
        {
            type: "scatter",
            x: [0],
            y: [0],
            marker: {size: 15, color:'black'},
           
            name: "AQI",
            text: aqiData,
            hoverinfo: "name+text",
            showlegend: false,
        },
        // pie chart converted into half by setting up 50% of it to have same color as the background (white in this case)
        {
            type: "pie",
            showlegend: false,
            hole: 0.5,
            rotation: 90,

           // values: [10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000 / 9, 10000], // divided into part1 and part2. Part1 divided into 9 equal sections
           //text: ["0-100", "100-200", "200-300", "300-400", "400-500", "500-600", "600-700", "700-800", "800-900", ""],

            values: [5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000 / 9, 5000], // divided into part1 and part2. Part1 divided into 9 equal sections
            text: ["0-50", "51-100", "101-150", "151-200", "201-250", "251-300", "351-400", "451-500", "500+"],

            direction: "clockwise",
            textinfo: "text",
            textposition: "inside",
            marker: {
                colors: [
                   
                    "green",
                    "lime",
                    "Yellow",
                    "Orange",
                    "tomato",                    
                    "red",
                    "Crimson",
                    "FireBrick",           
                    "Maroon",
                    "White"
                    /*
                    "green",
                    "SeaGreen",
                    "lime",
                    "LawnGreen",
                    "Yellow",
                    "Orange",
                    "Sienna",                    
                    "Red",
                    "Maroon",
                    "White"
                    "rgb(175,238,238)",
                    "rgb(173,216,230)",
                    "rgb(135,206,250)",
                    "rgb(72,209,204)",
                    "rgb(100,149,237)",
                    "rgb(70,130,180)",
                    "rgb(65,105,225)",
                    "rgb(95,158,160)",
                    "rgb(0,128,128)",
                    "rgb(255,255,255)"*/
                ]
            },
            labels: ["0-50", "51-100", "101-150", "151-200", "201-250", "251-300", "351-400", "451-500", "500+", ""],
            hoverinfo: "label"
        }
    ];

    // plotly layout
    let gaugeLayout = {
        autosize: true,
        shapes: [{
            type: "path",
            path: path,
        }],

        title: ("Air Quality Index (AQI)"),
        xaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        },

        yaxis: {
            zeroline: false,
            showticklabels: false,
            showgrid: false,
            range: [-1, 1]
        }
    };

    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
};


//Function to build the charts (bar graph and bubble chart)
function buildSiteCharts(incomingSampleData) {
    console.log(incomingSampleData);
    
    d3.json("data/samples.json").then(function(data) {

        //Array of objects
        var dataSamples = data.samples;
        
        //Filter through the array for the incoming sample and use it for the site charts
        var resultArray = dataSamples.filter(sampleObj => sampleObj.names == incomingSampleData);
        var sampleData = resultArray[0];
        
        // Here: bar chart ------------------

        //Initialize x/y variables for the bar chart
        var otuID = sampleData.ptu_labels.slice(0,10).reverse();
        var sampleValues = sampleData.sample_values.slice(0,10).reverse();
        //var hoverLabels = sampleData.otu_labels.slice(0,10).reverse();

        // y value
        otuMicrobes = []
        otuID.forEach(function(id) {
            var otuMicrobeName = `${id}`;
            otuMicrobes.push(otuMicrobeName);
        });

        //Bar chart trace 
        var samplesBarChart = [{
            type: "bar", 
            x: sampleValues,
            y: otuMicrobes,
           // hovertext: hoverLabels,
            orientation: "h"
        }];

        //Layout of the bar chart and other design elements
        var barChartLayout = {
            title: "Air Pollutants Bar Chart",
            height: 700,
            width: 500,
            xaxis: { autorange: true},
            hoverlabel: { bgcolor: "#459BD9"} 
        };

        //Plotly displays the bar chart
        Plotly.newPlot("bar", samplesBarChart, barChartLayout);

        //Here: bubble chart -------------------------

         //Initlialize x/y variables for the bubble chart
        var otuIDXAxis = sampleData.ptu_labels;
        var sampleValuesYAxis = sampleData.sample_values;
        //var otuTextValues = sampleData.otu_labels;

        //Bubble chart trace
        var bubbleChart = [{
            x: otuIDXAxis,
            y: sampleValuesYAxis,
            //text: otuTextValues,
            mode: "markers", 
            marker: {
                colorscale: "Earth",
                size: sampleValuesYAxis,
                color: otuIDXAxis
            }
        }];

        // Bubble Chart Layout
        var bubbleChartLayout = {
            title: "Air Pollutants Bubble Chart" ,
            xaxis: {title: "Air"},
            yaxis: {title: "Values"}
        };

        //Plotly displays the bubble chart
        Plotly.newPlot("bubble", bubbleChart, bubbleChartLayout);  
        //buildGauge(sampleData.WFREQ);
        // var metaArray = data.metadata.filter(metaObj => metaObj.id == incomingSampleData);
        // var wData = metaArray[0].wfreq; 
        
    });

};

// Initial loading, where d3 selects the drop down selector to append the sample IDs
function init() {
    
    var dropDownSelector = d3.select("#selDataset");
    console.log(dropDownSelector);

    //List of Sample names
    d3.json("data/samples.json").then(function(nameOfSamples) {
        console.log(nameOfSamples);
        Object.entries(nameOfSamples).forEach(function([key, value]) {
            console.log([key, value]);          
            
            value.forEach((dataSet) => {  
                dropDownSelector
                    .append("option")
                    .text(dataSet.names)
                    .property("value", dataSet.names);
        
            });
            
            /*
            if (key == "names") {
                dropDownSelector
                        .append("option")
                        .text(value)
                        .property("value", value);
            
                };
                  value.forEach((incomingSampleData) => {  
                    dropDownSelector
                        .append("option")
                        .text(incomingSampleData)
                        .property("value", incomingSampleData);
            
                }); */

                //The first sample in the entire dataset is used to build the charts (like creating a default)
                buildSiteCharts(value[0].names);
                buildSampleMetadata(value[0].names);
                //Guage_Chart(value[0]); 
        });
        
    });

};

//Update all the charts for the next sample
function optionChanged(nextSample) {
    buildSiteCharts(nextSample);
    buildSampleMetadata(nextSample);
};

//Initialize the dashboard for the user
init();
