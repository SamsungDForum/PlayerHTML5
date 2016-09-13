(function(){
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[PlayerHTML5]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = [
            'MediaFastForward',
            'MediaPlayPause',
            'MediaPause',
            'MediaPlay',
            'MediaRewind',
            'MediaStop',
            '1'
        ];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            var seekJump = 5;
            switch (e.keyCode) {
                //key RETURN
                case 10009:
                    log("RETURN");
                    tizen.application.getCurrentApplication().hide();
                    break;

                //key PLAY
                case 415:
                    play();
                    break;

                //key STOP
                case 413:
                    pause();
                    player.currentTime = 0;
                    break;

                //key PAUSE
                case 19:
                	pause();
                	break;
               
                //key PLAY_PAUSE
                case 10252: 
                    if (paused) {
                        play();
                    } else {
                        pause();
                    }
                    break;

                //key FF
                case 417:
                    if (!player.seeking && player.currentTime + seekJump < player.seekable.end(0)) {
                        pause();
                        player.currentTime += seekJump;
                        play();
                    }
                    break;

                //key REWIND
                case 412:
                    if (!player.seeking && player.currentTime - seekJump > player.seekable.start(0)) {
                        pause();
                        player.currentTime -= seekJump;
                        play();
                    }
                    break;

                //key 1
                case 49:
                    log("Key 1");
                    changeSource();
                    break;

                default:
                    log("Unhandled key: " + e.keyCode);
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    var paused = true;
    var posters = ['img/BUNNY_poster.jpg', 'img/SINTEL_poster.jpg'];
    var sources = ['http://media.w3.org/2010/05/bunny/trailer.mp4', 'http://media.w3.org/2010/05/sintel/trailer.mp4'];
    var currentSource = 0;
    var player = null;

    /**
     * Creates HTML video tag and adds all event listeners
     */
    function createPlayer() {
        var player = document.createElement('video');

        player.src = sources[0];
        player.poster = posters[0];

        player.addEventListener('loadeddata', function (e) {
            log("Movie loaded.");
        });
        player.addEventListener('loadedmetadata', function (e) {
            log("Meta data loaded.");
        });
        player.addEventListener('timeupdate', function (e) {
            log("Current time: " + player.currentTime);
        });
        player.addEventListener('play', function (e) {
            log("Playback started.");
        });
        player.addEventListener('pause', function (e) {
            log("Playback paused.");
        });
        player.addEventListener('ended', function (e) {
            log("Playback finished.");
        });
        player.addEventListener('click', function (e) {
            if (paused) {
                play();
            } else {
                pause();
            }
        });

        return player;
    }

    /**
     * Stop the player when application is closed.
     */
    function onUnload() {
    	log('onUnload');
        player.pause();
        player.currentTime = 0;
    }

    /**
     * Choose next source video and poster
     */
    function changeSource() {
        currentSource += 1;

        // Last source reached, go to the first one
        if (currentSource >= sources.length) {
            currentSource = 0;
        }

        if (!player) {
            player = createPlayer();
            document.querySelector('.left').appendChild(player);
        }

        player.poster = posters[currentSource];
        player.src = sources[currentSource];
    }

    /**
     * Function to start video playback.
     * Create video element if it does not exist yet.
     */
    function play() {
        paused = false;
        player.play();
    }

    /**
     * Function to pause video playback.
     */
    function pause() {
        paused = true;
        player.pause();
    }


    /**
     * Start the application once loading is finished
     */
    window.onload = function () {
        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
            return;
        }

        displayVersion();
        registerKeys();
        registerKeyHandler();
        player = createPlayer();
        document.querySelector('.left').appendChild(player);

        document.body.addEventListener('unload', onUnload);
    };
})();