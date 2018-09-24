$(document).ready(function () {
    let newusername = $("#newusername")
    let newuserrole = $("#newuserrole")
    let newuserpassword = $("#newuserpassword")
    let newusersecondpassword = $("#newusersecondpassword")
    let newuserfullname = $("#newuserfullname")
    var responsedata//TO CHECK THE RESPONSE IS SUCCESSFUL WHEN THE USER SUBMITS THE FORM
    async function sendUser(e) {
        try {
            validate()//RUN THE VALIDATE FUNCTION BEFORE SENDING
            const response = await axios.post("http://localhost:8011/insert_user", {
                newuserfullname: newuserfullname.val(),
                newuserpassword: newuserpassword.val(),
                newuserrole: newuserrole.val(),
                newusername: newusername.val().toLowerCase(),
            });
            responsedata = response.data
            if (responsedata !== 'User Successfully Created') {
                alert(responsedata)
            } else {
                document.getElementById('userform').reset();
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    //WHEN ANYTHING ON THE FORM IS TYPED INTO THEN RUN THESE (REAL-TIME VALIDATE UPDATES)
    newusername.on('keyup', function () {
        if (newusername.val().length < 3) {
            $("#newusernameerror").html('Username Must Be At Least 3 Characters')
            isValid = false;
            return false
        }
        else {
            $("#newusernameerror").html('')
        }
    });
    newuserfullname.on('keyup', function () {
        if (newuserfullname.val().length < 3) {
            $("#newuserfullnameerror").html('Full Name Must Be At Least 3 Characters')
            return false
        }
        else {
            $("#newuserfullnameerror").html('')
        }
    });
    newuserpassword.on('keyup', function () {
        if (newuserpassword.val().length < 5) {
            $("#newuserpassworderror").html('Password Must Be 5 Characters')
            return false
        }
        else {
            $("#newuserpassworderror").html('')
        }
    });
    //FUNCTION THAT WILL CHECK ALL THE USER INPUTS
    function validate() {
        if (newusername.val().length < 3) {
            $("#newusernameerror").html('Username Must Be At Least 3 Characters')
            return false
        }
        else {
            $("#newusernameerror").html('')
        }
        if (newuserfullname.val().length < 3) {
            $("#newuserfullnameerror").html('Full Name Must Be At Least 3 Characters')
            return false
        }
        else {
            $("#newuserfullnameerror").html('')
        }
        if (!newuserrole.val()) {
            $("#newuserroleerror").html('Select A Role')
            return false
        }
        else {
            $("#newuserroleerror").html('')
        }

        if (newuserpassword.val().length < 5) {
            $("#newuserpassworderror").html('Password Must Be 5 Characters')
            return false
        }
        else {
            $("#newuserpassworderror").html('')
        }
        if (newusersecondpassword.val() !== newuserpassword.val()) {
            $("#newusersecondpassworderror").html('Password Do NOT Match')
            return false
        }
        else {
            $("#newusersecondpassworderror").html('')
        }
        return true
    }

    $("#submitnewuser").on("click", async function () {
        if (validate() == true) {//IF THERE ARE NO RETURN FALSE FROM THE VALIDATE FUNCTION
            await sendUser();// SEND THE FORM TO THE BACKEND
        }
        else { 
            alert("Please Fix Input Errors") //THERE WAS A RETURN FALSE
        }
        if (responsedata === "User Successfully Created") {//AFTER THE sendUser() HAS RAN CHECK THE RESPONSE TO SEE IF ITS SUCCESSFUL
            alert('User Successfully Created, Now Log In');// JUST SAY IT WAS SUCCESSFUL
            window.location = "index.html"//SEND THEM TO THE INDEX PAGE AND IT WILL NEED THE BASIC AUTH SO THEY WILL ENTER THE PASSWORD JUST CREATED
        }
    })
});