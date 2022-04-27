

const path = require('path'); // Modulo de nodejs para trabajar con rutas
const express = require('express'); // Configurar express
const fs = require('fs'); //  File System module
const net = require('net');
const SocketIO = require('socket.io');
const ExcelJS = require('exceljs');
const matrix = require('node-matrix');

const BluetoothClassicSerialportClient = require('bluetooth-classic-serialport-client');
const serial_imu1 = new BluetoothClassicSerialportClient();
const serial_imu2 = new BluetoothClassicSerialportClient();
const PLOTSAMPLINGTIME = 100; //ms

const Chart = require('chart.js');

const annotationPlugin = require('chartjs-plugin-annotation');
Chart.register(annotationPlugin);

const domtoimage = require('dom-to-image')

/////////////////////////////////
//** Webserver configuration **//
/////////////////////////////////
//
// Express initialization SWalker
const app = express();
app.set('port', process.env.PORT || 3000)
// Send static files
app.use(express.static(path.join(__dirname, 'public')));
// Configure PORT of the web
const server = app.listen(app.get('port'), () => {
    console.log('Server', app.get('port'));
})

/////////////////////////////////
//** Socket io configuration **//
/////////////////////////////////
// Socket io is the javascript library used for the
// realtime, bi-directional communication between web
// clients and servers.
//
// Give the server to socketio
const io = SocketIO(server);
var sockets = Object.create(null);

//////////////////////////////////////
//***** SENSORS DATA RECEPTION
//////////////////////////////
//

var global_csvname = "";
// vars of recorded therapy data
var record_therapy = false;
var is_first_data = [true, true, true, true];   //sw, imu1, pressure, imu3
var is_imu1_connected = false;
var is_imu2_connected = false;

// vars used for the imus data reception
var ascii_msg_imu1;
var alfa = 0; 
var beta = 0;
var gamma = 0;
var alfa_vector = []
var beta_vector =  []
var gamma_vector = []
var ascii_msg_imu2;
var alfa2 = 0; 
var beta2 = 0;
var gamma2 = 0;
var alfa2_vector = []
var beta2_vector =  []
var gamma2_vector = []



var RS = matrix([[0,0,0], [0,0,0], [0,0,0]])
var RS2 = matrix([[0,0,0], [0,0,0], [0,0,0]])
var RT = matrix([[0,0,0], [0,0,0], [0,0,0]])
var R_cal2 = matrix([[0,0,0], [0,0,0], [0,0,0]])
var R_cal = matrix([[0,0,0], [0,0,0], [0,0,0]])

var planoMovimiento = "cervical";
var global_movement = 1;
var global_movement_vector = [];
var global_movement_vector2 = [];
var time_stamp_vector = [];
var time_stamp_vector2 = [];

var lasthex_imu1 = "";
var lasthex_imu2 = "";
var dcm_msgData = "";
var dcm_msgData2 = "";
var dcm_mode = false;
var dcm_mode2 = false;

var global_studycase;
var global_session_to_dashboard;
var global_session_id ;

var status_msg_rcv  = false;

// IMU1 data reception (bt)
serial_imu1.on('data', function(data){ 
	// Check imu mode (DCM or ANGLES)
	if (data.toString().includes("#")){
		let key = data.toString().split('#')[1].substr(0,3)
		if (key == 'DCM'){
			dcm_mode = true;
		} else if (key == 'YPR'){
			dcm_mode = false;
		}  
	}

	// In Games mode the DCM matrix is needed. 
	if (!dcm_mode){
		// To change the imu streaming mode to DCM, the command "#om" must be sent
		var buf = Buffer.from('#om', 'utf8');
		serial_imu1.write(buf)
		.then(() => console.log('Command "#om" successfully written'))
		.catch((err) => console.log('Error en envío del cmando #om a imu', err))
		
		dcm_mode = true;
	
	// The imu streamming mode is already in DCM
	} else{
		try{
			// get the entire message from the received data ('#DCM= arg1, arg2...., arg10')
			 ascii_msg_imu1 = hex2a_general(data, lasthex_imu1, is_first_data[1]);
			 let msg_list = ascii_msg_imu1[0];
			 is_first_data[1] = ascii_msg_imu1[1];
			 
			 for(i=0; i<msg_list.length; i++){
				if(msg_list[i].includes("=") & msg_list[i].includes(',')){
					let dcm_data_vector = msg_list[i].split('=')[1].split(',');				
					if(dcm_data_vector.length == 10){
						lasthex_imu1 = "";
						
						RS = matrix([[parseFloat(dcm_data_vector[0]), parseFloat(dcm_data_vector[1]), parseFloat(dcm_data_vector[2])],
							   [parseFloat(dcm_data_vector[3]), parseFloat(dcm_data_vector[4]), parseFloat(dcm_data_vector[5])],
							   [parseFloat(dcm_data_vector[6]), parseFloat(dcm_data_vector[7]), parseFloat(dcm_data_vector[8])]
							   ]);
						
						let angles = calculateEuler(R_cal,RS);
						alfa = angles[0]
						beta = angles[1]
						gamma = angles[2]
						
						// Data storage
						if(record_therapy){
						    time_stamp_vector.push(Date.now());
						    alfa_vector.push(alfa);
						    beta_vector.push(beta);
						    gamma_vector.push(gamma);
						    global_movement_vector.push(global_movement);
						}

					} else {
						lasthex_imu1 = '#' + msg_list[i]
					}
				} else {
					lasthex_imu1 = '#' + msg_list[i]
				}
					
			}
		}catch(error){
			console.log(error);
		}
	}

});

// IMU1 data reception (bt)
serial_imu2.on('data', function(data){ 
	// Check imu mode (DCM or ANGLES)
	if (data.toString().includes("#")){
		let key = data.toString().split('#')[1].substr(0,3)
		if (key == 'DCM'){
			dcm_mode2 = true;
		} else if (key == 'YPR'){
			dcm_mode2 = false;
		}  
	}

	// In Games mode the DCM matrix is needed. 
	if (!dcm_mode2){
		// To change the imu streaming mode to DCM, the command "#om" must be sent
		var buf = Buffer.from('#om', 'utf8');
		serial_imu2.write(buf)
		.then(() => console.log('Command "#om" successfully written'))
		.catch((err) => console.log('Error en envío del cmando #om a imu', err))
		
		dcm_mode2 = true;
	
	// The imu streamming mode is already in DCM
	} else{
		try{
			// get the entire message from the received data ('#DCM= arg1, arg2...., arg10')
			 ascii_msg_imu2 = hex2a_general(data, lasthex_imu2, is_first_data[1]);
			 let msg_list = ascii_msg_imu2[0];
			 is_first_data[1] = ascii_msg_imu2[1];
			 
			 for(i=0; i<msg_list.length; i++){
				if(msg_list[i].includes("=") & msg_list[i].includes(',')){
					let dcm_data_vector = msg_list[i].split('=')[1].split(',');				
					if(dcm_data_vector.length == 10){
						lasthex_imu2 = "";
						
						RS2 = matrix([[parseFloat(dcm_data_vector[0]), parseFloat(dcm_data_vector[1]), parseFloat(dcm_data_vector[2])],
							   [parseFloat(dcm_data_vector[3]), parseFloat(dcm_data_vector[4]), parseFloat(dcm_data_vector[5])],
							   [parseFloat(dcm_data_vector[6]), parseFloat(dcm_data_vector[7]), parseFloat(dcm_data_vector[8])]
							   ]);
						
						let angles = calculateEuler(R_cal2,RS2);
						alfa2 = angles[0]
						beta2 = angles[1]
						gamma2 = angles[2]
						
						// Data storage
						if(record_therapy){
						    time_stamp_vector2.push(Date.now());
						    alfa_vector2.push(alfa2);
						    beta_vector2.push(beta2);
						    gamma_vector2.push(gamma2);
						    global_movement_vector2.push(global_movement);
						}

					} else {
						lasthex_imu2 = '#' + msg_list[i]
					}
				} else {
					lasthex_imu2 = '#' + msg_list[i]
				}
					
			}
		}catch(error){
			console.log(error);
		}
	}

});  

serial_imu2.on('closed', function(){
	console.log("connection closed --");
	
	sockets['websocket'].emit('ProMotion:connection_status',{
		 device: "imu2",
		 status:3
	}) 
	
	disconnect_bt_device(sockets['websocket'], serial_imu2, is_imu2_connected, "imu2")

})

serial_imu2.on('failure', function(e){
	console.log(e);

})

serial_imu2.on('disconnected', function(e){
	console.log(e);

})

////////////////////////////////
//** Database configuration **//
////////////////////////////////
//
var mysql = require('mysql');

///////////////////////////////////////
//*** Server-Client communication ***//
///////////////////////////////////////
//
//Connect with DataBase ProMotion
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "ProMotion",
    multipleStatements: true
});

// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);
    sockets['websocket'] = socket;
    
    var datitos=[];
    app.get('/downloaddata', (req, res) => setTimeout(function(){ res.download('./ProMotion.xlsx'); }, 1000))
    app.get('/downloadusers', (req, res) => setTimeout(function(){ res.download('./Users_DB.xlsx'); }, 1000))
    app.get('/downloadsessionsdata_studycase_csv', (req, res) => setTimeout(function(){ res.download('./Session_' + global_csvname + '.xlsx'); }, 1000))
    app.get('/downloadflexextdashboard', (req, res) => setTimeout(function(){ res.download('./image_flexext.png'); }, 1000))
    app.get('/downloadrotationdashboard', (req, res) => setTimeout(function(){ res.download('./image_rot.png'); }, 1000))
    app.get('/downloadinclinationdashboard', (req, res) => setTimeout(function(){ res.download('./image_inc.png'); }, 1000))


     // ***** SW DATABASE INTERACTIONS
    socket.on('refreshlist',function() {
        console.log("Connected!");
        console.log("Connected Sessions!");
	 var sql = "SELECT * FROM tabla_sesiones";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
        });
        var sql = "SELECT tabla_sesiones.* , tabla_usuarios.nombre_usuario, tabla_usuarios.apellido_usuario_1, tabla_usuarios.apellido_usuario_2 FROM tabla_sesiones JOIN tabla_usuarios ON tabla_sesiones.id_usuario = tabla_usuarios.id";
        //var sql = "SELECT * FROM tabla_sesiones JOIN tabla_usuarios ON tabla_sesiones.id_usuario = tabla_usuarios.id";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
            socket.emit('sessionsconfigdata', sessions_data);   //session_data --- datos de las sesiones (configuraciones)
        });
        console.log("Connected usuarios!");
        var sql = "SELECT * FROM tabla_usuarios";
        con.query(sql, function (err, users_list) {
            if (err) throw err;
            socket.emit('usersdata', users_list);  //patients_list ----- lista de pacientes(id-nombre-apellido)
        });
	
	/*
        console.log("Connected Therapist!");
        var sql = "SELECT * FROM data_sessions";
        con.query(sql, function (err, datasessions_list) {
            if (err) throw err;
            socket.emit('datasessions', datasessions_list);    
        });
        
        */
    })
    
     //GET PATIENT INFO AND AUTOFILL IN "Therapy Settings" (DATABASE)
    socket.on('get_patient_info',function(data){
	    console.log(data)
        // Get patient ID from database
        var name = data.user_name.split(" ")[0];
        var surname_1 =  data.user_name.split(" ")[1];
        var surname_2 =  data.user_name.split(" ")[2];
        var user_id = "";
        var sql_patient = "SELECT * FROM tabla_usuarios WHERE nombre_usuario='" + name.toString() + "' AND apellido_usuario_1='" + surname_1.toString() + "' AND apellido_usuario_2='" + surname_2.toString() +  "';";
        console.log(sql_patient);
        con.query(sql_patient, function (err, user_data) {
            if (err) throw err;
            console.log(user_data);
            var user_id = user_data[0].id; 
            console.log(user_id);
            if (user_id != undefined) {
		var user_date_of_birth = user_data[0].fecha_nacimiento; 
		var user_gender = user_data[0].sexo;
		socket.emit('set_patient_info', {
			user_id: user_id,
			user_date_of_birth: user_date_of_birth,
			user_gender: user_gender,
			
		})

	}
                
        });
    })
    
    socket.on("get_user_studycases", function(data){
	console.log(data)
	let user_id = data.user_id;
	var sql_studycases = "SELECT DISTINCT caso_estudio FROM tabla_sesiones WHERE id_usuario='" + user_id.toString() + "';";
        console.log(sql_studycases);
        con.query(sql_studycases, function (err, user_data) {
            if (err) throw err;
	    var cases_vector=[]
	    for (i=0; i < user_data.length ; i++){
		cases_vector.push(user_data[i].caso_estudio)
	    }
            console.log(cases_vector);
            
	    socket.emit('set_casestudy_info', {
		    study_cases: cases_vector
		    
	    })
        });
    });
    
    // Save therapy settings in a JSON file.
    socket.on('settings:save_settings', (data) => {
	console.log("received sav message")
	console.log(data);
	planoMovimiento = data.joint;
	var therapyConfigPath = path.join(__dirname, 'config','therapySettings.json');
	try{
		fs.writeFileSync(therapyConfigPath, JSON.stringify(data))
		console.log('Therapy settings saved!')

	} catch(error){
	
	    console.log(error)
	}
        
    })
    
    // Show therapy settings in the monitoring screen.
    socket.on('monitoring:ask_therapy_settings', function(callbackFn) {
	    console.log("monitoring ask settings");
        // Read therappy settings from config file.
	var therapyConfigPath = path.join(__dirname, 'config','therapySettings.json');
        fs.readFile(therapyConfigPath, (err, data) => {
            if (err) throw err;
            let config = JSON.parse(data);
            console.log(config.sensor1);
            // Send values
            socket.emit('monitoring:get_therapy_settings', {
                user_name_surname : config.user_name,
                joint : config.joint,
                case_study :  config.case_study,
                number_of_sensors :   config.number_of_sensors,
                sensor_1 :   config.sensor1,
                sensor_2 :   config.sensor2,
		flexext_max: config.flexext_max,
                flexext_min: config.flexext_min,
                inclinacion_max: config.inclinacion_max,
                inclinacion_min: config.inclinacion_min,
                rotacion_max: config.rotacion_max,
                rotacion_min: config.rotacion_min
            
            })

        });
    });
    
    // Show therapy settings in the monitoring screen.
    socket.on('settings:ask_therapy_settings', function(callbackFn) {
	console.log("settings ask settings");
        // Read therappy settings from config file.
	var therapyConfigPath = path.join(__dirname, 'config','therapySettings.json');
        fs.readFile(therapyConfigPath, (err, data) => {
            if (err) throw err;
            let config = JSON.parse(data);
            console.log(config.sensor1);
            // Send values
            socket.emit('settings:get_therapy_settings', {
                user_name_surname : config.user_name,
                joint : config.joint,
                case_study :  config.case_study,
                number_of_sensors :   config.number_of_sensors,
                sensor_1 :   config.sensor1,
                sensor_2 :   config.sensor2,
		flexext_max: config.flexext_max,
                flexext_min: config.flexext_min,
                inclinacion_max: config.inclinacion_max,
                inclinacion_min: config.inclinacion_min,
                rotacion_max: config.rotacion_max,
                rotacion_min: config.rotacion_min
            })
        });
    });
    
    // GET BLUETOOTH DEVICES TO SHOW THEM IN CONFIG 
    socket.on('get_bluetooth_devices',function(){
	
	scan_bluetooth_devices(socket, serial_imu1)
	
    });
    
    // ADD USER TO DATABASE
    socket.on('insertuser', function(user) {
        var sql = "INSERT INTO tabla_usuarios (nombre_usuario, apellido_usuario_1, apellido_usuario_2, fecha_nacimiento, sexo) VALUES (?)";
        con.query(sql,[user], function (err, result) {
            if (err) throw err;
            console.log(result.insertId);
	    socket.emit("useradded", {
		id: result.insertId
		})
        });
    });
    
    //DELETE USER FROM DATABASE
    socket.on('deleted_user', function(iddeleted) {
        var sql = "DELETE FROM tabla_usuarios WHERE id="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Deleted Patient");
        });
    });
    //EDIT PATIENT DATABASE
    socket.on('edit_user', function(edituser) {
	console.log(edituser)
        var sql = 'UPDATE tabla_usuarios SET nombre_usuario = ?, apellido_usuario_1 = ?, apellido_usuario_2 = ?, fecha_nacimiento = ?, sexo = ? WHERE (id=?)'
        con.query(sql,[edituser.nombre_usuario,edituser.apellido_usuario_1,edituser.apellido_usuario_2, edituser.fecha_nacimiento, edituser.sexodown, edituser.id], function (err, result) {
            console.log("Edited Patient");
        });
    });
    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('download_users',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');
        worksheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'First Name', key: 'nombre_usuario', width: 10 },
            { header: 'Last Name 1', key: 'apellido_usuario_1', width: 10 },
            { header: 'Last Name 2', key: 'apellido_usuario_2', width: 10 },
            { header: 'Gender', key: 'sexo', width: 10 },
            { header: 'Date Of Birth', key: 'fecha_nacimiento', width: 10 },
        ];
        var sql = "SELECT * FROM tabla_usuarios";
        con.query(sql, function (err, users_list) {
            if (err) throw err;
            datitos=users_list;
                for (var i = 0; i < users_list.length; i++) {
                    worksheet.addRow((users_list[i]));
                }
            workbook.xlsx.writeFile("Users_DB.xlsx");
        });
    })
    
    //DELETE SESSION FROM DATABASE
    socket.on('deleted_session', function(iddeleted) {
	console.log(iddeleted)
        var sql = "DELETE FROM tabla_sesiones WHERE id="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Deleted SESION");
        });
    });
    
    //DELETE STUDY CASE FROM DATABASE
    socket.on('deleted_study_case', function(study_case_to_delete) {
	console.log(study_case_to_delete)
	var sql = "SELECT id FROM tabla_sesiones WHERE caso_estudio='"+study_case_to_delete.toString() + "';"
	console.log(sql)
	con.query(sql, function(err, result){
	    console.log(result)
	    for (var i in result){
		var sql = "DELETE FROM tabla_sesiones WHERE id="+result[i].id;
		con.query(sql, function (err, result_2) {
		    console.log("Deleted SESION");
		});
	    }
	});
	console.log("the study case has been deleted");
        
    });
    
    socket.on("study_case_to_dashboard", function(session_data){
	console.log(session_data);
	global_session_to_dashboard = session_data;
    });
    
    socket.on("monitor_home:study_case_to_dashboard", function(id_){
	console.log(id_)
	var sql_ = "SELECT tabla_sesiones.* , tabla_usuarios.nombre_usuario, tabla_usuarios.apellido_usuario_1, tabla_usuarios.apellido_usuario_2 FROM tabla_sesiones JOIN tabla_usuarios ON tabla_sesiones.id_usuario = tabla_usuarios.id WHERE tabla_sesiones.id=" + id_.toString() ;
        console.log(sql_)
	//var sql = "SELECT * FROM tabla_sesiones JOIN tabla_usuarios ON tabla_sesiones.id_usuario = tabla_usuarios.id";
        con.query(sql_, function (err, session_data) {
            if (err) throw err;
            //socket.emit('sessionsconfigdata', sessions_data);   //session_data --- datos de las sesiones (configuraciones)
	    console.log(session_data[0])
	    global_session_to_dashboard = session_data[0];
        });
    });
    
    
    
    //DOWNLOAD STUDY CASE DATA FROM DATABASE IN CSV FORMAT
    socket.on('download_studycase_csv',function(data){
        console.log("Download Data csv")
        console.log(data.studyCase)
	global_studycase = data.studyCase
	let user = data.user;
	let titles = data.titles;
	const workbook = new ExcelJS.Workbook();

	// get IDs of study case sessions
	var sql = "SELECT id,date FROM tabla_sesiones WHERE caso_estudio='" + global_studycase.toString() + "';";
	console.log(sql)
        con.query(sql, function (err, sessions_data) {
	    console.log(sessions_data)
	    var ids_vector = []
	    for (index = 0; index < sessions_data.length; index++){		
		var date = (sessions_data[index].date).toString();
		var month = date.split(" ")[1]
		var day = date.split(" ")[2]
		var year = date.split(" ")[3]
		var time = date.split(" ")[4].split(":").join(".")
		console.log(date)
		date = day + month + year + "T" + time
		
		console.log(date)
		const worksheet = workbook.addWorksheet(date);
		worksheet.columns = [
		    { header: 'Session ID', key: 'id_sesion', width: 10 },
		    { header: 'Time (ms)', key: 'Date', width: 20 },
		    { header: 'Type Of Movement', key: 'movimiento', width: 20 },
		    { header: titles[0], key: 'alfa', width: 20 },
		    { header: titles[1], key: 'beta', width: 20 },
		    { header: titles[2], key: 'gamma', width: 20 },

		];
		var sql = "SELECT * FROM tabla_datos WHERE id_sesion=" + (sessions_data[index].id).toString() + ";";
		console.log(sql);
		con.query(sql, function (err, session_data) {
		    if (err) throw err;
		    for (var i = 0; i < session_data.length; i++) {
			worksheet.addRow((session_data[i]));
		    }
		    console.log(global_studycase)
		    global_csvname = "CaseStudy_" +  user + "_" + global_studycase
		    workbook.xlsx.writeFile("Session_" + global_csvname + ".xlsx");
		});
	
		
	    }
	    
	    var clear_interval = false;
	    var temp_interval = setInterval(function(){
		if(clear_interval){
		    socket.emit('open_download_csv_studycase_link');
		    clearInterval(temp_interval)
		}
		else {
		    clear_interval = true;
		}
	    }, 3000);
		    
		    
	});
	
        
    })
    
    socket.on('ProMotion:addsessiondata', function(data){
	console.log("Add session data")
        var sql = "INSERT INTO tabla_sesiones (id_usuario, caso_estudio, articulacion, numero_sensores, sensor1, sensor2, ROM_flexion, ROM_extension, ROM_inclinacion_izq, ROM_inclinacion_der, ROM_rotacion_izq, ROM_rotacion_der, comentarios) VALUES (?)";
        // Read therapy configuration from conf file
	var therapyConfigPath = path.join(__dirname, 'config','therapySettings.json');
        fs.readFile(therapyConfigPath, (err, data) => {
            if (err) throw err;
            var config = JSON.parse(data);
            var patient_id = "SELECT id from tabla_usuarios where nombre_usuario in ('" + (config.user_name.split(" "))[0] +"') AND apellido_usuario_1 in ('" + (config.user_name.split(" "))[(config.user_name.split(" ").length) -2] +"') AND apellido_usuario_2 in ('" + (config.user_name.split(" "))[(config.user_name.split(" ").length) -1] +"'); ";
            var ID = patient_id
            con.query(ID , function (err, result) {
                if (err) throw err;
                patient_id = result[0].id;

		var sessionConfig = [patient_id, config.case_study, config.joint, config.number_of_sensors, config.sensor_1, config.sensor_2, config.flexext_max, config.flexext_min, config.inclinacion_max, config.inclinacion_min, config.rotacion_max, config.rotacion_min, config.comments];
			    
		con.query(sql,[sessionConfig], function (err, result) {
			if (err) throw err;
			// Save Data of the session
			var sessionID = "SELECT id from tabla_sesiones ORDER BY id DESC LIMIT 1;";
			con.query(sessionID , function (err, sessionID) {
				if (err) throw err;
				// Get last session ID
				sessionID = sessionID[0].id;
				global_session_id = sessionID;
				console.log(config.number_of_sensors);
				if(config.number_of_sensors == 2){
				    if(alfa_vector.length < alfa2_vector.length){
					var total_length = alfa_vector.length
					var final_time_stamp_vector = time_stamp_vector
					var final_global_movement_vector = global_movement_vector
				    } else if(alfa_vector.length > alfa2_vector.length){
					var total_length = alfa_vector2.length
					var final_time_stamp_vector = time_stamp_vector2
					var final_global_movement_vector = global_movement_vector2
				    }
				} else {
				    var total_length = alfa_vector.length
				    var final_time_stamp_vector = time_stamp_vector
				    var final_global_movement_vector = global_movement_vector
				}
				
				for(index = 0; index < total_length -1 ; index++){
				    // Prepare joints angles data of the last session
				    if(config.number_of_sensors==2){
					insertDataRows = "(" + (sessionID).toString() + "," + (final_time_stamp_vector[index]).toString() +","+ 
								"'"+ (final_global_movement_vector[index]).toString() + "'," + (parseFloat(alfa_vector[index])-parseFloat(alfa_vector2[index])).toString()  + "," + (parseFloat(beta_vector[index])-parseFloat(beta_vector2[index])).toString() + "," + (parseFloat(gamma_vector[index])-parseFloat(gamma_vector2[index])).toString() +  ");"
				    
				    } else if(config.number_of_sensors==1){
					insertDataRows = "(" + (sessionID).toString() + "," + (time_stamp_vector[index]).toString() +","+ 
								"'"+ (global_movement_vector[index]).toString() + "'," + (alfa_vector[index]).toString()  + "," + (beta_vector[index]).toString() + "," + (gamma_vector[index]).toString() +  ");"
				    }
				    var sql = "INSERT INTO tabla_datos (id_sesion, Date, movimiento, alfa, beta, gamma) VALUES " + insertDataRows;
				    //console.log(sql);
				    con.query(sql, function (err, result) {
					
					if (err) throw err;
				    });
				}
				
				socket.emit('ProMotion:recorded_sessionData',  global_session_id);
				console.log(global_session_id);
				console.log("emited")
			
			});
			console.log("Recorded Session Data");
			
			
		});
		
           });
	});
    });
    
    socket.on("monitoring:set_movement", function(data){
	
	global_movement = data

    });
    
    // Send data to the charts in pressure_home
    
    setInterval(function () {
	if(is_imu1_connected & is_imu2_connected){
	    var alfa_to_send = parseFloat(alfa) - parseFloat(alfa2)
	    var beta_to_send = parseFloat(beta) - parseFloat(beta2)
	    var gamma_to_send = parseFloat(gamma) - parseFloat(gamma2)
	    
	} else if(is_imu1_connected){
	    var alfa_to_send = parseFloat(alfa)
	    var beta_to_send = parseFloat(beta)
	    var gamma_to_send = parseFloat(gamma) 
	    
	} else{
	    var alfa_to_send = beta_to_send = gamma_to_send = 0
	}
	    
        socket.emit('ProMotion:data', {
		
            // IMU
            alfa: alfa_to_send,
            beta: beta_to_send,
            gamma: gamma_to_send,
	    is_imu1_connected: is_imu1_connected,
	    is_imu2_connected: is_imu2_connected,
            
        })

    }, PLOTSAMPLINGTIME);

    
    // Connect IMU 1
    socket.on('ProMotion:connect_imu1', function(data) {
	console.log("connecting imu1...")
	status_msg_rcv = false;
	console.log(is_imu1_connected);
	console.log(data)
	connect_bt_device(socket, serial_imu1, is_imu1_connected, data.sensor_name, "imu1");
    
    });
    // Disconnect IMU 1
    socket.on('ProMotion:disconnect_imu1', function(callbackFn) {
	console.log("disconnect imu1");
       disconnect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");
       
    });
    
    // Connect IMU 2
    socket.on('ProMotion:connect_imu2', function(data) {
	status_msg_rcv = false;
	console.log("connecting imu2...");
	console.log(is_imu2_connected);
	connect_bt_device(socket, serial_imu2, is_imu2_connected, data.sensor_name, "imu2");
	
    });
    // Disconnect IMU 1
    socket.on('ProMotion:disconnect_imu2', function(callbackFn) {

       disconnect_bt_device(socket, serial_imu2, is_imu2_connected, "imu2");
       
    });
    
    socket.on('ProMotion:status_msg_rcv', function(){
	status_msg_rcv = true;
    });

    // Start therapy.
    socket.on('ProMotion:start', function(callbackFn) {
		
        // Start recording
        record_therapy = true;
	time_stamp_vector = []
	time_stamp_vector2 = []
       
        // IMU vars
        alfa = 0;
	beta = 0;
	gamma = 0;
	alfa_vector = [];
	beta_vector = [];
	gamma_vector = [];
	alfa2 = 0;
	beta2 = 0;
	gamma2 = 0;
	alfa_vector2 = [];
	beta_vector2 = [];
	gamma_vector2 = [];
	
	// focused type of movement (1: flexext, 2:inclinacion, 3:rotacion)
	global_movement = 1;
	global_movement_vector = []
	global_movement_vector2 = []
			
		
    });

    // Stop therapy.
    socket.on('ProMotion:stop', function(callbackFn) {

        record_therapy = false;

    });
    
    // calibrate Capture Motion sensor.
    socket.on('ProMotion:calibrate', function(n_sensor) {
	console.log("calibrando");

	if(n_sensor == 1){
	    R_cal = calibrateIMU(RS);
	}else if(n_sensor == 2){
	    R_cal2 = calibrateIMU(RS2);
	}
		
    });
    
    socket.on("summary:get_user_info", function(callbackFn){
	// Get user id from the study case 
	
	var sql = "SELECT * from tabla_usuarios WHERE id=" + global_session_to_dashboard.id_usuario + ";"
	con.query(sql, function (err, user_data) {
	    if (err) throw err;
	    socket.emit("summary:set_user_info", user_data);
	});
	
    });
    
    socket.on("summary:get_config_sessions", function(data){
	var sql = "SELECT * from tabla_sesiones WHERE id_usuario=" + global_session_to_dashboard.id_usuario + " AND caso_estudio='" + global_session_to_dashboard.caso_estudio + "' AND articulacion='" + global_session_to_dashboard.articulacion + "';"
	con.query(sql, function (err, sessions_data) {
	    if (err) throw err;
	    socket.emit("summary:set_config_info", {
		selected_session_data: global_session_to_dashboard,
		all_sessions_in_case_study: sessions_data
	    });
	});
    });
    
    socket.on("settings:ask_sessions_in_caseStudy", function(data){
	let caseStudy = data.caseStudy
	let id_user = data.user_id
	let joint = data.joint
	
	var sql = "SELECT * from tabla_sesiones WHERE id_usuario=" + id_user + " AND caso_estudio='" + caseStudy + "' AND articulacion='" + joint + "';"
	con.query(sql, function (err, sessions_data) {
	    if (err) throw err;
	    socket.emit("settings:answer_sessions_in_caseStudy", {
		sessions_int: sessions_data.length
	    });
	});
    });
    
    socket.on("summary:get_data_session1", function(id){
	
	var sql_movement = "SELECT DISTINCT movimiento FROM tabla_datos WHERE id_sesion=" + id + ";";
	var splitted_data_session = []
	var different_movements_in_set = []
	con.query(sql_movement, function (err, movements_) {
	    different_movements_in_set = movements_
	    if (err) throw err;
	    for (j in movements_){
		var sql_movement = "SELECT * from tabla_datos WHERE id_sesion=" + id + " AND movimiento='"+ movements_[j].movimiento.toString() + "';";
		con.query(sql_movement, function (err, movement_x_data) {
		    if(err) throw err;
		    splitted_data_session.push(movement_x_data)
		});
	    }
	});
	var interval = setInterval(function () {
	    if (splitted_data_session.length == different_movements_in_set.length){
		socket.emit("summary:set_data_session1", splitted_data_session);
		clearInterval(interval)
	    } 
	}, 1000);
		
    });
    socket.on("summary:get_data_session2", function(id){
	
	var sql_movement = "SELECT DISTINCT movimiento FROM tabla_datos WHERE id_sesion=" + id + ";";
	var splitted_data_session = []
	var different_movements_in_set = []
	con.query(sql_movement, function (err, movements_) {
	    different_movements_in_set = movements_
	    if (err) throw err;
	    for (j in movements_){
		var sql_movement = "SELECT * from tabla_datos WHERE id_sesion=" + id + " AND movimiento='"+ movements_[j].movimiento.toString() + "';";
		con.query(sql_movement, function (err, movement_x_data) {
		    if(err) throw err;
		    splitted_data_session.push(movement_x_data)
		});
	    }
	});
	var interval = setInterval(function () {
	    if (splitted_data_session.length == different_movements_in_set.length){
		socket.emit("summary:set_data_session2", splitted_data_session);
		clearInterval(interval)
	    } 
	}, 1000);
		
    });
    socket.on("summary:get_data_session3", function(id){
	
	var sql_movement = "SELECT DISTINCT movimiento FROM tabla_datos WHERE id_sesion=" + id + ";";
	var splitted_data_session = []
	var different_movements_in_set = []
	con.query(sql_movement, function (err, movements_) {
	    different_movements_in_set = movements_
	    if (err) throw err;
	    for (j in movements_){
		var sql_movement = "SELECT * from tabla_datos WHERE id_sesion=" + id + " AND movimiento='"+ movements_[j].movimiento.toString() + "';";
		con.query(sql_movement, function (err, movement_x_data) {
		    if(err) throw err;
		    splitted_data_session.push(movement_x_data)
		});
	    }
	});
	var interval = setInterval(function () {
	    if (splitted_data_session.length == different_movements_in_set.length){
		socket.emit("summary:set_data_session3", splitted_data_session);
		clearInterval(interval)
	    } 
	}, 1000);
		
    });
    
    buffers=[]
    socket.on("blob-flexext", function(blob1){
	console.log(blob1)
	let buffer = toBuffer(blob1)
	
	let imageName_flexext = 'image_flexext.png';
	fs.createWriteStream(imageName_flexext).write(buffer)
	
	let n_int = 0
	let int = setInterval(function(){
	    if(n_int == 1){
		socket.emit('open_dashboard_flexext_link')

		
	    } else if (n_int == 2){
		clearInterval(int)
	    }
	    n_int ++;
	}, 1000)
    });
    
    socket.on("blob-rot", function(blob2){
	console.log(blob2)
	let buffer = toBuffer(blob2.buffer)
	let imageName_rot = 'image_rot.png';
	fs.createWriteStream(imageName_rot).write(buffer)
	
	let n_int = 0
	let int = setInterval(function(){
	    if(n_int == 1){
		socket.emit('open_dashboard_rotation_link')

		console.log("sent")
	    } else if (n_int == 2){
		clearInterval(int)
	    }
	    n_int ++;
	}, 1000)
    });
    
    socket.on("blob-inc", function(blob3){
	console.log(blob3)
	let buffer = toBuffer(blob3.buffer)
	let imageName_inc = 'image_inc.png';
	fs.createWriteStream(imageName_inc).write(buffer)
	
	let n_int = 0
	let int = setInterval(function(){
	    if(n_int == 1){
		socket.emit('open_dashboard_inclination_link')

		
	    } else if (n_int == 2){
		clearInterval(int)
	    }
	    n_int ++;
	}, 1000)
	
	
    });
    
    
});

function toBuffer(ab){
    var buf = new Buffer.from(ab);
    
    return buf;
}

function calculateEuler(R_cal,RS){
	let alfa_ = 0
	let beta_ = 0
	let gamma_ = 0;
	
	if(dcm_mode){
		RT = matrix.multiply(R_cal, RS)
		//console.log(alfa + "," + beta + "," + gamma)

		
		if (planoMovimiento.toString() == "cervical"){
			try{
				alfa_ = Math.atan2(RT[0][2], RT[0][0]) * 180 / Math.PI;   // extension flexion
				beta_ = Math.asin(RT[0][1]) * 180 / Math.PI;		  // inclinacion 
				gamma_ = -Math.atan2(-RT[2][1], RT[1][1]) * 180 / Math.PI; // rotacion
				
			} catch(e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
			
		} else if ((planoMovimiento.toString() == "codo_derecho") | (planoMovimiento.toString() == "codo_derecho")){
			try{
				// IAQUIERDO  . ESTE ES EL QUE TIENE SENTIDO
				// flexion / extension
				// supinacion/pronacion    fuera/ dentro     
				//
				 
				//derecho
				alfa_ = Math.atan2(-RT[1][0], RT[0][0]) * 180 / Math.PI;   // extension/flexion   
				beta_ = Math.atan2(RT[2][1], RT[2][2]) * 180 / Math.PI;    // pronosupinacion     dentro/fuera 
				gamma_ = Math.asin(RT[1][0]) * 180 / Math.PI;              // no tiene
				
				if (RT[0, 0] < 0 && RT[1, 0] > 0 && beta < -80){

				    alfa_ = Math.atan2(RT[1][0], RT[0][0]) * 180 / Math.PI - 360; // flexoextensión de codo
				}
			} catch(e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
			
		} else if ((planoMovimiento.toString() == "muñeca_derecha") | (planoMovimiento.toString() == "muñeca_izquierda")){
			try{
				
				// IZQUIERDA
				// EXT/FLEXION
				// CUBITAL/RADIAL   FUERA/DENTRO
				
				
				// DERECHA
				// CONVENIO desviacion radial y cubital + FLEXOEXTENSION
				alfa_ = Math.atan2(-RT[2][0], RT[0][0])*180 / Math.PI;      // EXT/FLEXION
				beta_ =  Math.asin(-RT[1][0])*180 / Math.PI;    //  desv. CUBITAL/RADIAL    FUERA/DENTRO 
				gamma_ = Math.atan2(-RT[1][2], RT[1][1]) * 180 / Math.PI;    // NO TIENE
				
						
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
			
		} else if (planoMovimiento.toString() == "lumbar"){
			try{
				alfa_ = -Math.atan2(RT[0][2], RT[0][0]) * 180 / Math.PI; // EXTENSION/FLEXION
				beta_ = -Math.asin(RT[0][1]) * 180 / Math.PI; // Inclinación   IZQUIERDA/DERECHA
				gamma_ = -Math.atan2(-RT[2][1], RT[1][1]) * 180 / Math.PI; // rotacion  DERECHA/IZQUIERDA
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
			
		} else if((planoMovimiento.toString() == "rodilla_derecha") | (planoMovimiento.toString() == "rodilla_izquierda")){
		    
			// IZQUIERDA CARGA Y DESCARGA
			// EXTENSION/FLEXION
			
			try{
											//DERECHA CARGA Y DESCARGA
				alfa_ = Math.atan2(RT[0][2], RT[0][0]) * 180 / Math.PI; // FLEXION/EXTENSION
				beta_ = Math.asin(RT[0][1]) * 180 / Math.PI; // NO HAY
				gamma_= Math.atan2(-RT[2][1], RT[1][1]) * 180 / Math.PI; // NO HAY
				
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
				
		} else if ((planoMovimiento.toString() == "tobillo_izquierdo") | (planoMovimiento.toString() == "tobillo_derecho")){
			//IZQUIERDO CARGA
			//DORSAL/PLANTAR
			//INVERSION/EVERSION
			
			try{									//DERECHO CARGA
				alfa_ = Math.atan2(-RT[2][0], RT[0][0]) * 180 / Math.PI;  // FlexION PLANTAR / FLEXION DORSAL 
				beta_ = Math.atan2(-RT[1][2], RT[1][1]) * 180 / Math.PI;  // EVERSION / INVERSION
				gamma_ = 0 //no hay
				
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
			
		} else if (( planoMovimiento.toString() == "hombro_izquierdo") | ( planoMovimiento.toString() == "hombro_derecho")){
			try{
			    // arr/abajo
			    // izquierdo: //flexext
					  //abd/add
					  //ext/int
			    //derecho
				alfa_ = Math.atan2(-RT[2][0], RT[0][0]) * 180 / Math.PI;  // flexext   
				beta_ = Math.atan2(-RT[0][1], RT[1][1]) * 180 / Math.PI;  // add/abd  
				gamma_ = Math.atan2(-RT[1][2], RT[1][1]) * 180 / Math.PI;  // rot interna/externa
				if (alfa_ > 120) {	
					alfa_ = alfa_- 360; // En un movimiento de abducción, el ángulo nunca podrá llegar a ser mayor que 100 (SE MOVERÁ EN EL RANGO NEGATIVO), si es así hay que aplicar la correción
				}
				
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
		} else if ((planoMovimiento.toString() == "cadera_izquierda") | (planoMovimiento.toString() == "cadera_derecha")){
		    
			// IZQUIERDA
			// FLEXION/EXTENSION
			// ADD/ABD
			// ROT INTERNA/EXTERNA
		    
		    
			//DERECHA
			try{
				alfa_ = Math.atan2(-RT[2][0], RT[2][2]) * 180 / Math.PI;   // EXTENSION/FLEXION    AL REVES ESCRITO!
				beta_ = Math.atan2(-RT[0][1], RT[1][1]) * 180 / Math.PI;   // adb/add 
				gamma_ = Math.atan2(-RT[1][2], RT[1][1]) * 180 / Math.PI;  // rot EXTERNA/INTERNA
				
			} catch (e){
				console.log("Alfa, beta, gamma calcs, error: " + e);
			}
		}
	}
	let angles = [alfa_,beta_,gamma_]
	return angles

	
}
function calibrateIMU(RS_){
	n = 1;
	let R_cal_ = RS_
	R_cal_ = R_cal_.transpose()
	
	return R_cal_
}

function hex2a_general(hexx, lasthex, is_first_data) {
    var hex = hexx.toString();//force conversion
    var message = [];
    var newhex = "";
    
    if(is_first_data){
		is_first_data = false;
		lasthex = "";
		var splitted = [];
			
	} else {
		for (var i = 0; i < hex.length; i++){
			if (!(hex[i] == "\r" || hex[i] == "\n")){
				newhex += hex[i];
			}
		}
		
		newhex = lasthex + newhex;
		if (newhex.includes("#")){
			var splitted = newhex.split("#");
		} else {
			var splitted = []
		}
	
	}
	
    message.push(splitted)
    message.push(is_first_data)
    return message; 
}

var connected_PMSensors_addresses = [];
function connect_bt_device(socket, bt_object, status_boolean, sensor_name, str_device){
	console.log(sensor_name)
	if (!status_boolean){
		status_boolean = false;
		var deviceNotFound = true;
		var pairedDevices = bt_object.scan()
		.then(function(devices) {
			console.log("[Bt] Scanning devices ...");
			console.log(devices)
			
			// Check if the device is switch on and close to the raspberry
			for (let i = 0; i < devices.length; i++) {
				
				if(deviceNotFound){
					var device_name = devices[i].name;
					var device_address = devices[i].address;
							
				
					// case sensors ProMotion 
					/*if (device_name.substr(device_name.length -3) == "-PM"){
						if(!connected_PMSensors_addresses.includes(device_address)){
							deviceNotFound = false;
							connected_PMSensors_addresses.push(str_device);
							connected_PMSensors_addresses.push(device_address);
						}
					}*/
					
					if(device_name == sensor_name){
						deviceNotFound = false;
					};
					
					// Device found
					if(!deviceNotFound){
						bt_object.connect(device_address)
						.then(function() {
							console.log('[Bt] Bluetooth connection established with device name: ' + device_name)
							socket.emit('ProMotion:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 0,
							})
							if (str_device == "imu1"){
								is_imu1_connected = true;
							
							} else if (str_device == "imu2"){
								is_imu2_connected = true;
							
							}
							
						})
						.catch(function(err) {
							// The device has not been found.
							var deviceNotFound = false;
							connected_PMSensors_addresses.pop(device_address);
							console.log('[Error] Device: ' + device_name , err);
							
							// message status in case GAMES interface
							socket.emit('ProMotion:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 1
							})
						})
					}
				}
			}
			
			// Device not found
			if(deviceNotFound){
				console.log("device not found!");
				// message status in case GAMES interface
				socket.emit('ProMotion:connection_status', {   
					device: str_device,
					// status--> 0: connect, 1: disconnect, 2: not paired/not found
					status: 2
				})
			} 
		});
		
	
		
	}else{
		console.log('[Bt] The device is already connected!')
		var interval1 = setInterval(function(){
		    socket.emit('ProMotion:connection_status', {
			device: str_device,
			// status--> 0: connect, 1: disconnect, 2: not paired
			status: 0
		    }) 
		    if(status_msg_rcv){
			clearInterval(interval1)
		    }
		}, 1000);
		
    }
	
}

function disconnect_bt_device(socket, bt_object, status_boolean, str_device){
    if (status_boolean){
		if (connected_PMSensors_addresses.includes(str_device)){
			let index = connected_PMSensors_addresses.indexOf(str_device);
			connected_PMSensors_addresses.splice(index+1, 1);
			connected_PMSensors_addresses.pop(str_device);
		}
		bt_object.close()
		.then(function() {
			console.log('[Bt] Bluetooth connection successfully closed ');
			status_boolean = false;
			socket.emit('ProMotion:connection_status', {
					device: str_device,
					// status--> 0: connect, 1: error, 2: not paired, 3: disconnected
					status: 3,
				})
		
		})
		.catch(function(err) {
			console.log('Connetion already close')
			
		})
	
		if (str_device == "imu1"){
			is_imu1_connected = false;
			dcm_mode = false;
		} else if (str_device == "imu2"){
			is_imu2_connected = false;
		
		}	
				
	}
	
}

function scan_bluetooth_devices(socket, bt_object){
	let devices_list = []
	var pairedDevices = bt_object.scan()
	.then(function(devices) {
		console.log("[Bt] Scanning devices ...");
		console.log(devices)
		
		for (let i = 0; i < devices.length; i++) {
			var device_name = devices[i].name;
			devices_list.push(device_name)
			
			
		}
		console.log(devices_list)
		
		socket.emit("bluetooth_scan_list", {
			list: devices_list			
		});
	})
	.catch(function(err){
		console.log(err)
	});
}

