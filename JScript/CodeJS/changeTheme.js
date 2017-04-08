//#region 更换皮肤

//更换皮肤
function onChangeTheme(theme) {
    switch (theme) {
        case 'default':
            //该项为选中状态
            $('#default').css("background-color", "#C9D3E2");
            //其他为非选中状态
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'bootstrap':
            //该项为选中状态
            $('#bootstrap').css("background-color", "#C9D3E2");
            //其他为非选中状态
            $('#default').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-blue':
            //该项为选中状态
            $('#metro-blue').css("background-color", "#C9D3E2");
            //其他为非选中状态
            $('#bootstrap').css("background-color", "");
            $('#default').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-green':
            //该项为选中状态
            $('#metro-green').css("background-color", "#C9D3E2");
            //其他为非选中状态
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#default').css("background-color", "");
            $('#metro-red').css("background-color", "");
            break;
        case 'metro-red':
            //该项为选中状态
            $('#metro-red').css("background-color", "#C9D3E2");
            //其他为非选中状态
            $('#bootstrap').css("background-color", "");
            $('#metro-blue').css("background-color", "");
            $('#metro-green').css("background-color", "");
            $('#default').css("background-color", "");
            break;
    }
    //更换皮肤
    var link = $('#content').find('link:first');
    link.attr('href', '../JScript/jquery-easyui/themes/' + theme + '/easyui.css');
}

//#endregion