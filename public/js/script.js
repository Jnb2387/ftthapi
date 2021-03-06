$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip(); // initialize the tooltip features
    var geom;
    var cellLayer;
    var responsedata;
    var cell_id;
    var cellsinarea_map;
    var homesresponsedata;
    var pni_or_netwin_name;
    var footagesresponsedata;
    //CREATE A GEOJSON FOR THE JSO_LOCATION BECAUSE ITS LAT LONG WILL BE INCLUDED IN THE CELL GEOJSON PROPERTIES
    var jsomarker = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            }
        }]
    };
    //USER STUFF
    var username = $(".username");
    var user_role = $(".user_role");
    async function getUser() {
        try {
            const response = await axios.post('http://localhost:8011/getuser');
            userdata = response.data;
            console.log(userdata);
            username.html(userdata.name);
            user_role.html(userdata.role);
            // DISABLE EDITING AND EXTRACT IF THE USER IS NOT AN ADMIN
            if (userdata.role !== 'admin') {
                $(".editbtns").addClass('disabled');
                // $(".editbtns").prop("disabled", true);
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }
    getUser();
    //THIS GET A 404 FROM THE SERVER TO REMOVE THE AUTH
    $("#log_out").on("click", function () {
        alert("You Have Been Logged Out")
        axios.get("http://localhost:8011/logout")
    });
    // END USER STUFF
    //Autocomplete for the Search Cell
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
        select: async function (e, data) {
            await getData(data.item.value); // Run the getData function with the parameters of the selected value in the autocomplete
            await getfunctiontable(data.item.value); // Run the getfunctiontable for the associated selected value.
            await getHomesPassed(data.item.value);
            await getFootages(data.item.value);
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
    async function getData(cell) {
        try {
            const response = await axios.get("http://localhost:8011/geojson/v1/ftth.cells?geom_column=geom&filter=pni_cell_name%20ilike%20'" + cell + "'OR%20netwin_cell_jso_name%20ilike%20'" + cell + "'&limit=100");
            responsedata = response.data.features[0].properties; //JUST THE PROPERTIES OF THE DATA
            // console.log(responsedata)
            let responsegeometry = response.data;
            jsomarker.features[0].geometry.coordinates = [responsedata.jso_latitude, responsedata.jso_longitude]; //UPDATE THE jsomarker GEOJSON CREATED EARLIER WITH THE COORDINATES IN THIS RESPONSE
            cell_id = responsedata.cell_id;
            delete responsegeometry.features[0].properties // REMOVE THE GEOMETRY TO JUST HAVE THE PROPERTIES
            geom = responsegeometry; // GEOMETRY CAN BE GRABED FROM ANYWHERE
            Object.keys(responsedata).forEach(function (key) { //REPLACE ANY NULL VALUES WITH JUST A DASH
                if (responsedata[key] == null || responsedata[key] == "") {
                    responsedata[key] = '-';
                }
            })
            // $("#cell_id").html(responsedata.cell_id)
            $("#netwin_cell_jso_name").html(responsedata.netwin_cell_jso_name)
            $("#cell_state").html(responsedata.cell_state)
            $("#cell_hub").html(responsedata.cell_hub)
            $("#cell_ring").html(responsedata.cell_ring)
            $("#rolt_id").html(responsedata.rolt_id)
            $("#cellid").html(responsedata.cell)
            $("#netwin_project_name").html(responsedata.netwin_project_name)
            $("#feeder").html(responsedata.feeder)
            $("#permitting_rolt_number").html(responsedata.permitting_rolt_number)
            $("#pni_cell_name").html(responsedata.pni_cell_name)
            $("#franchise").html(responsedata.franchise)
            $("#town").html(responsedata.town)
            $("#region").html(responsedata.region)
            $("#map_number").html(responsedata.map_number)
            $("#nodes_within_cell").html(responsedata.nodes_within_cell);
            $("#cell_rfs_date").html(responsedata.cell_rfs_date);
            $("#homes_serviceable").html(responsedata.homes_serviceable)
            $("#remaining_homes_unserviceable").html(responsedata.remaining_homes_unserviceable);
            $("#netwin_project_name").html(responsedata.netwin_project_name);

            addcelltomap(geom); //RUN THE FUNCTION TO ADD THE CURRENT CELL TO MAPBOX
        } catch (error) {
            console.log(error);
        }
    }
    //============================ MAP SET UP

    //MAPBOX
    // Set bounds to New York, New York
    var bounds = [
        [-79.76506, 40.03666], // Southwest coordinates
        [-70.6222, 45.0327] // Northeast coordinates
    ];
    // mapboxgl.accessToken =
    //     'pk.eyJ1IjoiYnJhZGxleTIzODciLCJhIjoiY2pnMTk0ZTk2NmJzOTJxbnZpMjl1ZGsxbiJ9.L-BSY_VjUrkHL3ov0OciKQ';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: '/js/style.json',
        //  style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
        center: [-74.38, 41], // starting position
        zoom: 6, // starting zoom
        hash: true,
        maxBounds: bounds,
        attributionControl:true
    });
    map.addControl(new mapboxgl.AttributionControl({
        compact: false
    }));
    map.on('load', function () {
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());
        // Add a button to make the map full-screen
        map.addControl(new mapboxgl.FullscreenControl());
        map.on('zoom', function () {
            if (map.getZoom() < 14) { // if the current zoom level is higher than 15 then enable the button else keep it disabled.
                $("#cellsinareabtn").addClass("disabled");
            } else {
                $("#cellsinareabtn").removeClass("disabled");
            }
        });
        map.on('click', function(e){
            var features=map.queryRenderedFeatures(e.point)
            console.log(features)
        })
        //NEW YORK SAM ADDRESSES
        // map.addSource('nysam', {
        //     "type": "vector",
        //     "tiles": ["http://www.jeffreybradley.a2hosted.com:49500/nysam/{z}/{x}/{y}.pbf"],
        //     'minzoom': 7,
        //     'maxzoom': 14,
        // });
        // map.addLayer({
        //     "id": "nysam",
        //     'type': 'circle',
        //     "source": "nysam",
        //     'source-layer': 'nysam2',
        //     'minzoom': 7,
        //     'maxzoom': 22,
        //     "layout": {
        //         'visibility': 'visible',
        //     },
        //     "paint": {
        //         'circle-color': 'blue',
        //         'circle-radius': {
        //             'base': 1.75,
        //             'stops': [
        //                 [14, 1],
        //                 [22, 19]
        //             ]
        //         },
        //     }
        // }, 'poi_label');

        // map.addLayer({
        //     "id": "nysamlabels",
        //     'type': 'symbol',
        //     "source": "nysam",
        //     'source-layer': 'nysam2',
        //     'minzoom': 17,
        //     'maxzoom': 22,
        //     "layout": {
        //         'visibility': 'visible',
        //         "text-field": '{AddressLabel}',
        //         "text-font": ["Roboto Black"],
        //         "text-size": 11,
        //         "text-transform": "uppercase",
        //         "text-letter-spacing": 0.05,
        //         "text-offset": [0, 1.5]
        //     },
        //     "paint": {
        //         "text-color": "#202",
        //         "text-halo-color": "#fff",
        //         "text-halo-width": 2
        //     }
        // }, 'poi_label');        

    });
    var jsopopup = new mapboxgl.Popup({
        closeOnClick: true
    });

    function addcelltomap(geom) {
        //=====================MAPBOX
        var layers = map.getStyle().layers; //GET ALL THE LAYERS IN THE STYLE
        var labelLayerId;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                labelLayerId = layers[i].id; //ADD EACH LAYER THAT IS A TEXT OR SYMBOL TO THE STORED VARIABLE
                break;
            }
            // //REMOVE THE OLD CELL LAYER
            if (layers[i].id === "cellpolygon") {
                console.log("REMOVED cellpolygon");
                map.removeLayer("cellpolygon");
                map.removeLayer("cellpolygon_outline");
                map.removeLayer("jsomarker");
                map.removeSource("jsomarker");
                map.removeSource("cellpolygon");
            }
            //REMOVE ANY CELLS IN VIEW SEARCHES
            if (layers[i].id === 'cellsinview') {
                map.removeLayer("cellsinview");
                map.removeLayer("cellsinview_outline");
                map.removeLayer("cellsinview_outline_highlight");
                map.removeLayer("cellsinview_label");
                map.removeSource("cellsinview");
            }
        }
        // map.getSource('cellpolygon').setData(geom);//TRY TO USE THIS INSTEAD JUST CANT FIGURE OUT THE BEST WAY

        //ADD THE SEARCHED CELL LAYER
        map.addSource('cellpolygon', {
            'type': 'geojson',
            'data': geom //THIS WAS THE STRIPPED OUT GEOMETRY FROM THE getdata() response geojson
        });
        map.addLayer({
            'id': 'cellpolygon',
            'type': 'fill',
            'source': 'cellpolygon',
            'layout': {},
            'paint': {
                'fill-color': 'blue',
                'fill-opacity': 0.6,
            }

        }, labelLayerId); //ADD THE LAYER BELOW ANY LABELS
        map.addLayer({
            'id': 'cellpolygon_outline',
            'type': 'line',
            'source': 'cellpolygon',
            'layout': {},
            'paint': {
                'line-color': 'black',
                'line-width': 2
            }
        }, labelLayerId);//"road_label"
        //JSO MARKER
        map.addSource('jsomarker', {
            'type': 'geojson',
            'data': jsomarker //THE GEOJSON CREATED AT THE TOP
        });
        map.addLayer({
            'id': 'jsomarker',
            'type': 'circle',
            'source': 'jsomarker',
            'layout': {

            },
            "paint": {
                "circle-radius": 6,
                "circle-color": "rgba(73, 69, 14, 1)",
                "circle-stroke-color": "rgba(115, 131, 53, 1)",
                "circle-stroke-width": 1
            }
        });
        // Change the cursor to a pointer when the mouse is over the jsomarker layer.
        map.on('mouseenter', 'jsomarker', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'jsomarker', function () {
            map.getCanvas().style.cursor = '';
        });
        map.on('click', 'jsomarker', function (e) {
            var features = map.queryRenderedFeatures(e.point);
            //Give the popup some data
            jsopopup.setLngLat(e.lngLat)
                .setHTML('<p class= "mb-1"><span class="font-italic small font-weight-bold pr-1">JSO Type:</span>' + responsedata.jso_type + '</p><p class= "mb-1"><span class="font-italic small font-weight-bold pr-1">JSO Pole #:  </span>' + responsedata.jso_pole_number + '</p>')
                .addTo(map);
        })
        if (jsopopup) {
            // popup.remove();//DIDNT WORK FOR SOME REASON
            $(".mapboxgl-popup-close-button").click();
        }
        jsopopup
            .setLngLat(jsomarker.features[0].geometry.coordinates) //SET THE POP TO BE THE JSO COORDINATES
            .setHTML('<p class= "mb-1"><span class="font-italic small font-weight-bold pr-1">JSO Type:</span>' + responsedata.jso_type + '</p><p class= "mb-1"><span class="font-italic small font-weight-bold pr-1">JSO Pole #:  </span>' + responsedata.jso_pole_number + '</p>')
            .addTo(map);

        // TURF FINDS THE EXTENT OF THE CELL POLYGON AND THEN I JUST TELL MAPBOX TO ZOOM TO IT 'QUICKLY' AND PUT A LITTLE SPACING AROUND THE ZOOM
        var bounds = turf.extent(geom);
        map.fitBounds(bounds, {
            duration: 0,
            padding: 20
        });

    }
    async function findcellsinarea(coords) {
        try {
            if (!responsedata) {
                alert("Please Search for A Cell");
                return;
            }
            var layers = map.getStyle().layers; //GET ALL THE LAYERS IN THE STYLE
            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id; //ADD EACH LAYER THAT IS A TEXT OR SYMBOL 
                    break;
                }
                //REMOVE ANY CELLS IN VIEW SEARCHES
                if (layers[i].id === 'cellsinview') {
                    console.log('REMOVED cellsinview')
                    map.removeLayer("cellsinview");
                    map.removeLayer("cellsinview_outline");
                    map.removeLayer("cellsinview_outline_highlight");
                    map.removeLayer("cellsinview_label");
                    map.removeSource("cellsinview");
                }
            }
            let bounds = map.getBounds().toArray().toString();
            const response = await axios.get("http://localhost:8011/geojson/v1/ftth.cells?geom_column=geom&columns=*&filter=geom%26%26ST_MakeEnvelope(" + bounds + ")AND%20cell_id%3C%3E" + cell_id + "&limit=50");
            cellsinareageom = response.data;
            console.log('Cell in area data: ', cellsinareageom);

            //Create a Source containing all the cells in view
            map.addSource('cellsinview', {
                'type': 'geojson',
                'data': response.data
            })
            //Add the cells in view polygons
            map.addLayer({
                'id': 'cellsinview',
                'type': 'fill',
                'source': 'cellsinview',
                'layout': {},
                'paint': {
                    'fill-color': 'red',
                    'fill-opacity': 0.6,
                }
            }, 'cellpolygon')
            //Also add an outline to make it look better and distinct
            map.addLayer({
                'id': 'cellsinview_outline',
                'type': 'line',
                'source': 'cellsinview',
                'layout': {},
                'paint': {
                    'line-color': 'black',
                    'line-width': 2
                }
            }, 'cellpolygon');
            //When a user clicks on the cells this highlights the cell in yellow
            map.addLayer({
                'id': 'cellsinview_outline_highlight',
                'type': 'line',
                'source': 'cellsinview',
                'layout': {},
                'paint': {
                    'line-color': 'yellow',
                    'line-width': 2
                },
                "filter": ["in", "cell_id", ""]
            });
            //Make a label for all the cells in view contain the newtin jso and the pni
            map.addLayer({
                'id': 'cellsinview_label',
                'type': 'symbol',
                'source': 'cellsinview',
                "minzoom": 14,
                "layout": {
                    "text-field": "{netwin_cell_jso_name}/{pni_cell_name}",
                    "text-font": [
                        "Roboto Black"
                    ],
                    "text-size": {
                        'base': 1.75,
                        'stops': [
                            [14, 11],
                            [22, 18]
                        ]
                    },
                    'text-allow-overlap': true,
                    'text-ignore-placement': true,
                    'visibility': 'visible'
                },
                "paint": {
                    "text-color": "red",
                    "text-halo-blur": 1,
                    "text-halo-color": "white",
                    "text-halo-width": 2
                }
            });
            
            // Change the cursor to a pointer when the mouse is over the cellsinview layer.
            map.on('mouseenter', 'cellsinview', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'cellsinview', function () {
                map.getCanvas().style.cursor = '';
            });
            // Create a popup, but don't add it to the map yet.
            var popup = new mapboxgl.Popup({
                closeOnClick: false //KEEP THIS OTHERWISE THE POPUP DISAPPEARS WHEN CLICKING A DIFFERENT CELL AFTER OPENED
            })
            //When someone clicks on the cellsinview polygons this filters through the data and highlights the cell with the same cell_id
            map.on('click', 'cellsinview', function (e) {
                // set bbox as 5px reactangle area around clicked point
                var bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5]
                ];
                var features = map.queryRenderedFeatures(bbox, {
                    layers: ['cellsinview']
                });

                //Give the popup some data
                popup.setLngLat(e.lngLat)
                    .setHTML('<h6 class="text-center mb-0 font-weight-bold">' + e.features[0].properties.netwin_cell_jso_name + ' / ' + e.features[0].properties.pni_cell_name + '</h6><br><button class="mt-0 btn btn-sm btn-primary mapcellsearchbtn">Search For This Cell</button>')
                    .addTo(map);
                //GRAB THE newtin_cell_jso_name and store it in a variable to search.
                if (e.features[0].properties.netwin_cell_jso_name) {
                    pni_or_netwin_name = e.features[0].properties.netwin_cell_jso_name;
                } else {
                    pni_or_netwin_name = e.features[0].properties.pni_cell_name;
                }

                // Run through the selected features and set a filter
                // to match features with unique cell_id's to activate
                // the cellsinview_outline_highlight layer.
                var filter = features.reduce(function (memo, feature) {
                    memo.push(feature.properties.cell_id);
                    return memo;
                }, ['in', 'cell_id']);
                //Add the filter to the highlight layer
                map.setFilter("cellsinview_outline_highlight", filter);
                //WHEN THE SEARCH FOR THIS CELL BUTTON IS CLICKED
                $(".mapcellsearchbtn").on('click', function () {
                    console.log('Searching for netwin jso only from popup click', pni_or_netwin_name);
                    $("#cellsearch").val(pni_or_netwin_name);
                    $("#nav_cell_name").text(pni_or_netwin_name);
                    getData(pni_or_netwin_name);
                    getfunctiontable(pni_or_netwin_name); // Run the getfunctiontable for the associated selected value.
                    getHomesPassed(pni_or_netwin_name);
                    getFootages(pni_or_netwin_name);
                    if (popup) {
                        // popup.remove();//DIDNT WORK FOR SOME REASON
                        $(".mapboxgl-popup-close-button").click()
                    }
                });
            });

        } catch (err) {
            console.log(err)
        }
    }

    //=============================LEAFLET 
    // map = L.map('map').setView([42, -74.09], 7);
    // // var openstreetmaps = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // // }).addTo(map);
    // var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    //     subdomains: 'abcd',
    // }).addTo(map);
    //REMOVE THE PREVIOUS cellLayer
    // map.eachLayer(function (layer) {
    //     if (map.hasLayer(cellLayer)) {
    //         map.removeLayer(cellLayer);
    //         map.removeLayer(jsomarker);
    //         if (map.hasLayer(cellsinarea_map)) {
    //             map.removeLayer(cellsinarea_map);
    //             console.log('cellsinarea_map Removed.');
    //         }
    //     }
    // });
    // // if the geometry object is empty then dont run this
    // if (!isEmpty(geom.features[0].geometry)) {
    //     cellLayer = L.geoJSON(geom).addTo(map);
    //     map.fitBounds(cellLayer.getBounds());
    //     jsomarker = L.circle(jsogeom, {
    //             radius: 20,
    //             color: 'yellow'
    //         }).addTo(map)
    //         .bindPopup("<b class='text-center'>JSO Name</b></br>" + responsedata.netwin_cell_jso_name)
    //         .openPopup();
    // } else {
    //     console.log('No Geometry');
    // }
    //Disable and Enable the find cells in view button based on zoom level
    // map.on('zoomend', function () {
    //     if (map.getZoom() < 15) { // if the current zoom level is higher than 15 then enable the button else keep it disabled.
    //         $("#cellsinareabtn").addClass("disabled");
    //     } else {
    //         $("#cellsinareabtn").removeClass("disabled");
    //     }
    // });

    // async function findcellsinarea(coords) {
    //     try {
    //         // DONT RUN FUNCTION IF THERE IS NO CELL SEARCHED
    //         if (!responsedata) {
    //             alert("Please Search for A Cell");
    //             return;
    //         }
    //         map.eachLayer(function (layer) {
    //             if (map.hasLayer(cellsinarea_map)) {
    //                 map.removeLayer(cellsinarea_map);
    //                 console.log('cellsinareageom Layer Removed');
    //             }
    //         });
    //         let bounds = map.getBounds().toBBoxString();
    //         const response = await axios.get("http://localhost:8011/geojson/v1/ftth.cells?geom_column=geom&columns=*&filter=geom%26%26ST_MakeEnvelope(" + bounds + ")AND%20cell_id%3C%3E" + cell_id + "&limit=50");
    //         cellsinareageom = response.data;
    //         console.log('Cell in area data: ', cellsinareageom);

    //         var cellsinareastyle = {
    //             "color": "red",
    //             "weight": 5,
    //             "opacity": 0.65
    //         };
    //         cellsinarea_map = L.geoJSON(cellsinareageom, {
    //             style: cellsinareastyle
    //         }).addTo(map);

    //         cellLayer.bringToFront();
    //         cellsinarea_map.eachLayer(function (layer) {
    //             layer.bindPopup(layer.feature.properties.netwin_cell_jso_name);
    //         });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }


    $("#cellsinareabtn").on("click", function () {
        findcellsinarea();
    });






    //Helper function to check for empty objects
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    async function getHomesPassed(cell) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.homes_passed?columns=*&filter=%20pni_cell_name%20ilike'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike'" + cell + "%25'&limit=10");
            homesresponsedata = response.data[0]; //JUST THE PROPERTIES OF THE DATA
            if (homesresponsedata) {
                console.log('Homes Passed Table data ', homesresponsedata);
                $(".homes_passed_null").html('-');
                $("#aerial_homes").html(homesresponsedata.aerial);
                $("#ug_homes").html(homesresponsedata.ug);
                $("#comm_aerial_homes").html(homesresponsedata.commercial);
                $("#comm_ug_homes").html(homesresponsedata.commercial_ug);
                $("#ba_homes").html(homesresponsedata.ba);
                $("#mdu_homes").html(homesresponsedata.mdu);
                $("#planned_homes").html(homesresponsedata.planned);
                $("#total_homes").html(homesresponsedata.total);
            } else {
                $(".homes_passed_null").html('-');
            }
        } catch (error) {
            console.log(error);
        }
    }
    async function getFootages(cell) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.footages?columns=*&filter=%20pni_cell_name%20ilike'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike'" + cell + "%25'&limit=10");
            footagesresponsedata = response.data[0]; //JUST THE PROPERTIES OF THE DATA
            if (footagesresponsedata) {
                console.log('Footages Table data ', footagesresponsedata);
                $("#cbs_footages").html(footagesresponsedata.cable_bearing_strand);
                $("#ba_footages").html(footagesresponsedata.building_attachment);
                $("#mdu_footages").html(footagesresponsedata.mdu);
                $("#commercial_ug_footages").html(footagesresponsedata.commercial_ug);
                $("#slack_footages").html(footagesresponsedata.slack);
                $("#ug_footages").html(footagesresponsedata.ug);
                $("#total_footages").html(footagesresponsedata.total);
            } else {
                $(".footages_null").html('-');
            }
        } catch (error) {
            console.log(error);
        }
    }

    $('#cellsearchbtn').on("click", async function () {
        let cell = $("#cellsearch").val().toUpperCase();
        if (!cell) {
            return;
        } // DONT SEARCH IF THERE IS NOTHING IN THE INPUT
        await getData(cell);
        await getfunctiontable(cell);
        await getHomesPassed(cell);
        await getFootages(cell);
    });
    $("#mapdivbtn").on("click", function () {
        window.dispatchEvent(new Event('resize')); // FOR SOME REASON THE LEAFLET MAP DOESN'T KNOW THE ELEMENT SIZE IN A MODAL.
    });

    //===============EXTRACT CELL DATA======================. 
    $("#celldataextractbtn").on("click", function (e) {
        $("#cellExtractModal").modal('show');
    });
    $("#current_cell_extract_btn").on("click", function (e) {
        extractCurrentCellData(e);
        $("#cellExtractModal").modal('hide');
    });
    $("#all_cell_extract_btn").on("click", function (e) {
        extractAllCellData(e);
        $("#cellExtractModal").modal('hide');
    });
    //WHEN THE DATA EXTRACT BUTTON IS CLICKED DOWNLOAD THE CURRENT CELL DATA AS CSV
    async function extractCurrentCellData(e) {
        // DONT RUN FUNCTION IF THERE IS NO CELL SEARCHED
        if (!responsedata) {
            alert("Please Search for A Cell");
            e.stopPropagation(); // if there is no responsedata then dont open the modal
            return;
        }
        try {
            var cell = $("#cellsearch").val();
            const response = await axios.get("http://localhost:8011/csv/v1/ftth.cells_no_geom?columns=*&filter=%20ftth.cells_no_geom.pni_cell_name%20ilike'" + cell + "'%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%20ilike'" + cell + "'&join=ftth.homes_passed_prefixed%3Bftth.cells_no_geom.pni_cell_name%3Dftth.homes_passed_prefixed.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.homes_passed_prefixed.netwin_cell_jso_name&join2=ftth.footages_prefixed%3Bftth.cells_no_geom.pni_cell_name%3Dftth.footages_prefixed.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.footages_prefixed.netwin_cell_jso_name&join3=ftth.cell_functions_crosstab%3Bftth.cells_no_geom.pni_cell_name%3Dftth.cell_functions_crosstab.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.cell_functions_crosstab.netwin_cell_jso_name&join4=ftth.sheath_crosstab_joined%3Bftth.cells_no_geom.pni_cell_name%3D%20ftth.sheath_crosstab_joined.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3D%20ftth.sheath_crosstab_joined.netwin_cell_jso_name&join5=ftth.pdo_crosstab_joined%3Bftth.cells_no_geom.pni_cell_name%3D%20ftth.pdo_crosstab_joined.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3D%20ftth.pdo_crosstab_joined.netwin_cell_jso_name");
            var currentcelldata = response.data; //JUST THE PROPERTIES OF THE DATA
            console.log(currentcelldata)
            var link = document.createElement("a");
            link.href = 'data:text/csv;charset=utf-8,' + encodeURI(currentcelldata);
            link.setAttribute("download", "Cell_" + cell + "_Extract.csv"); //NAME OF THE CSV
            document.body.appendChild(link);
            link.click(); // This will download the data file 
        } catch (error) {
            console.log(error)
        }
    }

    //FOR EXTRACTING ALL THE CELLS
    async function extractAllCellData() {
        try {
            const response = await axios.get("http://localhost:8011/csv/v1/ftth.cells_no_geom?columns=*&join=ftth.homes_passed_prefixed%3Bftth.cells_no_geom.pni_cell_name%3Dftth.homes_passed_prefixed.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.homes_passed_prefixed.netwin_cell_jso_name&join2=ftth.footages_prefixed%3Bftth.cells_no_geom.pni_cell_name%3Dftth.footages_prefixed.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.footages_prefixed.netwin_cell_jso_name&join3=ftth.cell_functions_crosstab%3Bftth.cells_no_geom.pni_cell_name%3Dftth.cell_functions_crosstab.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3Dftth.cell_functions_crosstab.netwin_cell_jso_name&join4=ftth.sheath_crosstab_joined%3Bftth.cells_no_geom.pni_cell_name%3D%20ftth.sheath_crosstab_joined.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3D%20ftth.sheath_crosstab_joined.netwin_cell_jso_name&join5=ftth.pdo_crosstab_joined%3Bftth.cells_no_geom.pni_cell_name%3D%20ftth.pdo_crosstab_joined.pni_cell_name%20OR%20ftth.cells_no_geom.netwin_cell_jso_name%3D%20ftth.pdo_crosstab_joined.netwin_cell_jso_name");
            var allcelldata = response.data; //JUST THE PROPERTIES OF THE DATA
            var link = document.createElement("a");
            link.href = 'data:text/csv;charset=utf-8,' + encodeURI(allcelldata);
            link.setAttribute("download", "All_Cells_Extract.csv"); //NAME OF THE CSV
            document.body.appendChild(link);
            link.click(); // This will download the data file 
        } catch (error) {
            console.log(error)
        }
    }
    //================= END EXTRACT CELL DATA


    //CELL FUNCTION TABLE
    async function getfunctiontable(cell) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.functions_table?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=100");
            console.log('Function table data: ', response.data)
            dataArr = response.data
            var functiondatatable = await $("#functiontable").DataTable({
                data: dataArr,
                destroy: true,
                select: true,
                dataSrc: "",
                idSrc: 'id',
                bLengthChange: false,
                columnDefs: [{
                    width: 900,
                    targets: 3
                }],
                columns: [{
                    data: "design_function",
                    name: "design_function"
                }, {
                    data: "resource",
                    name: "resource"
                },
                //  {
                //     data: "object_id"
                // }, 
                {
                    data: "date_complete",
                    name: "date_complete"
                }, {
                    data: "comment",
                    name: "comment",
                    width: "40%"
                }
                ],
                "order": [
                    [2, "desc"]
                ]
            });

            var editor = await new $.fn.dataTable.Editor({
                ajax: {
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    create: {
                        type: 'POST',
                        // url: "http://localhost:8011/insert_functions/v1/ftth.functions_table?cell_id=" + responsedata.cell_id,
                        url: "http://localhost:8011/insert_functions/v1/ftth.functions_table?pni_cell_name=" + responsedata.pni_cell_name + "&netwin_cell_jso_name=" + responsedata.netwin_cell_jso_name,
                        data: function (d) { //BREAK OUT FROM THE WHAT THE NATIVE DATABASE EDITOR WAS SENDING AS THE KEY VALUE IN THE ACTUAL FIELD NAME. HAD 'DATA[0]' ATTACHED
                            var obj;
                            for (var key in d.data) {
                                obj = d.data[key];
                                break;
                            }
                            return obj;
                        },
                        error: function (xhr, error, thrown) {
                            alert('Error Adding Cell Function \n' + xhr.responseText)
                        }
                    },
                    edit: {
                        type: 'POST',
                        url: "http://localhost:8011/update_functions/v1/ftth.functions_table?pni_cell_name=" + responsedata.pni_cell_name + "&netwin_cell_jso_name=" + responsedata.netwin_cell_jso_name + "&id=_id_",
                        data: function (d) { //BREAK OUT FROM THE WHAT THE NATIVE DATABASE EDITOR WAS SENDING AS THE KEY VALUE IN THE ACTUAL FIELD NAME. HAD 'DATA[0]' ATTACHED
                            var obj;
                            for (var key in d.data) {
                                obj = d.data[key];
                                break;
                            }
                            return obj;
                        },
                        error: function (xhr, error, thrown) {
                            alert(xhr.responseJSON.message)
                        }
                    }, //STILL DONT UNDERSTAND HOW ITS GRABING THE id FIELD AS _id_ AT END OF URL
                    remove: {
                        type: 'POST',
                        url: "http://localhost:8011/delete_functions/v1/ftth.functions_table?id=_id_"
                    }
                },
                table: '#functiontable',
                idSrc: 'id',
                fields: [{
                    name: "design_function",
                    label: "Design Function",
                    type: "select",
                    options: [{
                        label: "",
                        value: null
                    },
                    {
                        label: "Cell Pocketed",
                        value: "Cell Pocketed"
                    },
                    {
                        label: "Cell Designed",
                        value: "Cell Designed"
                    },
                    {
                        label: "Cell Issued to QC",
                        value: "Cell Issued to QC"
                    },
                    {
                        label: "Cell Drafted in Netwin",
                        value: "Cell Drafted in Netwin"
                    },
                    {
                        label: "Cell Released to Construction",
                        value: "Cell Released to Construction"
                    },
                    {
                        label: "Cell QC Design",
                        value: "Cell QC Design"
                    },
                    {
                        label: "Cell Pocketing QC",
                        value: "Cell Pocketing QC"
                    },
                    {
                        label: "Cell Design Issued",
                        value: "Cell Design Issued"
                    },
                    ],
                    attr: {
                        required: true
                    }
                }, {
                    name: "resource",
                    label: "Resource",
                    def: username.text() //grabbed from variable at the top

                }, {
                    name: "date_complete",
                    label: "Date Complete",
                    type: 'datetime',
                    def: function () {
                        return new Date();
                    },
                    format: 'M/DD/YYYY', //THIS MAKES SURE THE DATE COLUMN MATCHES THIS FORMAT
                }, {
                    name: "comment",
                    label: "Comment"
                }]
            });
            // MAKE THE design_function AND resource A REQUIRED FIELD
            editor.on('preSubmit', function (e, o, action) {
                if (action !== 'remove') {
                    var design_function = this.field('design_function');
                    if (design_function.val() == null) {
                        design_function.error('Select A Design Function');
                    }
                    var resource = this.field('resource');
                    if (resource.val() == null || resource.val() == '') {
                        resource.error('Input A Resource');
                    }
                    // If any error was reported, cancel the submission
                    if (this.inError()) {
                        return false;
                    }
                }
            });
            //WHEN A NEW FUNCTION IS INSERTED OR CREATED THEN RE_RUN THE getfunctiontable() BECAUSE NEW ROWS DONT HAVE AN UNIQUE id YET SO CANT BE EDITED UNLESS RELOADED.
            editor.on('create', function (e, o, action) {
                var cell = $("#cellsearch").val().toUpperCase();
                console.log("Function Added So Refreshing The Cell Function Table")
                getfunctiontable(cell)

            });
            new $.fn.dataTable.Buttons(functiondatatable, [{
                extend: "create",
                text: "<i class='fa fa-plus text-success'></i> Add Function",
                editor: editor
            },
            {
                extend: "edit",
                text: "<i class='fa fa-pencil-square-o'></i> Edit Function",
                editor: editor
            },
            {
                extend: "remove",
                text: "<i class='fa fa-trash-o '></i> Delete Function",
                editor: editor
            }, {
                extend: 'csvHtml5',
                text: 'Export Functions',
                title: responsedata.netwin_cell_jso_name + '_Cell_Functions_Export'
            }
            ]);

            if (user_role.text() == 'admin') {
                console.log('Editing Buttons Enabled')
                functiondatatable.buttons().container()
                    .appendTo($('.col-md-6:eq(0)', functiondatatable.table().container()));
                // functiondatatable.buttons().disable()
            }

        } catch (error) {
            console.log(error)
        }
    }

    //SHEATH TABLE
    async function getsheathtable(cell) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.sheath?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=100");
            console.log('Sheath table data: ', response.data)
            dataArr = response.data
            datatable = $("#sheathtable").DataTable({
                data: dataArr,
                destroy: true,
                select: true,
                searching: false,
                "paging": false,
                bLengthChange: false,
                info: false,
                dataSrc: "",
                columns: [{
                    data: "type"
                }, {
                    data: "aerial"
                }, {
                    data: "ug"
                }, {
                    data: "total"
                }],
            });
        } catch (error) {
            console.log(error)
        }
    }
    //PDO TABLE
    async function getpdotable(cell) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.pdo?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "%25'%20OR%20netwin_cell_jso_name%20ilike%20'" + cell + "%25'&limit=100");
            console.log('PDO Table data: ', response.data)
            dataArr = response.data
            datatable = $("#pdotable").DataTable({
                data: dataArr,
                destroy: true,
                select: true,
                searching: false,
                "paging": false,
                bLengthChange: false,
                info: false,
                dataSrc: "",
                columns: [{
                    data: "type"
                }, {
                    data: "aerial"
                }, {
                    data: "ug"
                }, {
                    data: "total"
                }],
            });
        } catch (error) {
            console.log(error)
        }
    }
    $("#cellstatisticsbtn").on('click', function (e) {
        pni_or_netwin_name = $("#cellsearch").val() // GRAB THE VALUE OF THE cellsearch
        if (!responsedata) {
            alert("Please Search for A Cell")
            e.stopPropagation(); // if there is no responsedata then dont open the modal
            return
        }
        getsheathtable(pni_or_netwin_name);
        getpdotable(pni_or_netwin_name)
    })
    //========EDIT A CELL, FOOTAGES AND HOMES PASSED
    $("#editcellbtn").on('click', function (e) {
        if (!responsedata) {
            alert("Please Search for A Cell")
            e.stopPropagation(); // if there is no responsedata then dont open the modal
            return
        }
        pni_or_netwin_name = $("#cellsearch").val() // GRAB THE VALUE OF THE cellsearch AND PUT IT IN THE HEADER OF THE MODAL
        $("#editcellheader").html(pni_or_netwin_name)
        console.log('Edit Cell Prefilled Data: ', responsedata)
        Object.keys(responsedata).forEach(function (key) { //REMOVE THE '-' THAT WAS ADDED ABOVE SO THAT IT WONT GET SEND TO THE DATABASE
            if (responsedata[key] == '-') {
                responsedata[key] = null;
            }
        })
        $("#cellmodalform")[0].reset() //CLEAR ALL THE INPUTS SO THAT IF SOMETHING ISNT FILLED IN THE DATABASE IT WONT CLEAR THE PREVIOUS INPUT
        //PREFILL THE CELL DATA
        $("#netwin_cell_jso_name_edit").val(responsedata.netwin_cell_jso_name);
        $("#cell_state_edit").val(responsedata.cell_state);
        $("#cell_hub_edit").val(responsedata.cell_hub);
        $("#cell_ring_edit").val(responsedata.cell_ring)
        $("#rolt_id_edit").val(responsedata.rolt_id)
        $("#cell_edit").val(responsedata.cell)
        $("#netwin_project_name_edit").val(responsedata.netwin_project_name)
        $("#feeder_edit").val(responsedata.feeder)
        $("#permitting_rolt_number_edit").val(responsedata.permitting_rolt_number)
        $("#pni_cell_name_edit").val(responsedata.pni_cell_name)
        $("#franchise_edit").val(responsedata.franchise)
        $("#town_edit").val(responsedata.town)
        $("#region_edit").val(responsedata.region)
        $("#map_number_edit").val(responsedata.map_number)
        $("#nodes_within_cell_edit").val(responsedata.nodes_within_cell)
        $("#cell_rfs_date_edit").val(responsedata.cell_rfs_date)
        $("#homes_serviceable_edit").val(responsedata.homes_serviceable)
        $("#remaining_homes_unserviceable_edit").val(responsedata.remaining_homes_unserviceable)
        $("#jso_street_location_edit").val(responsedata.jso_street_location)
        $("#jso_pole_number_edit").val(responsedata.jso_pole_number)
        $("#jso_latitude_edit").val(responsedata.jso_latitude)
        $("#jso_longitude_edit").val(responsedata.jso_longitude)
        $("#cell_build_year_edit").val(responsedata.cell_build_year)
        $("#market_year_edit").val(responsedata.market_year)
        $("#jso_type_edit").val(responsedata.jso_type)
        $("#cell_dc_edit").val(responsedata.cell_dc)
        $("#dc_to_location_edit").val(responsedata.dc_to_location)
        $("#dc_from_location_edit").val(responsedata.dc_from_location)
        $("#cell_local_design_priority_edit").val(responsedata.cell_local_design_priority)
        $("#cell_revision_comment_edit").val(responsedata.cell_revision_comment)
        $("#cell_homes_pocketed_edit").val(responsedata.cell_homes_pocketed)
        $("#cell_status_edit").val(responsedata.cell_status)
        $("#number_of_pdos_edit").val(responsedata.number_of_pdos)
        //PREFILL FOOTAGES DATA
        if (footagesresponsedata) {
            $("#building_attachment_footage_edit").val(footagesresponsedata.building_attachment)
            $("#cable_bearing_strand_footage_edit").val(footagesresponsedata.cable_bearing_strand)
            $("#mdu_footage_edit").val(footagesresponsedata.mdu)
            $("#slack_footage_edit").val(footagesresponsedata.slack)
            $("#ug_footage_edit").val(footagesresponsedata.ug)
            $("#total_footage_edit").val(footagesresponsedata.total)
        }
        //PREFILL HOMES PASSED DATA
        if (homesresponsedata) {
            $("#aerial_homes_passed_edit").val(homesresponsedata.aerial)
            $("#ba_homes_passed_edit").val(homesresponsedata.ba)
            $("#commercial_homes_passed_edit").val(homesresponsedata.commercial)
            $("#commercial_ug_homes_passed_edit").val(homesresponsedata.commercial_ug)
            $("#mdu_homes_passed_edit").val(homesresponsedata.mdu)
            $("#planned_homes_passed_edit").val(homesresponsedata.planned)
            $("#UG_homes_passed_edit").val(homesresponsedata.ug)
            $("#total_homes_passed_edit").val(homesresponsedata.total)
        }
    });
    var cellupdateresponse;
    async function updateCellTable() {
        try {
            const response = await axios.post("http://localhost:8011/update_cell/v1/ftth.cells?cell_id=" + cell_id + "", {
                netwin_cell_jso_name: $("#netwin_cell_jso_name_edit").val(),
                cell_state: $("#cell_state_edit").val(),
                cell_hub: $("#cell_hub_edit").val(),
                cell_ring: $("#cell_ring_edit").val(),
                rolt_id: $("#rolt_id_edit").val(),
                cell: $("#cell_edit").val(),
                netwin_project_name: $("#netwin_project_name_edit").val(),
                feeder: $("#feeder_edit").val(),
                permitting_rolt_number: $("#permitting_rolt_number_edit").val(),
                pni_cell_name: $("#pni_cell_name_edit").val(),
                franchise: $("#franchise_edit").val(),
                town: $("#town_edit").val(),
                region: $("#region_edit").val(),
                map_number: $("#map_number_edit").val(),
                nodes_within_cell: $("#nodes_within_cell_edit").val(),
                cell_rfs_date: $("#cell_rfs_date_edit").val(),
                homes_serviceable: $("#homes_serviceable_edit").val(),
                remaining_homes_unserviceable: $("#remaining_homes_unserviceable_edit").val(),
                jso_street_location: $("#jso_street_location_edit").val(),
                jso_pole_number: $("#jso_pole_number_edit").val(),
                jso_latitude: $("#jso_latitude_edit").val(),
                jso_longitude: $("#jso_longitude_edit").val(),
                cell_build_year: $("#cell_build_year_edit").val(),
                market_year: $("#market_year_edit").val(),
                jso_type: $("#jso_type_edit").val(),
                cell_dc: $("#cell_dc_edit").val(),
                dc_to_location: $("#dc_to_location_edit").val(),
                dc_from_location: $("#dc_from_location_edit").val(),
                cell_local_design_priority: $("#cell_local_design_priority_edit").val(),
                cell_revision_comment: $("#cell_revision_comment_edit").val(),
                cell_homes_pocketed: $("#cell_homes_pocketed_edit").val(),
                cell_status: $("#cell_status_edit").val(),
                number_of_pdos: $("#number_of_pdos_edit").val(),
            });
            console.log("Updated Cells Table")
            cellupdateresponse = response.data;
        } catch (error) {
            console.log(error)
        }
    }
    //UPDATE FOOTAGES TABLE, ALSO NEED THE INSERT IF THE NETWIN OR PNI NAME DOESNT EXIST
    var footagesupdateresponse;
    async function updateFootagesTable() {
        try {
            const response = await axios.post("http://localhost:8011/update_footages/v1/ftth.footages?id=" + footagesresponsedata.id + "", {
                building_attachment: $("#building_attachment_footage_edit").val(),
                cable_bearing_strand: $("#cable_bearing_strand_footage_edit").val(),
                mdu: $("#mdu_footage_edit").val(),
                slack: $("#slack_footage_edit").val(),
                ug: $("#ug_footage_edit").val(),
                total: $("#total_footage_edit").val()
            });
            console.log("Updated Footages Table")
            footagesupdateresponse = response.data;
        } catch (error) {
            console.log(error)
        }
    }
    //INSERT FOOTAGES TABLE
    async function insertFootagesTableFromEdit() {
        try {
            const response = await axios.post("http://localhost:8011/insert_footages/v1/ftth.footages", {
                pni_cell_name: $("#pni_cell_name_edit").val(),
                netwin_cell_jso_name: $("#netwin_cell_jso_name_edit").val(),
                building_attachment: $("#building_attachment_footage_edit").val(),
                cable_bearing_strand: $("#cable_bearing_strand_footage_edit").val(),
                mdu: $("#mdu_footage_edit").val(),
                slack: $("#slack_footage_edit").val(),
                ug: $("#ug_footage_edit").val(),
                total: $("#total_footage_edit").val()
            });
            console.log("Inserted into Footages Table")
            footagesupdateresponse = response.data;
        } catch (error) {
            console.log(error)
        }
    }
    //UPDATE HOMES PASSED TABLE ALSO NEED THE INSERT IF THE NETWIN OR PNI NAME DOESNT EXIST
    var homespassedupdateresponse;
    async function updateHomesPassedTable() {
        try {
            const response = await axios.post("http://localhost:8011/update_homes_passed/v1/ftth.homes_passed?id=" + homesresponsedata.id + "", {
                aerial: $("#aerial_homes_passed_edit").val(),
                ba: $("#ba_homes_passed_edit").val(),
                commercial: $("#commercial_homes_passed_edit").val(),
                commercial_ug: $("#commercial_ug_homes_passed_edit").val(),
                mdu: $("#mdu_homes_passed_edit").val(),
                planned: $("#planned_homes_passed_edit").val(),
                ug: $("#UG_homes_passed_edit").val(),
                total: $("#total_homes_passed_edit").val()
            });
            console.log("Updated Homes Passed Table")
            homespassedupdateresponse = response.data;
        } catch (error) {
            console.log(error)
        }
    }
    //INSERT HOMES PASSED TABLE
    async function insertHomesPassedTableFromEdit() {
        try {
            const response = await axios.post("http://localhost:8011/insert_homes_passed/v1/ftth.homes_passed", {
                pni_cell_name: $("#pni_cell_name_edit").val(),
                netwin_cell_jso_name: $("#netwin_cell_jso_name_edit").val(),
                aerial: $("#aerial_homes_passed_edit").val(),
                ba: $("#ba_homes_passed_edit").val(),
                commercial: $("#commercial_homes_passed_edit").val(),
                commercial_ug: $("#commercial_ug_homes_passed_edit").val(),
                mdu: $("#mdu_homes_passed_edit").val(),
                planned: $("#planned_homes_passed_edit").val(),
                ug: $("#UG_homes_passed_edit").val(),
                total: $("#total_homes_passed_edit").val()
            });
            console.log("Inserted into Homes Passed Table")
            homespassedupdateresponse = response.data;
        } catch (error) {
            console.log(error)
        }
    }
    //NOW SEND ALL UPDATED CELL, FOOTAGES AND HOMES PASSED DATA
    $("#cellupdatebtn").on('click', async function () {
        await updateCellTable();
        if (footagesresponsedata) { //IF THERE ISNT A FIELD IN THE FOOTAGES TABLE FOR THE CELL ALREADY THEN IT NEEDS TO BE CREATED SO CHECK IF THE footagesresponsedata HAS DATA AND THEN IF NOT MAKE AN INSERT INSTEAD OF UPDATE
            await updateFootagesTable();
        } else {
            insertFootagesTableFromEdit()
        }
        if (homesresponsedata) { //IF THERE ISNT A FIELD IN THE HOMES PASSED TABLE FOR THE CELL ALREADY THEN IT NEEDS TO BE CREATED SO CHECK IF THE homessresponsedata HAS DATA AND THEN IF NOT MAKE AN INSERT INSTEAD OF UPDATE
            await updateHomesPassedTable();
        } else {
            await insertHomesPassedTableFromEdit();
        }
        await getData(pni_or_netwin_name); // WHEN THE CELL IS UPDATED RELOAD THE VIEW AGAIN
        await getHomesPassed(pni_or_netwin_name);
        await getFootages(pni_or_netwin_name);
        //MAY HAVE TO REFACTOR CAUSE NOT THE BEST WAY. BUT CHECK THE RESPONSE OF EACH POST REQUEST AND IF THEY ARE ALL SUCCESSFUL THEN SHOW THE SUCCESS MODAL OTHERS ALERT ERROR
        if (homespassedupdateresponse == 'Successful' && footagesupdateresponse == 'Successful' && cellupdateresponse == 'Successful') {
            $("#addcellSuccess .modal-body p").text("Cell Successfully Updated") //CHANGE THE TEXT OF THE MODAL
            $("#addcellSuccess").modal('show'); // Set a timeout to hide the element again
            setTimeout(function () {
                $("#addcellSuccess").modal('hide'); //HIDE THE SUCCESS MODAL
            }, 4000);
            $("#cellmodal").modal('hide'); //HIDE THE ADD CELL MODAL 
        } else {
            alert("Error Updating Cell Please Check All Columns")
        }
    });
    // END UPDATE CELL FOOTAGES AND HOMES PASSED

    //====================================ADD NEW CELL, FOOTAGES AND HOMES PASSED==========================================================
    async function addCell() {
        try {
            const response = await axios.post("http://localhost:8011/insert_cell/v1/ftth.cells", {
                netwin_cell_jso_name: $("#netwin_cell_jso_name_add").val(),
                pni_cell_name: $("#pni_cell_name_add").val(),
                cell_state: $("#cell_state_add").val(),
                cell_hub: $("#cell_hub_add").val(),
                cell_ring: $("#cell_ring_add").val(),
                rolt_id: $("#rolt_id_add").val(),
                cell: $("#cell_add").val(),
                netwin_project_name: $("#netwin_project_name_add").val(),
                feeder: $("#feeder_add").val(),
                permitting_rolt_number: $("#permitting_rolt_number_add").val(),
                town: $("#town_add").val(),
                franchise: $("#franchise_add").val(),
                region: $("#region_add").val(),
                map_number: $("#map_number_add").val(),
                nodes_within_cell: $("#nodes_within_cell_add").val(),
                cell_rfs_date: $("#cell_rfs_date_add").val(),
                homes_serviceable: $("#homes_serviceable_add").val(),
                remaining_homes_unserviceable: $("#remaining_homes_unserviceable_add").val(),
                jso_street_location: $("#jso_street_location_add").val(),
                jso_pole_number: $("#jso_pole_number_add").val(),
                jso_latitude: $("#jso_latitude_add").val(),
                jso_longitude: $("#jso_longitude_add").val(),
                cell_build_year: $("#cell_build_year_add").val(),
                market_year: $("#market_year_add").val(),
                jso_type: $("#jso_type_add").val(),
                cell_dc: $("#cell_dc_add").val(),
                dc_to_location: $("#dc_to_location_add").val(),
                dc_from_location: $("#dc_from_location_add").val(),
                cell_local_design_priority: $("#cell_local_design_priority_add").val(),
                cell_revision_comment: $("#cell_revision_comment_add").val(),
                cell_homes_pocketed: $("#cell_homes_pocketed_add").val(),
                cell_status: $("#cell_status_add").val(),
                number_of_pdos: $("#number_of_pdos_add").val(),
            });
            if (response.data == "Successful") {
                console.log("Inserted into Cells Table")

            } else {
                //alert(response.data)
                return
            }
        } catch (error) {
            console.log(error)
        }
    }
    //INSERT FOOTAGES TABLE
    async function insertFootagesTable() {
        try {
            const response = await axios.post("http://localhost:8011/insert_footages/v1/ftth.footages", {
                pni_cell_name: $("#pni_cell_name_add").val(),
                netwin_cell_jso_name: $("#netwin_cell_jso_name_add").val(),
                building_attachment: $("#building_attachment_footage_add").val(),
                cable_bearing_strand: $("#cable_bearing_strand_footage_add").val(),
                mdu: $("#mdu_footage_add").val(),
                slack: $("#slack_footage_add").val(),
                ug: $("#ug_footage_add").val(),
                total: $("#total_footage_add").val()
            });
            if (response.data == "Successful") {
                console.log("Inserted into Footages Table")

            } else {
                // return
                // alert(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
    //INSERT HOMES PASSED TABLE

    async function insertHomesPassedTable() {
        try {
            const response = await axios.post("http://localhost:8011/insert_homes_passed/v1/ftth.homes_passed", { //THIS USES THE SAME ROUTE AS THE INSERTFROMEDIT ONE JUST WITH THE ID ITS GRABBING CHANGED FROM _edit TO _add
                pni_cell_name: $("#pni_cell_name_add").val(),
                netwin_cell_jso_name: $("#netwin_cell_jso_name_add").val(),
                aerial: $("#aerial_homes_passed_add").val(),
                ba: $("#ba_homes_passed_add").val(),
                commercial: $("#commercial_homes_passed_add").val(),
                commercial_ug: $("#commercial_ug_homes_passed_add").val(),
                mdu: $("#mdu_homes_passed_add").val(),
                planned: $("#planned_homes_passed_add").val(),
                ug: $("#UG_homes_passed_add").val(),
                total: $("#total_homes_passed_add").val()
            });
            if (response.data == "Successful") {
                console.log("Inserted into Homes Passed Table")
                $("#addcellSuccess .modal-body p").text("Cell Successfully Inserted") //CHANGE THE TEXT OF THE MODAL 
                $("#addcellSuccess").modal('show'); // Set a timeout to hide the element again
                setTimeout(function () {
                    $("#addcellSuccess").modal('hide'); //HIDE THE SUCCESS MODAL
                }, 4000);
                $("#addcellmodal").modal('hide'); //HIDE THE ADD CELL MODAL 

            } else {
                alert(response.data)
            }
        } catch (error) {
            alert('Homespassed insert: ')
        }
    }
    // WHEN THE ADD CELL BUTTON IS CLICKED RUN EACH FUNCTION TO ADD THE CELL AND THEN THE FOOTAGES AND THEN THE HOMES PASSED
    $("#addcellbtn").on('click', async function () {
        await addCell();
        await insertFootagesTable();
        await insertHomesPassedTable();
        //MAY HAVE TO REFACTOR CAUSE NOT THE BEST WAY. BUT CHECK THE RESPONSE OF EACH POST REQUEST AND IF THEY ARE ALL SUCCESSFUL THEN SHOW THE SUCCESS MODAL OTHERS ALERT ERROR
        if (homespassedinsertresponse == 'Successful' && footagesinsertresponse == 'Successful' && cellinsertresponse == 'Successful') {

        } else {
            alert('cellinsertresponse error: ', cellinsertresponse)
        }
    });

    // ===========================================END ADD A NEW CELL FOOTAGE AND HOMES PASSED=================================================

    // ==================================================CONSTRUCTION TRACKER STUFF===========================================================
    var construction_tracker_table;
    async function getConstuctionTrackerFunction(cell, rolt) {
        var response;
        try {
            rolt = $("#construction_rolt").val();
            //HAVE TO SEE WHICH WAY TO SEARCH BY ROLT OR THE CURRENT CELL SO CHECK THE STATUS OF THE BUTTON CLICK
            if (roltbuttonclicked == true && rolt.length > 1) {
                response = await axios.get("http://localhost:8011/query/v1/ftth.construction_cell_tracker?columns=*&filter=permitting_rolt_number%20ilike%20'" + rolt + "'&limit=500");
            } else {
                response = await axios.get("http://localhost:8011/query/v1/ftth.construction_cell_tracker?columns=*&filter=pni_cell_name%20ilike%20'" + cell + "'&limit=500");
            }
            console.log('Construction Tracker table data: ', response.data)
            dataArr = response.data;
            construction_tracker_table = $("#construction_tracker_table").DataTable({
                data: dataArr,
                destroy: true,
                select: true,
                dataSrc: "",
                idSrc: 'id',
                bLengthChange: false,
                scrollX: true,
                scrollY: "60vh",
                // paging: false

                // autoWidth:true,
                columns: [{
                    data: "pni_cell_name",
                    name: "PNI Cell Name"
                },
                {
                    data: "jso_location",
                    name: "JSO Location"
                },
                {
                    data: "start_device",
                    name: "Start Device"
                },
                {
                    data: "end_device",
                    name: "End Device"
                },
                {
                    data: "fiber_count",
                    name: "Fiber Count"
                },
                {
                    data: "homes_passed",
                    name: "Homes Passed"
                },
                {
                    data: "cbs",
                    name: "CBS"
                },
                {
                    data: "ug",
                    name: "UG"
                },
                {
                    data: "mdu",
                    name: "MDU"
                },
                {
                    data: "route",
                    name: "Route"
                },
                {
                    data: "start_footage",
                    name: "Start Footage"
                },
                {
                    data: "end_footage",
                    name: "End Footage"
                },
                {
                    data: "total_placed",
                    name: "Total Placed"
                },
                {
                    data: "placed",
                    name: "Placed"
                },
                {
                    data: "total_pdo",
                    name: "Total PDO"
                },
                {
                    data: "pdo_spliced",
                    name: "PDO Spliced"
                },
                {
                    data: "date_issued",
                    name: "Date Issued"
                },
                {
                    data: "cabled_complete",
                    name: "Cabled Complete"
                },
                {
                    data: "pdo_complete",
                    name: "PDO Complete"
                },
                {
                    data: "jso_spliced",
                    name: "JSO Spliced"
                },
                {
                    data: "pdo_jso_complete",
                    name: "PDO JSO Complete"
                },
                {
                    data: "feeder_spliced",
                    name: "Feeder Spliced"
                },
                {
                    data: "pdo_jso_feeder_complete",
                    name: "PDO JSO Feeder Complete"
                },
                {
                    data: "feeder_to_odf_rolt_spliced",
                    name: "Feeder to ODF Rolt Spliced"
                },
                {
                    data: "backhaul_spliced",
                    name: "Backhaul Spliced"
                },
                {
                    data: "pdo_to_odf",
                    name: "PDO to ODF"
                },
                {
                    data: "tested",
                    name: "Tested"
                },
                {
                    data: "permitting_rolt_number",
                    name: "Permitting Rolt Number"
                }
                ],
                // order: [
                //     [2, "desc"]
                // ]
            });
        } catch (error) {
            console.log(error)
        }
        // CONSTRUCTION TRACKER EDITOR
        var editor = new $.fn.dataTable.Editor({
            ajax: {
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                create: {
                    type: 'POST',
                    url: "http://localhost:8011/insert_construction_tracker/v1/ftth.construction_cell_tracker",
                    data: function (d) { //BREAK OUT FROM THE WHAT THE NATIVE DATABASE EDITOR WAS SEND AS THE KEY VALUE IN THE ACTUAL FIELD NAME. HAD 'DATA[0]' ATTACHED
                        var obj;
                        for (var key in d.data) {
                            obj = d.data[key];
                            break;
                        }
                        return obj;
                    },
                    error: function (xhr, error, thrown) {
                        alert(xhr.responseJSON.message)
                    }
                },
                edit: {
                    type: 'POST',
                    url: "http://localhost:8011/update_construction_tracker/v1/ftth.construction_cell_tracker?id=_id_",
                    data: function (d) { //BREAK OUT FROM THE WHAT THE NATIVE DATABASE EDITOR WAS SEND AS THE KEY VALUE IN THE ACTUAL FIELD NAME. HAD 'DATA[0]' ATTACHED
                        var obj;
                        for (var key in d.data) {
                            obj = d.data[key];
                            break;
                        }
                        return obj;
                    },
                    error: function (xhr, error, thrown) {
                        alert(xhr.responseJSON.message)
                    }
                }, //STILL DONT UNDERSTAND HOW ITS GRABING THE id FIELD AS _id_ AT END OF URL
                remove: {
                    type: 'POST',
                    url: "http://localhost:8011/delete_construction_tracker/v1/ftth.construction_cell_tracker?id=_id_"
                }
            },
            table: '#construction_tracker_table',
            idSrc: 'id',
            fields: [{
                name: "pni_cell_name",
                label: "PNI Cell Name",
                id: "pni_cell_name_editor",
                // type: "autoComplete", CANT FIGURE OUT

            }, {
                name: "jso_location",
                label: "JSO Location",

            }, {
                name: "start_device",
                label: "Start Device"
            }, {
                name: "end_device",
                label: "End Device"
            }, {
                name: "fiber_count",
                label: "Fiber Count"
            }, {
                name: "homes_passed",
                label: "Homes Passed"
            }, {
                name: "cbs",
                label: "CBS"
            }, {
                name: "ug",
                label: "UG"
            }, {
                name: "mdu",
                label: "MDU"
            }, {
                name: "route",
                label: "Route"
            }, {
                name: "start_footage",
                label: "Start Footage"
            }, {
                name: "end_footage",
                label: "End Footage"
            }, {
                name: "total_placed",
                label: "Total Placed"
            }, {
                name: "placed",
                label: "Placed"
            }, {
                name: "total_pdo",
                label: "Total PDO"
            }, {
                name: "pdo_spliced",
                label: "PDO Spliced"
            }, {
                name: "date_issued",
                label: "Date Issued",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'M/DD/YYYY',
            }, {
                name: "cabled_complete",
                label: "Cabled Complete",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'M/DD/YYYY',
            }, {
                name: "pdo_complete",
                label: "PDO Complete",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'M/DD/YYYY',
            }, {
                name: "jso_spliced",
                label: "JSO Spliced",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'M/DD/YYYY',
            }, {
                name: "pdo_jso_complete",
                label: "PDO JSO Complete",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'M/DD/YYYY',
            }, {
                name: "feeder_spliced",
                label: "Feeder Spliced"
            }, {
                name: "pdo_jso_feeder_complete",
                label: "PDO JSO Feeder Complete"
            }, {
                name: "feeder_to_odf_rolt_spliced",
                label: "Feeder to ODF Rolt Spliced"
            }, {
                name: "backhaul_spliced",
                label: "Backhaul Spliced"
            }, {
                name: "pdo_to_odf",
                label: "PDO To ODF"
            }, {
                name: "tested",
                label: "Tested"
            }, {
                name: "permitting_rolt_number",
                label: "Permitting Rolt Number"
            }]
        });

        new $.fn.dataTable.Buttons(construction_tracker_table, [{
            extend: "create",
            text: "<i class='fa fa-plus text-success'></i> Add Function",
            editor: editor
        },
        {
            extend: "edit",
            text: "<i class='fa fa-pencil-square-o'></i> Edit Function",
            editor: editor
        },
        {
            extend: "remove",
            text: "<i class='fa fa-trash-o '></i> Delete Function",
            editor: editor
        }, {
            extend: 'csvHtml5',
            text: 'Export CSV',
            title: 'Construction_Tracker_Export'
        }
        ]);
        //WHEN CREATING A NEW CONSTRUCTION TRACKER FUNCTION DEPENDING ON WHICH WAY THEY SEARCHED EITHER BY cell OR rolt THEN UPDATE THE FUNCTION AND REFRESH THE TABLE BY cell OR rolt
        editor.on('create', function (e, o, action) {
            if (roltbuttonclicked === true) {
                var permitting_rolt_number = $("#construction_rolt").val().toUpperCase();
                getConstuctionTrackerFunction(permitting_rolt_number)
            } else {
                var cell = $("#cellsearch").val().toUpperCase();
                console.log("Function Added So Refreshing The Cell Function Table")
                getConstuctionTrackerFunction(cell)
            }

        });
        //IF THE USER IS ADMIN THEN ADD THE EDIT BUTTONS
        if (user_role.text() == 'admin') {
            console.log('Construction Tracker Editing Buttons Enabled')
            construction_tracker_table.buttons().container()
                .appendTo($('.col-md-6:eq(0)', construction_tracker_table.table().container()));
            // functiondatatable.buttons().disable()
        } else {
            console.log('User Can NOT Edit')
        }

        //THESE ENABLE THE EDITOR POPUP TO BE ASSIGNED A CLASS SO THAT I CAN MAKE THE MODAL WIDER
        editor.on('open', function (e, mode, action) {
            $('.modal-dialog').addClass('DTED_Stacked');
            //Autocomplete FOR CONSTRUCTION TABLE SO THAT IT NEEDS TO ALREADY BE IN THE DATABASE
            $("#pni_cell_name_editor").autocomplete({
                minLength: 2,
                autoFocus: true,
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
                            if (value.toUpperCase().substring(0, 2) == term.toUpperCase().substring(0, 2)) { // make them both uppercase to match.
                                return value // return only the matching values into the desiredcellnames
                            }
                        })
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
                    // getData(data.item.value); // Run the getData function with the parameters of the selected value in the autocomplete
                    // getfunctiontable(data.item.value); // Run the getfunctiontable for the associated selected value.
                    // getHomesPassed(data.item.value);
                    // getFootages(data.item.value);
                }
            });
            if (action == 'edit') {
                editor.show(); //Shows all fields
                editor.disable('pni_cell_name');
                editor.disable('jso_location');
            }
        });
        //REMOVES THAT CLASS WHEN IT CLOSES.
        editor.on('close', function (e, mode, action) {
            $('.modal-dialog').removeClass('DTED_Stacked');
            editor.fields().map(function (field) {
                editor.enable(field);
            })
        });



    } // end contruction tracker data function
    //ONLY DISPLAY THE CURRENT CELL FOR THE CONSTRUCTION TRACKER
    $("#current_cell_construction_btn").on('click', function (e) {
        roltbuttonclicked = false;
        if (!responsedata) {
            alert("Please Search for A Cell")
            e.stopPropagation();
            return
        }
        var cell = $("#cellsearch").val();
        $("#construction_tracker_modal").modal('show')
        getConstuctionTrackerFunction(cell)
        $("#construction_tracker_modalLabel").html("Construction Tracker " + "<b>" + cell.toUpperCase() + "</b>")
        //NEED TO FIGURE OUT ANOTHER WAY TO MAKE THE COLUMNS LINE UP.
        setTimeout(function () {
            construction_tracker_table.columns.adjust()
        }, 1000)

    });
    // FUNCTION TO GET ALL THE CONSTRUCTION TRACKER BY ROLT
    var roltbuttonclicked;
    $("#rolt_construction_btn").on('click', function (e) {
        var construction_rolt = $("#construction_rolt").val();
        if (!construction_rolt) {
            alert("Please Search for A Rolt")
            e.stopPropagation();
            return
        }
        roltbuttonclicked = true;
        $("#construction_tracker_modal").modal('show')
        getConstuctionTrackerFunction(construction_rolt)
        //NEED TO FIGURE OUT ANOTHER WAY TO MAKE THE COLUMNS LINE UP.
        $("#construction_tracker_modalLabel").html("Construction Tracker " + "<b>" + construction_rolt.toUpperCase() + "</b>")
        setTimeout(function () {
            construction_tracker_table.columns.adjust()
        }, 1000)

    });
});