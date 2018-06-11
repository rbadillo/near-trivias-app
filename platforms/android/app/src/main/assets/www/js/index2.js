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

        var active_player = true;
        var player_answer = 0;

        var default_count_down_timer = { 
            time: { 
                Days: { show: false },
                Hours: { show: false }, 
                Minutes: { show: false },
                Seconds: { color: "#8cc541" }
            }, 
            count_past_zero: false,
            total_duration : 11,
            start: false,
            fg_width: 0.08
        }

        var server_url = "http://trivia.descubrenear.com:5000"
        var socket = io(server_url);

        socket.on('contest', function(msg){

            if(active_player)
            {
              $('#btn1').prop('disabled', false);
              $('#btn2').prop('disabled', false);
              $('#btn3').prop('disabled', false);
              $('#game').text("GAME OVER");
              $('#game').hide();
            }

            var client_epoch = 11 - (app.seconds_since_epoch() - msg.epoch)

            if(client_epoch<0)
            {
              client_epoch = 0
            }

            console.log(client_epoch)
            console.log(msg)

            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
        });

      
        socket.on('answer_already_submitted', function(msg){

            if(active_player)
            {
              $('#btn1').prop('disabled', true);
              $('#btn2').prop('disabled', true);
              $('#btn3').prop('disabled', true);   
            }

            var client_epoch = 11 - (app.seconds_since_epoch() - msg.epoch)

            if(client_epoch<0)
            {
              client_epoch = 0
            }

            console.log(client_epoch)
            console.log(msg)

            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#game').text(msg.msg);
        });

        socket.on('timeout', function(msg){

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#game').show();

            if(msg.answer != player_answer)
            {
              active_player = false;
            }

            // rebuild Timer
            $("#CountDownTimer").TimeCircles().rebuild();

        });

        socket.on('end_game', function(msg){

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#game').text(msg.msg);
            $('#game').show();

        });

        socket.on('game_is_already_on', function(msg){

            console.log("game_is_already_on")
            console.log(msg)
            active_player = false;

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);

            var client_epoch = 11 - (app.seconds_since_epoch() - msg.epoch)

            if(client_epoch<0)
            {
              client_epoch = 0
            }

            console.log(client_epoch)

            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#late').text(msg.sorry);

        });
    },

    seconds_since_epoch: function(){
        return Math.floor( Date.now() / 1000 ) 
    },

    submitAnswer: function(button_clicked){

        player_answer = button_clicked

        $('#btn1').prop('disabled', true);
        $('#btn2').prop('disabled', true);
        $('#btn3').prop('disabled', true);

        var payload = {
          user : "rbadillo", 
          answer : player_answer,
        }

        $.ajax({
              type: "POST",
              url: "http://trivia.descubrenear.com:5000/answer",
              data: JSON.stringify(payload),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(data){
                  $('#game').text(data.msg);
              },
              failure: function(errMsg) {
                  $('#game').text(errMsg.msg);
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
    }
};
