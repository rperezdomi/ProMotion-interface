const socket = io();

socket.emit('games:mode_update', {
	mode : 'games'
});

var is_imu_connected = false;
var update_counter = 0;

	
window.onload = function(){ 
	
	//*********************************//
	//** CHARTS CONFIGURATION  **//
	//*********************************//
	var ctxalfa = document.getElementById('alfa_chart').getContext('2d');
	var ctxbeta = document.getElementById('beta_chart').getContext('2d');
	var ctxgamma = document.getElementById('gamma_chart').getContext('2d');

	// charts sizes:
	ctxalfa.canvas.height = 340;
	ctxbeta.canvas.height = 340;
	ctxgamma.canvas.height = 340;

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
					max: 50,    // maximum will be 70, unless there is a lower value.
					min: -50    // minimum will be -10, unless there is a lower value.  
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
			}]
		},
		options: Object.assign({}, commonOptions_IMU)		
	});
	var beta_chart_instance = new Chart(ctxbeta, {
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
	
	
	/////////////////////////////////////////////////////////////
	/////////////////// INTERFACE INTERACTION ///////////////////
	/////////////////////////////////////////////////////////////
	
	document.getElementById("connect_imu").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_imu").value == "off") {
			document.getElementById("connect_imu").value = "connecting";
			document.getElementById("connect_imu").style.background = "#808080";
			document.getElementById("connect_imu").innerHTML = "Conectando...";
			socket.emit('pressure:connect_imu1');
			console.log("connnect")

		// Stop emg_connection
		} else if (document.getElementById("connect_imu").value == "on") {
			document.getElementById("connect_imu").value = "off";
			document.getElementById("connect_imu").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu").style.background = "#4e73df";
			socket.emit('pressure:disconnect_imu1');

		} else if (document.getElementById("connect_imu").value == "connecting") {
			document.getElementById("connect_imu").value = "off";
			document.getElementById("connect_imu").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu").style.background = "#4e73df";
			socket.emit('pressure:disconnect_imu1');
		}
	}	
	
	document.getElementById("record").onclick = function() {
		socket.emit('pressure:start');
		document.getElementById("record").disabled = true;
		document.getElementById("stop").disabled = false;
		
	}
	document.getElementById("stop").onclick = function() {
		socket.emit('pressure:stop');
		document.getElementById("record").disabled = false;
		document.getElementById("stop").disabled = true;
		document.getElementById("save").disabled = false;
		
	}
	document.getElementById("save").onclick = function() {
		socket.emit('pressure:download');
		document.getElementById("save").disabled = true;
		window.open('http://192.168.43.1:3000/downloadpressuresensor');
		
	}
	document.getElementById("calibrate").onclick = function() {
		socket.emit('pressure:calibrate');
		console.log("calibrate");		
	}
	
	/////////////////////////////////////////////////
	/////////// REAL-TIME VISUALIZATION /////////////
	/////////////////////////////////////////////////
	socket.on('pressure:connection_status', (data) => {
		let device= data.device;
		let status= data.status;
		console.log(data);
		if(device == 'imu1'){
			if (status==0){
				console.log("is con")
				//change button color and text;
				document.getElementById("connect_imu").value = "on";
				document.getElementById("connect_imu").innerHTML = "Desconectar IMU";
				document.getElementById("connect_imu").style.background = "#4eb14e";
				document.getElementById("calibrate").style.display = "block";
				is_imu_connected = true
				n = 1;
				const limitedInterval = setInterval(() => {
					if (n > 3){
						socket.emit('pressure:calibrate');	
						clearInterval(limitedInterval);	
					} 
					n++
					
				}, 1000)

				document.getElementById("record").disabled = false;
				
				resetGraphs()
				
			} else if (status == 1 || status == 2){
				console.log("error connection / disconnection")
				hideIMUDatasets();
				document.getElementById('calibrate').style.display = "none";
				//change button color and text;
				document.getElementById("connect_imu").value = "off";
				document.getElementById("connect_imu").innerHTML = "Conectar IMU";
				document.getElementById("connect_imu").style.background = "#4e73df";
				is_imu_connected = false;
				
				document.getElementById("record").disabled = true;
				document.getElementById("stop").disabled = true;
				document.getElementById("save").disabled = true;
				
				
			}

		}
	});

	socket.on('pressure:data', (data) => {
		alfa = data.alfa;
		beta = data.beta;
		gamma = data.gamma;
		
		
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

		/*if(segundos.toString().length < 2){
			segundos = '0' + segundos;
		}
		*/
		let label = minutos + '-' + segundos + '-' + milisegundos;
		console.log(label)
		if(is_imu_connected){
			//Update data value
			alfa_chart_instance.data.datasets[0].data.push(alfa);
			beta_chart_instance.data.datasets[0].data.push(beta);
			gamma_chart_instance.data.datasets[0].data.push(gamma);
			
			alfa_chart_instance.data.labels.push(label);
			beta_chart_instance.data.labels.push(label);
			gamma_chart_instance.data.labels.push(label);
			
			if(update_counter > 99){
				// Remove first data value  in array
				alfa_chart_instance.data.datasets[0].data.shift()
				beta_chart_instance.data.datasets[0].data.shift();
				gamma_chart_instance.data.datasets[0].data.shift();
				
				// Remove first data label in array
				alfa_chart_instance.data.labels.shift()
				beta_chart_instance.data.labels.shift();
				gamma_chart_instance.data.labels.shift();
			}
			
			
		} else {
			alfa_chart_instance.data.labels = ['00:00', '00:01'];
			beta_chart_instance.data.labels = ['00:00', '00:01'];
			gamma_chart_instance.data.labels = ['00:00', '00:01'];
		}
		
		
		update_counter ++
		
		alfa_chart_instance.update();
		beta_chart_instance.update();
		gamma_chart_instance.update();
		
		

	});
	
	function resetGraphs(){
		update_counter = 0;
		
		if(is_imu_connected){
			alfa_chart_instance.data.datasets[0].data = [];
			beta_chart_instance.data.datasets[0].data = [];
			gamma_chart_instance.data.datasets[0].data = [];
			alfa_chart_instance.data.labels = [];
			beta_chart_instance.data.labels = [];
			gamma_chart_instance.data.labels = [];
			
			// show data
			alfa_chart_instance.data.datasets[0].hidden = false;
			beta_chart_instance.data.datasets[0].hidden = false;
			gamma_chart_instance.data.datasets[0].hidden = false;
		}
		
	}
	
	function hideIMUDatasets(){
		alfa_chart_instance.data.datasets[0].hidden = true;
		beta_chart_instance.data.datasets[0].hidden = true;
		gamma_chart_instance.data.datasets[0].hidden = true;
	}
	
}


