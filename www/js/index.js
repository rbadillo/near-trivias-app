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

    seconds_since_epoch: function(){
        return Math.floor( Date.now() / 1000 ) 
    },

    submitAnswer: function(button_clicked){

        player_answer = button_clicked

        $('#btn1').prop('disabled', true);
        $('#btn2').prop('disabled', true);
        $('#btn3').prop('disabled', true);
        $('#btn4').prop('disabled', true);

        $('#btn1').css('background','#262626');
        $('#btn2').css('background','#262626');
        $('#btn3').css('background','#262626');
        $('#btn4').css('background','#262626');

        var payload = {
          user : window.localStorage["username"], 
          answer : player_answer,
        }

        $.ajax({
              type: "POST",
              url: "http://trivias.descubrenear.com:5000/answer",
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

    toPlayLand: function(){
        $(".views").show();
        $(".login-page").hide();
        $(".login-form").hide();
        $(".register-form").hide();
        $(".form").hide();

        var active_player = true;

        var default_count_down_timer = { 
            time: { 
                Days: { show: false },
                Hours: { show: false }, 
                Minutes: { show: false },
                Seconds: { color: "#8cc541", "text": "" }
            }, 
            count_past_zero: false,
            total_duration : 11,
            start: false,
            fg_width: 0.12
        }

        var username= $('#username').val();
        console.log("Username: "+username)
        window.localStorage["username"] = username;
        var server_url = "http://trivias.descubrenear.com:5000?username="+username
        var socket = io(server_url);

        $('#livestreaming').height($(window).height() - $('.navbar').height());
        $('#livestreaming').width($(window).width())

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

            var client_epoch = 11 - (app.seconds_since_epoch() - msg.epoch)

            if(client_epoch<0)
            {
              client_epoch = 0
            }

            console.log(client_epoch)
            console.log(msg)

            document.getElementById("livestreaming").style.height = 0;
            document.getElementById("livestreaming").style.width = 0;
            document.getElementById("question").style.visibility = "visible";
            document.getElementById("btn1").style.visibility = "visible";
            document.getElementById("btn2").style.visibility = "visible";
            document.getElementById("btn3").style.visibility = "visible";
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#btn4').text(msg.option_4);
        });

      
        socket.on('answer_already_submitted', function(msg){

            if(active_player)
            {
              $('#btn1').prop('disabled', true);
              $('#btn2').prop('disabled', true);
              $('#btn3').prop('disabled', true); 
              $('#btn4').prop('disabled', true);   
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
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#btn4').text(msg.option_4);
        });

        socket.on('timeout', function(msg){

            console.log("TIMEOUT")
            //$('#livestreaming').height(youtube_player_height);
            //$('#livestreaming').width(youtube_player_width);
            //$('#livestreaming').height($(window).height() - $('.navbar').height());
            //$('#livestreaming').width($(window).width())

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

            $('#btn1').css('background','#262626');
            $('#btn2').css('background','#262626');
            $('#btn3').css('background','#262626');
            $('#btn4').css('background','#262626');

            if(msg.answer != player_answer)
            {
              active_player = false;
            }

            // rebuild Timer
            $("#CountDownTimer").TimeCircles().rebuild();
            console.log("Timeout, checking flag active_player: " +active_player)
            console.log(msg.answer)
            console.log(player_answer)

            setTimeout(function(){ 
                $('#livestreaming').height($(window).height() - $('.navbar').height());
                $('#livestreaming').width($(window).width())
                $(".playland").hide(); 
            }, 3000);

        });

        socket.on('end_game', function(msg){

            console.log("end_game")
            //$('#livestreaming').height(youtube_player_height);
            //$('#livestreaming').width(youtube_player_width);


            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

            setTimeout(function(){ 
                $('#livestreaming').height($(window).height() - $('.navbar').height());
                $('#livestreaming').width($(window).width())
                $(".playland").hide(); 
            }, 3000);
        });

        socket.on('game_is_already_on', function(msg){

            console.log("game_is_already_on")
            console.log(msg)
            active_player = false;

            $('#btn1').prop('disabled', true);
            $('#btn2').prop('disabled', true);
            $('#btn3').prop('disabled', true);
            $('#btn4').prop('disabled', true);

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
            document.getElementById("btn4").style.visibility = "visible";
            document.getElementById("CountDownTimer").style.visibility = "visible";
            document.getElementById("CountDownTimer").setAttribute("data-timer",client_epoch);

            default_count_down_timer["total_duration"] = client_epoch;

            $("#CountDownTimer").TimeCircles(default_count_down_timer);
            $("#CountDownTimer").TimeCircles().start();

            $('#question').text(msg.question);
            $('#btn1').text(msg.option_1);
            $('#btn2').text(msg.option_2);
            $('#btn3').text(msg.option_3);
            $('#btn4').text(msg.option_4);
            $('#late').text(msg.sorry);

        });
    }
};
