/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Global Variable
var player_answer = 0;

var youtube_player_height = 0;
var youtube_player_width = 0;

var global_client_timer = null;

var socket = null;

var global_streaming_id = null;

// Youtube Player
var streaming_player = null;
var streaming_stop_sign_off = false;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // Now safe to use device APIs
        console.log("DEVICE READY")
        app.getNextGameDetails(function(){
          console.log("getNextGameDetails callback")
        });
    },

    getNextGameDetails: function(callback){

        $.ajax({
          type: "GET",
          url: "http://register-trivias.descubrenear.com/nextgame",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data){

            console.log("GET nextgame Successful")
            console.log(data)

            $('#next_game_message').html("Fecha: " +data[0].prize_date +"<br> Premio: " +data[0].prize_description);
            global_streaming_id = data[0].streaming_id
            return callback()
            
          },
          error: function(data) {
              console.log("GET nextgame Failed")
              console.log("HTTP Code: " +data.status);
              if(data.status == 0)
              {
                var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else if(data.status == 503)
              {
                var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else
              {
                $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              return callback()
          }
        });
    },

    submitAnswer: function(button_clicked){

        player_answer = button_clicked

        $('#btn1').prop('disabled', true);
        $('#btn2').prop('disabled', true);
        $('#btn3').prop('disabled', true);
        $('#btn4').prop('disabled', true);

        if(player_answer == "1")
        {
            $('#btn2').css('background','#262626');
            $('#btn3').css('background','#262626');
            $('#btn4').css('background','#262626');
        }
        else if(player_answer == "2")
        {
            $('#btn1').css('background','#262626');
            $('#btn3').css('background','#262626');
            $('#btn4').css('background','#262626');
        }
        else if(player_answer == "3")
        {
            $('#btn1').css('background','#262626');
            $('#btn2').css('background','#262626');
            $('#btn4').css('background','#262626');
        }
        else if(player_answer == "4")
        {
            $('#btn1').css('background','#262626');
            $('#btn2').css('background','#262626');
            $('#btn3').css('background','#262626');
        }

        var payload = {
          player : window.localStorage["player"], 
          answer : player_answer,
        }

        $.ajax({
              type: "POST",
              url: "http://trivias.descubrenear.com/answer",
              data: JSON.stringify(payload),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(data){
                  console.log(data.msg);
              },
              failure: function(data) {

                console.log("HTTP Code: " +data.status);
                // Reactivating buttons
                $('#btn1').prop('disabled', false);
                $('#btn2').prop('disabled', false);
                $('#btn3').prop('disabled', false);
                $('#btn4').prop('disabled', false);

                if(data.status == 0)
                {
                  var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                  $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                }
                else if(data.status == 503)
                {
                  var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                  $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                }
                else
                {
                  $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                }
              }
        });
    },

    toLoginForm: function(){
        $("#logo-register-form").hide();
        $(".register-form").hide();
        $(".forgot-password-form").hide();
        $(".leaderboard-form").hide();
        $(".next-game").show();
        $(".login-form").show();

        // Empty Leaderboard Table
        $("#leaderboardtable").find("tr:gt(0)").remove();

        // Empty Country Dropdown
        $("#country").empty();
    },

    toRegisterForm: function(){
        $(".next-game").hide();
        $(".login-form").hide();
        $(".forgot-password-form").hide();
        $(".leaderboard-form").hide();
        $("#logo-register-form").show();
        $(".register-form").show();

        $.ajax({
          type: "GET",
          url: "http://register-trivias.descubrenear.com/countries",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data){

            console.log("GET Countries Successful")
            console.log(data)

            var country_select = document.getElementById("country");

            for(var i=0;i<data.length;i++)
            {
                var option = document.createElement("option");
                option.text = data[i].country_name;
                country_select.add(option);
            }
          },
          error: function(data) {
              console.log("GET Countries Failed")
              console.log("HTTP Code: " +data.status);
              if(data.status == 0)
              {
                var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else if(data.status == 503)
              {
                var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else
              {
                $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
          }
        });
    },

    toForgotPasswordForm: function(){
        $(".login-form").hide();
        $(".register-form").hide();
        $(".leaderboard-form").hide();
        $(".forgot-password-form").show();

    },

    toLeaderBoard: function(){
        $(".login-form").hide();
        $(".register-form").hide();
        $(".forgot-password-form").hide();
        $(".leaderboard-form").show();

        $.ajax({
          type: "GET",
          url: "http://register-trivias.descubrenear.com/leaderboard",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data){

            console.log("GET leaderboard Successful")
            console.log(data)

            var table = document.getElementById("leaderboardtable");

            for(var i=0; i<data.length; i++)
            {
                var row = table.insertRow(1);

                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);

                cell0.innerHTML = data.length-i;
                cell1.innerHTML = data[i].player_winner;
                cell2.innerHTML = data[i].date;
                cell3.innerHTML = data[i].prize_description;
            }
          },
          error: function(data) {
              console.log("GET leaderboard Failed")
              console.log("HTTP Code: " +data.status);
              if(data.status == 0)
              {
                var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else if(data.status == 503)
              {
                var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else
              {
                $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
          }
        });


    },

    signOff: function(){
        console.log("Sign off");
        socket.close()

        $(".views").hide();
        $(".register-form").hide();
        $(".playland").hide();

        $(".next-game").show();
        $(".form").show();
        $(".login-form").show();
        $(".login-page").show();

        // Stop youtube streaming
        streaming_stop_sign_off = true;
        streaming_player.stopVideo()
    },

    login: function(){
        console.log("Login");

        if($('#nickname_login').val().length &&
           $('#password').val().length)
        {

            app.getNextGameDetails(function(){

                if(global_streaming_id != null)
                {

                  // Load streaming
                  streaming_player.loadVideoById(global_streaming_id);

                  var payload = {
                    nickname : $('#nickname_login').val(), 
                    password : sha256($('#password').val())
                  }

                  $.ajax({
                        type: "POST",
                        url: "http://register-trivias.descubrenear.com/login",
                        data: JSON.stringify(payload),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function(data){
                            console.log("Login Successful")
                            console.log(data)
                            console.log(data.msg)
                            $.notify(data.msg, {className:"success", globalPosition: "top left", autoHideDelay: "5000"});

                            // Don't stop video while playing
                            streaming_stop_sign_off = false;
                            app.toPlayLand();
                        },
                        error: function(data) {
                            console.log("Login Failed");
                            console.log("HTTP Code: " +data.status);
                            if(data.status == 0)
                            {
                              var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                              $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                            }
                            else if(data.status == 503)
                            {
                              var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                              $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                            }
                            else
                            {
                              $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "5000"});
                            }
                        }
                  });
                }
                else
                {
                    var msg = "El concurso de esta semana aún no comienza,\npor favor regresa más tarde."
                    $.notify(msg, {className:"info", globalPosition: "top left", autoHideDelay: "5000"});
                }
            });
        }
        else
        {
          var msg = "Por favor llena ambos campos para poder\niniciar sesión."
          $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "5000"});
        }
    },

    forgotPasswordPlayer: function(){
        console.log("forgotPasswordPlayer");

        var payload = {
          email : $('#emailfgpass').val()
        }

        if($('#emailfgpass').val().length)
        {

          $.ajax({
                type: "POST",
                url: "http://register-trivias.descubrenear.com/forgotpassword",
                data: JSON.stringify(payload),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data){
                    console.log("Forgot Password Successful")
                    console.log(data)
                    console.log(data.msg)
                    $.notify(data.msg, {className:"success", globalPosition: "top left", autoHideDelay: "9000"});
                },
                error: function(data) {
                    console.log("Forgot Password Failed");
                    console.log("HTTP Code: " +data.status);
                    if(data.status == 0)
                    {
                      var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                      $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                    }
                    else if(data.status == 503)
                    {
                      var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                      $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                    }
                    else
                    {
                        $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "9000"});
                    }
                }
          });
        }
        else
        {
            var msg = "Por favor escribe tu correo electrónico\npara poder recuperar la cuenta."
            $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
        }
    },

    registerPlayer: function(){

        console.log("Register Player")

        // Verify that all fields have information
        if( $('#name').val().trim().length &&
            $('#lastname').val().trim().length &&
            $('#nickname_register').val().trim().length &&
            $('#age').val().trim().length &&
            $('#email').val().trim().length &&
            $('#country').val() != null &&
            $('#state').val() !=null &&
            $('#city').val() !=null &&
            $('#newpassword1').val().trim().length &&
            $('#newpassword2').val().trim().length)
        {
            var passwordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
            var emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

            if(emailRegex.test($('#email').val().trim()))
            {

              if( $('#nickname_register').val().trim().indexOf(' ') == -1)
              {
                  if( $('#newpassword1').val() == $('#newpassword2').val() )
                  {
                      if(passwordRegex.test($('#newpassword1').val().trim()))
                      {
                        var payload = {
                          name : $('#name').val(),
                          lastname : $('#lastname').val(),
                          nickname: $('#nickname_register').val().trim(),
                          age : $('#age').val(),
                          email : $('#email').val(),
                          country : $('#country').val(),
                          state : $('#state').val(),
                          city : $('#city').val(), 
                          password : sha256($('#newpassword1').val().trim())
                        }

                        $.ajax({
                              type: "POST",
                              url: "http://register-trivias.descubrenear.com/register",
                              data: JSON.stringify(payload),
                              contentType: "application/json; charset=utf-8",
                              dataType: "json",
                              success: function(data){
                                  console.log("Register Successful")
                                  console.log(data)
                                  console.log(data.msg)
                                  $.notify(data.msg, {className:"success", globalPosition: "top left", autoHideDelay: "10000"});

                                  setTimeout(function(){
                                    
                                    app.toLoginForm()

                                    $('#name').val("");
                                    $('#lastname').val("");
                                    $('#nickname_register').val("");
                                    $('#age').val("");
                                    $('#email').val("");
                                    $('#country').val("");
                                    $('#state').val("");
                                    $('#city').val("");
                                    $('#newpassword1').val("");
                                    $('#newpassword2').val("");

                                  }, 11000);

                              },
                              error: function(data) {
                                  console.log("Register Failed");
                                  console.log("HTTP Code: " +data.status);
                                  if(data.status == 0)
                                  {
                                    var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                                    $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                                  }
                                  else if(data.status == 503)
                                  {
                                    var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                                    $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                                  }
                                  else
                                  {
                                    $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "5000"});
                                  }
                              }
                        });
                      }
                      else
                      {
                          $.notify("La contraseña debe tener mínimo 6 caracteres\n y al menos 1 letra minúscula, 1 letra mayúscula\ny 1 número.", {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                      }
                  }
                  else
                  {
                      $.notify("Las contraseña y su confirmación no son iguales", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
                  }
              }
              else
              {
                 $.notify("Nickname no puede contener espacios", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
              }
          }
          else
          {
              $.notify("Porfavor introduce un correo electrónico válido", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
          }
        }
        else
        {
            $.notify("Por favor llena toda la información de registro", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
        }

    },

    onCountryChange: function(){

        console.log("API to Get States")

        var country = $('#country').val()

        $.ajax({
          type: "GET",
          url: "http://register-trivias.descubrenear.com/states?country="+country,
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data){

            console.log("GET States Successful")
            console.log(data)

            var state_select = document.getElementById("state");

            $('#state').empty().append('<option value="" disabled selected>Selecciona tu estado</option>');
            $('#city').empty().append('<option value="" disabled selected>Selecciona tu ciudad</option>');

            for(var i=0;i<data.length;i++)
            {
                var option = document.createElement("option");
                option.text = data[i].state_name;
                state_select.add(option);
            }

          },
          error: function(data) {
              console.log("GET States Failed")
              console.log("HTTP Code: " +data.status);
              if(data.status == 0)
              {
                var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else if(data.status == 503)
              {
                var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
              else
              {
                $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
          }
        });
    },

    onStateChange: function(){

        if($('#country').val() == null)
        {
            $.notify("Por favor elige un país antes de seleccionar estado", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
        }
        else
        {
            console.log("API to Get Cities")

            var country = $('#country').val()
            var state = $('#state').val()

            $.ajax({
              type: "GET",
              url: "http://register-trivias.descubrenear.com/cities?country="+country+"&state="+state,
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(data){

                console.log("GET Cities Successful")
                console.log(data)

                var city_select = document.getElementById("city");

                $('#city').empty().append('<option value="" disabled selected>Selecciona tu ciudad</option>');

                for(var i=0;i<data.length;i++)
                {
                    var option = document.createElement("option");
                    option.text = data[i].city_name;
                    city_select.add(option);
                }
              },
              error: function(data) {
                  console.log("GET Cities Failed")
                  console.log("HTTP Code: " +data.status);
                  if(data.status == 0)
                  {
                    var msg = "Hubo un error con tu conexión a internet,\npor favor intenta de nuevo."
                    $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                  }
                  else if(data.status == 503)
                  {
                    var msg = "Hubo un error con el servidor,\npor favor intenta de nuevo."
                    $.notify(msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                  }
                  else
                  {
                    $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
                  }
              }
            });
        }
    },

    toPlayLand: function(){
        $(".views").show();
        $(".login-page").hide();
        $(".login-form").hide();
        $(".register-form").hide();
        $(".forgot-password-form").hide();
        $(".form").hide();
        $(".next-game").hide();

        var active_player = true;
        var non_active_player_msg = false;

        var default_count_down_timer = { 
            time: { 
                Days: { show: false },
                Hours: { show: false }, 
                Minutes: { show: false },
                Seconds: { color: "#8cc541", "text": "" }
            }, 
            count_past_zero: false,
            total_duration : 7,
            start: false,
            fg_width: 0.12
        }

        var nickname= $('#nickname_login').val();
        console.log("Player: "+nickname)
        window.localStorage["player"] = nickname;
        var server_url = "http://trivias.descubrenear.com?player="+nickname
        socket = io(server_url,{'forceNew':true })


        $('#livestreaming').height($(window).height() - $('.navbar').height() - $('.active-players').height());
        $('#livestreaming').width($(window).width())

        socket.on('connect', function(){
          console.log('Connected to App Server')
          $.notify("Conectado al servidor de Trvias Near!", {className:"success", globalPosition: "top left", autoHideDelay: "2500"});
        })

        socket.on('disconnect', function(){
          console.log('Disconnected from App Server')
          $.notify("Desconectado del servidor de Trvias Near!", {className:"error", globalPosition: "top left", autoHideDelay: "2500"});
        })

        socket.on('reconnecting', function(attemptNumber){
          console.log('Reconnecting to App Server - Attempt: ' +attemptNumber)
          $.notify("Reconectando al servidor de Trvias Near ...", {className:"info", globalPosition: "top left", autoHideDelay: "2500"});
        });

        // On every question
        socket.on('contest', function(msg){

            // Show Question Land
            $(".playland").show();

            if(active_player)
            {
              $('#btn1').prop('disabled', false);
              $('#btn2').prop('disabled', false);
              $('#btn3').prop('disabled', false);
              $('#btn4').prop('disabled', false);

              $('#btn1').css('background','#4CAF50');
              $('#btn2').css('background','#4CAF50');
              $('#btn3').css('background','#4CAF50');
              $('#btn4').css('background','#4CAF50');
            }
            else
            {
              $('#btn1').css('background','#262626');
              $('#btn2').css('background','#262626');
              $('#btn3').css('background','#262626');
              $('#btn4').css('background','#262626');              
            }

            if(global_client_timer == null)
            {
                console.log("Init TIMER")
                global_client_timer = moment()
            }

            var time_now = moment()
            var client_timer = 7 - ( time_now.diff(global_client_timer,'seconds') )

            if(client_timer<0)
            {
              client_timer = 0
            }

            console.log(client_timer)
            console.log(msg)

            document.getElementById("livestreaming").style.height = 0;
            document.getElementById("livestreaming").style.width = 0;
            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_timer);

            default_count_down_timer["total_duration"] = client_timer;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().restart();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#btn4').text(msg.option_4);
        });

        // Time is over, let's disable everything 
        socket.on('timeout', function(msg){

            console.log("TIMEOUT")

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

            if(player_answer == "1")
            {
                $('#btn2').css('background','#262626');
                $('#btn3').css('background','#262626');
                $('#btn4').css('background','#262626');
            }
            else if(player_answer == "2")
            {
                $('#btn1').css('background','#262626');
                $('#btn3').css('background','#262626');
                $('#btn4').css('background','#262626');
            }
            else if(player_answer == "3")
            {
                $('#btn1').css('background','#262626');
                $('#btn2').css('background','#262626');
                $('#btn4').css('background','#262626');
            }
            else if(player_answer == "4")
            {
                $('#btn1').css('background','#262626');
                $('#btn2').css('background','#262626');
                $('#btn3').css('background','#262626');
            }

            //console.log("Timeout, checking flag active_player: " +active_player)
            //console.log(msg.answer)
            //console.log(player_answer)

            setTimeout(function(){
                $("#CountDownTimer").TimeCircles().rebuild();
                $('#livestreaming').height($(window).height() - $('.navbar').height() - $('.active-players').height());
                $('#livestreaming').width($(window).width())
                $(".playland").hide();
                global_client_timer = null;
            }, 3000);

        });


        // Let's verify the answer of the question
        socket.on('verify_answer', function(msg){

            // Show Question Land
            $(".playland").show();

            console.log("verify_answer")

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

            $('#btn1').css('background','#262626');
            $('#btn2').css('background','#262626');
            $('#btn3').css('background','#262626');
            $('#btn4').css('background','#262626');

            if(msg.answer == "1")
            {
              $('#btn1').css('background','#4CAF50');
            }
            else if(msg.answer == "2")
            {
              $('#btn2').css('background','#4CAF50');
            }
            else if(msg.answer == "3")
            {
              $('#btn3').css('background','#4CAF50');
            }
            else if(msg.answer == "4")
            {
              $('#btn4').css('background','#4CAF50');
            }

            if(active_player && msg.answer != player_answer)
            {
                active_player = false;

                if(player_answer == "1")
                {
                  $('#btn1').css('background','#FE3838');
                }
                else if(player_answer == "2")
                {
                  $('#btn2').css('background','#FE3838');
                }
                else if(player_answer == "3")
                {
                  $('#btn3').css('background','#FE3838');
                }
                else if(player_answer == "4")
                {
                  $('#btn4').css('background','#FE3838');
                }
            }
            
            console.log("verify_answer, checking flag active_player: " +active_player)
            console.log(msg.answer)
            console.log(player_answer)

            document.getElementById("livestreaming").style.height = 0;
            document.getElementById("livestreaming").style.width = 0;
            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";

            var players_answer_distribution = msg["answer_distribution"]
            $('#answer1').text(" " +players_answer_distribution["1"]);
            $('#answer2').text(" " +players_answer_distribution["2"]);
            $('#answer3').text(" " +players_answer_distribution["3"]);
            $('#answer4').text(" " +players_answer_distribution["4"]);

            setTimeout(function(){
                $("#CountDownTimer").TimeCircles().rebuild();
                $('#livestreaming').height($(window).height() - $('.navbar').height() - $('.active-players').height());
                $('#livestreaming').width($(window).width())
                $('#answer1').text("");
                $('#answer2').text("");
                $('#answer3').text("");
                $('#answer4').text("");
                $(".playland").hide();
                global_client_timer = null;

                if(!active_player && !non_active_player_msg)
                {
                    non_active_player_msg = true;
                    alert("Gracias por participar pero elegiste la respuesta incorrecta, vuelve pronto para que seas tú el próximo ganador!")
                }
                
            }, 7000);

        });

        // We have a winner or tie, Game over
        socket.on('end_game', function(msg){

            // Show Question Land
            $(".playland").show();

            console.log("end_game")

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

            $('#btn1').css('background','#262626');
            $('#btn2').css('background','#262626');
            $('#btn3').css('background','#262626');
            $('#btn4').css('background','#262626');

            if(msg.answer == "1")
            {
              $('#btn1').css('background','#4CAF50');
            }
            else if(msg.answer == "2")
            {
              $('#btn2').css('background','#4CAF50');
            }
            else if(msg.answer == "3")
            {
              $('#btn3').css('background','#4CAF50');
            }
            else if(msg.answer == "4")
            {
              $('#btn4').css('background','#4CAF50');
            }

            if(active_player && msg.answer != player_answer)
            {
                active_player = false;

                if(player_answer == "1")
                {
                  $('#btn1').css('background','#FE3838');
                }
                else if(player_answer == "2")
                {
                  $('#btn2').css('background','#FE3838');
                }
                else if(player_answer == "3")
                {
                  $('#btn3').css('background','#FE3838');
                }
                else if(player_answer == "4")
                {
                  $('#btn4').css('background','#FE3838');
                }
            }
            
            console.log("end_game, checking flag active_player: " +active_player)
            console.log(msg.answer)
            console.log(player_answer)

            document.getElementById("livestreaming").style.height = 0;
            document.getElementById("livestreaming").style.width = 0;
            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            
            $("#CountDownTimer").TimeCircles().end();
            $('#final_message').text(msg.final_message);

            var players_answer_distribution = msg["answer_distribution"]
            $('#answer1').text(" " +players_answer_distribution["1"]);
            $('#answer2').text(" " +players_answer_distribution["2"]);
            $('#answer3').text(" " +players_answer_distribution["3"]);
            $('#answer4').text(" " +players_answer_distribution["4"]);

            setTimeout(function(){
                $('#livestreaming').height($(window).height() - $('.navbar').height() - $('.active-players').height());
                $('#livestreaming').width($(window).width())
                $('#answer1').text("");
                $('#answer2').text("");
                $('#answer3').text("");
                $('#answer4').text("");
                $(".playland").hide();
                global_client_timer = null;

                if(!active_player && !non_active_player_msg)
                {
                    non_active_player_msg = true;
                    alert("Gracias por participar pero elegiste la respuesta incorrecta, vuelve pronto para que seas tú el próximo ganador!")
                }
            }, 7000);

        });

        // Sorry but you are late, Game already started
        socket.on('game_is_already_on', function(msg){

            console.log("game_is_already_on")
            console.log(msg)
            active_player = false;

            if(!active_player && !non_active_player_msg)
            {
                non_active_player_msg = true

                setTimeout(function(){
                    alert(msg.sorry_message)
                },1000)
            }
        });

        // Update the number of online players (Playing + Watching)
        socket.on('active_players_count', function(msg){
            console.log("active_players_count")
            $('#activeplayerscount').text(" " +msg);
        });
    }
};
