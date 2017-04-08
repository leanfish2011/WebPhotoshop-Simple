/*
* 全屏切换，在Chrome下支持
* 2015-1-28，北京
*/
function fullscreen() {
    var body = document.body;
    var status = !document.fullscreenElement &&  // get the screen status
        !document.msFullscreenElement &&
        !document.mozFullscreenElement &&
        !document.webkitFullscreenElement;

    if (status) {
        if (body.requestFullscreen) {
            body.requestFullscreen();
        } else if (body.mozRequestFullscreen) {
            body.mozRequestFullscreen();
        } else if (body.webkitRequestFullscreen) {
            body.webkitRequestFullscreen();
        } else if (body.msRequestFullscreen) {
            //body.msRequestFUllscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozExitFullscreen) {
            document.mozExitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
