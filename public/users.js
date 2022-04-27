//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

global_user_data = {}
global_config_data = {}

socket.on('session_data_loaded',function(data){

    console.log(data);
    data_right = data.rom_r;
    console.log(data_right);
    data_left = data.rom_l;
    load = data.load;

});

socket.emit('refreshlist');

socket.on('usersdata',function(datauser){

  console.log(datauser);
  
  global_user_data = datauser


  let $pd = $('#usersList');
  console.log(datauser)
  let pd = $pd.DataTable({
      "data": datauser,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistapacientes, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistapacientes.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'id'},
          { data: 'nombre_usuario' },
          { data: 'apellido_usuario_1'},
          { data: 'apellido_usuario_2'},
          { data: 'sexo'},
          { data: 'fecha_nacimiento'},
          ],
          
  });


        // Cuando hacen click en los checkbox del tbody
        $pd.on('change', 'tbody input', function() {
          let info = pd.row($(this).closest('tr')).data();
          // ACA accedemos a las propiedades del objeto
          info.checked = this.checked;
          if (this.checked){
              document.getElementById("edit_user").disabled = false;
              document.getElementById("remove_user").disabled = false;
              document.getElementById("download_list_user").disabled = false;
          }else{
              document.getElementById("edit_user").disabled = true;
              document.getElementById("remove_user").disabled = true;
              document.getElementById("download_list_user").disabled = true;
          }
         
      });


    //ADD PATIENT
    $('#b_add_p').on('click', function() {
      let userfname = document.getElementById("FNuser").value;
      let userln1 = document.getElementById("LN1user").value;
      let userln2= document.getElementById("LN2user").value;
      let usergender = document.getElementById("gender").value;
      let userbirthday = document.getElementById("birthday").value;
      socket.emit('insertuser',[userfname, userln1, userln2, userbirthday, usergender]);
      
      socket.on('useradded',function(id_user){
        $('#usersList').DataTable().row.add({
            'id': id_user.id,
            'nombre_usuario': userfname,
            'apellido_usuario_1': userln1,
            'apellido_usuario_2': userln2,
            'sexo': usergender,
            'fecha_nacimiento': userbirthday,
        }).draw();
        
      });
      
    })

    //  suscribimos un listener al click del boton remove
    $('#b_delete_p').on('click', function() {
        let dt = $('#usersList').DataTable();
        let vars = dt.data().toArray();
        let checkeds = dt.data().toArray().filter((data) => data.checked);
        for (i = 0; i < vars.length; i++) {
          console.log(checkeds[0].id)
          console.log(vars[i].id)
            if (checkeds[0].id == vars[i].id){
              var indexrow = i
            };
        };
        dt.row(indexrow).remove().draw();
        socket.emit('deleted_user',checkeds[0].id);
    });

    $('#b_download_p').on('click', function() {
      socket.emit('download_users');
      window.open('http://192.168.43.1:3000/downloadusers');
    });


    $('#edit_user').on('click', function() {
      let dt = $('#usersList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);
      console.log(checkeds)
      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].id){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].id);
          };
      };
      document.getElementById("editFNuser").value = checkeds[0].nombre_usuario;
      document.getElementById("editLN1user").value =  checkeds[0].apellido_usuario_1;
      document.getElementById("editLN2user").value =  checkeds[0].apellido_usuario_2;
      document.getElementById("editgender").value =  checkeds[0].sexo;
      document.getElementById("editbirthday").value =  checkeds[0].fecha_nacimiento;
 
    })

    $('#b_edit_p').on('click', function() {
      let dt = $('#usersList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].id == vars[i].id){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].id);
          };
      };
      
      checkeds[0].nombre_usuario = document.getElementById("editFNuser").value;
      checkeds[0].apellido_usuario_1 = document.getElementById("editLN1user").value;
      checkeds[0].apellido_usuario_2 = document.getElementById("editLN2user").value;
      checkeds[0].sexo = document.getElementById("editgender").value;
      checkeds[0].fecha_nacimiento = document.getElementById("editbirthday").value;
      
      

      dt.row(indexrow).remove().draw();
      $('#usersList').DataTable().row.add({
        'id': checkeds[0].id,
        'nombre_usuario': checkeds[0].nombre_usuario,
        'apellido_usuario_1': checkeds[0].apellido_usuario_1,
        'apellido_usuario_2': checkeds[0].apellido_usuario_2,
        'sexo': checkeds[0].sexo,
        'fecha_nacimiento': checkeds[0].fecha_nacimiento,
        
      }).draw();
      
      socket.emit('edit_user',checkeds[0]);
    });


})

socket.on('sessionsconfigdata', function(datas) {

    console.log(datas);
    global_config_data = datas;

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
             {data: 'id'},
            { data: 'date' },
            { data: 'nombre_usuario' },
            { data: 'apellido_usuario_1'},
            { data: 'apellido_usuario_2'},
            { data: 'articulacion'},
            { data: 'caso_estudio'},
            { data: 'comentarios'}
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
            document.getElementById("view_study_case").disabled = false;
            
            let dt = $('#sessionsList').DataTable();
            let vars = dt.data().toArray();
            let checkeds = dt.data().toArray().filter((data) => data.checked);
            console.log(checkeds[0]);
            n_session = checkeds[0].id;

        }else{
            document.getElementById("remove_session").disabled = true;
            document.getElementById("download_sessions_config").disabled = true; 
            document.getElementById("download_session_data").disabled = true; 
            document.getElementById("view_study_case").disabled = true;
            
            
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
        if (checkeds[0].id == vars[i].id){
          console.log(i);
          var indexrow = i;
        };
    };
    console.log()
    dt.row(indexrow).remove().draw();
    socket.emit('deleted_session',checkeds[0].id);
  });
  
  $('#b_delete_studyCase').on('click', function() {
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);
    let study_case_to_delete = checkeds[0].caso_estudio
    let indexrows = []
    for (i = 0; i < vars.length; i++) {
        if (study_case_to_delete == vars[i].caso_estudio){
          var indexrow = i;
          indexrows.push(indexrow)
        };
    };
    console.log(indexrows)
    for (i=0; i<indexrows.length; i++){
      dt.row(indexrows[0]).remove().draw();
    }
    socket.emit('deleted_study_case', study_case_to_delete);
  });

  // DOWNLOAD DATA SESSION IN CSV FORMAT
  $('#b_download_csv_studycase').on('click', function() {
    console.log("Download Data")
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].id == vars[i].id){
          console.log(i);
          console.log(checkeds[0].id);
          console.log(checkeds[0].caso_estudio);
          
          let title_text = []
          
          if(checkeds[0].articulación == "cervical"){
            title_texts = ["Extension/Flexion", "Right/Left Inclination", "Right/Left Rotation"]
          } else if(checkeds[0].articulación == "hombro_derecho"){
            title_texts = ["Extension/Flexion", "Adduction/Abduction", "External/Internal Rotation"]
          } else if(checkeds[0].articulación == "hombro_izquierdo"){
            title_texts = ["Extension/Flexion", "Abduction/Adduction", "Internal/External Rotation"]
          } else if(checkeds[0].articulación == "codo_derecho"){
            title_texts = ["Extension/Flexion", "Supination/Pronation", "Rotation"]
          } else if(checkeds[0].articulación == "codo_izquierdo"){
            title_texts = ["Extension/Flexion", "Pronation/Supination", "Rotation"]
          } else if(checkeds[0].articulación == "muñeca_derecha"){
            title_texts = ["Extension/Flexion", "Desv. Radial/Cubital", "Rotation"]
          } else if(checkeds[0].articulación == "muñeca_izquierda"){
            title_texts = ["Extension/Flexion", "Desv. Cubital/Radial", "Rotation"]
          } else if(checkeds[0].articulación == "lumbar"){
            title_texts = ["Extension/Flexion", "Right/Left Inclination", "Right/Left Rotation"]
          } else if(checkeds[0].articulación == "cadera_izquierda"){
            title_texts = ["Extension/Flexion", "Adduction/Abduction", "External/Internal Rotation"]
          } else if(checkeds[0].articulación == "cadera_derecha"){
            title_texts = ["Extension/Flexion", "Abduction/Adduction", "Internal/External Rotation"]
          } else if(checkeds[0].articulación == "rodilla_derecha"){
            title_texts = ["Flexion/Extension", "Inclination", "Rotation"]
          } else if(checkeds[0].articulación == "rodilla_izquierda"){
            title_texts = ["Flexion/Extension", "Inclination", "Rotation"]
          } else if(checkeds[0].articulación == "tobillo_derecho"){
            title_texts = ["Plantar/Dorsal Flexion", "Left/Right Inclination", "Rotation"]
          } else if(checkeds[0].articulación == "tobillo_izquierdo"){
            title_texts = ["Plantar/Dorsal Flexion", "Right/Left nclination", "Rotation"]
          }  
          socket.emit('download_studycase_csv', {
            studyCase: (checkeds[0].caso_estudio),
            titles: title_texts
          });
        };
    };
    
  })
  
  $('#view_study_case').on('click', function() {
    console.log("view clicked")
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);
    console.log(checkeds[0])
    socket.emit("study_case_to_dashboard", checkeds[0])
    location.replace("summary.html");
    
  });
	
  
  // DOWNLOAD DATA SESSION
  $('#b_download_all_s_data').on('click', function() {
    console.log("Download  all Data Sessions")
    socket.emit('download_all_sessions_data');
    
    
  })

  socket.on('open_download_csv_studycase_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadsessionsdata_studycase_csv');
  });
  socket.on('open_download_all_sessions_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadallsessionsdata');
  });

  $('#b_download_s_conf').on('click', function() {
    socket.emit('download_sessions_config');
    window.open('http://192.168.43.1:3000/downloadsessionsconfig');
  });

})








$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
  });
