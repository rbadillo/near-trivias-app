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
              failure: function(errMsg) {
                  console.log(errMsg.msg);
              }
        });
    },

    toLoginForm: function(){
        $(".register-form").hide();
        $(".login-form").show();
    },

    toRegisterForm: function(){
        $(".login-form").hide();
        $(".register-form").show();
    },


    signOff: function(){
        console.log("Sign off");
        socket.disconnect()

        $(".views").hide();
        $(".register-form").hide();
        $(".playland").hide();

        $(".form").show();
        $(".login-form").show();
        $(".login-page").show();
    },

    login: function(){
        console.log("Login");

        var payload = {
          email : $('#username').val(), 
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
                  $.notify(data.msg, {className:"success", globalPosition: "top left", autoHideDelay: "3000"});
                  app.toPlayLand();
              },
              error: function(data) {
                  console.log("Login Failed");
                  console.log(data.responseJSON.msg);
                  $.notify(data.responseJSON.msg, {className:"error", globalPosition: "top left", autoHideDelay: "3000"});
              }
        });
    },

    registerPlayer: function(){

        console.log("Register Player")

        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

        console.log($('#newpassword1').val() )

        if( $('#newpassword1').val() == $('#newpassword2').val() )
        {
            if(mediumRegex.test($('#newpassword1').val()))
            {
                $.notify("Tu cuenta ha sido creada exitosamente.\nPor favor confirma tu cuenta\ndando click en el link enviado\na tu correo electrónico", {className:"success", globalPosition: "top left", autoHideDelay: "3000"});
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

    },

    toPlayLand: function(){
        $(".views").show();
        $(".login-page").hide();
        $(".login-form").hide();
        $(".register-form").hide();
        $(".form").hide();

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

        var username= $('#username').val();
        console.log("Player: "+username)
        window.localStorage["player"] = username;
        var server_url = "http://trivias.descubrenear.com?player="+username
        socket = io(server_url);

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
