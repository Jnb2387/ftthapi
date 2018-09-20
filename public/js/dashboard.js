$(document).ready(function () {
    var myChart;
    var myLineChart;
    var doughnutChart;
    $("#cellsearch").autocomplete({
        minLength: 2,
        autoFocus: true,
        sortResults: true,
        source: function (request, response) {
            var term = request.term; // The term being typed in the input
            let cellname = []; // To hold all the response names
            $.getJSON("http://localhost:8011/query/v1/ftth.cells?columns=pni_cell_name,netwin_cell_jso_name&filter=pni_cell_name%20ilike%20'" + term + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + term + "%25'&limit=20", function (data, status, xhr) {
                data.map(function (pni_cell_name, netwin_cell_jso_name) { // loop through the array from the getJSON request
                    cellname.push(pni_cell_name.pni_cell_name); // add the name of the pni_cell_name to the cellname Array created above.
                    cellname.push(pni_cell_name.netwin_cell_jso_name); // add the name of the netwin_cell_jso_name to the cellname Array created above
                });
                console.log('Data From autocomplete: ', data)
                var desiredcellnames = cellname.filter(function (value) { // now that both values are in the cellname Array, filter out the ones that start with the same characters as the search term
                    if (value !== null && value.toUpperCase().substring(0, 2) == term.toUpperCase().substring(0, 2)) { // make them both uppercase to match.
                        return value; // return only the matching values into the desiredcellnames
                    }
                });
                desiredcellnames.sort() //ITS DIFFICULT TO SORT IN THE DATABASE BECAUSE IT CAN BE EITHER pni_cell_name OR netwin_cell_jso_name
                response(desiredcellnames); // just send the desiredcellnames.
            });
        }, //IF THERE IS NO DATA IN THE RESPONSE
        response: function (event, ui) {
            if (!ui.content.length) {
                var noResult = {
                    value: "",
                    label: "No results found"
                };
                ui.content.push(noResult);
            }
        }, //WHEN SOMEONE SELECTS A VALUE FROM THE AUTOCOMPLETE DROPDOWN
        select: function (e, data) {
            if (myLineChart) {
                myLineChart.destroy();
            }
            if (myChart) {
                myChart.destroy();
            }
            if (doughnutChart) {
                doughnutChart.destroy();
            }
            getPdoData(data.item.value); // Run the getData function with the parameters of the selected value in the autocomplete
            getSheathData(data.item.value); // Run the getfunctiontable for the associated selected value.
            getFootagesData(data.item.value);
        }
    });
    //WHEN THE PAGE IS SCROLLED THE USER WONT SEE WHAT CELL THEY SEARCHED FOR SO ADD IT TO THE NAVBAR
    $(window).scroll(function () {
        if ($(".navbar").hasClass("top-nav-collapse")) {
            var cell = $("#cellsearch").val();
            $("#nav_cell_name").html(cell);
        } else {
            $("#nav_cell_name").empty()
        }
    });
    $("#cellsearchbtn").on("click", function () {
        //HAVE TO RETHINK THIS CAUSE IF MULTIPLE SEARCHES THE BAR GRAPH KEEPS THE OLD DATA
        let cell = $("#cellsearch").val().toUpperCase();
        getPdoData(cell); // Run the getData function with the parameters of the selected value in the autocomplete
        getSheathData(cell); // Run the getfunctiontable for the associated selected value.
        getFootagesData(cell);
        
    })



    async function getSheathData(cell) {
        try {
            var aerial_12f = [];
            var ug_12f = [];
            var total_12f = [];
            var aerial_24f = [];
            var ug_24f = [];
            var total_24f = [];
            var aerial_36f = [];
            var ug_36f = [];
            var total_36f = [];
            var aerial_48f = [];
            var ug_48f = [];
            var total_48f = [];
            var aerial_60f = [];
            var ug_60f = [];
            var total_60f = [];
            var aerial_72f = [];
            var ug_72f = [];
            var total_72f = [];
            var aerial_96f = [];
            var ug_96f = [];
            var total_96f = [];
            var aerial_144f = [];
            var ug_144f = [];
            var total_144f = [];

            const response = await axios.get("http://localhost:8011/query/v1/ftth.sheath_crosstab_joined?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=1000");
            var bardata = response.data;
            console.log(bardata)
            bardata.map(function (row) {
                aerial_12f.push(row.sheath_12f_aerial);
                ug_12f.push(row.sheath_12f_ug)
                total_12f.push(row.sheath_12f_total)
                aerial_24f.push(row.sheath_24f_aerial);
                ug_24f.push(row.sheath_24f_ug)
                total_24f.push(row.sheath_24f_total)
                aerial_36f.push(row.sheath_36f_aerial);
                ug_36f.push(row.sheath_36f_ug)
                total_36f.push(row.sheath_36f_total)
                aerial_48f.push(row.sheath_48f_aerial);
                ug_48f.push(row.sheath_48f_ug)
                total_48f.push(row.sheath_48f_total)
                aerial_60f.push(row.sheath_60f_aerial);
                ug_60f.push(row.sheath_60f_ug)
                total_60f.push(row.sheath_60f_total)
                aerial_72f.push(row.sheath_72f_aerial);
                ug_72f.push(row.sheath_72f_ug)
                total_72f.push(row.sheath_72f_total)
                aerial_96f.push(row.sheath_96f_aerial);
                ug_96f.push(row.sheath_96f_ug)
                total_96f.push(row.sheath_96f_total)
                aerial_144f.push(row.sheath_144f_aerial);
                ug_144f.push(row.sheath_144f_ug)
                total_144f.push(row.sheath_144f_total)
            })
            var ctx = document.getElementById("myChart").getContext('2d');
            // Chart.defaults.global.defaultFontColor = 'white';

            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["Aerial 12f", "UG 12f", "Total 12f", "Aerial 24f", "UG 24f", "Total 24f", "Aerial 36f", "UG 36f", "Total 36f", "Aerial 48f", "UG 48f", "Total 48f", "Aerial 60f", "UG 60f", "Total 60f", "Aerial 72f", "UG 72f", "Total 96f", "Aerial 96f", "UG 96f", "Total 96f", "Aerial 144f", "UG 144f", "Total 144f"],
                    datasets: [{
                        label: bardata[0].pni_cell_name +"/ "+ bardata[0].netwin_cell_jso_name,
                        data: [aerial_12f, ug_12f, total_12f, aerial_24f, ug_24f, total_24f,aerial_36f,ug_36f,total_36f,aerial_48f,ug_48f,total_48f,aerial_60f,ug_60f,total_60f,aerial_72f,ug_72f,total_72f,aerial_96f,ug_96f,total_96f,aerial_144f,ug_144f,total_144f],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        // position: "bottom",
                        labels: {
                            // This more specific font property overrides the global property
                            fontColor: 'blue'
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }]
                    }
                },
            });
        } catch (error) {
            console.log(error)
        }
    }

    
    //Kinda of Weird but once the charts are drawn i believe this plugin checks if there is no data and displays no data label


        Chart.plugins.register({
            afterDraw: function(chart) {
                // console.log(chart.data.datasets[0])
            if (chart.data.datasets[0].data[0].length < 1) {
                alert("no data")
              var ctx = chart.chart.ctx;
              var width = chart.chart.width;
              var height = chart.chart.height
              chart.clear();
              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = "16px normal 'Helvetica Nueue'";
              ctx.fillText('No data to display', width / 2, height / 2);
              ctx.restore();
            }
          }
        });
        


    async function getFootagesData(cell) {
        try {
            
            console.log("cell FROM footage table get:",cell)
            var building_attachment = [];
            var cable_bearing_strand = [];
            var mdu = [];
            var slack = [];
            var ug = [];
            // var total = [];
            const response = await axios.get("http://localhost:8011/query/v1/ftth.footages?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=1000");
            var doughnutdata = response.data;
            $("#no_data").addClass('d-none')
            doughnutdata.map(function (row) {
                building_attachment.push(row.building_attachment);
                cable_bearing_strand.push(row.cable_bearing_strand)
                mdu.push(row.mdu)
                slack.push(row.slack);
                ug.push(row.ug)
                // total.push(row.total)
            })
            

            //doughnut
            var ctxD = document.getElementById("doughnutChart").getContext('2d');
            doughnutChart = new Chart(ctxD, {
                type: 'doughnut',
                data: {
                    labels: ["Building Attachment", "Cable Bearing Strand", "MDU", "Slack", "UG"],//, "total"],
                    datasets: [
                        {
                            data: [building_attachment,cable_bearing_strand,mdu,slack,ug],//,total],
                            backgroundColor: ["red", "#5AD3D1", "#616774", "green", "#4D5360","indigo"],
                            hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    title:{
                        display:true,
                        text: doughnutdata[0].pni_cell_name +"/ "+ doughnutdata[0].netwin_cell_jso_name,
                    },
                    legend: {
                        display: true,
                        labels: {
                            fontColor: 'black'
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error)
            $("#no_data").removeClass('d-none')
        }
    }


    //line
    async function getPdoData(cell) {
        try {
            var jso_dome_aerial = [];
            var jso_dome_ug = [];
            var jso_dome_total = [];
            var jfo_dome_total = [];
            var jfo_dome_ug = [];
            var jfo_dome_aerial = [];
            var pdo_6_aerial = [];
            const response = await axios.get("http://localhost:8011/query/v1/ftth.pdo_crosstab_joined?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=1000");
            var linedata = response.data;
            linedata.map(function (row) {
                jso_dome_aerial.push(row.jso_dome_aerial);
                jso_dome_ug.push(row.jso_dome_ug)
                jso_dome_total.push(row.jso_dome_total)
                jfo_dome_total.push(row.jfo_dome_total);
                jfo_dome_ug.push(row.jfo_dome_ug)
                jfo_dome_aerial.push(row.jfo_dome_aerial)
                pdo_6_aerial.push(row.pdo_6_aerial)
            })

            var ctxL = document.getElementById("lineChart").getContext('2d');
            myLineChart = new Chart(ctxL, {
                type: 'line',
                data: {
                    labels: ["JFO DOME AERIAL", "JFO DOME UG", "JFO DOME TOTAL", "JSO DOME AERIAL", "JSO DOME UG", "JSO DOME TOTAL", "PDO 6 TOTAL"],
                    datasets: [
                        {
                            label: linedata[0].pni_cell_name +"/ "+ linedata[0].netwin_cell_jso_name,
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: [jso_dome_aerial, jso_dome_ug, jso_dome_total, jfo_dome_total, jfo_dome_ug, jfo_dome_aerial, pdo_6_aerial]
                        },
                        // {
                        //     label: "My Second dataset",
                        //     fillColor: "rgba(151,187,205,0.2)",
                        //     strokeColor: "rgba(151,187,205,1)",
                        //     pointColor: "rgba(151,187,205,1)",
                        //     pointStrokeColor: "#fff",
                        //     pointHighlightFill: "#fff",
                        //     pointHighlightStroke: "rgba(151,187,205,1)",
                        //     data: [28, 48, 40, 19, 86, 27, 90]
                        // }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }]
                    }
                }
            });
        } catch (error) {
            console.log(error)
            
        }
    }




}); // END READY