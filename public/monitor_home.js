const socket = io();

var global_config_data = {}
var global_data = "alfa"

var is_imu1_connected = false;
var is_imu2_connected = false;
var update_counter = 0;

var alfa_texts;
var beta_texts;
var gamma_texts;

var upper_text;
var lower_text;
var title_text;
var movements_array;
var n_movement = 0;

var current_session_id ;
	
window.onload = function(){ 
	
	console.log("ask");
	socket.emit('monitoring:ask_therapy_settings', {
		mode : 'ProMotion'
	});

	socket.on('monitoring:get_therapy_settings', (data) => {
		console.log(data)
		global_config_data = data;
		
		if(global_config_data.joint == "cervical"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Right","Left", "Inclination"]
			gamma_texts = ["Right","Left", "Rotation"]
			
		} else if(global_config_data.joint == "hombro_derecho"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension" ]
			beta_texts = ["Adduction","Abduction", "Adduction/Abduction"]
			gamma_texts = ["External","Internal", "Rotation"]
	
		} else if(global_config_data.joint == "hombro_izquierdo"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Abduction","Adduction", "Abduction/Adduction"]
			gamma_texts = ["Internal","External", "Rotation"]
			
		} else if(global_config_data.joint == "codo_derecho"){
			movements_array = [1,2]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Supination","Pronation", "Supination/Pronation"]
			gamma_texts = ["","", ""]
			
		} else if(global_config_data.joint == "codo_izquierdo"){
			movements_array = [1,2]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Pronation","Supination", "Pronation/Supination"]
			gamma_texts = ["","", ""]
			
		} else if(global_config_data.joint == "muñeca_derecha"){
			movements_array = [1,2]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Desv. Radial","Desv. Cubital", "Desv. Radial/Cubital"]
			gamma_texts = ["","", ""]
			
		} else if(global_config_data.joint == "muñeca_izquierda"){
			movements_array = [1,2]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Desv. Cubital","Desv. Radial", "Desv. Radial/Cubital"]
			gamma_texts = ["",""]
			
		} else if(global_config_data.joint == "lumbar"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Extension/Flexion"]
			beta_texts = ["Right","Left", "Inclination"]
			gamma_texts = ["Right","Left", "Rotation"]
			
		} else if(global_config_data.joint == "cadera_izquierda"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Adduction","Abduction", "Adduction/Abduction"]
			gamma_texts = ["External","Internal", "Rotation"]
			
		} else if(global_config_data.joint == "cadera_derecha"){
			movements_array = [1,2,3]
			alfa_texts = ["Extension","Flexion", "Flexion/Extension"]
			beta_texts = ["Abduction","Adduction", "Abduction/Adduction"]
			gamma_texts = ["Internal","External", "Rotation"]
			
		} else if(global_config_data.joint == "rodilla_derecha"){
			movements_array = [1]
			alfa_texts = ["Flexion","Extension", "Flexion/Extension"] 
			beta_texts = ["","", ""]
			gamma_texts = ["","",""]
			
		} else if(global_config_data.joint == "rodilla_izquierda"){
			movements_array = [1]
			alfa_texts = ["Flexion","Extension", "Flexion/Extension"]
			beta_texts = ["","", ""]
			gamma_texts = ["","", ""]
			
		} else if(global_config_data.joint == "tobillo_derecho"){
			movements_array = [1,2]
			alfa_texts = ["Flexion Plantar","Flexion Dorsal", "Plantar/Dorsal Flexion"]
			beta_texts = ["Left","Right","Inclination"]
			gamma_texts = ["","",""]
			
		} else if(global_config_data.joint == "tobillo_izquierdo"){
			movements_array = [1,2]
			alfa_texts = ["Flexion Plantar","Flexion Dorsal", "Plantar/Dorsal Flexion"]
			beta_texts = ["Right","Left","Inclination"]
			gamma_texts = ["","",""]
		}  
		
		
		upper_text = alfa_texts[0]
		lower_text = alfa_texts[1]
		title_text = alfa_texts[2]
		
		document.getElementById("joint").innerHTML = global_config_data.joint.split("_").join(" ").toUpperCase();
		
		//document.getElementById('connect_imu1').style.display = "block";
		//document.getElementById('connect_imu2').style.display = "block";

		//if (global_config_data.number_of_sensors.toString() == "1"){
		//	document.getElementById('connect_imu2').style.display = "none";
		//} 	
		
		console.log(global_config_data)
		if(document.referrer != '192.168.43.1:3000/ProMotion_settings.html' | document.referrer != 'localhost:3000/ProMotion_settings.html' ){
			location.replace("localhost:3000/ProMotion_settings.html");
			location.replace("192.168.43.1:3000/ProMotion_settings.html");
			console.log("previous page was not settings. Lets try to connect the sensor/s")
			//socket.emit('ProMotion:connect_imu1', {sensor_name: global_config_data.sensor_1})
			

		} else {
			console.log("previous page was "+ document.referrer)
		}
	});

	
	//*********************************//
	//** CHARTS CONFIGURATION  **//
	//*********************************//
	var ctxalfa = document.getElementById('alfa_chart').getContext('2d');
	//var ctxbeta = document.getElementById('beta_chart').getContext('2d');
	//var ctxgamma = document.getElementById('gamma_chart').getContext('2d');

	// charts sizes:
	ctxalfa.canvas.height = 340;
	//ctxbeta.canvas.height = 340;
	//ctxgamma.canvas.height = 340;

	var commonOptions = {
		font: {
			size: 16
		},
		scales: {
			xAxes: [{
				type: 'time',
    			time: {
					parser: 'mm-ss-SSS',
        			tooltipFormat: 'HH:mm',
        			displayFormats: {
            			millisecond: 'mm:ss.SSS',
            			second: 'mm:ss',
            			minute: 'mm'
        			}
    			},
				scaleLabel: {
					fontSize: 18,
					display: true,
					labelString: 'Tiempo (s)'
				},
				ticks: {
					fontSize: 18,
					autoSkip: true,
					sampleSize: 5,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				ticks: {
                    //display: false,
					max: 100,    // maximum will be 70, unless there is a lower value.
					min: 0    // minimum will be -10, unless there is a lower value.  
				},
				scaleLabel: {
					display: true,
					labelString: 'Grados (º)'
				}
			}]
		},
		
		maintainAspectRatio: false,
		//showLines: false, // disable for a single dataset
		animation: {
			duration: 0 // general animation time
		},
		elements: {
			line: {
				tension: 0.1 // disables bezier curves
			},
			point:{
				radius: 0
			}
		}
	};
	var commonOptions_IMU = {
		font: {
			size: 16
		},
		scales: {
			xAxes: [{
				type: 'time',
    			time: {
					parser: 'mm-ss-SSS',
        			tooltipFormat: 'HH:mm',
        			displayFormats: {
            			millisecond: 'mm:ss.SSS',
            			second: 'mm:ss',
            			minute: 'mm'
        			}
    			},
				scaleLabel: {
					fontSize: 18,
					display: true,
					labelString: 'Tiempo (s)'
				},
				ticks: {
					fontSize: 18,
					autoSkip: true,
					sampleSize: 5,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				ticks: {
                    //display: false,
					max: 80,    // maximum will be 70, unless there is a lower value.
					min: -80    // minimum will be -10, unless there is a lower value.  
				},
				scaleLabel: {
					display: true,
					labelString: 'Grados (º)'
				}
			}]
		},
		legend:{
			display:false
		},
		maintainAspectRatio: false,
		//showLines: false, // disable for a single dataset
		animation: {
			duration: 0 // general animation time
		},
		elements: {
			line: {
				tension: 0.1 // disables bezier curves
			},
			point:{
				radius: 0
			}
		}
	};
	
	var alfa_chart_instance = new Chart(ctxalfa, {
		type: 'line',
		data: {
			datasets: [{label: 'alfa',
				data: 0,
				fill: false,
				hidden: true,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointBorderWidth: [],
				pointStyle: 'line'
			},{
				label: 'left',
				data: 0,
				borderColor: '#add8e6',
				borderWidth: 0.5,
				FillColor: '#add8e6',
				fill: true,
				hidden: true,
				pointStyle: 'line'
			},{
				label: 'Right',
				data: 0,
				borderColor: '#add8e6',
				borderWidth: 0.5,
				FillColor: '#add8e6',
				fill: true,
				hidden: true,
				pointStyle: 'line'
			}]
				
		},
		options: Object.assign({}, commonOptions_IMU)		
	});
	/*var beta_chart_instance = new Chart(ctxbeta, {
		type: 'line',
		data: {
			datasets: [{label: 'beta',
				data: 0,
				fill: false,
				hidden: true,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointBorderWidth: [],
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions_IMU)		
	});
	var gamma_chart_instance = new Chart(ctxgamma, {
		type: 'line',
		data: {
			datasets: [{label: 'gamma',
				data: 0,
				fill: false,
				hidden: true,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointBorderWidth: [],
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions_IMU)		
	});
	*/
	
	/////////////////////////////////////////////////////////////
	/////////////////// INTERFACE INTERACTION ///////////////////
	/////////////////////////////////////////////////////////////
	
	/*
	document.getElementById("connect_imu1").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_imu1").value == "off") {
			document.getElementById("connect_imu1").value = "connecting";
			document.getElementById("connect_imu1").style.background = "#808080";
			document.getElementById("connect_imu1").innerHTML = "Conectando...";
			socket.emit('ProMotion:connect_imu1', {
				sensor_name: global_config_data.sensor_1
				});

		// Stop emg_connection
		} else if (document.getElementById("connect_imu1").value == "on") {
			document.getElementById("connect_imu1").value = "off";
			document.getElementById("connect_imu1").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu1").style.background = "#4e73df";
			document.getElementById('record').disabled = true;
			is_imu1_connected = false;
			socket.emit('ProMotion:disconnect_imu1');

		} else if (document.getElementById("connect_imu1").value == "connecting") {
			document.getElementById("connect_imu1").value = "off";
			document.getElementById("connect_imu1").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu1").style.background = "#4e73df";
			socket.emit('ProMotion:disconnect_imu1');
		}
	}	
	*/
	document.getElementById("record").onclick = function() {
		socket.emit('ProMotion:start');
		document.getElementById("record").disabled = true;
		document.getElementById("stop").disabled = false;
		document.getElementById("go_to_dashboard").style.display="none";
		
	}
	document.getElementById("stop").onclick = function() {
		socket.emit('ProMotion:stop');
		document.getElementById("record").disabled = false;
		document.getElementById("stop").disabled = true;
		document.getElementById("save").disabled = false;
		
	}
	document.getElementById("save").onclick = function() {
		socket.emit('ProMotion:addsessiondata');
		document.getElementById("save").disabled = true;
		
	}
	
	document.getElementById("go_to_dashboard").onclick = function() {
		console.log("gotodashboard clicked")
		socket.emit("monitor_home:study_case_to_dashboard", current_session_id)			
		location.replace("summary.html");
	}
	document.getElementById("calibrate").onclick = function() {
		if(global_config_data.number_of_sensors == 1){
			socket.emit('ProMotion:calibrate',1);
		} else if (global_config_data.number_of_sensors == 2){
			socket.emit('ProMotion:calibrate',1);
			socket.emit('ProMotion:calibrate',2);
		}

		console.log("calibrate");		
	}
	
	document.getElementById("next").onclick = function(){
		//let phase = document.getElementById("next").value;
		
		
		if(n_movement < movements_array.length-1){
			n_movement++
		} else {
			n_movement = 0;
		}
		
		let phase = movements_array[n_movement]-1
		
		resetGraphs()
		console.log(phase)
		if (phase == 0){
			upper_text = alfa_texts[0]
			lower_text = alfa_texts[1]
			title_text = alfa_texts[2]
			document.getElementById("next").value = "1"
			alfa_chart_instance.data.datasets[0].label = "alfa"
			document.getElementById("inclinacion").style.display = 'none'
			
			var max_to_fill = parseInt(global_config_data.flexext_max) + 5
			var min_to_fill = parseInt(global_config_data.flexext_min) + 5
			
			global_data = "alfa"
			
		} else if(phase == 1){
			upper_text = beta_texts[0]
			lower_text = beta_texts[1]
			title_text = beta_texts[2]
			document.getElementById("next").value = "2"
			alfa_chart_instance.data.datasets[0].label = "beta"
			
			var max_to_fill = parseInt(global_config_data.inc_max) + 5
			var min_to_fill = parseInt(global_config_data.inc_min) + 5
			
			global_data = "beta"
			
		} else if (phase == 2){
			upper_text = gamma_texts[0]
			lower_text = gamma_texts[1]
			title_text = gamma_texts[2]
			document.getElementById("next").value = "3"
			alfa_chart_instance.data.datasets[0].label = "gamma"
			
			var max_to_fill = parseInt(global_config_data.rot_max) + 5
			var min_to_fill = parseInt(global_config_data.rot_min) + 5
						
			global_data = "gamma"
			
		}
		
		alfa_chart_instance.data.datasets[1].label = upper_text
		alfa_chart_instance.data.datasets[2].label = lower_text
		document.getElementById("graph").innerHTML = title_text
		
		alfa_chart_instance.data.datasets[1].fill = "origin";
		alfa_chart_instance.data.datasets[2].fill = "origin";
		
		socket.emit("monitoring:set_movement", (movements_array[n_movement]+1));
	}
	
	document.getElementById("connect_disconnect_sensor").onclick = function(){
		document.getElementById("connect_disconnect_sensor").disabled = true;
		document.getElementById("connection_status").innerHTML = "Connection Status: Connecting...";

		// La conexion/desconexion del segundo sensor, en aquellos casos donde se use, se realizará al recibir la confirmación del primero.
		console.log(document.getElementById("connect_disconnect_sensor").value)
		if(document.getElementById("connect_disconnect_sensor").value == "off"){
			socket.emit('ProMotion:connect_imu1', {sensor_name: global_config_data.sensor_1})

		} else if (document.getElementById("connect_disconnect_sensor").value == "on"){
			socket.emit('ProMotion:disconnect_imu1')
			
		}
	}
	/////////////////////////////////////////////////
	/////////// REAL-TIME VISUALIZATION /////////////
	/////////////////////////////////////////////////
	socket.on('ProMotion:recorded_sessionData', (id) => {
		console.log("recorded data")
		current_session_id = id;
		document.getElementById("go_to_dashboard").style.display="inline";

		
	});
	
	var init= false;
	
	socket.on('ProMotion:connection_status', (data) => {
		let device= data.device;
		let status= data.status;
		console.log(data);
		let n_sensor = 0

		let calibrate = false;
		if(device == 'imu1'){
			if (status==0){
				console.log("is con")
				is_imu1_connected = true;
				
				if((global_config_data).number_of_sensors == 1){
					calibrate = true;
					n_sensor = 1;
					
				} else {
					console.log("2 sensors configured")
					if(is_imu2_connected){
						calibrate = true;
						n_sensor = 2;

					} else {
						document.getElementById("connection_status").innerHTML = "Conection Status: Sensor 1 Connected, Connecting Sensor 2...";
						socket.emit('ProMotion:connect_imu2', {sensor_name: global_config_data.sensor_2})
					}
				}
				
			} else {
				
				document.getElementById("connect_disconnect_sensor").disabled = false;
				console.log("error connection / disconnection")
				hideIMUDatasets();
				is_imu1_connected = false;


				document.getElementById('calibrate').style.display.innerHTML = "Connect";
				document.getElementById('connect_disconnect_sensor').style.display = "inline";
				document.getElementById('connect_disconnect_sensor').value= "off";
				document.getElementById('connect_disconnect_sensor').innerHTML= "Connect Sensor/s";


				//change button color and text;
				document.getElementById('calibrate').style.display = "none";
				document.getElementById("connection_status").value = "off";
				document.getElementById("connection_status").innerHTML = "Conection Status: Disconnected";
				document.getElementById("connection_status").style.background = "#4e73df";
				
				document.getElementById("record").disabled = true;
				document.getElementById("stop").disabled = true;
				document.getElementById("save").disabled = true;
				
				
			}

		}
		
		if(device == 'imu2'){
			if (status==0){
				console.log("is con 2")
				is_imu2_connected = true
				
				if(is_imu1_connected){
					calibrate = true;
					n_sensor = 2
				}
				
			} else {
				
				document.getElementById("connect_disconnect_sensor").disabled = false;
				console.log("error connection / disconnection")
				hideIMUDatasets();
				document.getElementById('calibrate').style.display = "none";
				document.getElementById('connect_disconnect_sensor').style.display = "block";
				document.getElementById('connect_disconnect_sensor').value= "off";
				document.getElementById('connect_disconnect_sensor').innerHTML= "Connect Sensor/s";

				//change button color and text;
				document.getElementById("connection_status").value = "off";
				document.getElementById("connection_status").innerHTML = "Conection Status: Disconnected";
				document.getElementById("connection_status").style.background = "#4e73df";
				is_imu2_connected = false;
				
				document.getElementById("record").disabled = true;
				document.getElementById("stop").disabled = true;
				document.getElementById("save").disabled = true;
				
			}

		}
		
		if(calibrate){
			
			document.getElementById("connect_disconnect_sensor").disabled = false;
			
			console.log("calibrate");
			//change button color and text;
			document.getElementById("connection_status").value = "on";
			if(n_sensor == 1){
				document.getElementById("connection_status").innerHTML = "Connection Status: Connected";
			} else if(n_sensor == 2){
				document.getElementById("connection_status").innerHTML = "Connection Status: Sensors 1 and 2 Connected";
			}
			document.getElementById("connection_status").style.background = "#4eb14e";
			document.getElementById("calibrate").style.display = "block";
			
			document.getElementById('connect_disconnect_sensor').innerHTML= "Disconnect Sensor/s";
			document.getElementById('connect_disconnect_sensor').value= "on";
			document.getElementById('connect_disconnect_sensor').style.display= "block";

			
			// CALIBRATE SENSOR 1
			n = 1;
			const limitedInterval = setInterval(() => {
				if (n > 3){
					socket.emit('ProMotion:calibrate', 1);	
					clearInterval(limitedInterval);	
				} 
				n++
				
			}, 1000)
				
			if (n_sensor ==2){
				
				// CALIBRATE SENSOR 2
				n = 1;
				const limitedInterval1 = setInterval(() => {
					if (n > 3){
						socket.emit('ProMotion:calibrate', 2);	
						clearInterval(limitedInterval1);	
					} 
					n++
					
				}, 1000)
			}
			

			document.getElementById("record").disabled = false;
			
			resetGraphs()
			
			init = true;
		} else {
			init = false;
		}
		
		console.log(connect_disconnect_sensor.innerHTML);	
		
		socket.emit('ProMotion:status_msg_rcv');
	});

	socket.on('ProMotion:data', (data) => {
		alfa = data.alfa;
		beta = data.beta;
		gamma = data.gamma;
		is_imu1_connected = data.is_imu1_connected;
		is_imu2_connected = data.is_imu2_connected;
		
		// Update data label
		let segundos = Math.trunc(update_counter/10);
		let milisegundos = (update_counter/10*1000 - segundos*1000)
		let minutos = Math.trunc(segundos/60);
		segundos = segundos - minutos*60; 
		
		if(Math.trunc(milisegundos).toString().length == 1){
			milisegundos = '00' + milisegundos;
		} else if(Math.trunc(milisegundos).toString().length == 2){
			milisegundos = '0' + milisegundos;
		} else if(Math.trunc(milisegundos).toString().length == 0){
			milisegundos = '000';
		}
		let label = minutos + '-' + segundos + '-' + milisegundos;
		
		if(init){
			if (global_data == 'alfa'){
				var data_ = alfa;
				var max_rom = global_config_data.flexext_max;
				var min_rom = global_config_data.flexext_min;
			}else if ( global_data == 'beta'){
				var data_ = beta;
				var max_rom = global_config_data.inclinacion_max;
				var min_rom = global_config_data.inclinacion_min;
			} else if(global_data =='gamma'){
				var data_ = gamma;
				var max_rom = global_config_data.rotacion_max;
				var min_rom = global_config_data.rotacion_min;
			}
			alfa_chart_instance.data.datasets[0].data.push(data_);
			alfa_chart_instance.data.datasets[1].data.push(parseInt(max_rom));
			alfa_chart_instance.data.datasets[2].data.push(parseInt(-min_rom));
			
			//beta_chart_instance.data.datasets[0].data.push(beta);
			//gamma_chart_instance.data.datasets[0].data.push(gamma);
			
			alfa_chart_instance.data.labels.push(label);
			//beta_chart_instance.data.labels.push(label);
			//gamma_chart_instance.data.labels.push(label);
			
			if(update_counter > 99){
				// Remove first data value  in array
				alfa_chart_instance.data.datasets[0].data.shift()
				alfa_chart_instance.data.datasets[1].data.shift()
				alfa_chart_instance.data.datasets[2].data.shift()
				//beta_chart_instance.data.datasets[0].data.shift();
				//gamma_chart_instance.data.datasets[0].data.shift();
				
				// Remove first data label in array
				alfa_chart_instance.data.labels.shift()
				//beta_chart_instance.data.labels.shift();
				//gamma_chart_instance.data.labels.shift();
			}
			
			
		} else {
			alfa_chart_instance.data.labels = ['00:00', '00:01'];
			//beta_chart_instance.data.labels = ['00:00', '00:01'];
			//gamma_chart_instance.data.labels = ['00:00', '00:01'];
		}
		
		
		update_counter ++
		
		alfa_chart_instance.update();
		//beta_chart_instance.update();
		//gamma_chart_instance.update();
		ctxalfa.font = "16px Arial";
		ctxalfa.fillStyle = "black";
		ctxalfa.fillText(upper_text,420,30);
		ctxalfa.fillText(lower_text,420, 260);
				

	});
	
	function resetGraphs(){
		update_counter = 0;
		
		if(is_imu1_connected){
			alfa_chart_instance.data.datasets[0].data = [];
			alfa_chart_instance.data.datasets[1].data = [];
			alfa_chart_instance.data.datasets[2].data = [];
			//beta_chart_instance.data.datasets[0].data = [];
			//gamma_chart_instance.data.datasets[0].data = [];
			alfa_chart_instance.data.labels = [];
			//beta_chart_instance.data.labels = [];
			//gamma_chart_instance.data.labels = [];
			
			// show data
			alfa_chart_instance.data.datasets[0].hidden = false;
			alfa_chart_instance.data.datasets[1].hidden = false;
			alfa_chart_instance.data.datasets[2].hidden = false;
			//beta_chart_instance.data.datasets[0].hidden = false;
			//gamma_chart_instance.data.datasets[0].hidden = false;
			
			let max_to_fill = parseInt(global_config_data.flexext_max) + 5
			console.log(global_config_data.flexext_max)
			console.log(max_to_fill)
			let min_to_fill = parseInt(global_config_data.flexext_min) + 5
			console.log(min_to_fill)
			alfa_chart_instance.data.datasets[1].fill = "origin";
			alfa_chart_instance.data.datasets[2].fill = "origin";
			
			document.getElementById("next").value = "1"
			alfa_chart_instance.data.datasets[0].label = "alfa"
			document.getElementById("graph").innerHTML = "Flexion/Extension"
			document.getElementById("inclinacion").style.display = 'none'
			global_data = "alfa"
		}
		
	}
	
	function hideIMUDatasets(){
		alfa_chart_instance.data.datasets[0].hidden = true;
		alfa_chart_instance.data.datasets[1].hidden = true;
		alfa_chart_instance.data.datasets[2].hidden = true;
		//beta_chart_instance.data.datasets[0].hidden = true;
		//gamma_chart_instance.data.datasets[0].hidden = true;
	}
	
}


