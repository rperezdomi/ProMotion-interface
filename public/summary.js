const socket = io();



window.onload = function(){ 
	
	var alfa_texts;
	var beta_texts;
	var gamma_texts;

	var upper_text;
	var lower_text;

	var global_data_sessions = [];
	var global_user_info = [];
	
	global_all_sessions_in_case_study = []
	global_selected_session_data=[]
	
	var global_sample_size_flexext = 0;
	var global_sample_size_rot = 0;
	var global_sample_size_inc = 0;

	var is_flexext_selected = true;
	var is_rotation_selected = false;
	var is_inclination_selected = false;

	var ctxalfa;
	var ctxbeta
	var ctxgamma;
	
	var alfa_chart_instance;
	var alfa_bars_chart;
	var beta_chart_instance;
	var beta_bars_chart;
	var gamma_chart_intance;
	var gamma_bars_chart;
	var alfa_AV_chart;
	var beta_AV_chart;
	var gamma_AV_chart;
	
	var commonOptions_IMU = {
		
		plugins:{ 
			annotation:{
				drawTime: 'afterDatasetsDraw',
				annotations:{
					line1: {
						type: 'line',
						yMin:40,
						yMax:40,
						borderColor:'rgb(255,99,132)',
						borderwidth:2
					}
				}
			}
		},
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
			display:true
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
	
	var commonOptions_AV = {
		font: {
			size: 16
		},
		scales: {
			xAxes: [{
				type: 'linear',
				scaleLabel: {
					fontSize: 12,
					display: true,
					labelString: 'Degrees (º)'
				},
				ticks: {
					fontSize: 12,
					autoSkip: true,
					sampleSize: 5,
					
				}
			}],
			yAxes: [{
				ticks: {
                    //display: false,
					suggestedMax: 100,    // maximum will be 70, unless there is a lower value.
					suggestedMin: -100    // minimum will be -10, unless there is a lower value.  
				},
				scaleLabel: {
					display: true,
					labelString: 'Angular Velocity'
				}
			}]
			
		},
		maintainAspectRatio: false,
		elements: {
			line: {
				tension: 0.1 // disables bezier curves
			},
			point:{
				radius: 0
			}
		
		}
		
	};
	
	
	create_flexext_chart()
	create_flexext_bars_chart()
	create_flexext_AV_chart()
	
	
	socket.emit("summary:get_user_info");
	socket.emit("summary:get_config_sessions");
	socket.emit('summary:get_sessions_data');
	
	
		
		
	socket.on("summary:set_user_info", function(data){
		console.log(data)
		global_user_info = data[0]
		let user_name = data[0].nombre_usuario + " " + data[0].apellido_usuario_1 + " " + data[0].apellido_usuario_2 ;
		document.getElementById("user-name").innerHTML = user_name;
		document.getElementById("birth_date").innerHTML = data[0].fecha_nacimiento;
		
	});
	
	socket.on("summary:set_config_info", function(data){
		console.log(data.selected_session_data)
		console.log(data.all_sessions_in_case_study)
		
		global_all_sessions_in_case_study = data.all_sessions_in_case_study
		console.log(global_all_sessions_in_case_study)
		global_selected_session_data = data.selected_session_data
		
		document.getElementById("study_case").innerHTML = data.selected_session_data.caso_estudio;
		document.getElementById("joint").innerHTML = data.selected_session_data.articulacion;
		
		if(data.selected_session_data.articulacion == "cervical"){
			alfa_texts = ["Extension","Flexion", ]
			beta_texts = ["Right","Left"]
			gamma_texts = ["Right","Left"]
			
		} else if(data.selected_session_data.articulacion == "hombro_derecho"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Adduction","Abduction"]
			gamma_texts = ["External","Internal"]
	
		} else if(data.selected_session_data.articulacion == "hombro_izquierdo"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Abduction","Adduction"]
			gamma_texts = ["Internal","External"]
			
		} else if(data.selected_session_data.articulacion == "codo_derecho"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Supination","Pronation"]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "codo_izquierdo"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Pronation","Supination"]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "muñeca_derecha"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Desv. Cubital","Desv. Radial"]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "muñeca_izquierda"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Desv. Radial","Desv. Cubital"]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "lumbar"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Right","Left"]
			gamma_texts = ["Right","Left"]
			
		} else if(data.selected_session_data.articulacion == "cadera_izquierda"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Adduction","Abduction"]
			gamma_texts = ["External","Internal"]
			
		} else if(data.selected_session_data.articulacion == "cadera_derecha"){
			alfa_texts = ["Extension","Flexion"]
			beta_texts = ["Abduction","Adduction"]
			gamma_texts = ["Internal","External"]
			
		} else if(data.selected_session_data.articulacion == "rodilla_derecha"){
			alfa_texts = ["Flexion","Extension"]
			beta_texts = ["",""]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "rodilla_izquierda"){
			alfa_texts = ["Flexion","Extension"]
			beta_texts = ["",""]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "tobillo_derecho"){
			alfa_texts = ["Flexion Plantar","Flexion Dorsal"]
			beta_texts = ["",""]
			gamma_texts = ["",""]
			
		} else if(data.selected_session_data.articulacion == "tobillo_izquierdo"){
			alfa_texts = ["Flexion Plantar","Flexion Dorsal"]
			beta_texts = ["",""]
			gamma_texts = ["",""]
		}  
		
		ask_for_data_sessions();
		
		upper_text = alfa_texts[0]
		lower_text = alfa_texts[1]
		
		
	});
	
	socket.on("summary:set_data_session1", function(data){
		console.log(data)
		console.log("Movimientos en sesion 1: " + data.length)
		for (i in data){
			if(data[i][0].movimiento == 1 & is_flexext_selected){
				
				if(	document.getElementById("flexext_tab").style.diplay == "none"){
					document.getElementById("flexext_tab").style.diplay = "block"
				}
				
				console.log(document.getElementById("flexext_tab").style)
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].alfa);
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}

				alfa_chart_instance.data.datasets[0].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_flexext){
					global_sample_size_flexext = data_vector.length
				}
				
				
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				let data_flexion_filtered = []
				let data_extension_filtered = []
				
				for(j = 0; j < global_sample_size_flexext; j++){
					
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(parseInt(global_all_sessions_in_case_study[0].ROM_flexion))
					data_vector_min.push(-parseInt(global_all_sessions_in_case_study[0].ROM_extension))
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_flexion_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_extension_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
					
					
				}
				alfa_chart_instance.data.labels = labels_vector
				alfa_chart_instance.data.datasets[3].data = data_vector_max;
				alfa_chart_instance.data.datasets[4].data = data_vector_min;
				alfa_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].borderColor = borderColor;
				alfa_chart_instance.data.datasets[4].borderColor = borderColor;
				alfa_chart_instance.data.datasets[3].fill = "origin";
				alfa_chart_instance.data.datasets[4].fill = "origin";
				alfa_chart_instance.update();
				
				console.log(alfa_texts)
				set_text(ctxalfa, alfa_texts)

				let n_maximas = getMaximas(data_vector_filtered)
				let n_minimums = getMinimums(data_vector_filtered)
				
				console.log(n_maximas)
				console.log(n_minimums)
				//let annotations = createAnotationsDict(n_maximas, n_minimums, data_vector_filtered, alfa_chart_instance)

				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(alfa_AV_chart, data_vector_filtered, angular_velocity_vector,'#FF2626',0)
				
				document.getElementById("flexext_positive").innerHTML=alfa_texts[0]
				document.getElementById("flexext_negative").innerHTML=alfa_texts[1]
				// BAR CHART
				buildBarsChart(alfa_bars_chart, [getMax(data_flexion_filtered), getMax(data_extension_filtered)],'#FF2626', '#FF2626', 0, alfa_texts)
				
				// TABLAS
				document.getElementById("flexext_body").innerHTML += "<tr><td> <span style='color: #FF2626;'> [" + global_all_sessions_in_case_study[0].ROM_flexion + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_flexion) + 5).toString() + "]</span> " + "</td><td> <span style='color:#FF2626'>[" + global_all_sessions_in_case_study[0].ROM_extension + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_extension) + 5).toString() + "]</span> </td></tr>" 
				document.getElementById("flexext_angles_flexion_body").innerHTML += "<tr><td> <span style='color:#FF2626;'>" + getMax(data_flexion_filtered) +
																					"</span></td><td> <span style='color:#FF2626;'>" + getMed(data_flexion_filtered) + 
																					"</span></td><td> <span style='color:#FF2626'>" + getDev(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" +getMax(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" +getMax(data_flexion_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("flexext_angles_extension_body").innerHTML += "<tr><td><span style='color:#FF2626'> " + getMax(data_extension_filtered) +
																					"</span></td><td> <span style='color:#FF2626'>" + getMed(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getDev(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getMax(data_extension_filtered)+ 
																					"</span></td><td><span style='color:#FF2626'> " + getMax(data_extension_filtered)+ 
																					"</span></td></tr>" 

			} else if(data[i][0].movimiento == 2 & is_rotation_selected){
				
				if(	document.getElementById("rotacion_tab").style.diplay == "none"){
					document.getElementById("rotacion_tab").style.diplay = "block"
				}
				
				var data_vector = []

				for(j in data[i]){
					data_vector.push(data[i][j].beta);
					
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				
				beta_chart_instance.data.datasets[0].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_rot){
					global_sample_size_rot = data_vector_filtered.length
					
				}
				
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_left_filtered = []
				var data_right_filtered = []
				
				for(j =0; j< global_sample_size_rot; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[0].ROM_rotacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[0].ROM_rotacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_left_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_right_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				beta_chart_instance.data.labels = labels_vector
				beta_chart_instance.data.datasets[3].data = data_vector_max;
				beta_chart_instance.data.datasets[4].data = data_vector_min;
				beta_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].borderColor = borderColor;
				beta_chart_instance.data.datasets[4].borderColor = borderColor;
				beta_chart_instance.data.datasets[3].fill = "origin";
				beta_chart_instance.data.datasets[4].fill = "origin";
				beta_chart_instance.update()
				
				set_text(ctxbeta, beta_texts)

				
				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(beta_AV_chart, data_vector_filtered, angular_velocity_vector,'#FF2626',0)
				
				// BAR CHART
				buildBarsChart(beta_bars_chart, [getMax(data_left_filtered), getMax(data_right_filtered)],'#FF2626', '#FF2626', 0, beta_texts)

				// TABLAS
				document.getElementById("rot_positive").innerHTML=beta_texts[0]
				document.getElementById("rot_negative").innerHTML=beta_texts[1]
				document.getElementById("rot_body").innerHTML += "<tr><td><span style='color:#FF2626'> [" + global_all_sessions_in_case_study[0].ROM_rotacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_rotacion_izq) + 5).toString() + "] </span>" + "</td><td> <span style='color:#FF2626'>[" + global_all_sessions_in_case_study[0].ROM_rotacion_der + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_rotacion_der) + 5).toString() + "] </span></td></tr>" 
				document.getElementById("rot_angles_left_body").innerHTML += "<tr><td> <span style='color:#FF2626'>" + getMax(data_left_filtered) +
																					"</span></td><td> <span style='color:#FF2626'>" + getMed(data_left_filtered) + 
																					"</span></td><td> <span style='color:#FF2626'>" + getDev(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getMax(data_left_filtered)+ 
																					"</span></td><td><span style='color:#FF2626'> " + getMax(data_left_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("rot_angles_right_body").innerHTML += "<tr><td> <span style='color:#FF2626'>" + getMax(data_right_filtered) +
																					"</span></td><td> <span style='color:#FF2626'>" + getMed(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getDev(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getMax(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#FF2626'>" + getMax(data_right_filtered)+ 
																					"</span></td></tr>" 
				
			} else if(data[i][0].movimiento == 3 & is_inclination_selected){
				
				if(	document.getElementById("inclinacion_tab").style.diplay == "none"){
					document.getElementById("inclinacion_tab").style.diplay = "block"
				}
				
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].gamma);
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				
				gamma_chart_instance.data.datasets[0].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_inc){
					global_sample_size_inc = data_vector_filtered.length
				}
				
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_left_filtered = []
				var data_right_filtered = []
				
				for(j =0; j< global_sample_size_inc; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[0].ROM_inclinacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[0].ROM_inclinacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_left_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_right_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				gamma_chart_instance.data.labels = labels_vector
				gamma_chart_instance.data.datasets[3].data = data_vector_max;
				gamma_chart_instance.data.datasets[4].data = data_vector_min;
				gamma_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].borderColor = borderColor;
				gamma_chart_instance.data.datasets[4].borderColor = borderColor;
				gamma_chart_instance.data.datasets[3].fill = "origin";
				gamma_chart_instance.data.datasets[4].fill = "origin";
				gamma_chart_instance.update()
				set_text(ctxgamma, gamma_texts)

				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(gamma_AV_chart, data_vector_filtered, angular_velocity_vector,'#FF2626',0)
				
				// BAR CHART
				buildBarsChart(gamma_bars_chart, [getMax(data_left_filtered), getMax(data_right_filtered)],'#FF2626', '#FF2626', 0, gamma_texts)
				
				// TABLES
				document.getElementById("inc_positive").innerHTML=gamma_texts[0]
				document.getElementById("inc_negative").innerHTML = gamma_texts[1]
				document.getElementById("inc_body").innerHTML += "<tr><td><span style='color:#FF2626'> [" + global_all_sessions_in_case_study[0].ROM_inclinacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_inclinacion_izq) + 5).toString() + "]</span> " + "</td><td> <span style='color:#FF2626'>[" + global_all_sessions_in_case_study[0].ROM_inclinacion_der + "-" + (parseFloat(global_all_sessions_in_case_study[0].ROM_inclinacion_der) + 5).toString() + "] </span></td></tr>" 
				document.getElementById("inc_angles_left_body").innerHTML += "<tr><td> <span style='color:#FF2626'>" + getMax(data_left_filtered) +
																				"</span></td><td><span style='color:#FF2626'> " + getMed(data_left_filtered) + 
																				"</span></td><td><span style='color:#FF2626'> " + getDev(data_left_filtered)+ 
																				"</span></td><td> <span style='color:#FF2626'>" + getMax(data_left_filtered)+ 
																				"</span></td><td> <span style='color:#FF2626'>" + getMax(data_left_filtered)+ 
																				"</span></td></tr><span style='color:#FF2626'>" 
				document.getElementById("inc_angles_right_body").innerHTML += "<tr><td> <span style='color:#FF2626'> " + getMax(data_right_filtered) +
																				"</span></td><td> <span style='color:#FF2626'>" + getMed(data_right_filtered)+ 
																				"</span></td><td> <span style='color:#FF2626'>" + getDev(data_right_filtered)+ 
																				"</span></td><td> <span style='color:#FF2626'>" + getMax(data_right_filtered)+ 
																				"</span></td><td><span style='color:#FF2626'> " + getMax(data_right_filtered)+ 
																				"</span></td></tr>" 
			
			
			
			}
		}
		
		
	});
	socket.on("summary:set_data_session2", function(data){
		console.log(data)
		console.log("Movimientos en sesion 2: " + data.length)
		for (i in data){
			//console.log(data[i][0].movimiento)
			if(data[i][0].movimiento == 1 & is_flexext_selected){
				
				if(	document.getElementById("flexext_tab").style.diplay == "none"){
					document.getElementById("flexext_tab").style.diplay = "block"
				}
				
				//console.log("flexext")
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].alfa);
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				
				alfa_chart_instance.data.datasets[1].data = data_vector_filtered;
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_flexext){
					global_sample_size_flexext = data_vector_filtered.length
				}
				
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_flexion_filtered=[]
				var data_extension_filtered =[]
				
				for(j = 0; j< global_sample_size_flexext; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(parseInt(global_all_sessions_in_case_study[1].ROM_flexion))
					data_vector_min.push(-parseInt(global_all_sessions_in_case_study[1].ROM_extension))
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_flexion_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_extension_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				alfa_chart_instance.data.labels = labels_vector
				alfa_chart_instance.data.datasets[3].data = data_vector_max;
				alfa_chart_instance.data.datasets[4].data = data_vector_min;
				alfa_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].borderColor = borderColor;
				alfa_chart_instance.data.datasets[4].borderColor = borderColor;
				alfa_chart_instance.data.datasets[3].fill = "origin";
				alfa_chart_instance.data.datasets[4].fill = "origin";
				set_text(ctxalfa, alfa_texts)
				alfa_chart_instance.update()


				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(alfa_AV_chart, data_vector_filtered, angular_velocity_vector,'#0000ff',1)

				// BAR CHART
				buildBarsChart(alfa_bars_chart, [getMax(data_flexion_filtered), getMax(data_extension_filtered)],'#0000ff', '#0000ff', 1, alfa_texts);
				
				//TABLES
				document.getElementById("flexext_positive").innerHTML= alfa_texts[0]
				document.getElementById("flexext_negative").innerHTML= alfa_texts[1]
				document.getElementById("flexext_body").innerHTML += "<tr><td> <span style='color:#0000ff'>[" + global_all_sessions_in_case_study[1].ROM_flexion + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_flexion) + 5).toString() + "]</span> " + "</td><td><span style='color:#0000ff'> [" + global_all_sessions_in_case_study[1].ROM_extension + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_extension) + 5).toString() + "]</span> </td></tr>" 
				document.getElementById("flexext_angles_flexion_body").innerHTML += "<tr><td><span style='color:#0000ff'> " + getMax(data_flexion_filtered) +
																					"</span></td><td><span style='color:#0000ff'> " + getMed(data_flexion_filtered) + 
																					"</span></td><td> <span style='color:#0000ff'>" + getDev(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_flexion_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("flexext_angles_extension_body").innerHTML += "<tr><td> <span style='color:#0000ff'>" + getMax(data_extension_filtered) +
																					"</span></td><td> <span style='color:#0000ff'>" + getMed(data_extension_filtered)+ 
																					"</span></td><td><span style='color:#0000ff'> " + getDev(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_extension_filtered)+ 
																					"</span></td></tr>" 
			} else if(data[i][0].movimiento == 2 & is_rotation_selected){
				
				if(	document.getElementById("rotacion_tab").style.diplay == "none"){
					document.getElementById("rotacion_tab").style.diplay = "block"
				}
				
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].beta);
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				beta_chart_instance.data.datasets[1].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_rot){
					global_sample_size_rot = data_vector_filtered.length
				}
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_left_filtered=[]
				var data_right_filtered=[]
				
				for(j =0; j< global_sample_size_rot; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[1].ROM_rotacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[1].ROM_rotacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_left_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_right_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
					
				}
				beta_chart_instance.data.labels = labels_vector
				beta_chart_instance.data.datasets[3].data = data_vector_max;
				beta_chart_instance.data.datasets[4].data = data_vector_min;
				beta_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].borderColor = borderColor;
				beta_chart_instance.data.datasets[4].borderColor = borderColor;
				beta_chart_instance.data.datasets[3].fill = "origin";
				beta_chart_instance.data.datasets[4].fill = "origin";
				beta_chart_instance.update()
				set_text(ctxbeta, beta_texts)
				
				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(beta_AV_chart, data_vector_filtered, angular_velocity_vector,'#0000ff',1)
				
				// BAR CHART
				buildBarsChart(beta_bars_chart, [getMax(data_left_filtered), getMax(data_left_filtered)],'#0000ff', '#0000ff', 1, beta_texts)
				
				//TABLES
				document.getElementById("rot_positive").innerHTML=beta_texts[0]
				document.getElementById("rot_negative").innerHTML=beta_texts[1]
				document.getElementById("rot_body").innerHTML += "<tr><td> <span style='color:#0000ff'>[" + global_all_sessions_in_case_study[1].ROM_rotacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_rotacion_izq) + 5).toString() + "] </span>" + "</td><td><span style='color:#0000ff'> [" + global_all_sessions_in_case_study[1].ROM_rotacion_der + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_rotacion_der) + 5).toString() + "]</span> </td></tr>" 
				document.getElementById("rot_angles_left_body").innerHTML += "<tr><td> <span style='color:#0000ff'>" + getMax(data_left_filtered) +
																					"</span></td><td> <span style='color:#0000ff'>" + getMed(data_left_filtered) + 
																					"</span></td><td> <span style='color:#0000ff'>" + getDev(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_left_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("rot_angles_right_body").innerHTML += "<tr><td> <span style='color:#0000ff'>" + getMax(data_extension_filtered) +
																					"</span></td><td> <span style='color:#0000ff'>" + getMed(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getDev(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_right_filtered)+ 
																					"</span></td></tr>" 
																					
			} else if(data[i][0].movimiento == 3 & is_inclination_selected){
				
				if(	document.getElementById("inclinacion_tab").style.diplay == "none"){
					document.getElementById("inclinacion_tab").style.diplay = "block"
				}
				
				//console.log("inc")
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].gamma);
				}
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				gamma_chart_instance.data.datasets[1].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_inc){
					global_sample_size_inc = data_vector_filtered.length
					
				}
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_left_filtered=[]
				var data_right_filtered=[]
				
				for(j =0; j< global_sample_size_inc; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[1].ROM_inclinacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[1].ROM_inclinacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_left_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_right_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				gamma_chart_instance.data.labels = labels_vector
				gamma_chart_instance.data.datasets[3].data = data_vector_max;
				gamma_chart_instance.data.datasets[4].data = data_vector_min;
				gamma_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].borderColor = borderColor;
				gamma_chart_instance.data.datasets[4].borderColor = borderColor;
				gamma_chart_instance.data.datasets[3].fill = "origin";
				gamma_chart_instance.data.datasets[4].fill = "origin";
				gamma_chart_instance.update()
				set_text(ctxgamma, gamma_texts)
				
				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(gamma_AV_chart, data_vector_filtered, angular_velocity_vector,'#0000ff',1)
				
				// BAR CHART
				buildBarsChart(gamma_bars_chart, [getMax(data_left_filtered), getMax(data_right_filtered)],'#0000ff', '#0000ff', 1, gamma_texts)
				
				//TABLES
				document.getElementById("inc_positive").innerHTML=gamma_texts[0]
				document.getElementById("inc_negative").innerHTML=gamma_texts[1]
				document.getElementById("inc_body").innerHTML += "<tr><td> <span style='color:#0000ff'>[" + global_all_sessions_in_case_study[1].ROM_inclinacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_inclinacion_izq) + 5).toString() + "] </span>" + "</td><td><span style='color:#0000ff'> [" + global_all_sessions_in_case_study[1].ROM_inclinacion_der + "-" + (parseFloat(global_all_sessions_in_case_study[1].ROM_inclinacion_der) + 5).toString() + "] </span></td></tr>" 
				document.getElementById("inc_angles_left_body").innerHTML += "<tr><td> <span style='color:#0000ff'>" + getMax(data_left_filtered) +
																					"</span></td><td> <span style='color:#0000ff'>" + getMed(data_left_filtered) + 
																					"</span></td><td><span style='color:#0000ff'> " + getDev(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_left_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("inc_angles_right_body").innerHTML += "<tr><td><span style='color:#0000ff'> " + getMax(data_right_filtered) +
																					"</span></td><td> <span style='color:#0000ff'>" + getMed(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getDev(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#0000ff'>" + getMax(data_right_filtered)+ 
																					"</span></td></tr>" 
			}
		}
		
		
	});
	socket.on("summary:set_data_session3", function(data){
		console.log(data)
		console.log("Movimientos en sesion 3: " + data.length)
		for (i in data){
			//console.log(data[i][0].movimiento)
			if(data[i][0].movimiento == 1 & is_flexext_selected){
				
				if(	document.getElementById("flexext_tab").style.diplay == "none"){
					document.getElementById("flexext_tab").style.diplay = "block"
				}
				
				console.log(document.getElementById("flexext_tab").style);
				
				//console.log("flexext")
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].alfa);
				}
				
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				
				alfa_chart_instance.data.datasets[2].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_flexext){
					global_sample_size_flexext = data_vector_filtered.length	
				}
				
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_flexion_filtered=[]
				var data_extension_filtered=[]
				
				console.log(global_all_sessions_in_case_study[1])
				for(j = 0; j< global_sample_size_flexext; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(parseInt(global_all_sessions_in_case_study[2].ROM_flexion))
					data_vector_min.push(parseInt(-global_all_sessions_in_case_study[2].ROM_extension))
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_flexion_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_extension_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				console.log(data_vector_max)
				alfa_chart_instance.data.labels = labels_vector
				alfa_chart_instance.data.datasets[3].data = data_vector_max;
				alfa_chart_instance.data.datasets[4].data = data_vector_min;
				alfa_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				alfa_chart_instance.data.datasets[3].borderColor = borderColor;
				alfa_chart_instance.data.datasets[4].borderColor = borderColor;
				alfa_chart_instance.data.datasets[3].fill = "origin";
				alfa_chart_instance.data.datasets[4].fill = "origin";
				alfa_chart_instance.update()
				set_text(ctxalfa, alfa_texts)
				
				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(alfa_AV_chart, data_vector_filtered, angular_velocity_vector,'#008000',2)
				
				// BAR CHART
				buildBarsChart(alfa_bars_chart, [getMax(data_flexion_filtered), getMax(data_extension_filtered)],'#008000', '#008000', 2, alfa_texts)
				
				//TABLES
				document.getElementById("flexext_positive").innerHTML=alfa_texts[0]
				document.getElementById("flexext_negative").innerHTML=alfa_texts[1]
				document.getElementById("flexext_body").innerHTML += "<tr><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_flexion + "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_flexion) + 5).toString() + "] </span>" + "</td><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_extension + "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_extension) + 5).toString() + "] </span></td></tr>" 
				document.getElementById("flexext_angles_flexion_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_flexion_filtered) +
																					"</span></td><td> <span style='color:#008000'>" + getMed(data_flexion_filtered) + 
																					"</span></td><td><span style='color:#008000'> " + getDev(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_flexion_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_flexion_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("flexext_angles_extension_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_extension_filtered) +
																					"</span></td><td> <span style='color:#008000'>" + getMed(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getDev(data_extension_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_extension_filtered)+ 
																					"</span></td><td><span style='color:#008000'> " + getMax(data_extension_filtered)+ 
																					"</span></td></tr>" 
																					
			} else if(data[i][0].movimiento == 2 & is_rotation_selected){
				
				if(	document.getElementById("rotacion_tab").style.diplay == "none"){
					document.getElementById("rotacion_tab").style.diplay = "block"
				}
				
				var data_vector = []
				var data_vector_max = []
				var data_vector_min = []
				for(j in data[i]){
					data_vector.push(data[i][j].beta);
				}
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				beta_chart_instance.data.datasets[2].data = data_vector_filtered;
			
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_rot){
					global_sample_size_rot = data_vector_filtered.length
					
				}
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				
				var data_left_filtered=[]
				var data_right_filtered=[]
				
				for(j =0; j< global_sample_size_rot; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[1].ROM_rotacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[1].ROM_rotacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
					
					if(data_vector_filtered[j] > 0){
						data_left_filtered.push(parseFloat(data_vector_filtered[j]).toFixed(2))
					}else if(data_vector_filtered[j] < 0){
						data_right_filtered.push(Math.abs(data_vector_filtered[j]).toFixed(2))
					}
				}
				beta_chart_instance.data.labels = labels_vector
				beta_chart_instance.data.datasets[3].data = data_vector_max;
				beta_chart_instance.data.datasets[4].data = data_vector_min;
				beta_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				beta_chart_instance.data.datasets[3].borderColor = borderColor;
				beta_chart_instance.data.datasets[4].borderColor = borderColor;
				beta_chart_instance.data.datasets[3].fill = "origin";
				beta_chart_instance.data.datasets[4].fill = "origin";
				beta_chart_instance.update()
				set_text(ctxbeta, beta_texts)

				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(beta_AV_chart, data_vector_filtered, angular_velocity_vector,'#008000',2)
				
				// BAR CHART
				buildBarsChart(beta_bars_chart, [getMax(data_vector_filtered), getMax(data_vector_filtered)],'#008000', '#008000', 2, beta_texts)
				
				//TABLES
				document.getElementById("rot_positive").innerHTML=beta_texts[0]
				document.getElementById("rot_negative").innerHTML=beta_texts[1]
				document.getElementById("rot_body").innerHTML += "<tr><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_rotacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_rotacion_izq) + 5).toString() + "]</span> " + "</td><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_rotacion_der+ "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_rotacion_der) + 5).toString() + "]</span> </td></tr>" 
				document.getElementById("rot_angles_left_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_left_filtered) +
																					"</span></td><td><span style='color:#008000'> " + getMed(data_left_filtered) + 
																					"</span></td><td><span style='color:#008000'> " + getDev(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_left_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("rot_angles_right_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_right_filtered) +
																					"</span></td><td><span style='color:#008000'> " + getMed(data_right_filtered)+ 
																					"</span></td><td><span style='color:#008000'> " + getDev(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_right_filtered)+ 
																					"</span></td></tr>" 
																					
			} else if(data[i][0].movimiento == 3 & is_inclination_selected){
				
				if(	document.getElementById("inclinacion_tab").style.diplay == "none"){
					document.getElementById("inclinacion_tab").style.diplay = "block"
				}
				
				//console.log("inc")
				var data_vector = []
				for(j in data[i]){
					data_vector.push(data[i][j].gamma);
				}
				//filt
				var data_vector_filtered = []
				let sum=0
				for(n=4; n < data_vector.length; n++){
					sum = parseFloat(data_vector[n])+parseFloat(data_vector[n-1])+parseFloat(data_vector[n-2])+parseFloat(data_vector[n-3])+parseFloat(data_vector[n-4])
					let filt = parseFloat(sum)/5
					data_vector_filtered.push(parseFloat(filt))
				}
				gamma_chart_instance.data.datasets[2].data = data_vector_filtered;
				
				// check if is higher than the current data vector
				if(data_vector_filtered.length > global_sample_size_inc){
					global_sample_size_inc = data_vector_filtered.length
					
				}
				var labels_vector = []
				var data_vector_max = []
				var data_vector_min = []
				var backgroundColor = []
				var borderColor = []
				for(j =0; j< global_sample_size_inc; j++){
					let label = get_labels(j)
					labels_vector.push(label)
					data_vector_max.push(global_all_sessions_in_case_study[1].ROM_inclinacion_izq)
					data_vector_min.push(-global_all_sessions_in_case_study[1].ROM_inclinacion_der)
					backgroundColor.push('rgba(0,119,290,0.05)');
					borderColor.push('rgba(0,119,290,0.8)');
				}
				gamma_chart_instance.data.labels = labels_vector
				gamma_chart_instance.data.datasets[3].data = data_vector_max;
				gamma_chart_instance.data.datasets[4].data = data_vector_min;
				gamma_chart_instance.data.datasets[4].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].backgroundColor = backgroundColor;
				gamma_chart_instance.data.datasets[3].borderColor = borderColor;
				gamma_chart_instance.data.datasets[4].borderColor = borderColor;
				gamma_chart_instance.data.datasets[3].fill = "origin";
				gamma_chart_instance.data.datasets[4].fill = "origin";
				gamma_chart_instance.update()
				set_text(ctxgamma, gamma_texts)

				
				//ANGULAR VELOCITY CHART
				let angular_velocity_vector = get_angular_velocity(data_vector_filtered)
				buildAVChart(gamma_AV_chart, data_vector_filtered, angular_velocity_vector,'#008000',2)
				
				// BAR CHART
				buildBarsChart(gamma_bars_chart, [getMax(data_vector_filtered), getMax(data_vector_filtered)],'#008000', '#008000', 2, gamma_texts)
				
				document.getElementById("inc_positive").innerHTML=gamma_texts[0]
				document.getElementById("inc_negative").innerHTML=gamma_texts[1]
				document.getElementById("inc_body").innerHTML += "<tr><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_inclinacion_izq + "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_inclinacion_izq) + 5).toString() + "] </span>" + "</td><td> <span style='color:#008000'>[" + global_all_sessions_in_case_study[2].ROM_inclinacion_der + "-" + (parseFloat(global_all_sessions_in_case_study[2].ROM_inclinacion_der) + 5).toString() + "] </span></td></tr>" 
				document.getElementById("inc_angles_left_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_left_filtered) +
																					"</span></td><td> <span style='color:#008000'>" + getMed(data_left_filtered) + 
																					"</span></td><td> <span style='color:#008000'>" + getDev(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_left_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_left_filtered)+ 
																					"</span></td></tr>" 
				document.getElementById("inc_angles_right_body").innerHTML += "<tr><td> <span style='color:#008000'>" + getMax(data_right_filtered) +
																					"</span></td><td> <span style='color:#008000'>" + getMed(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getDev(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_right_filtered)+ 
																					"</span></td><td> <span style='color:#008000'>" + getMax(data_right_filtered)+ 
																					"</span></td></tr>" 
			}
		}
		
		
	});

	$('#inclinacion_tab').on('shown.bs.tab', function (event) {
		is_inclination_selected = true;
		is_rotation_selected = false;
		is_flexext_selected = false;
		
		document.getElementById('download_dashboard').innerHTML = 'Download Inclination Dashboard'
		
		ctxgamma = document.getElementById('gamma_chart').getContext('2d');
		ctxgamma.canvas.height = 340;
		gamma_chart_instance = new Chart(ctxgamma, {
			type: 'line',
			data: {
				datasets: [{label: 'session 1',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#FF2626',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 2',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#0000ff',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 3',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#008000',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					borderColor: '#add8e6',
					borderWidth: 0.5,
					backgroundColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					borderColor: '#add8e6',
					borderWidth: 0.5,
					backgroundColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				}]
			},
			options: Object.assign({}, commonOptions_IMU)		
		});
		
		create_inc_bars_chart();
		create_inc_AV_chart();
		
		// clear tables
		document.getElementById("inc_body").innerHTML = ""
		document.getElementById("inc_angles_left_body").innerHTML = ""
		document.getElementById("inc_angles_right_body").innerHTML = ""
		
		//ask to the server for data
		ask_for_data_sessions()
	});
		
	$('#rotacion_tab').on('shown.bs.tab', function (event) {
		console.log("entra en beta")
		is_rotation_selected = true;
		is_inclination_selected = false;
		is_flexext_selected = false;
		
		document.getElementById('download_dashboard').innerHTML = 'Download Rotation Dashboard'
		
		ctxbeta = document.getElementById('beta_chart').getContext('2d');
		ctxbeta.canvas.height = 340;
		
		beta_chart_instance = new Chart(ctxbeta, {
			type: 'line',
			data: {
				datasets: [{label: 'session 1',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#FF2626',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 2',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#0000ff',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 3',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#008000',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					backgroundColor: 'rgba(0,119,290,0.2)',
					borderColor: '#add8e6',
					borderWidth: 0.5,
					fillColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					borderColor: '#add8e6',
					borderWidth: 0.5,
					fillColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				}]
			},
			options: Object.assign({}, commonOptions_IMU)		
		});
		
		create_rot_bars_chart();
		create_rot_AV_chart();
		
		// clear tables
		document.getElementById("rot_body").innerHTML = ""
		document.getElementById("rot_angles_left_body").innerHTML = ""
		document.getElementById("rot_angles_right_body").innerHTML = ""
		
		//ask to the server for data
		ask_for_data_sessions()
	});
		
	$('#flexext_tab').on('shown.bs.tab', function (event) {
		is_flexext_selected = true
		is_rotation_selected = false;
		is_inclination_selected = false;
		
		document.getElementById('download_dashboard').innerHTML = 'Download Flexion-Extension Dashboard'
		
		// create charts
		create_flexext_chart();
		create_flexext_bars_chart();
		create_flexext_AV_chart();
		
		// clear tables
		document.getElementById("flexext_body").innerHTML = ""
		document.getElementById("flexext_angles_flexion_body").innerHTML = ""
		document.getElementById("flexext_angles_extension_body").innerHTML = ""
		
		// ask to the server for data
		ask_for_data_sessions();
	});

	function create_flexext_chart(){
		ctxalfa = document.getElementById('alfa_chart').getContext('2d');
		ctxalfa.canvas.height = 340;
		
		alfa_chart_instance = new Chart(ctxalfa, {
			type: 'line',
			data: {
				datasets: [{label: 'session 1',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#FF2626',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 2',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#0000ff',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{label: 'session 3',
					data: 0,
					fill: false,
					hidden: false,
					borderColor: '#008000',
					borderWidth: 1.5,
					pointBorderWidth: [],
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					borderColor: 'rgba(0,119,290,0.6)',
					backgroundColor: 'rgba(0,119,290,0.2)',
					borderWidth: 0.5,
					fillColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				},{
					label: '',
					data: 0,
					borderColor: 'rgba(0,119,290,0.6)',
					backgroundColor: 'rgba(0,119,290,0.2)',
					borderWidth: 0.5,
					fillColor: '#add8e6',
					fill: true,
					hidden: false,
					pointStyle: 'line'
				}]
					
			},
			options: Object.assign({}, commonOptions_IMU)		
		});
		
	}
	
	function ask_for_data_sessions(){
		var ids_data = ["s1_data","s2_data","s3_data"]
		var ids = ["s1","s2","s3"]
		for(i in global_all_sessions_in_case_study){
			document.getElementById(ids_data[i]).style.display = "inline"
			document.getElementById(ids[i]).innerHTML = global_all_sessions_in_case_study[i].date.split("T")[0]
			socket.emit("summary:get_data_session" + (parseInt(i)+1).toString(), global_all_sessions_in_case_study[i].id)
			console.log("sent ask session" + i)
		}
	}
	
	function create_flexext_bars_chart(){
		var ctxbarsalfa = document.getElementById('alfa_bars_chart').getContext('2d');
		ctxbarsalfa.canvas.height = 240;
		alfa_bars_chart = new Chart(ctxbarsalfa, {
			type: 'bar',
			labels:[],
			data: {
				datasets: [{
					label: 'session 1',
					data: [],
					backgroundColor: ['#FF2626'],
					borderWidth: 1,
					borderColor: ['#FF2626']

				},
				{
					label: 'session 2',
					data: [],
					borderColor: '#0000ff',
					backgroundColor: ['#0000ff'],
					borderWidth: 1,
					borderColor: ['#0000ff']

				},
				{
					label: 'session 3',
					data: [],
					backgroundColor: ['#008000'],
					borderWidth: 1,
					borderColor: ['#008000']

				}]	
			},
			options: {
				scales: {
					yAxes: [{
						ticks:{
							
							beginAtZero: true
						},
						scaleLabel: {
							display: true,
							labelString: 'Grados (º)'
						}
					}]
				},
				font:{
					size:18
				}
				
			}		
		});
	}
		
	function create_rot_bars_chart(){
		var ctxbarsbeta = document.getElementById('beta_bars_chart').getContext('2d');
		ctxbarsbeta.canvas.height = 240;
		beta_bars_chart = new Chart(ctxbarsbeta, {
			type: 'bar',
			labels:[],
			data: {
				datasets: [{
					label: 'session 1',
					borderColor: '#FF2626',
					data: [],
					backgroundColor: ['#FF2626'],
					borderWidth: 1,
					borderColor: ['#FF2626']

				},
				{
					label: 'session 2',
					data: [],
					backgroundColor: ['#0000ff'],
					borderColor: '#0000ff',
					borderWidth: 1,
					borderColor: ['#0000ff']

				},
				{
					label: 'session 3',
					data: [],
					backgroundColor: ['#008000'],
					borderWidth: 1,
					borderColor: ['#008000']

				}]	
			},
			options: {
				scales: {
					yAxes: [{
						ticks:{
							
							beginAtZero: true
						},
						scaleLabel: {
							display: true,
							labelString: 'Grados (º)'
						}
					}]
				},
				font:{
					size:18
				}
				
			}		
		});
	}
	
	function create_inc_bars_chart(){
		var ctxbarsgamma = document.getElementById('gamma_bars_chart').getContext('2d');
		ctxbarsgamma.canvas.height = 240;
		
		gamma_bars_chart = new Chart(ctxbarsgamma, {
			type: 'bar',
			labels:[],
			data: {
				datasets: [{
					label: 'session 1',
					data: [],
					borderColor: '#FF2626',
					backgroundColor: ['#FF2626'],
					borderWidth: 1,
					borderColor: ['#FF2626']

				},
				{
					label: 'session 2',
					data: [],
					backgroundColor: ['#0000ff'],
					borderWidth: 1,
					borderColor: ['#0000ff']

				},
				{
					label: 'session 3',
					data: [],
					backgroundColor: ['#008000'],
					borderWidth: 1,
					borderColor: ['#008000']

				}]	
			},
			options: {
				scales: {
					yAxes: [{
						ticks:{
							
							beginAtZero: true
						},
						scaleLabel: {
							display: true,
							labelString: 'Grados (º)'
						}
					}]
				},
				font:{
					size:18
				}
				
			}			
		});
		
	}
	
	function create_flexext_AV_chart(){
		var ctxavalfa = document.getElementById('alfa_angular_velocity_chart').getContext('2d');
		ctxavalfa.canvas.height = 340;
		
		alfa_AV_chart = new Chart(ctxavalfa, {
			type: 'line',
			data: {
				datasets: [{
					fill:false,
					label: 'session 1',
					data: [],
					backgroundColor: '#FF2626',
					borderWidth: 1,
					borderColor: '#FF2626'

				},
				{
					filll:false,
					label: 'session 2',
					data: [],
					backgroundColor: '#0000ff',
					borderWidth: 1,
					borderColor: '#0000ff'

				},
				{
					fill:false,
					label: 'session 3',
					data: [],
					backgroundColor: '#008000',
					borderWidth: 1,
					borderColor: '#008000'

				}]	
			},
			options: Object.assign({}, commonOptions_AV)				
		});
		
	}
	
	function create_rot_AV_chart(){
		var ctxavbeta = document.getElementById('beta_angular_velocity_chart').getContext('2d');
		ctxavbeta.canvas.height = 340;
		
		beta_AV_chart = new Chart(ctxavbeta, {
			type: 'line',
			labels:[],
			data: {
				datasets: [{
					fill:false,
					label: 'session 1',
					data: [],
					borderColor: '#FF2626',
					borderWidth: 1,
					backgroundColor: '#FF2626'

				},
				{
					fill:false,
					label: 'session 2',
					data: [],
					backgroundColor: '#0000ff',
					borderWidth: 1,
					borderColor:'#0000ff'

				},
				{
					fill:false,
					label: 'session 3',
					data: [],
					backgroundColor: '#008000',
					borderWidth: 1,
					borderColor: '#008000'

				}]	
			},
			options: Object.assign({}, commonOptions_AV)				
		});
		
	}
	
	function create_inc_AV_chart(){
		var ctxavgamma = document.getElementById('gamma_angular_velocity_chart').getContext('2d');
		ctxavgamma.canvas.height = 340;
		
		gamma_AV_chart = new Chart(ctxavgamma, {
			type: 'line',
			labels:[],
			data: {
				datasets: [{
					fill:false,
					label: 'session 1',
					data: [],
					borderColor: '#FF2626',
					backgroundColor: '#FF2626',
					borderWidth: 1,
					borderColor: '#FF2626'

				},
				{
					fill:false,
					label: 'session 2',
					data: [],
					backgroundColor: '#0000ff',
					borderWidth: 1,
					borderColor: '#0000ff'

				},
				{
					fill:false,
					label: 'session 3',
					data: [],
					backgroundColor: '#008000',
					borderWidth: 1,
					borderColor: '#008000'

				}]	
			},
			options: Object.assign({}, commonOptions_AV)				
		});
		
	}
	
	$('#download_csv').on('click', function() {
		console.log("Download Data")
		console.log(global_all_sessions_in_case_study[0].caso_estudio)
		
		let title_texts;
		console.log(global_all_sessions_in_case_study[0])
		if(global_all_sessions_in_case_study[0].articulacion == "cervical"){
            title_texts = ["Extension/Flexion", "Right/Left Inclination", "Right/Left Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "hombro_derecho"){
            title_texts = ["Extension/Flexion", "Adduction/Abduction", "External/Internal Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "hombro_izquierdo"){
            title_texts = ["Extension/Flexion", "Abduction/Adduction", "Internal/External Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "codo_derecho"){
            title_texts = ["Extension/Flexion", "Supination/Pronation", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "codo_izquierdo"){
            title_texts = ["Extension/Flexion", "Pronation/Supination", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "muñeca_derecha"){
            title_texts = ["Extension/Flexion", "Desv. Radial/Cubital", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "muñeca_izquierda"){
            title_texts = ["Extension/Flexion", "Desv. Cubital/Radial", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "lumbar"){
            title_texts = ["Extension/Flexion", "Right/Left Inclination", "Right/Left Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "cadera_izquierda"){
            title_texts = ["Extension/Flexion", "Adduction/Abduction", "External/Internal Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "cadera_derecha"){
            title_texts = ["Extension/Flexion", "Abduction/Adduction", "Internal/External Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "rodilla_derecha"){
            title_texts = ["Flexion/Extension", "Inclination", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "rodilla_izquierda"){
            title_texts = ["Flexion/Extension", "Inclination", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "tobillo_derecho"){
            title_texts = ["Plantar/Dorsal Flexion", "Left/Right Inclination", "Rotation"]
          } else if(global_all_sessions_in_case_study[0].articulacion == "tobillo_izquierdo"){
            title_texts = ["Plantar/Dorsal Flexion", "Right/Left nclination", "Rotation"]
          }  
          
		socket.emit('download_studycase_csv', {
            studyCase: global_all_sessions_in_case_study[0].caso_estudio,
            titles: title_texts,
            user: global_user_info.nombre_usuario
          });
    
	})
	
	$('#download_dashboard').on('click', function() {
		console.log("Download Data")
		
		document.getElementById("buttons_div").style.display = "none";
		
		if(is_flexext_selected){
			html2canvas(document.querySelector('#content_png')).then(canvas => {
				canvas.toBlob(function(blob){
					socket.emit('blob-flexext', blob)
				});
			});
		}
		
		if(is_rotation_selected){
			html2canvas(document.querySelector('#content_png')).then(canvas => {
				canvas.toBlob(function(blob){
					socket.emit('blob-rot', blob)
				});
			});
		}
		
		if(is_inclination_selected){
			html2canvas(document.querySelector('#content_png')).then(canvas => {
				canvas.toBlob(function(blob){
					socket.emit('blob-inc', blob)
				});
			});
		}
		
		document.getElementById("buttons_div").style.display="inline";

	
	});
}

socket.on('open_download_csv_studycase_link',function(idsesion){
	window.open('http://192.168.43.1:3000/downloadsessionsdata_studycase_csv');
});

socket.on('open_dashboard_flexext_link',function(){
	window.open('http://192.168.43.1:3000/downloadflexextdashboard');
});

socket.on('open_dashboard_rotation_link',function(){
	window.open('http://192.168.43.1:3000/downloadrotationdashboard');
});

socket.on('open_dashboard_inclination_link',function(){
	window.open('http://192.168.43.1:3000/downloadinclinationdashboard');
});

function get_labels(sample_size){
	let segundos = Math.trunc(sample_size/50);
	let milisegundos = (sample_size/50*1000 - segundos*1000)
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
	
	return label;
}


function getMinimums(data_vector_filtered){
	let n_minimums = []
	for(n=1; n< data_vector_filtered.length-1; n++){
		if(parseFloat(data_vector_filtered[n]) < parseFloat(data_vector_filtered[n-1])){
			if(parseFloat(data_vector_filtered[n]) < parseFloat(data_vector_filtered[n+1])){
				//This is a relative minimum
				if(parseFloat(data_vector_filtered[n]) < ((-parseInt(global_all_sessions_in_case_study[0].ROM_extension)) + 30)){
					if(data_vector_filtered[n] != data_vector_filtered[n_minimums[n_minimums.length-1]]){
						n_minimums.push(n)
					}
				}
			}
		}
	}
	
	return n_minimums
}

function getMaximas(data_vector_filtered){
	let n_maximas = []
	
	for(n=1; n< data_vector_filtered.length-1; n++){

		if (data_vector_filtered[n] > data_vector_filtered[n-1]){
			if(data_vector_filtered[n] > data_vector_filtered[n+1]){
				// This value is a relative maximum
				if(data_vector_filtered[n] > (global_all_sessions_in_case_study[0].ROM_flexion)-40){
					if(data_vector_filtered[n] != data_vector_filtered[n_maximas[n_maximas.length-1]]){
						n_maximas.push(n)
					}
				}
			}
		}
	}
	return n_maximas
		
}

function createAnotationsDict(n_maximas, n_minimums,data,chart){
	
	var marketing=[30,40]
	var amount = [50,70]
	
	var annotations = marketing.map(function(date,index){
		return{
			 id:'a-line-1',
			 type:"line",
			 mode:"horizontal",
			 scaleID:'y-axis-1',
			 value: date,
			 borderColor:"red",
			 borderWidth:2,
			 label:{
				 enabled:true,
				 position:"center",
				 content: amount[index]
			 }
		 }
	 });
			 
	//for (n in n_maximas){
	 chart.options.plugins.annotation.annotations = annotations;
	
	//}
		 console.log(chart.options)

	return annotations
}

function buildBarsChart(chart, max_min_vector, bordercolor, backgroundcolor, session_index, texts){
	if(chart.data.labels.length != 2){
		chart.data.datasets[session_index].data = []
		chart.data.datasets[session_index].backgroundColor = []
		chart.data.datasets[session_index].borderColor = []
		chart.data.labels.push('Flexion')
		chart.data.labels.push('Extension')
	}
	//chart.data.datasets[session_index].backgroundColor=[]
	//chart.data.datasets[session_index].borderColor=[]
	for (i in max_min_vector){

		chart.data.datasets[session_index].data.push(max_min_vector[i])
		
		chart.data.datasets[session_index].backgroundColor.push(backgroundcolor)
		chart.data.datasets[session_index].borderColor.push(bordercolor)
	}
	chart.update();
}

function get_angular_velocity(data_vector_filtered){
	
	angular_velocity_vector = [];
	for (i=1; i<data_vector_filtered.length-1;i++){
		// turn degrees to rad
		let rad = parseFloat(data_vector_filtered) * (Math.PI/180);

		// turn sample into seconds
		let sec = i/50
		
		let av = (data_vector_filtered[i])/(sec)
		// calculate angular velocity
		angular_velocity_vector.push(av)
	}
	return angular_velocity_vector
}

function buildAVChart(chart, data_vector_filtered, angular_velocity_vector, color, session_index ){
	
	
	console.log(session_index)
	for (i in data_vector_filtered){
		chart.data.datasets[session_index].data.push({
			x: parseFloat(data_vector_filtered[i]),
			y: parseFloat(angular_velocity_vector[i])
			})
		//chart.data.datasets[session_index].backgroundColor.push(color);
		//chart.data.datasets[session_index].borderColor.push(color);
	}
	chart.update();
}
		
function getMax(array){
	let max = Math.max(...array)
	
	if(!isFinite(max)){
		max = 0
	}
	return max
}	
				 
function getMed(array){
	
	let sum = 0
	for(i in array){
		sum += parseFloat(array[i])
	}
	let result = sum/parseInt(array.length)
	
	if(!isFinite(result)){
		result = 0
	}
	return result.toFixed(2)
}

function getDev(array){
	
	let sum = 0
	for(i in array){
		sum += parseFloat(array[i])
	}
	let mean = sum/parseInt(array.length)
	
	let array2 = []
	for(i in array){
		array2.push((array[i] - mean)**2)
	}
	
	
	let sum2 = 0
	for(i in array2){
		sum2 += parseFloat(array2[i])
	}
	let variance = sum2/parseInt(array2.length)
	let dev = Math.sqrt(variance)
	
	if(!isFinite(dev)){
		dev = 0
	}
	return dev.toFixed(2) 
}

function set_text(ctx, data_vector){
	ctx.font = "16px Arial";
	ctx.fillStyle = "black";
	console.log(data_vector)
	ctx.fillText(data_vector[0],420,60);
	ctx.fillText(data_vector[1],420, 230);
}
