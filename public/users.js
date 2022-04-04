//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

socket.on('session_data_loaded',function(data){

    console.log(data);
    data_right = data.rom_r;
    console.log(data_right);
    data_left = data.rom_l;
    load = data.load;

});

socket.emit('refreshlist');

var n_session;
socket.on('datasessions', function(datasessions) {
	
	console.log(datasessions);
	var l_rom;
	var r_rom ;
	var load;
	
	$('#view_session').on('click', function() {
	l_rom = [];
	r_rom = [];
	load = [];
	
	for (i = 0; i < datasessions.length; i++) {
		if (datasessions[i].idSesion == n_session){
		   l_rom.push(datasessions[i].left_hip);
		   r_rom.push(datasessions[i].right_hip);
		   load.push(datasessions[i].weight_gauge);
		   
		};
	};
			
	var l_max = Math.max(...l_rom);
    var r_max = Math.max(...r_rom);
    console.log(r_max);
    var r_min = Math.min(...r_rom);
    var l_min = Math.min(...l_rom);
    
    
	// load
	let mean_load = 0;
	for (i=0; i<load.length;i++){
		mean_load = mean_load + load[i];
	}
	mean_load = Math.round(mean_load/load.length);
	
	if (r_rom.length != 0){
		document.getElementById("l_maxRom").innerHTML =  l_max + "º";
		document.getElementById("l_minRom").innerHTML =  l_min + "º";
		document.getElementById("r_maxRom").innerHTML =  r_max + "º";
		document.getElementById("r_minRom").innerHTML =  r_min + "º";
		document.getElementById("supported_weight").innerHTML =  mean_load + "%";

	} else {
		document.getElementById("l_maxRom").innerHTML =  "--";
		document.getElementById("l_minRom").innerHTML =  "--";
		document.getElementById("r_maxRom").innerHTML =  "--";
		document.getElementById("r_minRom").innerHTML =  "--";
		document.getElementById("supported_weight").innerHTML =  "--";
	}

    
	$("#modalviewsession").modal('show');

    
  }) 
  
  $('#modalviewsession').on('shown.bs.modal', function (event) {

	var ctxl = document.getElementById('l_hip_chart').getContext('2d');
	var ctxr = document.getElementById('r_hip_chart').getContext('2d');
	
	
    
    var commonJointsOptions = {
      font: {
        size: 16
      },
      scales: {
        xAxes: [{
			type: 'time',
			time: {
				parser: 'mm-ss-SS',
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
            labelString: 'Segundos (s)'
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
            max: 50,    // maximum will be 70, unless there is a lower value.
            min: -30,    // minimum will be -10, unless there is a lower value.
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
        }
      }
    };
  
    // Joint instances
    var ctxrhipInstance = new Chart(ctxr, {
      type: 'line',
      data: {
        datasets: [{label: 'ROM',
          data: [],
          fill: false,
          borderColor: '#FF2626',
          borderWidth: 1.5,
          pointStyle: 'line'
        }],
      },
      options: Object.assign({}, commonJointsOptions), 
    });
    
    console.log(ctxrhipInstance);
    
    var ctxlhipInstance = new Chart(ctxl, {
      type: 'line',
      data: {
        datasets: [{
          label: 'ROM',
          data: [],
          fill: false,
          borderColor: '#FF2626',
          borderWidth: 1.5,
          pointStyle: 'line'
        }],
      },
      options: Object.assign({}, commonJointsOptions),   
    });
    
    var time_labels = [];
    console.log(r_rom)
    for (i=0; i< r_rom.length ; i++){
		// update labels
		var segundos = Math.trunc(i/100);
		var milisegundos = Math.trunc((i/100 - segundos)*1000)
		var minutos = Math.trunc(segundos/60);
		segundos = segundos - minutos*60; 
		var label = minutos + '-' + segundos + '-' + milisegundos;
		if(milisegundos.toString().length == 2){
			var label = minutos + '-' + segundos + '-0' + milisegundos;
		}
		ctxrhipInstance.data.labels.push(label)
		ctxrhipInstance.data.datasets[0].data.push(r_rom[i])
		ctxlhipInstance.data.labels.push(label)
		ctxlhipInstance.data.datasets[0].data.push(l_rom[i])
	}
	ctxrhipInstance.update();
	ctxlhipInstance.update();
	
	
}); 
	

});
	
socket.on('datostabla', function(datas) {

    console.log(datas);
    

    //Creación de DataTables
    let $dt = $('#sessionsList');
    let dt = $dt.DataTable({
        "data": datas,
        "columns": [
            {// Se ingresa el control para agregar columnas y observar mas detalles del paciente
                "className":      'details-control', // Se
                "orderable":      false,
                "data":           null,
                "width": '4%',
                "defaultContent":  ' <i class="fas fa-plus" style="color:#325AC8;" aria-hidden="true"></i>'  //ingreso el icono de más
            },
            {"width": '4%',
            render: function(data, type, fullsessions, meta) {
              // ACA controlamos la propiedad para des/marcar el input
              return "<input type='checkbox'" + (fullsessions.checked ? ' checked' : '') + "/>";
            },
            orderable: false
             },
             {data: 'idtable_session'},
            { data: 'date' },
            { data: 'NombrePaciente' },
            { data: 'ApellidoPaciente'},
            { data: 'NumberSession'},
            { data: 'gait_velocity'},
            { data: 'observations'}
            ],
            
    });

    // Cuando hacen click en el checkbox del thead
    $dt.on('change', 'thead input', function(evt) {
        let checked = this.checked;
        //let total = 0;
        let data = [];
  
        dt.data().each(function(info) {
          // ACA cambiamos el valor de la propiedad
          info.checked = checked;
          // ACA accedemos a las propiedades del objeto
         // if (info.checked) total += info.Precio;
          data.push(info);
        });
  
        dt.clear()
          .rows.add(data)
          .draw();
    });
  
    // Cuando hacen click en los checkbox del tbody SESSIONS
    $dt.on('change', 'tbody input', function() {
        let info = dt.row($(this).closest('tr')).data();
        // ACA accedemos a las propiedades del objeto
        info.checked = this.checked;
        //console.log(info.checked);
        if (this.checked){
            document.getElementById("remove_session").disabled = false;
            document.getElementById("download_sessions_config").disabled = false; 
            document.getElementById("download_session_data").disabled = false; 
            document.getElementById("view_session").disabled = false;
            
            
            var r_max = 0;
            var l_max = 0;
            var l_min = 0;
            var r_min = 0;
            var mean_load = 0;
            
            let dt = $('#sessionsList').DataTable();
			let vars = dt.data().toArray();
			let checkeds = dt.data().toArray().filter((data) => data.checked);
			console.log(checkeds[0].idtable_session);
			n_session = checkeds[0].idtable_session;
			
            
            

        }else{
            document.getElementById("remove_session").disabled = true;
            document.getElementById("download_sessions_config").disabled = true; 
            document.getElementById("download_session_data").disabled = true; 
            document.getElementById("view_session").disabled = true;
            
            
        }       
        
        
    });

    // Listener al click en detalles de cada paciente en SESSIONS
    dt.on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = dt.row( tr );

      if (row.child.isShown() ) {
          // This row is already open - close it
          row.child.hide();
          tr.find('svg').attr('data-icon', 'plus');    // FontAwesome 5
      }
      else {
          // Open this row
          row.child( format(row.data()) ).show();
        tr.find('svg').attr('data-icon', 'minus'); // FontAwesome 5
      }
    });
    
    //  DELET SESSION
  $('#b_delete_s').on('click', function() {
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);
    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtable_session == vars[i].idtable_session){
          console.log(i);
          var indexrow = i;
        };
    };
    console.log()
    dt.row(indexrow).remove().draw();
    socket.emit('deleted_session',checkeds[0].idtable_session);
  });

  // DOWNLOAD DATA SESSION
  $('#b_download_s_data').on('click', function() {
    console.log("Download Data")
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtable_session == vars[i].idtable_session){
          console.log(i);
          console.log(checkeds[0].idtable_session);
          socket.emit('download_sessions_data', (checkeds[0].idtable_session));
        };
    };
    
  })
  
  // DOWNLOAD DATA SESSION
  $('#b_download_all_s_data').on('click', function() {
    console.log("Download  all Data Sessions")
    socket.emit('download_all_sessions_data');
    
    
  })

  socket.on('open_download_sessions_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadsessionsdata');
  });
  socket.on('open_download_all_sessions_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadallsessionsdata');
  });

  $('#b_download_s_conf').on('click', function() {
    socket.emit('download_sessions_config');
    window.open('http://192.168.43.1:3000/downloadsessionsconfig');
  });

})


socket.on('patientdata',function(datapatient){

  //for (var i = 0; i < datapatient.length; i++) {
  //    listapacientes.push(datapatient[i]);
 // }
  //console.log(listapacientes);
  console.log(datapatient);


  let $pd = $('#patientsList');
  let pd = $pd.DataTable({
      "data": datapatient,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistapacientes, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistapacientes.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'NombrePaciente' },
          { data: 'ApellidoPaciente'},
          { data: 'patiente_age'},
          { data: 'patient_gender'},
          { data: 'patiente_weight'},
          { data: 'patient_height'},
          { data: 'leg_length'},
          { data: 'patient_active_rom'},
          { data: 'hip_joint'},
          { data: 'surgery'},
          { data: 'estado_fisico'},
          { data: 'estado_cognitivo'},
          
          ],
          
  });


        // Cuando hacen click en los checkbox del tbody
        $pd.on('change', 'tbody input', function() {
          let info = pd.row($(this).closest('tr')).data();
          // ACA accedemos a las propiedades del objeto
          info.checked = this.checked;
          if (this.checked){
              document.getElementById("edit_patient").disabled = false;
              document.getElementById("remove_patient").disabled = false;
              document.getElementById("download_list_patient").disabled = false;
          }else{
              document.getElementById("edit_patient").disabled = true;
              document.getElementById("remove_patient").disabled = true;
              document.getElementById("download_list_patient").disabled = true;
          }
         
      });


    //ADD PATIENT
    $('#b_add_p').on('click', function() {
      let patfname = document.getElementById("FNPatient").value;
      let patlname = document.getElementById("LNPatient").value;
      let patage= document.getElementById("AgePatient").value;
      let patweight = document.getElementById("WeightPatient").value;
      let patleglength = document.getElementById("LLPatient").value;
      let pathipjoint = document.getElementById("hip_joint").value;
      let patsurgery = document.getElementById("surgery").value;
      let patestadofisico = document.getElementById("estado_fisico").value;
      let patestadocognitivo = document.getElementById("estado_cognitivo").value;
      let patheight = document.getElementById("HeightPatient").value;
      let patmaxActiveRom = document.getElementById("activeRom").value;
      let patgender = document.getElementById("gender").value;
      socket.emit('insertPatient',[patfname, patlname, patage, patweight, patleglength, patestadofisico, patestadocognitivo, patsurgery, pathipjoint, patheight, patmaxActiveRom, patgender]);
      //location.reload(true);
      console.log("hola");
      
      
      $('#patientsList').DataTable().row.add({
          'NombrePaciente': patfname,
          'ApellidoPaciente': patlname,
          'patiente_age': patage,
          'patient_gender': patgender,
          'patiente_weight': patweight,
          'patient_height': patheight,
          'leg_length': patleglength,
          'patient_active_rom': patmaxActiveRom,
          'estado_fisico': patestadofisico,
          'estado_cognitivo': patestadocognitivo,
          'surgery': patsurgery,
          'hip_joint': pathipjoint,
          
      }).draw();
    });

        //  suscribimos un listener al click del boton remove
    $('#b_delete_p').on('click', function() {
        let dt = $('#patientsList').DataTable();
        let vars = dt.data().toArray();
        let checkeds = dt.data().toArray().filter((data) => data.checked);

        for (i = 0; i < vars.length; i++) {
            if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
              console.log(i);
              var indexrow = i;
            };
        };
        dt.row(indexrow).remove().draw();
        socket.emit('deleted_patient',checkeds[0].idtabla_pacientes);
    });

    $('#b_download_p').on('click', function() {
      socket.emit('download_patients');
      window.open('http://192.168.43.1:3000/downloadpatients');
    });


    $('#edit_patient').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      document.getElementById("editFNPatient").value = checkeds[0].NombrePaciente ;
      document.getElementById("editLNPatient").value =  checkeds[0].ApellidoPaciente;
      document.getElementById("editAgePatient").value =  checkeds[0].patiente_age;
      document.getElementById("editWeightPatient").value =  checkeds[0].patiente_weight;
      document.getElementById("editLLPatient").value =  checkeds[0].leg_length;
      document.getElementById("edithip_joint").value =  checkeds[0].hip_joint;
      document.getElementById("editsurgery").value =  checkeds[0].surgery;
      document.getElementById("editestado_fisico").value =  checkeds[0].estado_fisico;
      document.getElementById("editestado_cognitivo").value =  checkeds[0].estado_cognitivo;
      document.getElementById("editHeightPatient").value =  checkeds[0].patient_height;
      document.getElementById("editActiveRom").value =  checkeds[0].patient_active_rom;
      document.getElementById("editGender").value =  checkeds[0].patient_gender;
 
    })

    $('#b_edit_p').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      
      checkeds[0].NombrePaciente = document.getElementById("editFNPatient").value;
      checkeds[0].ApellidoPaciente = document.getElementById("editLNPatient").value;
      checkeds[0].patiente_age = document.getElementById("editAgePatient").value;
      checkeds[0].patiente_weight = document.getElementById("editWeightPatient").value;
      checkeds[0].leg_length = document.getElementById("editLLPatient").value;
      checkeds[0].hip_joint = document.getElementById("edithip_joint").value;
      checkeds[0].surgery = document.getElementById("editsurgery").value;
      checkeds[0].estado_fisico = document.getElementById("editestado_fisico").value;
      checkeds[0].estado_cognitivo = document.getElementById("editestado_cognitivo").value;
      checkeds[0].patient_height = document.getElementById("editHeightPatient").value;
      checkeds[0].patient_gender = document.getElementById("editGender").value;
      checkeds[0].max_active_rom = document.getElementById("editActiveRom").value;
      

      dt.row(indexrow).remove().draw();
      $('#patientsList').DataTable().row.add({
        'NombrePaciente': checkeds[0].NombrePaciente,
        'ApellidoPaciente': checkeds[0].ApellidoPaciente,
        'patiente_age': checkeds[0].patiente_age,
        'patient_gender': checkeds[0].patient_gender,
	    'patiente_weight': checkeds[0].patiente_weight,
	    'patient_height': checkeds[0].patient_height,
	    'leg_length': checkeds[0].leg_length,
	    'patient_active_rom': checkeds[0].patient_active_rom,
        'estado_fisico': checkeds[0].estado_fisico,
        'estado_cognitivo': checkeds[0].estado_cognitivo,
        'surgery': checkeds[0].surgery,
        'hip_joint': checkeds[0].hip_joint,
      }).draw();
      
      socket.emit('edit_patient',checkeds[0]);
    });


})





$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
  });
