"use strict";
(function(){
    const BACKGROUNDCOLOR   = "#d0f0f7";
    const CHESSBOARDWIDTH   = 15;
    const CHESSBOARDHEIGHT  = 15;
    const CHESSTOWIN        = 5;
    const WHITECHESS        = 1;
    const BLACKCHESS        = 2;
    const TIMEOUT           = 1000;

    var canvas          = document.getElementById("gobang");
    var ctx             = canvas.getContext('2d');

    var chessboard      = [];
    var play_process    = [];
    var play_even       = false;

    var dom = {
        black_url       : $(".black_url"),
        white_url       : $(".white_url"),
        time_out        : $(".time_out"),
        chess_play      : $(".chess_play"),
        chess_reset     : $(".chess_reset"),
        chess_msg       : $(".chess_msg"),
        chess_replay    : $(".chess_replay"),
        replay_next     : $(".chess_replay_next")
    };

    function log(text){
        dom.chess_msg.html(text);
    };

    function log_clear(){
        dom.chess_msg.html("");
    };

    function chessboard_init(){
        chessboard  = [];
        for (var i = 0; i < CHESSBOARDWIDTH; i++) {
            var chessboard_temp = [];
            for (var j = 0; j < CHESSBOARDHEIGHT; j++) {
                chessboard_temp.push(0);
            }
            chessboard.push(chessboard_temp);
        }
        return chessboard;
    };

    function draw_chessboard(){
        ctx.fillStyle = BACKGROUNDCOLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#666';
        ctx.beginPath();
        for (var i = 0; i < CHESSBOARDWIDTH; i++) {
            ctx.moveTo(60 + i * 40, 20);
            ctx.lineTo(60 + i * 40, 580);
            ctx.stroke();
            ctx.moveTo(60, 20 + i * 40);
            ctx.lineTo(620, 20 + i * 40);
            ctx.stroke();
        }
    };

    /**
     * @param {Object} opt
     {
        player_role : 1 or 2,
        x           : x,
        y           : y
    }
    */
    function draw_chess(opt){
        var chess_color = (opt.player_role == WHITECHESS) ? '#fff' : "#000";
        ctx.fillStyle = chess_color;
        ctx.beginPath();
        ctx.arc(60 + 40 * opt.x, 60 + 40 * opt.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    };

    /**
     * @param {String} position_x
     * @param {String} position_y
    */
    function draw_chess_win(x, y){
        var chess_color = "#ff0000";
        ctx.strokeStyle = chess_color;
        ctx.beginPath();
        ctx.arc(60 + 40 * x, 60 + 40 * y, 16, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function reset_chessboard(){
        log_clear();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_chessboard();
        chessboard_init();
        dom.chess_replay.attr("disabled", false);
        return;
    };

    /**
     * @param {String} position_x
     * @param {String} position_y
     * @return {Bool}
    */
    function can_set_chess(x, y){
        if (chessboard[x][y] == 0) {
            return true;
        }
        return false;
    };

    /**
     * @param {Object} opt
     {
        player_role : 1 or 2,
        x           : x,
        y           : y
    }
    */
    function play_chess(opt){
        chessboard[opt.x][opt.y] = opt.player_role;
    };

    /**
     * @param {Object} opt
     {
        url         : request url,
        player_role : 1 or 2,
        chessboard  : chessboard,
        onsuccess   : function(){ }
    }
    */
    function get_chess_to_play(opt){
        $.ajax({
            url     : opt.url ,
            method  : "post",
            data    : {
                chessboard  : JSON.stringify(opt.chessboard),
                player_role : opt.player_role
                },
            success : function(data){
                if(data.code != 0){
                    return false;
                }
                if (!can_set_chess(data.data.x,data.data.y)) {
                    log("此处(" + data.data.x + "," + data.data.y + ")不可以落子");
                    return false;
                }
                draw_chess({
                    player_role : opt.player_role,
                    x           : data.data.x,
                    y           : data.data.y
                });
                play_chess({
                    player_role : opt.player_role,
                    x           : data.data.x,
                    y           : data.data.y
                });

                play_process.push([opt.player_role, data.data.x, data.data.y]);

                opt.onsuccess(data);
            },
            error : function(){
                log("网络错误");
            }
        });
    };

    /**
     * @param {Object} opt
     {
        player_role : 1 or 2,
        x           : x,
        y           : y
    }
    * @return {Bool}
    */
    function is_finished(opt){
        let count = 0;
        let play_even_count = 0;
        let i = opt.y;
        let j = opt.x;
        let m = 0;
        let n = 0;

        while (i > 0 && i < 15 && chessboard[opt.x][i] == opt.player_role) {
            count++;
            i--;
            if (count == CHESSTOWIN) {
                return true;
            }
        }
        i = opt.y;
        while (i > 0 && i < 15 && chessboard[opt.x][i] == opt.player_role) {
            count++;
            i++;
            if (count == CHESSTOWIN + 1) {
                return true;
            }
        }
        i = opt.y;
        count = 0;

        while (j > 0 && j < 15 && chessboard[j][opt.y] == opt.player_role) {
            count++;
            j--;
            if (count == CHESSTOWIN) {
                return true;
            }
        }
        j = opt.x;
        while (chessboard[j][opt.y] == opt.player_role) {
            count++;
            j++;
            if (count == CHESSTOWIN + 1) {
                return true;
            }
        }
        j = opt.x;
        count = 0;

        while (i > 0 && i < 15 && j > 0 && j < 15 && chessboard[i][j] == opt.player_role) {
            count++;
            i--;
            j--;
            if (count == CHESSTOWIN) {
                return true;
            }
        }
        i = opt.y;
        j = opt.x;
        while (i > 0 && i < 15 && j > 0 && j < 15 && chessboard[i][j] == opt.player_role) {
            count++;
            i++;
            j++;
            if (count == CHESSTOWIN + 1) {
                return true;
            }
        }
        i = opt.y;
        j = opt.x;
        count = 0;

        while (i > 0 && i < 15 && j > 0 && j < 15 && chessboard[i][j] == opt.player_role) {
            count++;
            i--;
            j++;
            if (count == CHESSTOWIN) {
                return true;
            }
        }
        i = opt.y;
        j = opt.x;
        while (i > 0 && i < 15 && j > 0 && j < 15 && chessboard[i][j] == opt.player_role) {
            count++;
            i++;
            j--;
            if (count == CHESSTOWIN + 1) {
                return true;
            }
        }

        while (m < 15 && n < 15) {
            if (chessboard[m][n] != 0) {
                play_even_count++;
            }
            m++;
            n++;
        }

        if (play_even_count == CHESSBOARDWIDTH * CHESSBOARDHEIGHT) {
            play_even = true;
            return true;
        }

        return false;
    };

    /**
     * @param {String} url
    */
    function play_black(){
        let timeout     = $.trim(dom.time_out.val())*1000 || TIMEOUT;
        var url_black   = $.trim(dom.black_url.val());
        get_chess_to_play({
               url         : url_black,
               player_role : BLACKCHESS,
               chessboard  : chessboard,
               onsuccess   : function(data){
                   if ( is_finished({
                       player_role : BLACKCHESS,
                       x           : data.data.x,
                       y           : data.data.y
                   }) && !play_even) {
                       draw_chess_win(data.data.x, data.data.y);
                       log("黑子赢");
                       return false;
                   }else if (play_even) {
                       log("平局(´๑•ω•๑`)");
                       return false;
                   }
                   setTimeout(play_white, timeout);
               }
        });
    };

    /**
     * @param {String} url
    */
    function play_white(){
        let timeout     = $.trim(dom.time_out.val())*1000 || TIMEOUT;
        var url_white   = $.trim(dom.white_url.val());
        get_chess_to_play({
              url         : url_white,
              player_role : WHITECHESS,
              chessboard  : chessboard,
              onsuccess   : function(data){
                  if ( is_finished({
                      player_role : WHITECHESS,
                      x           : data.data.x,
                      y           : data.data.y
                  }) && !play_even) {
                      draw_chess_win(data.data.x, data.data.y);
                      log("白子赢");
                      return false;
                  }else if (play_even) {
                      log("平局(´๑•ω•๑`)");
                      return false;
                  }
                  setTimeout(play_black, timeout);
             }
        });
    };

    function chess_replay(){
        reset_chessboard();
        if (play_process.length == 0) {
            log("棋局历史记录 is 404 NotFound");
            return;
        }
        draw_chess({
            player_role : play_process[0][0],
            x           : play_process[0][1],
            y           : play_process[0][2]
        });
        play_process.shift();
        dom.chess_replay.attr("disabled", true);
    };

    function replay_next(){
        if (play_process.length != 0) {
            draw_chess({
                player_role : play_process[0][0],
                x           : play_process[0][1],
                y           : play_process[0][2]
            });
            play_process.shift();
        }else {
            log("找不到下一步~摊手.jpg");
            return;
        }
    };

    function chess_play(){
        play_process = [];
        reset_chessboard();
        log_clear();
        play_black();
        dom.chess_replay.attr("disabled", false);
    };

    draw_chessboard();
    chessboard_init();

    dom.chess_play.on("click",chess_play);
    dom.chess_reset.on("click",reset_chessboard);
    dom.chess_replay.on("click",chess_replay);
    dom.replay_next.on("click",replay_next);

})();
