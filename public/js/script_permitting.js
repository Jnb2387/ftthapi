$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip(); // initialize the tooltip features
    var responsedata;
    //Autocomplete for the Search Rolt
    $("#permitting_rolt_search").autocomplete({
        minLength: 6,
        autoFocus: true,
        source: function (request, response) {
            current_hub = $("#exisiting_hub_search").val();
            var term = request.term; // The term being typed in the input
            let roltnames = []; // To hold all the response names
            let hubnames = [];
            $.getJSON("http://localhost:8011/query/v1/ftth.permitting?columns=permitting_rolt_number,current_hub&filter=permitting_rolt_number%20ilike%20'" + term + "%25'&limit=20", function (data, status, xhr) {
                data.map(function (rolt, hub) { // loop through the array from the getJSON request
                    roltnames.push(rolt.permitting_rolt_number); // add the name of the pni_cell_name to the cellname Array created above.
                    hubnames.push(hub.current_hub); // add the name of the pni_cell_name to the cellname Array created above.
                });
                console.log('Data From autocomplete: ', data)
                response(roltnames, hubnames); // send the array of names.
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
            getRoltData(data.item.value); // Run the getData function with the parameters of the selected value in the autocomplete
            getPermittingFunction(data.item.value);
        }
    });

    //WHEN THE PAGE IS SCROLLED THE USER WONT SEE WHAT CELL THEY SEARCHED FOR SO ADD IT TO THE NAVBAR
    $(window).scroll(function () {
        if ($(".navbar").hasClass("top-nav-collapse")) {
            var cell = $("#permitting_rolt_search").val();
            $("#nav_cell_name").html(cell);
        } else {
            $("#nav_cell_name").empty()
        }
    });

    async function getRoltData(rolt) {
        try { //"http://localhost:8011/query/v1/ftth.permitting?columns=*&filter=%20permitting_rolt_number%20ilike'" + rolt + "%25'%20AND%20current_hub%20ilike'" + hub + "%25'&limit=10"
            const response = await axios.get("http://localhost:8011/query/v1/ftth.permitting?columns=*&filter=%20permitting_rolt_number%20ilike'" + rolt + "%25'&limit=10");
            responsedata = response.data[0];
            Object.keys(responsedata).forEach(function (key) { //REPLACE ANY NULL VALUES WITH JUST A DASH
                if (responsedata[key] === null || responsedata[key] === "") {
                    responsedata[key] = '-';
                }
            });
            console.log("Permitting table Data: ", responsedata);

            $("#final_pictures").html(responsedata.pictures)
            $("#final_road_type").html(responsedata.road_type)
            $("#final_permitting_agency").html(responsedata.permitting_agency)
            $("#final_riser_pole").html(responsedata.riser_pole)
            $("#final_lat_long").html(responsedata.lat_long)
            $("#final_utility_strip_width").html(responsedata.utility_strip_width) // MISPELLING IN THE DATABASE CSV
            $("#final_cross_street").html(responsedata.cross_street)
            $("#final_street").html(responsedata.street)
            $("#final_hamlet").html(responsedata.hamlett) //MISPELLING IN THE DATABASE CSV
            $("#final_franchise").html(responsedata.franchise_town)
            $("#second_pictures").html(responsedata.second_pictures)
            $("#second_road_type").html(responsedata.second_road_type)
            $("#second_permitting_agency").html(responsedata.second_permitting_agency)
            $("#second_riser_pole").html(responsedata.second_riser_pole)
            $("#second_lat_long").html(responsedata.second_lat_long)
            $("#second_utility_strip_width").html(responsedata.second_utility_strip_width)
            $("#second_cross_street").html(responsedata.second_cross_street)
            $("#second_street").html(responsedata.second_street)
            $("#second_hamlet").html(responsedata.second_hamlet);
            $("#second_franchise_town").html(responsedata.second_franchise_town);
            $("#first_pictures").html(responsedata.first_pictures)
            $("#first_road_type").html(responsedata.first_road_type)
            $("#first_permitting_agency").html(responsedata.first_permitting_agency)
            $("#first_riser_pole").html(responsedata.first_riser_pole)
            $("#first_lat_long").html(responsedata.first_lat_long)
            $("#first_utlity_strip_width").html(responsedata.first_utlity_strip_width)
            $("#first_cross_street").html(responsedata.first_cross_street)
            $("#first_street").html(responsedata.first_street)
            $("#first_hamlet").html(responsedata.first_hamlet);
            $("#first_franchise_town").html(responsedata.first_franchise_town);
            //TOP JUMBOTRON PART
            $("#cabinet_type").val(responsedata.cabinet_type);
            $("#rolt_status").val(responsedata.rolt_status);
            $("#current_hub_search").val(responsedata.current_hub);
            $("#future_hub_search").val(responsedata.future_hub);
            $("#netwin_rolt_search").val(responsedata.netwin_rolt_name);
            $("#block_yes_no").val(responsedata.blocked_y_n_);
            $("#blocked_by").val(responsedata.blocked_by);
            $("#blocker_owner").val(responsedata.blocker_owner);
            $("#eta_blocker_resolution").val(responsedata.eta_blocker_resolution);
            $("#blocker_description").val(responsedata.blocker_description);
            $("#permitting_rolt_number").val(responsedata.permitting_rolt_number);
            $("#ga_outreach_completed").val(responsedata.ga_outreach_completed);
            $("#municipality_climate").val(responsedata.municipality_climate);
            $("#original_build_yr").val(responsedata.original_build_yr);
            $("#actual_build_yr").val(responsedata.actual_build_yr);
            $("#id").val(responsedata.id);
            // THIS IS ONLY TO UPDATE THE MD-FORM BECAUSE THOSE INPUTS DONT MOVE THE LABEL UP WITH PROGRAMMATICALLY FILLING THE INPUT
            $('input[type=text]').each(function (element, i) {
                if ((element.value !== undefined && element.value.length > 0) || $(this).attr('placeholder') !== null) {
                    $(this).siblings('label').addClass('active');
                } else {
                    $(this).siblings('label').removeClass('active');
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    $("#permitting_search").on("click", function (e) {
        let rolt = $("#permitting_rolt_search").val();
        // let hub = $("#exisiting_hub_search").val();
        if (!rolt) {
            alert("Please Enter a Permitting Rolt");
            e.stopPropagation();
            return;
        }
        getRoltData(rolt);
        getPermittingFunction(rolt)
    });
    //ADD NEW PERMITTING
    $("#addpermittingbtn").on('click', function () {
        let permitting_rolt_number = $("#permitting_rolt_add_rolt").val()
        let rolt_status = $("#rolt_status_add_rolt").val()
        let cabinet_type = $("#cabinet_type_add_rolt").val()
        let netwin_rolt_name = $("#netwin_rolt_name_add_rolt").val()
        let current_hub = $("#current_hub_add_rolt").val()
        let future_hub = $("#future_hub_add_rolt").val()
        let approved_final_location = $("#approved_final_add_rolt").val()
        let permit_ = $("#permit_add_rolt").val()
        let blocked_y_n_ = $("#blocked_y_n_add_rolt").val()
        let blocked_by = $("#blocked_by_add_rolt").val()
        let blocker_owner = $("#blocker_owner_add_rolt").val()
        let eta_blocker_resolution = $("#eta_blocker_resolution_add_rolt").val()
        let blocker_description = $("#blocker_description_add_rolt").val()
        let first_franchise_town = $("#first_franchise_town_add_rolt").val()
        let first_hamlet = $("#first_hamlet_add_rolt").val()
        let first_street = $("#first_street_add_rolt").val()
        let first_cross_street = $("#first_utility_strip_width_add_rolt").val()
        let first_utlity_strip_width = $("#first_utility_strip_width_add_rolt").val()
        let first_lat_long = $("#first_lat_long_add_rolt").val()
        let first_riser_pole = $("#first_riser_pole_add_rolt").val()
        let first_permitting_agency = $("#first_permitting_agency_add_rolt").val()
        let first_road_type = $("#first_road_type_add_rolt").val()
        let first_pictures = $("#first_pictures_add_rolt").val()
        let second_franchise_town = $("#second_franchise_town_add_rolt").val()
        let second_hamlet = $("#second_hamlet_add_rolt").val()
        let second_street = $("#second_street_add_rolt").val()
        let second_cross_street = $("#second_cross_street_add_rolt").val()
        let second_utility_strip_width = $("#second_utility_strip_width_add_rolt").val()
        let second_lat_long = $("#second_lat_long_add_rolt").val()
        let second_riser_pole = $("#second_riser_pole_add_rolt").val()
        let second_permitting_agency = $("#second_permitting_agency_add_rolt").val()
        let second_road_type = $("#second_road_type_add_rolt").val()
        let second_pictures = $("#second_pictures_add_rolt").val()
        let franchise_town = $("#final_franchise_town_add_rolt").val()
        let hamlett = $("#final_hamlet_add_rolt").val()
        let street = $("#final_street_add_rolt").val()
        let cross_street = $("#final_cross_street_add_rolt").val()
        let utility_strip_width = $("#final_utility_strip_width_add_rolt").val()
        let lat_long = $("#final_lat_long_add_rolt").val()
        let riser_pole = $("#final_riser_pole_add_rolt").val()
        let permitting_agency = $("#final_permitting_agency_add_rolt").val()
        let road_type = $("#final_road_type_add_rolt").val()
        let pictures = $("#final_pictures_add_rolt").val()
        async function addPermitting() {
            try {
                const response = await axios.post("http://localhost:8011/insert_permitting/v1/ftth.permitting", {
                    permitting_rolt_number: permitting_rolt_number,
                    rolt_status: rolt_status,
                    cabinet_type: cabinet_type,
                    netwin_rolt_name: netwin_rolt_name,
                    current_hub: current_hub,
                    future_hub: future_hub,
                    approved_final_location: approved_final_location,
                    permit_: permit_,
                    blocked_y_n_: blocked_y_n_,
                    blocked_by: blocked_by,
                    blocker_owner: blocker_owner,
                    eta_blocker_resolution: eta_blocker_resolution,
                    blocker_description: blocker_description,
                    future_hub: future_hub,
                    first_franchise_town: first_franchise_town,
                    first_hamlet: first_hamlet,
                    first_street: first_street,
                    first_cross_street: first_cross_street,
                    first_utlity_strip_width: first_utlity_strip_width,
                    first_lat_long: first_lat_long,
                    first_riser_pole: first_riser_pole,
                    first_permitting_agency: first_permitting_agency,
                    first_road_type: first_road_type,
                    first_pictures: first_pictures,
                    second_franchise_town: second_franchise_town,
                    second_hamlet: second_hamlet,
                    second_street: second_street,
                    second_cross_street: second_cross_street,
                    second_utility_strip_width: second_utility_strip_width,
                    second_lat_long: second_lat_long,
                    second_riser_pole: second_riser_pole,
                    second_permitting_agency: second_permitting_agency,
                    second_road_type: second_road_type,
                    second_pictures: second_pictures,
                    franchise_town: franchise_town,
                    hamlett: hamlett,
                    street: street,
                    cross_street: cross_street,
                    utility_strip_width: utility_strip_width,
                    lat_long: lat_long,
                    riser_pole: riser_pole,
                    permitting_agency: permitting_agency,
                    road_type: road_type,
                    pictures: pictures,
                });
                if (response.data == "Permitting Successfully Inserted.") {
                    console.log('yuppp')
                    $("#addpermittingSuccess").modal('show'); // Set a timeout to hide the element again
                    setTimeout(function () {
                        $("#addpermittingSuccess").modal('hide');
                    }, 4000);
                    $("#addpermittingmodal").modal('hide');
                } else {
                    alert(response.data)
                }
            } catch (error) {
                // console.log(response.data)
                alert('Error from adding Permitting ', error)
            }
        }
        addPermitting();
    });

    var editor;
    //FUNCTION TABLE
    async function getPermittingFunction(rolt) {
        try {
            const response = await axios.get("http://localhost:8011/query/v1/ftth.permitting_functions?columns=*&filter=%20permitting_rolt_number%20ilike'" + rolt + "%25'&limit=500");
            console.log('Permitting Function table data: ', response.data)
            dataArr = response.data;
            var permittingfunctiondatatable = await $("#permittingfunctiontable").DataTable({
                data: dataArr,
                destroy: true,
                select: true,
                dataSrc: "",
                idSrc: 'id',
                bLengthChange: false,

                columns: [
                    // {
                    //     data: "permitting_rolt_number"
                    // }, {
                    //     data: "current_hub"
                    // },
                    {
                        data: "design_function",
                        name: "design_function",
                        width: "30%"
                    },
                    {
                        data: "resource",
                        name: "resource"
                    },
                    {
                        data: "date_complete",
                        name: "date_complete"
                    }, {
                        data: "comment",
                        name: "comment",
                        width: "40%"
                    }
                ],
                order: [
                    [2, "asc"]
                ]
            });
        } catch (error) {
            console.log(error)
        }
        editor = await new $.fn.dataTable.Editor({
            ajax: {
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                create: {
                    type: 'POST',
                    url: "http://localhost:8011/insert_permitting_functions/v1/ftth.permitting_functions?permitting_rolt_number=" + responsedata.permitting_rolt_number + "&current_hub=" + responsedata.current_hub,
                    data: function (d) {
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
                    url: "http://localhost:8011/update_permitting_functions/v1/ftth.permitting_functions?permitting_rolt_number=" + responsedata.permitting_rolt_number + "&current_hub=" + responsedata.current_hub + "&id=_id_",
                    data: function (d) {
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
                    url: "http://localhost:8011/delete_permitting_functions/v1/ftth.permitting_functions?id=_id_"
                },
            },
            table: '#permittingfunctiontable',
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
                    label: "ROLT MAP RECEIVED",
                    value: "ROLT MAP RECEIVED"
                },
                {
                    label: "ROLT MAP ISSUED TO FIELD",
                    value: "ROLT MAP ISSUED TO FIELD"
                },
                {
                    label: "ROLT RETURNED TO DESIGN",
                    value: "ROLT RETURNED TO DESIGN"
                },
                {
                    label: "FINAL LOCATION APPROVED",
                    value: "FINAL LOCATION APPROVED"
                },
                {
                    label: "SCHEDULED CONSTRUCTION MONTH",
                    value: "SCHEDULED CONSTRUCTION MONTH"
                },
                {
                    label: "NYC-DOITT SUBMISSION",
                    value: "NYC-DOITT SUBMISSION"
                },
                {
                    label: "NYC-DOITT APPROVED",
                    value: "NYC-DOITT APPROVED"
                },
                {
                    label: "GA ASSISTANCE",
                    value: "GA ASSISTANCE"
                },
                {
                    label: "GA RESOLVED - RETURNED FOR PERMITTING",
                    value: "GA RESOLVED - RETURNED FOR PERMITTING"
                },
                {
                    label: "MUNICIPAL PERMIT APPLIED",
                    value: "MUNICIPAL PERMIT APPLIED"
                },
                {
                    label: "MUNICIPAL PERMIT SUBMITTED FOR FEE PAYMENT",
                    value: "MUNICIPAL PERMIT SUBMITTED FOR FEE PAYMENT"
                },
                {
                    label: "MUNICIPAL PERMIT FEE PAYMENT RECIEVED",
                    value: "MUNICIPAL PERMIT FEE PAYMENT RECIEVED"
                },
                {
                    label: "BUILDING PERMIT APPLICATION",
                    value: "BUILDING PERMIT APPLICATION"
                },
                {
                    label: "BUILDING PERMIT FEE SUBMITTED",
                    value: "BUILDING PERMIT FEE SUBMITTED"
                },
                {
                    label: "BUILDING PERMIT FEE RECIEVED",
                    value: "BUILDING PERMIT FEE RECIEVED"
                },
                {
                    label: "MUNICIPAL PERMIT RECIEVED",
                    value: "MUNICIPAL PERMIT RECIEVED"
                },
                {
                    label: "MUNICIPAL PERMIT EXPIRATION DATE",
                    value: "MUNICIPAL PERMIT EXPIRATION DATE"
                },
                {
                    label: "UTILITY APPLICATION APPLIED",
                    value: "UTILITY APPLICATION APPLIED"
                },
                {
                    label: "UTILITY APPLICATION RECIEVED",
                    value: "UTILITY APPLICATION RECIEVED"
                },
                {
                    label: "AUSA ISSUED TO ATS FOR PLACEMENT",
                    value: "AUSA ISSUED TO ATS FOR PLACEMENT"
                },
                {
                    label: "PAD PLACEMENT COMPLETE",
                    value: "PAD PLACEMENT COMPLETE"
                },
                {
                    label: "CABINET PLACEMENT COMPLETE",
                    value: "CABINET PLACEMENT COMPLETE"
                },
                {
                    label: "FIBER TERMINATION COMPLETE",
                    value: "FIBER TERMINATION COMPLETE"
                },
                {
                    label: "POWER TO CABINET COMPLETE",
                    value: "POWER TO CABINET COMPLETE"
                },
                {
                    label: "AUSA PHYSICAL CABINET QC",
                    value: "AUSA PHYSICAL CABINET QC"
                },
                {
                    label: "AUSA QC TEST CABINET TO HUB",
                    value: "AUSA QC TEST CABINET TO HUB"
                },
                {
                    label: "DESIGN MAP RECIEVED",
                    value: "DESIGN MAP RECIEVED"
                },
                {
                    label: "RELEASED TO ISP",
                    value: "RELEASED TO ISP"
                },
                {
                    label: "BOM DEVELOPED",
                    value: "BOM DEVELOPED"
                },
                {
                    label: "MARS REQUEST SUBMITTED",
                    value: "MARS REQUEST SUBMITTED"
                },
                {
                    label: "MARS PICK-UP READY",
                    value: "MARS PICK-UP READY"
                },
                {
                    label: "CONTRACTOR PICKED-UP",
                    value: "CONTRACTOR PICKED-UP"
                },
                {
                    label: "DESIGN DATA READY",
                    value: "DESIGN DATA READY"
                },
                {
                    label: "TRANSPORT DATA READY",
                    value: "TRANSPORT DATA READY"
                },
                {
                    label: "IPNT DATA READY",
                    value: "IPNT DATA READY"
                },
                {
                    label: "NOC DATA READY",
                    value: "NOC DATA READY"
                },
                {
                    label: "INSTALLATION COMPLETED",
                    value: "INSTALLATION COMPLETED"
                },
                {
                    label: "DOCUMENTATION COMPLETED",
                    value: "DOCUMENTATION COMPLETED"
                },
                {
                    label: "NETWIN UPDATE COMPLETED",
                    value: "NETWIN UPDATE COMPLETED"
                }
                ],
                attr: {
                    required: true
                }
            }, {
                name: "resource",
                label: "Resource"
            }, {
                name: "date_complete",
                label: "Date Complete",
                type: 'datetime',
                def: function () {
                    return new Date();
                },
                format: 'MM/DD/YYYY',
            }, {
                name: "comment",
                label: "Comment"
            }]
        });

        // IF THEY DIDNT CHANGE THE design_function field THEN DONT SUBMIT
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
            var rolt = $("#permitting_rolt_search").val().toUpperCase();
            getPermittingFunction(rolt)
        });
        //ADD THE BUTTONS TO EDIT
        new $.fn.dataTable.Buttons(permittingfunctiondatatable, [{
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
        },
        {
            extend: 'csvHtml5',
            text: 'Export CSV',
            title: responsedata.permitting_rolt_number + '_Permitting_Functions_Export'
        }
        ]);

        permittingfunctiondatatable.buttons().container()
            .appendTo($('.col-md-6:eq(0)', permittingfunctiondatatable.table().container()));

    }
    //WHEN THE DATA EXTRACT BUTTON IS CLICKED DOWNLOAD THEPERMITTING DATA AS CSV
    $("#permittingdataextractbtn").on("click", function (e) {
        // DONT RUN FUNCTION IF THERE IS NO CELL SEARCHED
        // if (!responsedata) {
        //     alert("Please Search for A Rolt");
        //     e.stopPropagation();
        //     return;
        // }
        extractAllPermittingData();
    });
    async function extractAllPermittingData() {
        try {
            const response = await axios.get("http://localhost:8011/csv/v1/ftth.permitting?columns=*&join=ftth.permitting_functions_crosstab%3Bftth.permitting.permitting_rolt_number%3Dftth.permitting_functions_crosstab.permitting_rolt_number_function&limit=5000");
            var permittingdata = response.data; //JUST THE PROPERTIES OF THE DATA
            var link = document.createElement("a");
            link.href = 'data:text/csv;charset=utf-8,' + encodeURI(permittingdata);
            link.setAttribute("download", "Permitting_Extract.csv"); //NAME OF THE CSV
            document.body.appendChild(link);
            link.click(); // This will download the data file 
        } catch (error) {
            console.log(error)
        }
    }
    // EACH SAVE AND EDIT BUTTON FOR THE LOCATIONS ARE RAN INDIVIDUALLY
    $('#first_location').on('click', '.locationeditbtnspan', first_loction_edit_function);
    $('#second_location').on('click', '.locationeditbtnspan', second_loction_edit_function);
    $('#final_location').on('click', '.locationeditbtnspan', final_loction_edit_function);


    //EDITING THE First LOCATION
    function first_loction_edit_function(e) {
        if (!responsedata) {
            alert("Please Search for A Cell")
            // e.stopPropagation(); // if there is no responsedata then dont open the modal
            e.stopPropagation();
            return
        }
        $(this).siblings().each( // grab all the li elements from the first_location list
            function () {
                var inp = $(this).find('input'); //search for the input field in the ul
                if (inp.length) { // if there is an input field already
                    $(this).text(inp.val()); // update the input value to the text of the li
                    var list = $(this) // set the current element to list variable so i can add classes later
                    list.addClass('list-group-item') // make the list element look pretty
                    $("#first_location .locationeditbtn").removeClass("edit_red"); // color the edit button red if clicked and not currently editing
                    $("#save_first").addClass("location_save_btn"); // Save button is hidden at start so hide it again if not editing
                    $('#first_location_card').removeClass("grey"); //remove the grey background if not in edit
                } else {
                    var t = $(this).text().trim(); // store the text of the current li element in a variable.
                    var name = $(this).attr('id'); //grab the id from the li element and use that the name field for the input
                    $(this).html($('<input  />', {
                        'value': t
                    })); //turn the li element into an input and set its value to what was stored in the t variable
                    var input = $(this).children(); // not sure
                    input.addClass('form-control mb-2 fieldupdated mt-1'); // make the inputs look pretty. and assign then a class to grab later. fieldupdated
                    input.attr('name', name) // set the name attribute of the input to the id stored before
                    $("#first_location").css("list-style-type", "none") // so when the dots from the ul dont show.
                    input.parent('li').removeClass('list-group-item') // remove the list group as it throws off the formating of the input if its in a list-group-item
                    $("#first_location .locationeditbtn").addClass("edit_red"); // make the edit button red.
                    $("#save_first").removeClass("location_save_btn"); // show the save button
                    $('#first_location_card').addClass("grey"); // color the background grey if the card is being editted
                }
            });
        $('#save_first').prop('disabled', true); //set the update dispo data button to disable at first
        $('.fieldupdated').each(function () { // grab all the inputs values
            $(this).data('serialized', $(this).serialize()) //Store each original value of the input using the .serialize() method
            // console.log($(this).serialize())
        })
            .on('change input', function () { // when a value is changed on one of the address fields then run this
                $('.locationeditbtn').prop('disabled', $(this).serialize() !== $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.
                $('#save_first').prop('disabled', $(this).serialize() === $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.

                if ($('.locationeditbtn').prop('disabled')) {
                    console.log('location edit button disabled')
                    $('.locationeditbtnspan').attr("data-original-title", "SAVE EDITS FIRST")
                }
            })

    }

    $("#save_first").on("click", function () {
        updatePermittingTableFirstLocation();

    })
    async function updatePermittingTableFirstLocation() {
        try {
            // var first_ut= $('input[name="first_utlity_strip_width"]').val()
            // console.log(first_ut)
            // first_ut= first_ut.replace(/'/g, "\\'")
            // console.log("Changed",first_ut)

            var permitting_rolt_number = responsedata.permitting_rolt_number;
            var permitting_id = responsedata.id;
            var response = await axios({
                method: 'post',
                url: "http://localhost:8011/update_permitting_table_first_location/v1/ftth.permitting," + permitting_rolt_number + "," + permitting_id + "",
                data: {
                    first_franchise_town: $('input[name="first_franchise_town"]').val(),
                    first_hamlet: $('input[name="first_hamlet"]').val(),
                    first_street: $('input[name="first_street"]').val(),
                    first_cross_street: $('input[name="first_cross_street"]').val(),
                    first_utlity_strip_width: $('input[name="first_utlity_strip_width"]').val(),
                    first_lat_long: $('input[name="first_lat_long"]').val(),
                    first_riser_pole: $('input[name="first_riser_pole"]').val(),
                    first_permitting_agency: $('input[name="first_permitting_agency"]').val(),
                    first_road_type: $('input[name="first_road_type"]').val(),
                    first_pictures: $('input[name="first_pictures"]').val(),
                }
            });
            $('.locationeditbtn').prop('disabled', false);
            console.log(response.data)
            if (response.data === "First Location Successfully Updated") {
                $('#first_location .locationeditbtn').click() // RUN THE FUNCTION FROM BEFORE TO HIDE THE GREY THE RED BUTTON AND TURN THE INPUTS BACK TO A LIST IF SUCCESSFUL
                $("#permittingTableSuccess").modal('show'); // Set a timeout to hide the element again
                setTimeout(function () {
                    $("#permittingTableSuccess").modal('hide');
                }, 3000);
            }else{alert(JSON.stringify(response.data))}
        } catch (error) {
            console.log(error)
        }
    }
    //END first location edit

    //EDITING THE SECOND LOCATION
    function second_loction_edit_function(e) {
        if (!responsedata) {
            alert("Please Search for A Cell")
            // e.stopPropagation(); // if there is no responsedata then dont open the modal
            e.stopPropagation();
            return
        }
        $(this).siblings().each(
            function () {
                var inp = $(this).find('input');
                if (inp.length) {
                    $(this).text(inp.val());
                    var list = $(this)
                    list.addClass('list-group-item')
                    $("#second_location .locationeditbtn").removeClass("edit_red");
                    $("#save_second").addClass("location_save_btn");
                    $('#second_location_card').removeClass("grey");
                } else {
                    var t = $(this).text().trim();
                    var name = $(this).attr('id');
                    $(this).html($('<input  />', {
                        'value': t
                    }));
                    var input = $(this).children();
                    input.addClass('form-control mb-2 fieldupdated mt-1');
                    input.attr('name', name);
                    $("#second_location").css("list-style-type", "none")
                    input.parent('li').removeClass('list-group-item')
                    $("#second_location .locationeditbtn").addClass("edit_red");
                    $("#save_second").removeClass("location_save_btn");
                    $('#second_location_card').addClass("grey")
                }
            });
        $('#save_second').prop('disabled', true); //set the update dispo data button to disable at first
        $('.fieldupdated').each(function () { // grab all the inputs values
            $(this).data('serialized', $(this).serialize()) //Store each original value of the input using the .serialize() method
        })
            .on('change input', function () { // when a value is changed on one of the address fields then run this
                $('.locationeditbtn').prop('disabled', $(this).serialize() !== $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.
                $('#save_second').prop('disabled', $(this).serialize() === $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.
            })
    };
    $("#save_second").on("click", function () {
        updatePermittingTableSecondLocation();

    })
    async function updatePermittingTableSecondLocation() {
        try {
            var permitting_rolt_number = responsedata.permitting_rolt_number;
            var permitting_id = responsedata.id;
            var response = await axios({
                method: 'post',
                url: "http://localhost:8011/update_permitting_table_second_location/v1/ftth.permitting," + permitting_rolt_number + "," + permitting_id + "",
                data: {
                    second_franchise_town: $('input[name="second_franchise_town"]').val(),
                    second_hamlet: $('input[name="second_hamlet"]').val(),
                    second_street: $('input[name="second_street"]').val(),
                    second_cross_street: $('input[name="second_cross_street"]').val(),
                    second_utility_strip_width: $('input[name="second_utility_strip_width"]').val(),
                    second_lat_long: $('input[name="second_lat_long"]').val(),
                    second_riser_pole: $('input[name="second_riser_pole"]').val(),
                    second_permitting_agency: $('input[name="second_permitting_agency"]').val(),
                    second_road_type: $('input[name="second_road_type"]').val(),
                    second_pictures: $('input[name="second_pictures"]').val(),
                }
            });
            $('.locationeditbtn').prop('disabled', false);
            console.log(response.data)
            if (response.data === "Second Location Successfully Updated") {
                $('#second_location .locationeditbtn').click() // RUN THE FUNCTION FROM BEFORE TO HIDE THE GREY THE RED BUTTON AND TURN THE INPUTS BACK TO A LIST IF SUCCESSFUL
                $("#permittingTableSuccess").modal('show'); // Set a timeout to hide the element again
                setTimeout(function () {
                    $("#permittingTableSuccess").modal('hide');
                }, 3000);
            }else{alert(JSON.stringify(response.data))}
        } catch (error) {
            console.log(error)
        }
        //END SECOND LOCATION EDIT
    };

    //EDITING THE FINAL LOCATION
    function final_loction_edit_function(e) {
        if (!responsedata) {
            alert("Please Search for A Cell")
            // e.stopPropagation(); // if there is no responsedata then dont open the modal
            e.stopPropagation();
            return
        }
        $(this).siblings().each(
            function () {
                var inp = $(this).find('input');
                if (inp.length) {
                    $(this).text(inp.val());
                    var list = $(this)
                    list.addClass('list-group-item')
                    $("#final_location .locationeditbtn").removeClass("edit_red");
                    $("#save_final").addClass("location_save_btn");
                    $('#final_location_card').removeClass("grey");
                } else {
                    var t = $(this).text().trim();
                    var name = $(this).attr('id');
                    $(this).html($('<input  />', {
                        'value': t
                    }));
                    var input = $(this).children();
                    input.addClass('form-control mb-2 fieldupdated mt-1')
                    input.attr('name', name)
                    $("#final_location").css("list-style-type", "none")
                    input.parent('li').removeClass('list-group-item')
                    $("#final_location .locationeditbtn").addClass("edit_red");
                    $("#save_final").removeClass("location_save_btn");
                    $('#final_location_card').addClass("grey")
                }
            });
        $('#save_final').prop('disabled', true); //set the update dispo data button to disable at first
        $('.fieldupdated').each(function () { // grab all the inputs values
            $(this).data('serialized', $(this).serialize()) //Store each original value of the input using the .serialize() method
        })
            .on('change input', function () { // when a value is changed on one of the address fields then run this
                $('.locationeditbtn').prop('disabled', $(this).serialize() !== $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.
                $('#save_final').prop('disabled', $(this).serialize() === $(this).data('serialized')); //disable the button if the stored data values from the serialize do not match the current value.
            })

    }
    $("#save_final").on("click", function () {
        updatePermittingTableFinalLocation();

    })
    async function updatePermittingTableFinalLocation() {
        try {
            var permitting_rolt_number = responsedata.permitting_rolt_number;
            var permitting_id = responsedata.id;
            var response = await axios({
                method: 'post',
                url: "http://localhost:8011/update_permitting_table_final_location/v1/ftth.permitting," + permitting_rolt_number + "," + permitting_id + "",
                data: {
                    franchise_town: $('input[name="final_franchise_town"]').val(),
                    hamlet: $('input[name="final_franchise_town"]').val(),
                    street: $('input[name="final_street"]').val(),
                    cross_street: $('input[name="final_cross_street"]').val(),
                    utlity_strip_width: $('input[name="final_utlity_strip_width"]').val(),
                    lat_long: $('input[name="final_lat_long"]').val(),
                    riser_pole: $('input[name="final_riser_pole"]').val(),
                    permitting_agency: $('input[name="final_permitting_agency"]').val(),
                    road_type: $('input[name="final_road_type"]').val(),
                    pictures: $('input[name="final_pictures"]').val(),
                }
            });
            $('.locationeditbtn').prop('disabled', false);
            $('#final_location .locationeditbtn').click() // RUN THE FUNCTION FROM BEFORE TO HIDE THE GREY THE RED BUTTON AND TURN THE INPUTS BACK TO A LIST IF SUCCESSFUL

            console.log(response.data)
            if (response.data === "Final Location Successfully Updated") {
                $("#permittingTableSuccess").modal('show'); // Set a timeout to hide the element again
                setTimeout(function () {
                    $("#permittingTableSuccess").modal('hide');
                }, 3000);
            }else{alert(JSON.stringify(response.data))}
        } catch (error) {
            console.log(error)
        }
    }
    $("#log_out").on("click", function () {
        alert("You Have Been Logged Out")
        axios.get("http://localhost:8011/logout")
    })
});
//end Document ready