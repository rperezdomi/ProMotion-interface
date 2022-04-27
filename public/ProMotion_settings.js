const socket = io();

//Call to database
socket.emit('refreshlist');
var user_select = [];
var datausers ={};

var config_select = [];
var dataconfig={};

var user_id="";
var global_bt_scan_list;

var case_study_select = []

var global_sensor_1 = "";
var global_sensor_2 = "";
var global_number_of_sensors = 1;
var global_selected_joint;
var global_case_study;
var global_comments_settings = "";
var global_all_fields_completed=false;
var global_case_study_field_completed= false;
var global_sensor_1_field_completed = false;
var global_sensor_2_field_completed = false;
var global_sensor_fields_completed = false;
var global_comments_field_completed = false;

var global_select_flex_values = [60 , 65];
var global_select_ext_values = [60 , 65];
var global_select_rot_left_values = [40,45]
var global_select_rot_right_values = [40,45]
var global_select_inc_left_values = [35, 40]
var global_select_inc_right_values = [35,40]

var global_user_name="";

socket.on('usersdata',function(datapatient){
    console.log(datapatient)
    for (i = 0; i < datapatient.length; i++){
        let patient = datapatient[i].nombre_usuario + " " + datapatient[i].apellido_usuario_1 + " " + datapatient[i].apellido_usuario_2;
        user_select.push(patient);  
    }

    for(var i in user_select)
    { 
        document.getElementById("users-list").innerHTML += "<option value='"+user_select[i]+"'>"+user_select[i]+"</option>"; 
    }
    datausers=datapatient;
})

socket.on('sessionsconfigdata',function(config){
    console.log(config)
    /*
    for (i = 0; i < config.length; i++){
        var case_study = config[i].caso_estudio;
        case_study_select.push(case_study);  
    }
    console.log(case_study_select)
    for(var i in case_study_select)
    { 
        console.log(case_study_select[i])
        document.getElementById("caseStudy").innerHTML += "<option value='"+ case_study_select[i]+"'>"+case_study_select[i]+"</option>";
         
    }*/
    dataconfig=config;
})

socket.on('set_patient_info', (user_info) =>  {
	console.log(user_info)
    user_id = user_info.user_id
    var user_date_of_birth = user_info.user_date_of_birth
    var user_gender = user_info.user_gender
    
    document.getElementById("date_of_birth").value = user_date_of_birth.toString();
    document.getElementById("gender").value = user_gender.toString();
    
    socket.emit("get_user_studycases", {
        user_id : user_id
        
    });
})


socket.on('set_casestudy_info', (data) =>  {
    console.log(data.study_cases);
    let case_studies = data.study_cases
    for( index=0; index < case_studies.length; index++){
        console.log(case_studies[index])
        document.getElementById("caseStudy_select").innerHTML += "<option value='"+case_studies[index]+"'>"+case_studies[index]+"</option>"; 
    }
})

socket.on('bluetooth_scan_list', function(data){
    document.getElementById("reload").style.display="inline"
    document.getElementById("sensor1").innerHTML = "<option value= no_choose > Select sensor 1 ... </option>"; 
    document.getElementById("sensor1").disabled = false
    document.getElementById("sensor2").innerHTML = "<option value= no_choose > Select sensor 2 ... </option>";
    document.getElementById("sensor2").disabled = false
    
    global_bt_scan_list = data.list;
    console.log(global_bt_scan_list)
    for(var i in global_bt_scan_list)
    { 
        document.getElementById("sensor1").innerHTML += "<option value='"+global_bt_scan_list[i]+"'>"+global_bt_scan_list[i]+"</option>"; 
        document.getElementById("sensor2").innerHTML += "<option value='"+global_bt_scan_list[i]+"'>"+global_bt_scan_list[i]+"</option>"; 
    }
    
})

document.getElementById("reload").onclick = function(){
     socket.emit("get_bluetooth_devices")
    document.getElementById("reload").style.display = "none"
    document.getElementById("sensor1").innerHTML = "<option value= scanning > Scanning bluetooth devices... </option>"; 
    document.getElementById("sensor1").disabled = true
    document.getElementById("sensor2").innerHTML = "<option value= scanning > Scanning bluetooth devices... </option>"; 
    document.getElementById("sensor2").disabled = true
}

var show_modal;
// Trigger modal
$( document ).ready( function() {
    console.log(document.referrer)
    show_modal = true
    if (document.referrer.toString() == 'http://192.168.43.1:3000/monitor_home.html'){
        show_modal = false
    }
    if (document.referrer.toString() == 'http://localhost:3000/monitor_home.html'){
        show_modal = false
    }
    if(show_modal){
        socket.emit("get_bluetooth_devices")
        $("#myModal").modal('show');
        $('.modal-backdrop').appendTo('.modal_area');
        
        // Prevent disapearing 
        /*
        $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
        })*/

	} else {
        global_sensor_fields_completed = true
        socket.emit('settings:ask_therapy_settings')
    }
    
}); 

socket.on('settings:get_therapy_settings', function(config){
    console.log("ge settings")
    console.log(config)
    global_user_name = config.user_name_surname;
    document.getElementById("user-name").value = global_user_name;
    socket.emit('get_patient_info', {
        user_name: config.user_name_surname
    })
})



window.onload = function(){ 
    
    // Updates the therapist and patient name according to the selected names in the "login" popup.
    document.getElementById("login_user").onclick = function() {
        if  (document.getElementById("users-list").value == "no_choose") {   
                if (document.getElementById("users-list").value == "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = "Selecciona un paciente o registra uno nuevo."
                } else if (document.getElementById("users-list").value != "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = ""
                } 
                
                
        } else {
            if(global_sensor_fields_completed){
                console.log("l176");
                socket.emit('ProMotion:connect_imu1', {
                    sensor_name: global_sensor_1
                });
            }
            
            global_user_name = document.getElementById("users-list");
            document.getElementById("user-name").value = global_user_name.value;
            $('#myModal').modal('hide');
            console.log(document.getElementById("users-list").value);
            socket.emit('get_patient_info', {
                user_name: document.getElementById("users-list").value
            })
        }
        
    };

    // sessions in study case
    socket.on("settings:answer_sessions_in_caseStudy", function(data){ 
        console.log(data.sessions_int)
        let studyCase_sessions = data.sessions_int;
        
        if(studyCase_sessions <3){
            document.getElementById("save_settings").value = "continue";
            document.getElementById("save_settings").innerHTML = "Continuar";
            document.getElementById("save_settings").style.background = "#4CAF50";  
        } else {
            // The current study case has already 3 sessions. Please, create a new one.
            $('#modal-sessions-limit').modal('show'); 
        }
    })
    
    // When the "save_settings" button is clicked, send all the configured parameters to the server 
    document.getElementById("save_settings").onclick = function() {
        // First click change colour
        if (document.getElementById("save_settings").value == "save_settings") {

            global_all_fields_completed = false
            if (global_case_study_field_completed){
                if (global_sensor_fields_completed){
                    if (global_comments_field_completed){
                        global_all_fields_completed = true;
                        
                    } else {
                        console.log("comments")
                    }
                }
                
            } 

            if (global_all_fields_completed){
                console.log("all fields completed")
                
                if( document.getElementById("caseStudy_select").value == 'create_new'){
                    var case_study =  document.getElementById("new_case_study").value
                } else {
                    var case_study = document.getElementById("caseStudy_select").value;
                }
            
                // check that the number of sessions in the study case doesnt exceeds 3
                socket.emit("settings:ask_sessions_in_caseStudy", {
                    caseStudy: case_study ,
                    user_id: user_id,
                    joint: document.getElementById("selected_joint").value
                })
                
            } else {
                $('#modal-filed-undefined').modal('show'); 
                
            }
            console.log("end if")
        // Second click send data
        } else if (document.getElementById("save_settings").value == "continue") {      
            console.log("continue")    
            if( document.getElementById("caseStudy_select").value == 'create_new'){
                var case_study =  document.getElementById("new_case_study").value
            } else {
                var case_study = document.getElementById("caseStudy_select").value;
            }
            // Send data to server
            if(!show_modal){
                var user_name = global_user_name
             } else {
                 var user_name = document.getElementById("users-list").value
             }
             
              var d = new Date();
                console.log("lets save settings");
                console.log(document.getElementById("comments").value)
                
            socket.emit('settings:save_settings', {
                date: d.getTime(),
                user_name: user_name,
                joint: document.getElementById("selected_joint").value,
                case_study: case_study,
                number_of_sensors: global_number_of_sensors,
                sensor1: global_sensor_1,
                sensor2: global_sensor_2,
                flexext_max: global_select_flex_values[0],
                flexext_min: global_select_ext_values[0],
                inclinacion_max: global_select_inc_left_values[0],
                inclinacion_min: global_select_inc_right_values[0],
                rotacion_max: global_select_rot_left_values[0],
                rotacion_min: global_select_rot_right_values[0],
                comments: document.getElementById("comments").value,
            })
            
            if(!show_modal){
                socket.emit("ProMotion:connect_imu1")
            }
            
            // Redirect to the therapy monitoring window
            location.replace("monitor_home.html")
			
        }
    };
};

function JointSelection(selectObject) {
    global_selected_joint = selectObject.value; 
    
    if(global_selected_joint == "cervical"){
        document.getElementById("rotation_card").style.display = "inline"
        document.getElementById("rotation_left").innerHTML="Left"
        document.getElementById("rotation_right").innerHTML="Right"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Left"
        document.getElementById("inclination_right").innerHTML="Right"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
    
    } else if((global_selected_joint == "hombro_derecho") | (global_selected_joint == "hombro_izquierdo")){
        document.getElementById("rotation_card").style.display = "inline"
        document.getElementById("rotation_left").innerHTML="Left"
        document.getElementById("rotation_right").innerHTML="Right"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Abduction"
        document.getElementById("inclination_right").innerHTML="Adduction"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if((global_selected_joint == "codo_derecho") | (global_selected_joint == "codo_izquierdo")){
        document.getElementById("rotation_card").style.display = "none"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Pronation"
        document.getElementById("inclination_right").innerHTML="Supination"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if((global_selected_joint == "muñeca_derecha") | (global_selected_joint == "muñeca_izquierda")){
        document.getElementById("rotation_card").style.display = "none"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="External"
        document.getElementById("inclination_right").innerHTML="Internal"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if (global_selected_joint == "lumbar"){
        document.getElementById("rotation_card").style.display = "inline"
        document.getElementById("rotation_left").innerHTML="Left"
        document.getElementById("rotation_right").innerHTML="Right"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Left"
        document.getElementById("inclination_right").innerHTML="Right"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if ((global_selected_joint == "cadera_izquierda") | (global_selected_joint == "cadera_derecha")){
        document.getElementById("rotation_card").style.display = "inline"
        document.getElementById("rotation_left").innerHTML="External"
        document.getElementById("rotation_right").innerHTML="Internal"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Abdction"
        document.getElementById("inclination_right").innerHTML="Adduction"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if ((global_selected_joint == "rodilla_izquierda") | (global_selected_joint == "rodilla_derecha")){
        document.getElementById("rotation_card").style.display = "none"
        document.getElementById("inclination_card").style.display = "none"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Flexion"
        document.getElementById("extension").innerHTML = "Extension"
        
    } else if ((global_selected_joint == "catobillo_izquierdo") | (global_selected_joint == "tobillo_izquierdo")){
        document.getElementById("rotation_card").style.display = "none"
        document.getElementById("inclination_card").style.display = "inline"
        document.getElementById("inclination_left").innerHTML="Eversion"
        document.getElementById("inclination_right").innerHTML="Inversion"
        document.getElementById("flexext_card").style.display = "inline"
        document.getElementById("flexion").innerHTML = "Dorsal Flexion"
        document.getElementById("extension").innerHTML = "Plantar Flexion"
        
    }
            
}

function CaseStudySelection(selectObject) {
    global_case_study = selectObject.value; 
    if (global_case_study == "create_new"){
        document.getElementById("new_case_study").type = "text";
    } else {
        document.getElementById("new_case_study").type = "hidden";
    }
    global_case_study_field_completed = true
}

function ConfigSensors(selectObject){
    global_number_of_sensors = selectObject.value; 
    socket.emit("get_bluetooth_devices")
    if(global_number_of_sensors.toString() == 2){
        document.getElementById("sensor2").style.display = "inline";
    } else {
        document.getElementById("sensor2").style.display = "none";

    }
}

function SelectedSensor1(selectObject){
    global_sensor_1 = selectObject.value; 
    global_sensor_1_field_completed = true
    if (global_number_of_sensors == 2){
        if (global_sensor_2_field_completed){
            global_sensor_fields_completed= true;
        } else {
            global_sensor_fields_completed= false;
        }
    } else {
        global_sensor_fields_completed= true;
    }
        
}

function SelectedSensor2(selectObject){
    global_sensor_2 = selectObject.value; 
    global_sensor_2_field_completed = true
    if (global_sensor_1_field_completed){
        global_sensor_fields_completed= true;
    } else {
        global_sensor_fields_completed= false;
    }
}


function setComments(selectObject){
    global_comments_settings = document.getElementById("comments").value;
    global_comments_field_completed = true; 
}

function checkROMRange(value){
    console.log(value)
    value = parseInt(value)
    if(value < 5){
        var min_max = [0,5]
    } else if (value < 10){
        var min_max = [5,10]
    } else if (value < 15){
        var min_max = [10,15]
    } else if (value < 20){
        var min_max = [15,20]
    } else if (value < 25){
        var min_max = [20,25]
    } else if (value < 30){
        var min_max = [25,30]
    } else if (value < 35){
        var min_max = [30,35]
    } else if (value < 40){
        var min_max = [35,40]
    } else if (value < 45){
        var min_max = [40,45]
    } else if (value < 50){
        var min_max = [45,50]
    } else if (value < 55){
        var min_max = [50,55]
    } else if (value < 60){
        var min_max = [55,60]
    } else if (value < 65){
        var min_max = [60,65]
    } else if (value < 70){
        var min_max = [65,70]
    } else if (value < 75){
        var min_max = [70,75]
    } else if (value < 80){
        var min_max = [75,80]
    } else if (value < 85){
        var min_max = [80,85]
    } else if (value < 90){
        var min_max = [85,90]
    } else if (value < 95){
        var min_max = [90,95]
    } else if (value < 100){
        var min_max = [95,100] 
    } else {
        console.log("else")
    }
    return min_max
}
function changeSliderFlex(selectObject){
    
    global_select_flex_values= checkROMRange(selectObject.value)
    document.getElementById("spanFlex").innerHTML = global_select_flex_values[0] + " - " + global_select_flex_values[1];
    selectObject.value = global_select_flex_values[0]
}
function changeSliderExt(selectObject){
    global_select_ext_values= checkROMRange(selectObject.value)
    document.getElementById("spanExt").innerHTML = global_select_ext_values[0] + " - " + global_select_ext_values[1];
    selectObject.value = global_select_ext_values[0]
}

function changeSliderIncLeft(selectObject){
    global_select_inc_left_values= checkROMRange(selectObject.value)
    document.getElementById("spanIncLeft").innerHTML = global_select_inc_left_values[0] + " - " + global_select_inc_left_values[1];
    selectObject.value = global_select_inc_left_values[0]
}
function changeSliderIncRight(selectObject){
    global_select_inc_right_values= checkROMRange(selectObject.value)
    document.getElementById("spanIncRight").innerHTML = global_select_inc_right_values[0] + " - " + global_select_inc_right_values[1];
    selectObject.value = global_select_inc_right_values[0]
}

function changeSliderRotRight(selectObject){
    global_select_rot_right_values= checkROMRange(selectObject.value)
    document.getElementById("spanRotRight").innerHTML = global_select_rot_right_values[0] + " - " + global_select_rot_right_values[1];
    selectObject.value = global_select_rot_right_values[0]}
function changeSliderRotLeft(selectObject){
    global_select_rot_left_values= checkROMRange(selectObject.value)
    document.getElementById("spanRotLeft").innerHTML = global_select_rot_left_values[0] + " - " + global_select_rot_left_values[1];
    selectObject.value = global_select_rot_left_values[0]
}


