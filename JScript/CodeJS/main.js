/*
* 对前端的操作创建
* 作者：Tim  北京
* 2014-5-12创建
* 2014-6-21修改
* 2014-08-17完成工具箱功能
* 2014-12基本完成
*/

//#region 系统要使用的变量

var username = ""; //用户进行协同操作的用户名
var scHeight = 0; //屏幕的高
var scWidth = 0; //屏幕的宽

var drawarea = $(".drawWindow");             //获取绘图区域，包含两块画布

var showcanvas = document.getElementById("showcanvas");        //最终展现区
var show = showcanvas.getContext("2d");

var tempcanvas = document.getElementById("tempcanvas");        //临时绘图区，每次鼠标移动绘图前要进行画布清空
var temp = tempcanvas.getContext("2d");

//var mapWidth = tempcanvas.getAttribute("width"); //临时绘图区宽
//var mapHeight = tempcanvas.getAttribute("height"); //临时绘图区高
var mapWidth;//绘图区域宽
var mapHeight;//绘图区域高

var isMouseDown = false;      //鼠标是否按下，按下开始绘图
var startX = 0;                   //鼠标起始X坐标
var startY = 0;                   //鼠标起始Y坐标

var currentX = 0;                  //鼠标当前X坐标
var currentY = 0;                  //鼠标当前Y坐标

var pencolor = "";                  //线颜色、填充颜色
var penwidth = "";                  //线粗细
var penshowdow = "";                //模糊程度
var penalpha = "";                  //透明度
var penstyle = "";                  //笔头样式

var drawObject = "btnPencil";                //绘图对象
var drawObjectName = "铅笔（P）";
var drawObjectIcon = "icon-btnPencil";

var oprationmenuid;                 //菜单下的操作id
var oprationmenutext;               //操作命令名称
var iconmenuCls;                    //操作图标

var txtPoX = 0;                   //文本位置
var txtPoY = 0;

var txtFont = "";       //文本字体
var txtSize = "";       //文本大小
var txtBold = "";       //加粗
var txtItalic = "";    //倾斜
var txtUnderline = ""; //下划线
var txtDeleteline = ""; //删除线
var txtAlign = "";      //文本对齐
var txtInput = "";      //文本内容

var showoject = ""; //当前对象的属性

//矩形、圆
var drawWidth = 0; //绘图对象的宽
var drawHeight = 0; //绘图对象的高

//图片旋转缩放
var rad_x = 1;
var rad_y = 1;//水平/垂直变换参数
var rad_radian = 0;//旋转变换参数
var rad_zoom = 1;//缩放比例

//图像亮度调整原始图片
var imgdlight;
var imgdlighttmp;

var cancelTimes = 0; //撤销次数
var imageHistoryList = new Array(); //存储图片绘制历史信息

var isCreatedRule = false;//是否已经创建了标尺
var evt;
var dragdrop;
var rg;
var isCreatedGrid = false;//是否已经创建了网格

var isCommunicate = false;//是否已经加入协同处理
var communicateTo = 0;//默认为所有人

//#endregion

//#region 自定义函数

//弹出窗体
function showMyWindow(iconCls, title, href, width, height, modal, minimizable, maximizable, closable, top, left, widowsId) {
    var vWindowsId;
    vWindowsId = widowsId === undefined ? 'myWindow' : widowsId;
    $('#' + vWindowsId + '').window({
        iconCls: iconCls,
        title: title,
        width: width === undefined ? 600 : width,
        height: height === undefined ? 400 : height,
        top: top === undefined ? ($(window).height() - height) * 0.5 : top,
        left: left === undefined ? ($(window).width() - width) * 0.5 : left,
        loadingMessage: '正在加载数据，请稍等片刻......',
        content: '<iframe  frameborder="0"  src="' + href + '" scrolling="auto" style="width: 100%; height: 98%" id="' + vWindowsId + '_windows"></iframe>',
        modal: modal === undefined ? true : modal,
        minimizable: minimizable === undefined ? false : minimizable,
        maximizable: maximizable === undefined ? false : maximizable,
        closable: closable === undefined ? true : closable,
        shadow: false,
        cache: false,
        closed: false,
        collapsible: false,
        resizable: false
    });
}

//关闭窗体
function closeMyWindow(paras, widowsId, pwindowsid) {//参数；Windows标识；父Windows标识；
    var vWindowsId2;
    vWindowsId2 = widowsId === undefined ? 'myWindow' : widowsId;
    $('#' + vWindowsId2 + '').window('close');
    //子页面关闭时，向父页面传递参数，父页面进行处理
    try {
        if (paras != undefined) {
            if (pwindowsid === undefined) {
                //window.reCallMethod(paras); //调用reCallMethod函数
                //window.frames["testIframe"].reCallMethod(paras);
                reCallMethod(paras);
            } else {
                window.frames[pwindowsid + '_windows'].reCallMethod(paras);
            }
        }
    } catch (e) { alert(e); }
}

//处理子页面的传回的参数
function opeChildParas(paras) {
    try {
        if (paras != undefined) {
            reCallMethod(paras);
        }
    } catch (e) { alert(e); }
}

//清除字符串开始和结尾的空格
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

//获取图层中最上的，且未隐藏的图层
function getCurrentCanvas() {
    for (var i = levelList.length - 1; i > -1; i--) {
        if (levelList[i].isHide == false) {
            var currentCanvas = document.getElementById(levelList[i].canvasId);
            show = currentCanvas.getContext("2d");
            break;
        }
    }
}

//#endregion

//#region控件事件

//是否填充选中，则笔头大小隐藏
$("#chekfill").change(function () {
    $('#penWdth').toggle(); //笔头大小

    if (drawObject == "btnRectangle") {//是否圆角只针对矩形切换
        $('#opiscirclecorner').toggle();//是否圆角
    }
});

//是否圆角选中，则是否填充隐藏
$("#chekcirclecorner").change(function () {
    $('#opisfill').toggle(); //是否填充
});

//#endregion

//创建新的画布todo，创建canvas
function CreatedrawWindow() {
    var imgName = $("#txtImgName").val(); //画布名称
    var imgWidth = $("#spiImgWidth").val(); //画布宽度
    var imgHeight = $("#spiImgHeight").val(); //画布高度

    //获取画布大小
    var style = '"width: ' + imgWidth + 'px; height: ' + imgHeight + 'px;"';

    //创建tab及画布
    $('#tabDraw').tabs('add', {
        title: imgName,
        closable: true,
        iconCls: 'icon-log',
        content: '<div class="drawWindow" style=' + style + '></div>'
    });

    $('.drawWindow').parent().css('background-color', '#C9D3E2'); //改变父级的tab背景颜色

    $("#diamnFileNew").dialog('close');
}

//保存绘制的图片
function SaveImg() {
    //将图像输出为base64压缩的字符串  默认为image/png
    var data = showcanvas.toDataURL();
    //删除字符串前的提示信息 "data:image/png;base64,"
    var imgData = data.substring(22);
    //POST到服务器上，生成图片
    $.post("../../Handler/SaveImgHandler.ashx?Method=SaveImg", { "imgData": imgData, "imgName": $("#txtImgSaveName").val(), "imgSavePath": $("#txtImgSavePath").val() }, function (data, status) {
        if (status == "success") {
            //返回图片路径
            $.messager.alert('成功', '保存成功！<br \>位置为：' + data, 'info');
            $('#diamnSave').dialog('close');
        }
        else {
            $.messager.alert("保存失败");
        }
    }, "text");
}

//图片另存为
function SaveAsImg() {
    //将图像输出为base64压缩的字符串  默认为image/png
    var data = showcanvas.toDataURL();
    //删除字符串前的提示信息 "data:image/png;base64,"
    var imgData = data.substring(22);
    //POST到服务器上，生成图片
    $.post("../../Handler/SaveImgHandler.ashx?Method=SaveAsImg", { "imgData": imgData, "imgName": $("#txtImgSaveAsName").val(), "imgExtend": $("#combImgSaveAsExtend").combobox('getValue'), "imgSavePath": $("#txtImgSaveAsPath").val() }, function (data, status) {
        if (status == "success") {
            //返回图片路径
            $.messager.alert('成功', '保存成功！<br \>位置为：' + data, 'info');
            $('#diamnSaveAs').dialog('close');
        }
        else {
            $.messager.alert("保存失败", "保存失败", 'info');
        }
    }, "text");
}

//协同操作退出
function LoinOut() {
    $.messager.confirm('协同操作退出', '确定退出协同操作？', function (r) {
        if (r) {
            username = ""; //用户名清空
            closeMyWindow(); //关闭协同处理窗口
            $.messager.alert('协同操作退出', '协同操作退出成功！');
        }
    });
}

//#region 菜单操作

//#region总的操作方法

//记录当前操作id、操作名称、操作图标
$('#menu div div').click(function () {
    if (this.id != undefined && this.id != "") {
        oprationmenuid = this.id;
        oprationmenutext = $(this).text().trim();
        var iconClsArray = $(this).attr('data-options').split(",");
        var iconCls = iconClsArray[0].substring(9);
        iconmenuCls = iconCls.substring(0, iconCls.length - 1);
    }
});

//#endregion

//“文件”下的菜单操作
$('#mnFile div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnFileNew": //新建
                $("#diamnFileNew").dialog('open');
                break;
            case "mnFileopen": //打开
                fileOpen();
                break;
            case "mnFilefromCam": //获取
                imgFromCamera();
                break;
            case "mnFilecancel": //关闭
                $.messager.confirm('确定', '图片未保存，确定关闭？', function (r) {
                    if (r) {
                        //判断是否保存
                        $.messager.alert('关闭', '关闭成功！', 'info');
                    }
                });
                break;
            case "mnFilecloseall": //关闭全部
                $.messager.confirm('确定', '图片未保存，确定关闭？', function (r) {
                    if (r) {
                        //判断是否保存
                        $.messager.alert('关闭', '关闭成功！', 'info');
                    }
                });
                break;
            case "mnFilesave": //保存
                $("#diamnSave").dialog('open');
                break;
            case "mnFilesaveall": //保存全部
                //保存全部

                $.messager.alert('成功', '保存成功！', 'info');
                break;
            case "mnFilesaveas": //另存为
                $("#diamnSaveAs").dialog('open');
                break;
            case "mnFileprint": //打印
                showMyWindow('icon-print', '打印', 'Code/PrintImg.aspx', 800, 600, true, false, false, true);
                break;
            case "mnFileexist": //退出
                $.messager.confirm('确定', '图片未保存，确定退出？', function (r) {
                    if (r) {//不保存图片，直接退出
                        window.open('', '_parent', '');
                        window.top.opener = null;
                        window.close();
                    }
                });
                break;
        }
    }
});

//打开文件
function fileOpen() {
    showMyWindow('icon-open', '打开', 'Code/SelectImg.html', 800, 400, true, false, false, true);
}

//获取
function imgFromCamera() {
    showMyWindow('icon-fromCam', '获取', 'Code/GetCamareImg.aspx', 800, 600, true, false, false, true);
}

//“编辑”下的菜单操作
$('#mnEdit div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnEditundo":
                //alert("撤销");
                undo();
                break;
            case "mnEditredo":
                //alert("重做");
                redo();
                break;
            case "mnEditcut":
                alert("剪切");
                break;
            case "mnEditcopy":
                alert("复制");
                break;
            case "mnEditpaste":
                alert("粘贴");
                break;
            case "mnEditselectall":
                alert("选择所有");
                break;
            case "mnEditclear": //清空
                $.messager.confirm('确定', '确定清空当前画布？', function (r) {
                    if (r) {
                        reset();
                    }
                });
                break;
        }
    }
});

//“图像”下的菜单操作
$('#mnImage div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnImageautolevel": //色阶
                $("#diamnImageautolevel").dialog('open');
                break;
            case "mnImagecolorpalettes": //色相/饱和度
                $("#diamnImagecolorpalettes").dialog('open');
                break;
            case "mnImageimgsize":
                alert("图像大小");
                break;
            case "mnImagecanvassize":
                alert("画布大小");
                break;
            case "mnImagerotate180"://旋转180度
                transforms.flat();

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsflat", communicateTo);
                }

                break;
            case "mnImagerotatew90"://顺时针旋转90度
                transforms.right();

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsright", communicateTo);
                }

                break;
            case "mnImagerotatee90"://逆时针旋转90度
                transforms.left();

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsleft", communicateTo);
                }

                break;
            case "mnImageinputcc": //旋转任意角度
                $("#diamnImageinputcc").dialog('open');
                break;
            case "mnImagehorizonrotate"://水平翻转
                transforms.horizontal();

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformshorizontal", communicateTo);
                }

                break;
            case "mnImageverticalrotate"://垂直翻转
                transforms.vertical();

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("transformsvertical", communicateTo);
                }

                break;
            case "mnImagetailor": //裁剪
                //alert("裁剪");
                ToolOpration("btnSelectCut", "裁剪");
                break;
        }
    }
});

//“图层”下的菜单操作
$('#mnLevel div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnLevelnewlevel":
                //alert("新建图层");
                levelOpration.addLevel();
                break;
            case "mnLevelno":
                alert("待实现！删除图层");
                break;
            case "mnLevelcopylevel":
                alert("待实现！复制图层");
                break;
            case "mnLeveluplevel":
                alert("待实现！向上移动图层");
                break;
            case "mnLeveldownlevel":
                alert("待实现！向下移动图层");
                break;
            case "mnLevellevelinfo":
                alert("待实现！图层属性");
                break;
        }
    }
});

//“效果”下的菜单操作
$('#mnConslate div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnConslateblackwhite": //黑白
                var win = $.messager.progress({
                    title: '黑白',
                    msg: '处理...'
                });
                tobalckwhite();
                //处理完后关闭
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("tobalckwhite", communicateTo);
                }

                break;
            case "mnConslateopsitecolor": //反色
                var win = $.messager.progress({
                    title: '反色',
                    msg: '处理...'
                });
                inverse();
                //处理完后关闭
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("inverse", communicateTo);
                }

                break;
            case "mnConslatelight": //亮度/对比度
                $("#diamnLightSlide").dialog('open');
                imgdlighttmp = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
                imgdlight = imgdlighttmp;
                break;
            case "mnConslateblur": //模糊
                var win = $.messager.progress({
                    title: '浮雕',
                    msg: '处理...'
                });
                blur();
                //处理完后关闭
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("blur", communicateTo);
                }

                break;
            case "mnConslatecloud": //雾化
                var win = $.messager.progress({
                    title: '雾化',
                    msg: '处理...'
                });
                wuhuaView();
                //处理完后关闭
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("wuhuaView", communicateTo);
                }

                break;
            case "mnConslatesharpen": //锐化
                var win = $.messager.progress({
                    title: '锐化',
                    msg: '处理...'
                });
                sharpen();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("sharpen", communicateTo);
                }

                break;
            case "mnConslatefloat": //浮雕
                var win = $.messager.progress({
                    title: '浮雕',
                    msg: '处理...'
                });
                selaFloat();
                //处理完后关闭
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3000);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("selaFloat", communicateTo);
                }

                break;
            case "mnConslatesoft": //柔化
                var win = $.messager.progress({
                    title: '柔化',
                    msg: '处理...'
                });

                conslateSoft();

                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslateSoft", communicateTo);
                }

                break;
            case "mnConslatepainting": //油画
                var win = $.messager.progress({
                    title: '油画',
                    msg: '处理...'
                });

                conslatepainting();

                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslatepainting", communicateTo);
                }

                break;
            case "mnConslatewood": //积木
                var win = $.messager.progress({
                    title: '积木',
                    msg: '处理...'
                });
                conslatewood();

                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("conslatewood", communicateTo);
                }

                break;
            case "mnConslateCuve": //雕刻
                var win = $.messager.progress({
                    title: '雕刻',
                    msg: '处理...'
                });
                diaokeView();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("diaokeView", communicateTo);
                }

                break;
            case "mnConslateTurnOld": //怀旧
                var win = $.messager.progress({
                    title: '怀旧',
                    msg: '处理...'
                });
                turnOld();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnOld", communicateTo);
                }

                break;
            case "mnConslateTurnRed": //红色蒙版
                var win = $.messager.progress({
                    title: '红色蒙版',
                    msg: '处理...'
                });
                turnRed();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnRed", communicateTo);
                }

                break;
            case "mnConslateTurnGreen": //绿色蒙版
                var win = $.messager.progress({
                    title: '绿色蒙版',
                    msg: '处理...'
                });
                turnGreen();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnGreen", communicateTo);
                }

                break;
            case "mnConslateTurnBlue": //蓝色蒙版
                var win = $.messager.progress({
                    title: '蓝色蒙版',
                    msg: '处理...'
                });
                turnBlue();
                //处理完后关闭，这里作为测试
                setTimeout(function () {
                    $.messager.progress('close');
                }, 3500);

                //发送协同操作
                if (isCommunicate) {//加入协同操作成功！
                    communicateTo = $("#selMsgTo").val();
                    sendOperation("turnBlue", communicateTo);
                }

                break;
        }

        //保存历史记录，撤销时使用
        //有些对象不需要记录，需要排除
        if (oprationid != "" && oprationid != "mnConslatelight") {
            ShowOpration(oprationmenuid, oprationmenutext, iconmenuCls); //将操作显示在历史记录中
            saveImageHistory();
        }
    }
});

//“视图”下的菜单操作
$('#mnView div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnViewzoomin"://放大
                transforms.zoomin();
                break;
            case "mnViewzoomout"://缩小
                transforms.zoomout();
                break;
            case "mnViewruler"://标尺
                if (!isCreatedRule) {
                    evt = new Event();
                    dragdrop = new Dragdrop(evt);
                    rg = new RulersGuides(evt, dragdrop);

                    rg.enable();
                    $.messager.alert("说明", "点击界面左侧红色标尺菜单，操作标尺。");

                    isCreatedRule = true;
                }
                else {
                    if (rg.status == 0) {
                        rg.enable();
                        $.messager.alert("说明", "点击界面左侧红色标尺菜单，操作标尺。");
                    }
                    else {
                        rg.disable();
                    }
                }
                break;
            case "mnViewgrid"://网格
                if (!isCreatedGrid) {
                    drawGrid(levelNum);

                    isCreatedGrid = true;
                }
                else {
                    //隐藏或显示网格
                    if ($("#gridcanvas").css("display") == "none") {
                        $("#gridcanvas").css("display", "block");
                    } else {
                        $("#gridcanvas").css("display", "none");
                    }
                }
                break;
            case "mnViewfullscreen"://全屏模式
                fullscreen();
                //alert("全屏模式");
                break;
            case "default":
                onChangeTheme('default');
                break;
            case "bootstrap":
                onChangeTheme('bootstrap');
                break;
            case "metro-blue":
                onChangeTheme('metro-blue');
                break;
            case "metro-green":
                onChangeTheme('metro-green');
                break;
            case "metro-red":
                onChangeTheme('metro-red');
                break;
            case "mnViewreset":
                alert("重置界面");
                break;
        }
    }
});

//“窗口”下的菜单操作
$('#mnWindows div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnWindowstools": //工具箱
                $("#tools").dialog('open');
                break;
            case "mnWindowshistory": //操作
                $("#opration").dialog('open');
                break;
            case "mnWindowssearchimg":
                showMyWindow('icon-searchimg', '图片搜索', 'SearchImg.aspx', 800, 400, true, false, false, true);
                break;
            case "mnWindowscommunite": //协同操作
                if (username == "") {//未登录
                    $.messager.prompt('协同操作登录', '请输入你的用户名', function (r) {
                        if (r) {//如果输入，则使用输入的用户名
                            username = r;
                        }
                        else {
                            var now = new Date();
                            username = now.toLocaleTimeString(); //如果用户未输入用户名，则使用协同默认用户名，系统默认为当前时间
                        }

                        var host = "ws://192.168.198.17:8050";//本机ip及端口

                        connect(host, username);//连接服务器

                        //登录成功
                        isCommunicate = true;

                        //修改窗口title
                        //var loginTitle = "协同操作&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">退出</a>";
                        //$("#diamnCommunite").dialog('title', loginTitle);

                        $("#diamnCommunite").dialog('open');
                        //showMyWindow('icon-communite', "协同操作&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">退出</a>", 'Communite.aspx?username=' + username, 250, 340, false, false, true, true, 310, 1106);
                    });
                }
                else {
                    $("#diamnCommunite").dialog('open');
                    //showMyWindow('icon-communite', "协同操作&nbsp;" + username + "&nbsp;<a href=\"#\" onclick=\"LoinOut();\">退出</a>", 'Communite.aspx', 250, 340, false, false, true, true, 310, 1106);
                }
                break;
        }
    }
});

//“帮助”下的菜单操作
$('#mnHelp div').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id;
        switch (oprationid) {
            case "mnHelphelp": //WebPhotoshop帮助
                window.open("Code/Help.htm");
                break;
            case "mnHelphelpsite": //WebPhotoshop网站
                window.open("https://www.cnblogs.com/leanfish/");
                break;
            case "mnHelpabout": //关于WebPhotoshop
                showMyWindow('icon-about', '关于WebPhotoshop', 'Code/About.htm', 600, 400, true, false, false, true);
                break;
        }
    }
});

//#endregion

//#region 工具箱操作

//工具对应的操作：显示属性、
function ToolOpration(oprationid, oprationtitle) {
    //获取当前工具的名称、图片
    $('#objectname').html(oprationtitle); //工具名称
    //获取图片工具命名为btn+图片名称，截取，则获得工具对应的图片
    $("#objectimg").attr("src", "Images/tools/" + oprationid.substring(3, oprationid.length) + ".png");
    switch (oprationid) {
        case "btnSelect": //选择工具
            $('#toolDescrib').html(oprationtitle + "：点击并拖拽去画一个选择区。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').show(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式
            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnMove": //移动工具
            $('#toolDescrib').html(oprationtitle + "：拖动选择可以移动位置。"); //工具说明
            $(selectCanvas).addClass("easyui-draggable");//使选择画布可以移动

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnLasso": //套索工具
            //alert("套索工具");
            $('#toolDescrib').html(oprationtitle + "：点击并拖拽为选择区画轮廓。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnZoomAll": //缩放工具
            //alert("缩放工具");
            $('#toolDescrib').html(oprationtitle + "：左击放大，右击缩小。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').show(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnHand": //手抓工具
            //alert("手抓工具");
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖拽以沿想要的方向滚动图像。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnFill": //填充工具
            //alert("填充工具");
            $('#toolDescrib').html(oprationtitle + "：点击按下想要的图像区域填充颜色。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnGradient": //渐变工具
            //alert("渐变工具");
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动产生渐变。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').show(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnPaintBrush": //画笔
            //alert("画笔");
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动绘图。"); //工具说明

            $('#penWdth').show(); //笔头大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').show(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnPencil": //铅笔
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动绘图。"); //工具说明

            $('#penWdth').show(); //笔头大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //笔头样式

            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择
            break;
        case "btnEraser": //橡皮擦
            //alert("橡皮擦");
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动清除图像。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').show(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnZoomMiro": //放大镜
            //alert("放大镜");
            $('#toolDescrib').html(oprationtitle + "：左击局部放大图像，右击局部缩小图像。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnSelectCut": //裁剪
            //alert("裁剪");
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动选择需要裁剪的图像。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnText": //文本
            //alert("文本");
            $('#toolDescrib').html(oprationtitle + "：左击放置文本光标，然后输入文字。"); //工具说明
            $("#drawtext").dialog('open');

            //使文本输入框禁用，在点击画布，获取绘制文本的坐标后启用
            $("#drawtext textarea").attr("disabled", true);
            $("#drawtextCancel").linkbutton('disable');
            $("#drawtextOK").linkbutton('disable');
            $("#drawTextPosition").html(''); //清空坐标

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').show(); //字体
            $('#txtSize').show(); //字号
            $('#opbold').show(); //字体加粗
            $('#opitalic').show(); //字体倾斜
            $('#opunderline').show(); //字体下划线
            $('#opnodeleteline').show(); //字体删除线
            $('#txtAlign').show(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnLine": //直线
            //alert("直线");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制直线。"); //工具说明

            $('#penWdth').show(); //笔头大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').show(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnCurve": //曲线
            //alert("曲线");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制直线，然后选择点拖动变为曲线。"); //工具说明

            $('#penWdth').show(); //笔头大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnRectangle": //矩形
            //alert("矩形");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制矩形。"); //工具说明
            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //笔头大小隐藏
            }
            else {
                $('#penWdth').show(); //笔头大小显示
            }

            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').show(); //是否填充。否，则显示笔头大小、线条样式
            $('#opiscirclecorner').show(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnEllipse": //椭圆
            //alert("椭圆");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制椭圆。"); //工具说明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //笔头大小隐藏
            }
            else {
                $('#penWdth').show(); //笔头大小显示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').show(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').show(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnTriangle": //三角形
            //alert("三角形");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制三角形。"); //工具说明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //笔头大小隐藏
            }
            else {
                $('#penWdth').show(); //笔头大小显示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').show(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').show(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnPolygon": //多边形
            //alert("多边形");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制多边形。"); //工具说明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //笔头大小隐藏
            }
            else {
                $('#penWdth').show(); //笔头大小显示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').show(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').show(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnOtherShap": //其他形状
            //alert("其他形状");
            $('#toolDescrib').html(oprationtitle + "：左击并且拖动绘制选择的形状。"); //工具说明

            if ($('#chekfill').is(':checked')) {
                $('#penWdth').hide(); //笔头大小隐藏
            }
            else {
                $('#penWdth').show(); //笔头大小显示
            }
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').show(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').show(); //形状选择

            break;
        case "btnClone": //图章
            //alert("图章");
            $('#toolDescrib').html(oprationtitle + "：按Ctrl键的同时左击选择物体，然后左键拖动复制。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型
            $('#opEraserSize').show(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        case "btnAlpha": //透明度
            //alert("透明度");
            $('#toolDescrib').html(oprationtitle + "：点击减淡或加深按钮改变图像透明度。"); //工具说明

            $('#penWdth').hide(); //笔头大小
            $('#penAl').hide(); //不透明度
            $('#pStyleSelect').hide(); //笔头样式
            $('#paintpenBlur').hide(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').show(); //透明度加深、减淡按钮
            $('#opdeeppercent').show(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择

            break;
        default: //铅笔
            $('#toolDescrib').html(oprationtitle + "：点击按下并拖动绘图。"); //工具说明

            $('#penWdth').show(); //笔头大小
            $('#penAl').show(); //不透明度
            $('#pStyleSelect').show(); //笔头样式

            $('#paintpenBlur').show(); //模糊程度
            $('#opselectArea').hide(); //选择工具选择框:矩形、椭圆
            $('#opZoom').hide(); //放大、缩小
            $('#opGradient').hide(); //渐变工具渐变模式
            $('#opPenStyle').hide(); //笔型

            $('#opEraserSize').hide(); //宽度
            $('#txtFamily').hide(); //字体
            $('#txtSize').hide(); //字号
            $('#opbold').hide(); //字体加粗
            $('#opitalic').hide(); //字体倾斜
            $('#opunderline').hide(); //字体下划线
            $('#opnodeleteline').hide(); //字体删除线
            $('#txtAlign').hide(); //对齐
            $('#opisfill').hide(); //是否填充。否，则显示笔头大小、线条样式

            $('#opiscirclecorner').hide(); //是否圆角
            $('#opiscircle').hide(); //是否圆
            $('#optriangle').hide(); //三角形
            $('#opisregularpolygon').hide(); //是否为正多边形。是，则选择或者输入边数
            $('#opdeepreduce').hide(); //透明度加深、减淡按钮
            $('#opdeeppercent').hide(); //透明度加深、减淡按钮调节比例
            $('#opline').hide(); //线条样式
            $('#opothershap').hide(); //形状选择
    }
}

//“工具箱”下的菜单操作
$('#tools a').click(function () {
    if (this.id != undefined) {
        var oprationid = this.id; //获取工具id
        var oprationtitle = this.title; //获取工具的名称
        drawObject = this.id; //当前的绘图对象
        drawObjectName = oprationtitle;//当前的绘图对象名称
        drawObjectIcon = $(this).attr('data-options').substring(9);
        var arrdrawObjectIcon = drawObjectIcon.split(",");
        drawObjectIcon = arrdrawObjectIcon[0];//当前图标
        drawObjectIcon = drawObjectIcon.substring(0, drawObjectIcon.length - 1);
        ToolOpration(oprationid, oprationtitle);
    }
});

//#endregion

//#region 文本输入框操作

//点击画布启用文本输入框
$('.drawWindow').live("click", function (e) {
    //在点击画布，获取绘制文本的坐标后启用文本输入框
    $("#drawtext textarea").attr("disabled", false);
    $("#drawtextCancel").linkbutton('enable');
    $("#drawtextOK").linkbutton('enable');
    $("#drawTextPosition").html('x:' + Math.ceil(e.offsetX) + ',y:' + Math.ceil(e.offsetY)); //获取坐标

    //文本位置
    txtPoX = Math.ceil(e.offsetX);
    txtPoY = Math.ceil(e.offsetY);
});

$("#drawtextOK").live("click", function () {
    drawText();

    createDraw("paintdrawText");//加入协同处理
});

$("#drawtextCancel").live("click", function () {
    $("#drawtext").dialog('close');
});

//#endregion

//#region 浏览器大小变化操作

//当浏览器大小变化时，设置页面内容的大小、位置
function ByResizeSet() {
    scWidth = document.body.clientWidth;
    scHeight = document.body.clientHeight;

    mapWidth = scWidth * 0.6;
    mapHeight = scHeight * 0.8;

    //设置工具箱、历史记录、图层、颜色选择窗体位置

    //设置tab大小、画布大小
    $("#tabDraw").tabs({
        height: scHeight - 85
    });

    //todo,按照浏览器缩小比例
    $(".drawWindow").css("width", mapWidth);
    $(".drawWindow").css("height", mapHeight);

    //todo,动态设置画布的大小
    var showcanvasSet = document.getElementById("showcanvas");
    var tempcanvasSet = document.getElementById("tempcanvas");
    var gridcanvasSet = document.getElementById("gridcanvas");

    showcanvasSet.height = mapHeight;
    showcanvasSet.width = mapWidth;

    tempcanvasSet.height = mapHeight;
    tempcanvasSet.width = mapWidth;

    gridcanvasSet.height = mapHeight;
    gridcanvasSet.width = mapWidth;

    $("#opration").dialog({
        left: scWidth - 260
    });

    //变化协同处理窗口，协同处理窗口变成了单独页面，需要特殊处理，todo
    //    $("#communite").dialog({
    //        left: scWidth - 260
    //    });
}

//浏览器大小变化时
window.onresize = function () {
    ByResizeSet();
}

//浏览器加载时
window.onload = function () {
    ByResizeSet();
};

//#endregion

//#region历史记录操作

/*记录历史操作
 *opration  操作id
 *oprationName  名称
 *opiconCls 操作图标
*/
function ShowOpration(opration, oprationName, opiconCls) {
    var oprationClass = opration + "linkbutton";
    var oprationStr = "<a href=\"#\" style=\"width: 100%;\" title=\"" + oprationName + "\" class=\"" + oprationClass + "\" >" + oprationName + "</a><br />";
    $("#lsthitory").append(oprationStr);
    $('.' + oprationClass).linkbutton({
        iconCls: opiconCls,
        plain: true
    });
    //控制滚动条在最下
    $('#lsthitory').scrollTop($('#lsthitory')[0].scrollHeight);
}

//#region 历史记录下的操作按钮

//撤销全部按钮
$('#historyundoall').click(function () {
    undoall();
});

//撤销按钮
$('#historyundo').click(function () {
    undo();
});

//重做按钮
$('#historyredo').click(function () {
    redo();
});

//重做所有按钮
$('#historyredoall').click(function () {
    redoall();
});

//#endregion

//#endregion

//#region 选项栏操作

//放大
$('#opzoomin').click(function () {
    transforms.zoomin();

    ShowOpration("opzoomin", "放大", "icon-zoomin"); //将操作显示在历史记录中
});

//缩小
$('#opzoomout').click(function () {
    transforms.zoomout();

    ShowOpration("opzoomout", "缩小", "icon-zoomout"); //将操作显示在历史记录中
});

//#endregion

//起始函数
$(document).ready(function () {
    ByResizeSet();

    //工具箱，默认为铅笔
    ToolOpration('btnPencil', '铅笔（P）');

    //颜色
    $('#colorselect').jPicker({
        window: {
            expandable: true
        }
    }, function (color, context) {
        var all = color.val('all');
        $("#colorvalue").attr("value", (all && '#' + all.hex || 'none')); //获取颜色值
    });
});

//属性初始化todo，同时获取其他对象属性？还是单独获取每个对象的属性？
function setting() {
    pencolor = $("#colorvalue").val(); //线条颜色
    penwidth = $("#penwidthshow").val(); //线条大小
    penalpha = $('#alphashow').numberspinner('getValue'); //线条不透明度
    penalpha = penalpha / 100;
    penstyle = $("#hStyle").combobox('getValue'); //线条头样式

    penshowdow = $('#ptpenBlurShow').numberspinner('getValue'); //模糊度
    penshowdow = penshowdow / 100;

    txtFont = $("#seltxtFamily").combobox('getValue');       //文本字体
    txtSize = $("#seltxtSize").combobox('getValue');      //文本大小

    //todo，html5文字样式如何写？
    txtBold = $('#chekbold').is(':checked') == true ? "bold" : ""; //加粗
    txtItalic = $("#chekitalic").is(":checked") == true ? "italic" : "";    //倾斜
    txtUnderline = $("#chekunderline").is(":checked") == true ? "underline" : ""; //下划线
    txtDeleteline = $("#chekdeleteline").is(":checked") == true ? "deleteline" : ""; //删除线
    txtAlign = $("#seltxtAlign").combobox('getValue');     //文本对齐
    txtInput = $("#txtInput").val();      //文本内容
}

//#region 鼠标事件mousedown、mousemove、mouseup、mouseleave

//曲线绘制
//二次控制点
var cpx = -1;
var cpy = -1;

var endCurve = false;//是否结束了曲线绘制
var finishCurveLine = false;//是否完成了曲线绘制的第一步直线绘制
var selectCanvas;//选择工具创建的图层
var selectCanvasContext;//选择工具创建的图层上下文

//当鼠标按下时，把isMouseDown设为true，表示正在画，鼠标没松开。把鼠标点记录下来。
drawarea.mousedown(function (e) {
    startX = e.offsetX; //校正鼠标的绘图点
    startY = e.offsetY;

    isMouseDown = true;

    //根据绘图对象名称，做出不同的操作
    switch (drawObject) {
        case "btnPencil": //铅笔
            pencil();
            break;
        case "btnPaintBrush": //画笔
            paintpen();
            break;
        case "btnSelect": //选择工具
            //创建图层，并加入到背景图层中
            var firstDrawWin = document.getElementById("firstDrawWin");

            selectCanvas = document.createElement("canvas");
            selectCanvas.id = "level" + levelNum;
            selectCanvas.width = mapWidth;
            selectCanvas.height = mapHeight;
            $(selectCanvas).css({
                "z-index": levelNum + 2,
                "cursor": "crosshair"
            });
            var bgroudCanvas = document.getElementsByTagName("canvas")[0];
            firstDrawWin.insertBefore(selectCanvas, bgroudCanvas);
            selectCanvasContext = selectCanvas.getContext("2d");

            levelNum++;
            break;
        case "btnMove"://移动工具

            break;
        default:
            pencil();
    }
});

drawarea.mousemove(function (e) {
    //显示当前坐标
    $("#Coordinate").html("X:" + Math.ceil(e.offsetX) + ",Y:" + Math.ceil(e.offsetY));
    if (isMouseDown) {
        currentX = e.offsetX;
        currentY = e.offsetY;

        drawWidth = Math.abs(Math.ceil(currentX - startX));
        drawHeight = Math.abs(Math.ceil(currentY - startY));

        temp.clearRect(0, 0, mapWidth, mapHeight);   //鼠标拖动时，清空上次的绘图，即清空在临时画布上的绘图

        var tempPaint = paint;
        tempPaint.name = temp; //使用临时画布
        switch (drawObject) {
            case "btnSelect"://选择
                tempPaint.selectfillRect();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnMove"://移动工具

                break;
            case "btnLine":
                var lineStyle = $("#selline").combobox('getValue');//获取直线样式

                switch (lineStyle) {
                    case "solid":
                        tempPaint.line();
                        break;
                    case "dottedline1":
                        tempPaint.dottedline(5);
                        break;
                    case "dottedline2":
                        tempPaint.dottedline(15);
                        break;
                    case "dottedline3":
                        tempPaint.dottedline(25);
                        break;
                    default:
                        tempPaint.line();
                }
                break;
            case "btnCurve"://曲线
                if (!endCurve) {
                    if (!finishCurveLine) {//绘制直线
                        tempPaint.line();
                    }
                    else {
                        tempPaint.curveLine(cuStartX, cuStartY, cuEndX, cuEndY);
                    }
                }
                else {
                    endCurve = false;
                    finishCurveLine = false;
                }
                break;
            case "btnRectangle":
                //圆角
                if ($('#chekcirclecorner').is(':checked')) {
                    tempPaint.radiusStrokeRect();
                }
                else {
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillRect();
                    }
                    else {
                        tempPaint.strokeRect();
                    }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillrect":
                tempPaint.fillRect();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "circle":
                tempPaint.circle();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillcircle":
                tempPaint.fillCircle();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnEllipse":
                //是否为圆
                if ($('#chekcircle').is(':checked')) {
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillCircle();
                    }
                    else {
                        tempPaint.circle();
                    }
                }
                else {
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        tempPaint.fillellipse();
                    }
                    else {
                        tempPaint.ellipse();
                    }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "fillellipse":
                tempPaint.fillellipse();
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnPencil":
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
                break;
            case "btnPaintBrush":
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
                break;
            case "btnEraser":
                var eraserWidth = $("#selEraserSize").val();

                eraser(currentX, currentY, eraserWidth);
                break;
            case "btnText":
                break;
            case "btnTriangle":
                //三角形类型判断
                var seletriangle = $('#seltriangle').combobox('getValue');
                switch (seletriangle) {
                    case "righttriangle"://直角三角形
                        //判断是否选中填充
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillrighttriangle();
                        }
                        else {
                            tempPaint.righttriangle();
                        }
                        break;
                    case "regulartriangle"://等腰三角形
                        //判断是否选中填充
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillregulartriangle();//填充等腰三角形
                        }
                        else {
                            tempPaint.regulartriangle();
                        }
                        break;
                    default:
                        if ($('#chekfill').is(':checked')) {
                            tempPaint.fillrighttriangle();//填充直角三角形
                        }
                        else {
                            tempPaint.righttriangle();
                        }
                }
                $("#spanSize").html("尺寸：" + drawWidth + "x" + drawHeight);
                break;
            case "btnPolygon": //多边形
                //                //属性获取todo
                //                tempPaint.line();
                break;
            default:
                setting();
                show.lineTo(currentX, currentY);
                show.stroke();
        }
    }
});

//存放需要保存当前画布的绘图工具，即对当前画布进行了改变
var toSaveCanvas = new Array("btnSelect", "btnMove", "btnLasso", "btnPencil", "btnPaintBrush", "btnEraser", "btnFill", "btnGradient", "btnSelectCut", "btnLine", "btnCurve", "btnRectangle", "circle", "fillrect", "fillcircle", "btnEllipse", "fillellipse", "btnTriangle", "btnPolygon", "btnOtherShap", "btnClone");
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

//鼠标抬起，则在展示画布上显示图形
drawarea.mouseup(function (e) {
    isMouseDown = false;

    var showPaint = paint; //切换到展示画布
    showPaint.name = show;

    currentX = e.offsetX;
    currentY = e.offsetY;

    temp.clearRect(0, 0, mapWidth, mapHeight);  //在正式画布上形成图时，清空临时画布上的图，以免形成重叠图

    //在展示画布上绘图
    switch (drawObject) {
        case "btnSelect"://todo


            var selectCanvasPaint = paint; //切换到展示画布
            selectCanvasPaint.name = selectCanvasContext;
            selectCanvasPaint.selectfillRect();


            //获取像素，并重绘
            var imgd = show.getImageData(startX, startY, currentX - startX, currentY - startY);  //从指定的矩形区域获取 canvas 像素数组
            selectCanvasContext.putImageData(imgd, startX, startY);         //在指定位置进行像素重绘

            show.clearRect(startX, startY, currentX - startX, currentY - startY);
            break;
        case "btnMove"://移动工具

            break;
        case "btnLine":
            var lineStyle = $("#selline").combobox('getValue');//获取直线样式

            switch (lineStyle) {
                case "solid":
                    showPaint.line();

                    createDraw("paintline");//协同处理
                    break;
                case "dottedline1":
                    showPaint.dottedline(5);

                    createDraw("paintdottedline");//协同处理
                    break;
                case "dottedline2":
                    showPaint.dottedline(15);

                    createDraw("paintdottedline");//协同处理
                    break;
                case "dottedline3":
                    showPaint.dottedline(25);

                    createDraw("paintdottedline");//协同处理
                    break;
                default:
                    showPaint.line();
            }
            break;
        case "btnCurve"://曲线
            if (!endCurve) {
                if (!finishCurveLine) {//绘制直线
                    showPaint.line();
                    finishCurveLine = true;
                }
                else {
                    showPaint.curveLine(cuStartX, cuStartY, cuEndX, cuEndY);
                    //加入曲线绘制结束标志
                    endCurve = true;
                    cpx == -1;
                    cpy == -1;
                }
            }

            createDraw("paintcurveLine");//协同处理
            break;
        case "btnRectangle":
            //圆角
            if ($('#chekcirclecorner').is(':checked')) {
                showPaint.radiusStrokeRect();

                createDraw("paintradiusStrokeRect");//协同处理
            }
            else {
                //判断是否选中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillRect();

                    createDraw("paintfillRect");//进行协同处理
                }
                else {
                    showPaint.strokeRect();

                    createDraw("paintstrokeRect");//进行协同处理
                }
            }
            break;
        case "circle":
            showPaint.circle();
            break;
        case "fillrect":
            showPaint.fillRect();
            break;
        case "fillcircle":
            showPaint.fillCircle();
            break;
        case "btnEllipse":
            if ($('#chekcircle').is(':checked')) {//圆
                //判断是否选中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillCircle();

                    createDraw("paintfillCircle");//进行协同处理
                }
                else {
                    showPaint.circle();

                    createDraw("paintcircle");//进行协同处理
                }
            }
            else {//椭圆
                //判断是否选中填充
                if ($('#chekfill').is(':checked')) {
                    showPaint.fillellipse();

                    createDraw("paintfillellipse");//进行协同处理
                }
                else {
                    showPaint.ellipse();

                    createDraw("paintellipse");//进行协同处理
                }
            }
            break;
        case "fillellipse":
            showPaint.fillellipse();
            break;
        case "btnTriangle":
            //三角形类型判断
            var seletriangle = $('#seltriangle').combobox('getValue');
            switch (seletriangle) {
                case "righttriangle"://直角三角形
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillrighttriangle();//填充直角三角形

                        createDraw("paintfillrighttriangle");//进行协同处理
                    }
                    else {
                        showPaint.righttriangle();

                        createDraw("paintrighttriangle");//进行协同处理
                    }
                    break;
                case "regulartriangle"://等腰三角形
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillregulartriangle();//填充等腰三角形

                        createDraw("paintfillregulartriangle");//进行协同处理
                    }
                    else {
                        showPaint.regulartriangle();

                        createDraw("paintregulartriangle");//进行协同处理
                    }

                    break;
                default://直角三角形
                    //判断是否选中填充
                    if ($('#chekfill').is(':checked')) {
                        showPaint.fillrighttriangle();//填充直角三角形

                        createDraw("paintfillrighttriangle");//进行协同处理
                    }
                    else {
                        showPaint.righttriangle();

                        createDraw("paintrighttriangle");//进行协同处理
                    }
            }
            break;
        case "btnPolygon": //多边形

            break;
    }

    //保存历史记录，撤销时使用
    //有些对象不需要记录，需要排除
    if (toSaveCanvas.contains(drawObject)) {
        ShowOpration(drawObject, drawObjectName, drawObjectIcon); //将操作显示在历史记录中
        saveImageHistory();
    }
});

drawarea.mouseleave(function (e) {
    isMouseDown = false;
});

//#endregion

//#region 绘图操作

//清空
function reset() {
    show.clearRect(0, 0, mapWidth, mapHeight);
    temp.clearRect(0, 0, mapWidth, mapHeight);
}

//橡皮擦，橡皮擦坐标，橡皮擦宽度
function eraser(currentX, currentY, eraserWidth) {
    show.clearRect(currentX, currentY, eraserWidth, eraserWidth);
    temp.clearRect(currentX, currentY, eraserWidth, eraserWidth);
}

//绘制文本
function drawText() {
    setting();
    //font格式：font-style font-weight font-size font-family
    show.font = txtItalic + ' ' + txtBold + ' ' + txtSize + ' ' + txtFont;
    show.fillStyle = pencolor;
    show.textAlign = txtAlign;
    show.fillText(txtInput, txtPoX, txtPoY);

    //绘制下划线
    if (txtUnderline == "underline") {
        var txtlengthobj = show.measureText(txtInput);//获取文字长度
        if (txtAlign == "center") {//判断对齐方式，以决定下划线、删除线的起始位置
            txtPoX = txtPoX - txtlengthobj.width / 2;
        }
        if (txtAlign == "right") {
            txtPoX = txtPoX - txtlengthobj.width;
        }

        show.strokeStyle = pencolor;
        show.shadowBlur = penshowdow;
        show.lineWidth = penwidth;
        show.globalAlpha = penalpha;
        show.lineCap = penstyle;

        show.beginPath();
        show.moveTo(txtPoX, txtPoY + 5);//估算的位置
        show.lineTo(txtPoX + txtlengthobj.width, txtPoY + 5);
        show.stroke();
    }

    //绘制删除线
    if (txtDeleteline == "deleteline") {
        var txtlengthobj = show.measureText(txtInput);

        show.strokeStyle = pencolor;
        show.shadowBlur = penshowdow;
        show.lineWidth = penwidth;
        show.globalAlpha = penalpha;
        show.lineCap = penstyle;

        show.beginPath();
        show.moveTo(txtPoX, txtPoY - txtSize / 3);//估算的位置
        show.lineTo(txtPoX + txtlengthobj.width, txtPoY - txtSize / 3);
        show.stroke();
    }

    ShowOpration(drawObject, drawObjectName, drawObjectIcon); //将操作显示在历史记录中
    saveImageHistory();
}

//移动保留绘图痕迹绘图类，直线、矩形、填充矩形、圆、填充圆、椭圆、填充椭圆
var paint = {
    name: temp, //绘图的目标画布，鼠标移动过程中，是在临时画布上绘图，鼠标弹起，则显示在最终画布上
    //直线，绘制曲线第一步是绘制直线，也要用到该方法
    line: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        this.name.beginPath();
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);
        this.name.stroke();

        if (drawObject == "btnCurve") {
            //绘制曲线，则获取起点、终点
            cuStartX = startX;
            cuStartY = startY;

            cuEndX = currentX;
            cuEndY = currentY;
        }
    },
    //虚线，dashLength：间隔
    dottedline: function (dashLength) {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        var dashLengthdashLength = dashLength === undefined ? 5 : dashLength;

        var distanceX = currentX - startX;
        var distanceY = currentY - startY;
        var interval = Math.floor(Math.sqrt(distanceX * distanceX + distanceY * distanceY) / dashLength);

        this.name.beginPath();
        for (var i = 0; i < interval; ++i) {
            this.name[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (distanceX / interval) * i, startY + (distanceY / interval) * i);
        }
        this.name.stroke();
    },
    //矩形
    strokeRect: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.strokeRect(startX, startY, currentX - startX, currentY - startY);
    },
    //填充矩形
    fillRect: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillRect(startX, startY, currentX - startX, currentY - startY);
    },
    //圆角空心矩形
    radiusStrokeRect: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;

        if (currentX < startX && currentY < startY) {//从右下角画到左上角
            this.name.beginPath();
            this.name.moveTo(startX - 20, startY);

            this.name.lineTo(currentX + 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY - 20, 20);

            this.name.lineTo(currentX, currentY + 20);
            this.name.arcTo(currentX, currentY, currentX + 20, currentY, 20);

            this.name.lineTo(startX - 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY + 20, 20);

            this.name.lineTo(startX, startY - 20);
            this.name.arcTo(startX, startY, startX - 20, startY, 20);
        }
        else if (currentX > startX && currentY < startY) {//从左下角画到右上角
            this.name.beginPath();
            this.name.moveTo(startX + 20, startY);

            this.name.lineTo(currentX - 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY - 20, 20);

            this.name.lineTo(currentX, currentY + 20);
            this.name.arcTo(currentX, currentY, currentX - 20, currentY, 20);

            this.name.lineTo(startX + 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY + 20, 20);

            this.name.lineTo(startX, startY - 20);
            this.name.arcTo(startX, startY, startX + 20, startY, 20);
        }
        else if (currentX < startX && currentY > startY) {//从右上角画到左下角
            this.name.beginPath();
            this.name.moveTo(startX - 20, startY);

            this.name.lineTo(currentX + 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY + 20, 20);

            this.name.lineTo(currentX, currentY - 20);
            this.name.arcTo(currentX, currentY, currentX + 20, currentY, 20);

            this.name.lineTo(startX - 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY - 20, 20);

            this.name.lineTo(startX, startY + 20);
            this.name.arcTo(startX, startY, startX - 20, startY, 20);
        }
        else {//从左上角画到右下角
            this.name.beginPath();
            this.name.moveTo(startX + 20, startY);

            this.name.lineTo(currentX - 20, startY);
            this.name.arcTo(currentX, startY, currentX, startY + 20, 20);

            this.name.lineTo(currentX, currentY - 20);
            this.name.arcTo(currentX, currentY, currentX - 20, currentY, 20);

            this.name.lineTo(startX + 20, currentY);
            this.name.arcTo(startX, currentY, startX, currentY - 20, 20);

            this.name.lineTo(startX, startY + 20);
            this.name.arcTo(startX, startY, startX + 20, startY, 20);
        }

        this.name.stroke();
    },
    //圆
    circle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.arc(startX, startY, Math.sqrt((currentX - startX) * (currentX - startX) + (currentY - startY) * (currentY - startY)), 0, Math.PI * 2, true);
        this.name.stroke();
    },
    //填充圆
    fillCircle: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.arc(startX, startY, Math.sqrt((currentX - startX) * (currentX - startX) + (currentY - startY) * (currentY - startY)), 0, Math.PI * 2, true);
        this.name.fill();
    },
    //椭圆
    ellipse: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.moveTo(2 * startX - currentX, startY);
        this.name.bezierCurveTo(2 * startX - currentX, currentY, currentX, currentY, currentX, startY); //下半圆
        this.name.bezierCurveTo(currentX, 2 * startY - currentY, 2 * startX - currentX, 2 * startY - currentY, 2 * startX - currentX, startY); //上半圆
        this.name.stroke();
    },
    //填充椭圆
    fillellipse: function () {
        setting();
        this.name.fillStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();
        this.name.moveTo(2 * startX - currentX, startY);
        this.name.bezierCurveTo(2 * startX - currentX, currentY, currentX, currentY, currentX, startY); //下半圆
        this.name.bezierCurveTo(currentX, 2 * startY - currentY, 2 * startX - currentX, 2 * startY - currentY, 2 * startX - currentX, startY); //上半圆
        this.name.fill();
    },
    //直角三角形
    righttriangle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;

        this.name.beginPath();

        //斜边
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //横直角边
        this.name.lineTo(startX, currentY);

        //竖直角边
        this.name.closePath();

        this.name.stroke();
    },
    //填充直角三角形
    fillrighttriangle: function () {
        setting();
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillStyle = pencolor;

        this.name.beginPath();

        //斜边
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //横直角边
        this.name.lineTo(startX, currentY);

        //竖直角边
        this.name.closePath();

        this.name.stroke();
        this.name.fill();
    },
    //等腰三角形
    regulartriangle: function () {
        setting();
        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.beginPath();

        //腰
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //腰
        this.name.lineTo(startX - (currentX - startX), currentY);

        //底
        this.name.closePath();

        this.name.stroke();
    },
    //填充等腰三角形
    fillregulartriangle: function () {
        setting();
        this.name.shadowBlur = penshowdow;
        this.name.globalAlpha = penalpha;
        this.name.fillStyle = pencolor;

        this.name.beginPath();

        //腰
        this.name.moveTo(startX, startY);
        this.name.lineTo(currentX, currentY);

        //腰
        this.name.lineTo(startX - (currentX - startX), currentY);

        //底
        this.name.closePath();
        this.name.stroke();
        this.name.fill();
    },
    //曲线
    curveLine: function (staX, staY, endX, endY) {//曲线。参数为原直线的起、止坐标点
        setting();
        //先擦除第一次绘制的直线，该直线是绘制在最终画布上的
        //todo,存在缺陷，会清空一个矩形区域
        show.clearRect(staX, staY, endX - staX, endY - staY);

        this.name.strokeStyle = pencolor;
        this.name.shadowBlur = penshowdow;
        this.name.lineWidth = penwidth;
        this.name.globalAlpha = penalpha;
        this.name.lineCap = penstyle;

        //绘制曲线
        this.name.beginPath();
        this.name.moveTo(staX, staY);
        this.name.quadraticCurveTo(currentX, currentY, endX, endY);
        this.name.stroke();
    },
    //矩形选择工具痕迹
    selectfillRect: function () {
        this.name.strokeStyle = "#000000";
        this.name.lineWidth = 1;
        this.name.strokeRect(startX, startY, currentX - startX, currentY - startY);
    }
}

//铅笔开始
function pencil() {
    setting();

    show.shadowBlur = penshowdow;   //模糊程度
    show.strokeStyle = pencolor;
    show.lineWidth = penwidth;
    show.globalAlpha = penalpha;
    show.lineCap = penstyle;

    show.beginPath();
    show.moveTo(startX, startY);
    show.lineTo(startX, startY);
    show.stroke();
}

//画笔开始
function paintpen() {
    setting();
    show.shadowBlur = penshowdow;   //模糊程度
    show.shadowColor = pencolor;    //模糊颜色
    show.strokeStyle = pencolor;    //线颜色
    show.lineWidth = penwidth;
    show.globalAlpha = penalpha;
    show.lineCap = penstyle;

    show.beginPath();
    show.moveTo(startX, startY);
    show.lineTo(startX, startY)
    show.stroke();
}

//#endregion

//#region 图片操作

//#region 拖拽绘制图片

function imagesSelected(myFiles) {
    for (var i = 0, f; f = myFiles[i]; i++) {
        var imageReader = new FileReader();
        imageReader.onload = (function (aFile) {
            return function (e) {
                DrawPic(e.target.result);
            };
        })(f);
        imageReader.readAsDataURL(f);
    }
}

function dropIt(e) {
    imagesSelected(e.dataTransfer.files);
    e.stopPropagation();
    e.preventDefault();
}

//#endregion

//根据输入角度进行变换
function rotatebydegress() {
    var degree = $('#spnimnImageinputcc').numberspinner('getValue');
    var rateto = $("#selImgrateto").combobox('getValue');

    transforms.rotatebydegress(degree, rateto);

    if (rateto == "right") {
        ShowOpration("diamnImageinputcc", "顺时针旋转" + degree + "度", "icon-inputcc"); //将操作显示在历史记录中
    }
    else {
        ShowOpration("diamnImageinputcc", "逆时针旋转" + degree + "度", "icon-inputcc"); //将操作显示在历史记录中
    }

    //发送协同操作
    if (isCommunicate) {//加入协同操作成功！
        communicateTo = $("#selMsgTo").val();
        //带参数
        sendOperation("transformsrotatebydegress@" + degree + "@\"" + rateto + "\"", communicateTo);
    }
}

//变换方法
//如果没有选择，则对整个画布进行旋转，否则只旋转选择的部分
var transforms = {
    //参数初始化
    intitle: function () {
        rad_x = 1;
        rad_y = 1;//水平/垂直变换参数
        rad_radian = 0;//旋转变换参数
        //rad_zoom = 1;//缩放比例
    },
    //变换后重绘
    drawShow: function (imgdrsrc) {//图片路径
        var img = new Image();
        img.src = imgdrsrc;
        img.onload = function () {
            show.save();
            show.clearRect(0, 0, mapWidth, mapHeight);//清空内容
            show.translate(mapWidth / 2, mapHeight / 2);//中心坐标
            show.rotate(rad_radian);//旋转
            show.scale(rad_y, rad_x);//缩放
            show.drawImage(img, -img.width / 2, -img.height / 2);//居中画图
            show.restore();
        }
    },
    //垂直翻转
    vertical: function () {
        this.intitle();
        rad_radian = Math.PI - rad_radian;
        rad_y *= -1;
        this.drawShow(showcanvas.toDataURL());
    },
    //水平翻转
    horizontal: function () {
        this.intitle();
        rad_radian = Math.PI - rad_radian;
        rad_x *= -1;
        this.drawShow(showcanvas.toDataURL());
    },
    //向左转90度
    left: function () {
        this.intitle();
        rad_radian -= Math.PI / 2;
        this.drawShow(showcanvas.toDataURL());
    },
    //向右转90度
    right: function () {
        this.intitle();
        rad_radian += Math.PI / 2;
        this.drawShow(showcanvas.toDataURL());
    },
    //根据角度旋转
    rotatebydegress: function (degress, rateto) {
        this.intitle();
        if (rateto == "right") {
            rad_radian = degress * Math.PI / 180;//顺时针
        }
        else {
            rad_radian = -degress * Math.PI / 180;//逆时针
        }
        this.drawShow(showcanvas.toDataURL());
    },
    //旋转180度
    flat: function () {
        this.intitle();
        rad_radian += Math.PI;
        this.drawShow(showcanvas.toDataURL());
    },
    //缩放
    scale: function () {
        function getZoom(scale, zoom) {
            return scale > 0 && scale > -zoom ? zoom :
                    scale < 0 && scale < zoom ? -zoom : 0;
        }
        return function (zoom) {
            if (zoom) {
                var hZoom = getZoom(rad_y, zoom);
                var vZoom = getZoom(rad_x, zoom);
                if (hZoom && vZoom) {//放大
                    rad_y += hZoom;
                    rad_x += vZoom;
                }
                else {//缩小
                    rad_y = rad_y / 2;
                    rad_x = rad_x / 2;
                }
            }
        }
    }(),
    //放大
    zoomin: function () {
        this.intitle();
        this.scale(Math.abs(rad_zoom));
        this.drawShow(showcanvas.toDataURL());
    },
    //缩小
    zoomout: function () {
        this.intitle();
        this.scale(-Math.abs(rad_zoom));
        this.drawShow(showcanvas.toDataURL());
    }
};

//#region绘制图片

//参数为图片的路径
function DrawPic(imgdrsrc) {
    var img = new Image();
    img.src = imgdrsrc;
    img.onload = function () {
        //show.drawImage(img, 0, 0);       //在指定起始坐标处绘制图片

        show.save();
        show.translate(mapWidth / 2, mapHeight / 2);//中心坐标
        show.drawImage(img, -img.width / 2, -img.height / 2);//居中画图
        show.restore();
    }
}

//#endregion

/*
　在给定了width和height的canvas上，在坐标(x, y)上的像素的构成如下：
•红色部分：((width * y) + x) * 4
•绿色部分：((width * y) + x) * 4 + 1
•蓝色部分：((width * y) + x) * 4 + 2
•透明度部分：((width * y) + x) * 4 + 3
*/


//#region 黑白处理
//原理: 彩色图像处理成黑白效果通常有3种算法；
//(1).最大值法: 使每个像素点的 R, G, B 值等于原像素点的 RGB (颜色值) 中最大的一个；
//(2).平均值法: 使用每个像素点的 R,G,B值等于原像素点的RGB值的平均值；
//(3).加权平均值法: 对每个像素点的 R, G, B值进行加权
function tobalckwhite() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        var averge;
        //实例程序以加权平均值法产生黑白图像
        var iType = 2;
        switch (iType) {
            case 0: //平均值法
                averge = ((r + g + b) / 3);
                break;
            case 1: //最大值法
                averge = r > g ? r : g;
                averge = averge > b ? averge : b;
                break;
            case 2: //加权平均值法
                //averge = ((0.7 * r) + (0.2 * g) + (0.1 * b));
                averge = ((0.299 * r) + (0.587 * g) + (0.114 * b));
                break;
        }

        pix[i] = averge;       //红
        pix[i + 1] = averge;   //绿
        pix[i + 2] = averge;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}
//#endregion

//#region 反色处理
//获得每一点像素的值, 然后再使用SetPixel方法将取反后的颜色值设置到对应的点
function inverse() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    //获取红绿蓝，取反
    for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i] = 255 - pix[i];           //红
        pix[i + 1] = 255 - pix[i + 1];   //绿
        pix[i + 2] = 255 - pix[i + 2];   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}
//#endregion

//#region亮度处理todo
//将每个点的三个通道加上一个数。
function light(lightstep) {
    imgdlighttmp = imgdlight;
    var pix = imgdlighttmp.data; //得到像素
    var average = 0;//计算r、g、b平均值

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = pix[i] + lightstep;
        g = pix[i + 1] + lightstep;
        b = pix[i + 2] + lightstep;

        average = (r + g + b) / 3;
        r = r + average;
        g = g + average;
        b = b + average;

        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgdlighttmp, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region对比度调整todo
//让颜色深的更深，让颜色浅的更浅
function compare(compstep) {
    imgdlighttmp = imgdlight;
    var pix = imgdlighttmp.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = pix[i];
        g = pix[i + 1];
        b = pix[i + 2];

        if (r > 127) {
            r = r + compstep;
        }
        if (r < 127) {
            r = r - compstep;
        }

        if (g > 127) {
            g = g + compstep;
        }
        if (g < 127) {
            g = g - compstep;
        }

        if (b > 127) {
            b = b + compstep;
        }
        if (b < 127) {
            b = b - compstep;
        }

        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgdlighttmp, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region 锐化效果
//突出显示颜色值大(即形成形体边缘)的像素点.

function sharpen() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //拉普拉斯模板
    var Laplacian = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
    var r = 0, g = 0, b = 0;
    var Index = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            Index = 0;
            for (var col = -1; col <= 1; col++) {
                for (var row = -1; row <= 1; row++) {
                    r += pix[((imgdWd * (y + col)) + x + row) * 4] * Laplacian[Index];
                    g += pix[((imgdWd * (y + col)) + x + row) * 4 + 1] * Laplacian[Index];
                    b += pix[((imgdWd * (y + col)) + x + row) * 4 + 2] * Laplacian[Index];
                    Index++;
                }
            }

            //处理颜色值溢出
            r = r > 255 ? 255 : r;
            r = r < 0 ? 0 : r;
            g = g > 255 ? 255 : g;
            g = g < 0 ? 0 : g;
            b = b > 255 ? 255 : b;
            b = b < 0 ? 0 : b;

            pix[((imgdWd * (y - 1)) + x - 1) * 4] = r;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 1] = g;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 2] = b;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3] = pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置进行像素重绘
}

//#endregion

//#region 浮雕处理
//对图像像素点的像素值分别与相邻像素点的像素值相减后加上128, 然后将其作为新的像素点的值.

function selaFloat() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = Math.abs(pix[i] - pix[i + 4] + 128);
        g = Math.abs(pix[i + 1] - pix[i + 5] + 128);
        b = Math.abs(pix[i + 2] - pix[i + 6] + 128);
        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}
//#endregion

//#region 柔化效果
//当前像素点与周围像素点的颜色差距较大时取其平均值.

function conslateSoft() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //高斯模板
    var Gauss = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    var r = 0, g = 0, b = 0;
    var Index = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            Index = 0;
            for (var col = -1; col <= 1; col++) {
                for (var row = -1; row <= 1; row++) {
                    r += pix[((imgdWd * (y + col)) + x + row) * 4] * Gauss[Index];
                    g += pix[((imgdWd * (y + col)) + x + row) * 4 + 1] * Gauss[Index];
                    b += pix[((imgdWd * (y + col)) + x + row) * 4 + 2] * Gauss[Index];
                    Index++;
                }
            }

            r /= 16;
            g /= 16;
            b /= 16;
            //处理颜色值溢出
            r = r > 255 ? 255 : r;
            r = r < 0 ? 0 : r;
            g = g > 255 ? 255 : g;
            g = g < 0 ? 0 : g;
            b = b > 255 ? 255 : b;
            b = b < 0 ? 0 : b;

            pix[((imgdWd * (y - 1)) + x - 1) * 4] = r;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 1] = g;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 2] = b;
            pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3] = pix[((imgdWd * (y - 1)) + x - 1) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置进行像素重绘
}

//#endregion

//#region油画效果
//对图像中某一范围内的像素引入随机值.

function conslatepainting() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    //取不同的值决定油画效果的不同程度
    var iModel = 2;
    var i = imgdWd - iModel;
    while (i > 1) {
        var j = imgdHt - iModel;
        while (j > 1) {
            var iPos = Math.floor(Math.random() * 99999) % iModel;

            //将该点的RGB值设置成附近iModel点之内的任一点
            r = pix[((imgdWd * (j + iPos)) + i + iPos) * 4];
            g = pix[((imgdWd * (j + iPos)) + i + iPos) * 4 + 1];
            b = pix[((imgdWd * (j + iPos)) + i + iPos) * 4 + 2];

            pix[(imgdWd * j + i) * 4] = r;
            pix[(imgdWd * j + i) * 4 + 1] = g;
            pix[(imgdWd * j + i) * 4 + 2] = b;
            pix[(imgdWd * j + i) * 4 + 3] = pix[(imgdWd * j + i) * 4 + 3];

            j = j - 1;
        }
        i = i - 1;
    }

    show.putImageData(imgd, 0, 0);//在指定位置进行像素重绘
}

//#endregion

//#region积木效果
//对图像中的各个像素点着重(即加大分像素的颜色值)着色.

function conslatewood() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素
    var imgdWd = imgd.width;
    var imgdHt = imgd.height;

    var r = 0, g = 0, b = 0;
    var iAvg = 0;
    for (var x = 1; x < imgdWd - 1; x++) {
        for (var y = 1; y < imgdHt - 1; y++) {
            r = 0;
            g = 0;
            b = 0;
            iAvg = (pix[(imgdWd * y + x) * 4] + pix[(imgdWd * y + x) * 4 + 1] + pix[(imgdWd * y + x) * 4 + 2]) / 3;

            if (iAvg >= 128) {
                iAvg = 255;
            }
            else {
                iAvg = 0;
            }

            pix[(imgdWd * y + x) * 4] = iAvg;
            pix[(imgdWd * y + x) * 4 + 1] = iAvg;
            pix[(imgdWd * y + x) * 4 + 2] = iAvg;
            pix[(imgdWd * y + x) * 4 + 3] = pix[(imgdWd * y + x) * 4 + 3];
        }
    }

    show.putImageData(imgd, 0, 0);//在指定位置进行像素重绘
}

//#endregion

//#region 模糊处理
function blur() {
    var pi = 3.141592654; //get blur_array
    var e = 2.718281828459;
    var g = 2;
    var blur_array = new Array();
    var temp = 0;

    for (var x = 0; x < 2 * g + 1; x++) {
        blur_array[x] = new Array();
        for (var y = 0; y < 2 * g + 1; y++) {
            blur_array[x][y] = Math.pow(e, -((x - g) * (x - g) + (y - g) * (y - g)) / (2 * g * g)) / (2 * pi * g * g);
            temp += blur_array[x][y];
        }
    }

    for (var x = 0; x < 2 * g + 1; x++) {
        for (var y = 0; y < 2 * g + 1; y++) {
            blur_array[x][y] /= temp;
        }
    }

    var can_data = show.getImageData(0, 0, mapWidth, mapHeight);
    var can_data2 = show.getImageData(0, 0, mapWidth, mapHeight);

    for (var i = g; i < mapWidth - g - 1; i++) {
        for (var j = g; j < mapHeight - g - 1; j++) {
            var idx = (i + j * mapWidth) * 4;
            can_data2.data[idx + 0] = get_blur_average(can_data, g, blur_array, 0, i, j);
            can_data2.data[idx + 1] = get_blur_average(can_data, g, blur_array, 1, i, j);
            can_data2.data[idx + 2] = get_blur_average(can_data, g, blur_array, 2, i, j);
        }
    }
    show.putImageData(can_data2, 0, 0);
}

function get_blur_average(can_data, g, blur_array, channel, x, y) {
    var t = 0;
    for (var i = 0; i < 2 * g + 1; i++) {
        for (var j = 0; j < 2 * g + 1; j++) {
            var idx = (x + i - g + (y + j - g) * can_data.width) * 4;
            t += can_data.data[idx + channel] * blur_array[i][j];
        }
    }
    return t;
}

//#endregion

//#region 雾化处理
//在图像中引入一定的随机值, 打乱图像中的像素值

function wuhuaView() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var k = Math.floor(Math.random() * (123456 + 1));

        //像素块大小
        var dx = i + k % 19;
        if (dx >= pix.length) {
            dx = pix.length - 1;
        }

        var r = pix[dx];
        var g = pix[dx + 1];
        var b = pix[dx + 2];
        var a = pix[dx + 3];

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = a;         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region 雕刻处理
//同浮雕效果相反，从结尾的像素开始处理

function diaokeView() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = pix.length - 4; i > 0; i -= 4) {
        var r = 0;
        var g = 0;
        var b = 0;

        r = Math.abs(pix[i] - pix[i - 4] + 128);
        g = Math.abs(pix[i + 1] - pix[i - 3] + 128);
        b = Math.abs(pix[i + 2] - pix[i - 2] + 128);
        if (r > 255)
            r = 255;
        if (r < 0)
            r = 0;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}
//#endregion

//#region 怀旧处理

function turnOld() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = parseInt(0.393 * pix[i] + 0.769 * pix[i + 1] + 0.189 * pix[i + 2]);
        var g = parseInt(0.349 * pix[i] + 0.686 * pix[i + 1] + 0.168 * pix[i + 2]);
        var b = parseInt(0.272 * pix[i] + 0.534 * pix[i + 1] + 0.131 * pix[i + 2]);

        if (r > 255) {
            r = 255;
        }
        if (g > 255) {
            g = 255;
        }
        if (b > 255) {
            b = 255;
        }

        pix[i] = r;       //红
        pix[i + 1] = g;   //绿
        pix[i + 2] = b;   //蓝
        pix[i + 3] = pix[i + 3];         //透明度
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region红色蒙版
//将红色通道取平均值，绿色通道和蓝色通道都设为0

function turnRed() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];
        pix[i] = (r + g + b) / 3;        // 红色通道取平均值
        pix[i + 1] = pix[i + 2] = 0; // 绿色通道和蓝色通道都设为0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region绿色蒙版

function turnGreen() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        pix[i + 1] = (r + g + b) / 3;        // 绿色通道取平均值
        pix[i] = pix[i + 2] = 0; // 红色通道和蓝色通道都设为0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#region蓝色蒙版

function turnBlue() {
    var imgd = show.getImageData(0, 0, mapWidth, mapHeight);  //从指定的矩形区域获取 canvas 像素数组
    var pix = imgd.data; //得到像素

    for (var i = 0, n = pix.length; i < n; i += 4) {
        var r = pix[i];
        var g = pix[i + 1];
        var b = pix[i + 2];

        pix[i + 2] = (r + g + b) / 3;        //蓝色通道取平均值
        pix[i] = pix[i + 1] = 0; //红色通道和绿色通道都设为0
    }

    show.putImageData(imgd, 0, 0);         //在指定位置进行像素重绘
}

//#endregion

//#endregion

//#region 撤销、重做操作函数

//保存picture历史记录
function saveImageHistory() {
    cancelTimes = 0;
    imageHistoryList.push(showcanvas.toDataURL());
    if (imageHistoryList.length > 0) {
        //启用撤销功能

        //菜单栏的撤销功能
        var itemEl = $('#mnEditundo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        $('#historyundoall').linkbutton('enable');//历史记录下的撤销所有
        $('#historyundo').linkbutton('enable');//历史记录下的撤销
    }
}

//undo 撤销一次
function undo() {
    cancelTimes++;
    if (cancelTimes >= imageHistoryList.length + 1) {
        cancelTimes--;
        return;
    } else if (cancelTimes == imageHistoryList.length) {
        show.clearRect(0, 0, mapWidth, mapHeight);

        //启用重做功能
        var itemEl = $('#mnEditredo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        //历史记录下的重做、重做所有按钮
        $('#historyredo').linkbutton('enable');
        $('#historyredoall').linkbutton('enable');

        //禁用撤销功能
        var itemE2 = $('#mnEditundo')[0];
        $('#mnEdit').menu('disableItem', itemE2);

        $('#historyundoall').linkbutton('disable');//历史记录下的撤销所有
        $('#historyundo').linkbutton('disable');//历史记录下的撤销
    } else {
        //启用重做功能
        var itemEl = $('#mnEditredo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        //历史记录下的重做、重做所有按钮
        $('#historyredo').linkbutton('enable');
        $('#historyredoall').linkbutton('enable');

        show.clearRect(0, 0, mapWidth, mapHeight);
        var image = new Image();
        image.src = imageHistoryList[imageHistoryList.length - 1 - cancelTimes];
        image.onload = function () {
            show.drawImage(image, 0, 0, image.width, image.height);
        };
    }
};

//redo，重做上一次操作
function redo() {
    cancelTimes--;
    if (cancelTimes < 0) {
        cancelTimes++;
        return;
    } else {
        if (cancelTimes == 0) {
            //禁用重做功能
            var itemEl = $('#mnEditredo')[0];
            $('#mnEdit').menu('disableItem', itemEl);

            //历史记录下的重做、重做所有按钮
            $('#historyredo').linkbutton('disable');
            $('#historyredoall').linkbutton('disable');
        }
        show.clearRect(0, 0, mapWidth, mapHeight);
        var image = new Image();
        image.src = imageHistoryList[imageHistoryList.length - 1 - cancelTimes];
        image.onload = function () {
            show.drawImage(image, 0, 0, image.width, image.height);
        };

        //启用撤销功能
        var itemEl = $('#mnEditundo')[0];
        $('#mnEdit').menu('enableItem', itemEl);

        $('#historyundoall').linkbutton('enable');//历史记录下的撤销所有
        $('#historyundo').linkbutton('enable');//历史记录下的撤销
    }
};

//undoall 撤销所有
function undoall() {
    show.clearRect(0, 0, mapWidth, mapHeight);

    //启用重做功能
    var itemEl = $('#mnEditredo')[0];
    $('#mnEdit').menu('enableItem', itemEl);

    //历史记录下的重做、重做所有按钮
    $('#historyredo').linkbutton('enable');
    $('#historyredoall').linkbutton('enable');

    //禁用撤销功能
    var itemE2 = $('#mnEditundo')[0];
    $('#mnEdit').menu('disableItem', itemE2);

    $('#historyundoall').linkbutton('disable');//历史记录下的撤销所有
    $('#historyundo').linkbutton('disable');//历史记录下的撤销
}

//redoall重做所有
function redoall() {
    show.clearRect(0, 0, mapWidth, mapHeight);
    var image = new Image();
    image.src = imageHistoryList[imageHistoryList.length - 1];
    image.onload = function () {
        show.drawImage(image, 0, 0, image.width, image.height);
    };

    //禁用重做功能
    var itemEl = $('#mnEditredo')[0];
    $('#mnEdit').menu('disableItem', itemEl);

    //历史记录下的重做、重做所有按钮
    $('#historyredo').linkbutton('disable');
    $('#historyredoall').linkbutton('disable');

    //启用撤销功能
    var itemEl = $('#mnEditundo')[0];
    $('#mnEdit').menu('enableItem', itemEl);

    $('#historyundoall').linkbutton('enable');//历史记录下的撤销所有
    $('#historyundo').linkbutton('enable');//历史记录下的撤销
}

//#endregion

//#region 图层操作

//#region 图层管理下的按钮操作

//新建图层
$('#levellstNew').click(function () {
    levelOpration.addLevel();
});

//删除图层
$('#levellstDelete').click(function () {
    levelOpration.deleteLevel();
});

//复制图层
$('#levellstCopy').click(function () {
    levelOpration.copyLevel();
});

//向上移动图层
$('#levellstMoveUp').click(function () {
    levelOpration.moveUpLevel();
});

//向下移动图层
$('#levellstMoveDown').click(function () {
    levelOpration.moveDownLevel();
});

//图层属性
$('#levellstInfo').click(function () {
    levelOpration.showLevelInfo();
});

//#endregion



//存放图层信息
var levelList = new Array({ "canvasId": "showcanvas", "isHide": false });
//根据图层id删除该元素
Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].canvasId == val) {
            this.splice(i, 1);
            break;
        }
    }
}

//创建新的画布
var selectedLevelId;//记录当前选中的图层记录id
var selectedcanvasid;//记录当前选中图层canvas的id
var levelNum = 1; //图层面板新建索引
function createCanvas(levelNum, width, height) {
    var newCanvas = document.createElement("canvas");
    newCanvas.id = "level" + levelNum;
    newCanvas.width = width;
    newCanvas.height = height;
    $(newCanvas).addClass("newCanvas");
    $(newCanvas).css("z-index", levelNum + 2);//已经有临时图层和最终展示图层，z-index分别为1和2

    var levelInfo = { "canvasId": newCanvas.id, "isHide": false };
    levelList.push(levelInfo);
    return newCanvas;
}

//图层操作类
var levelOpration = {
    //图层个数
    levelCount: 0,
    //新增图层
    addLevel: function () {
        //创建图层，并加入到背景图层中
        var firstDrawWin = document.getElementById("firstDrawWin");

        var newCanvas = createCanvas(levelNum, mapWidth, mapHeight);
        var bgroudCanvas = document.getElementsByTagName("canvas")[0];
        firstDrawWin.insertBefore(newCanvas, bgroudCanvas);

        //图层管理面板
        var levelName = "图层" + levelNum;
        var levelNameCheck = "levelCheck" + levelNum;
        var levelStr = "<a id=\"" + levelName + "\" href=\"#\" style=\"width: 100%;\" title=\"" + levelName + "\" >" + levelName + "<input id=\"" + levelNameCheck + "\" type=\"checkbox\" checked=\"true\" /></a><br />";
        $("#levelList").prepend(levelStr);//新建的图层在开始行

        //设置样式
        $('#' + levelName).linkbutton({
            iconCls: 'icon-level',
            plain: true
        });
        //控制滚动条在最下
        $('#levelList').scrollTop();
        levelNum++;

        getCurrentCanvas();
    },
    //删除图层
    deleteLevel: function () {
        //删除选中的图层，不是checked=true的图层
        levelList.removeByValue(selectedcanvasid);//图层管理栈中删除该记录
        //删除该canvas
        $("#" + selectedcanvasid).remove();

        //图层管理记录中，移除该记录
        $("#" + selectedLevelId).remove();
        $('#levellstDelete').linkbutton('disable');

        getCurrentCanvas();
    },
    //复制图层
    copyLevel: function () {


        getCurrentCanvas();
    },
    //向上移动图层
    moveUpLevel: function () {

        getCurrentCanvas();
    },
    //向下移动图层
    moveDownLevel: function () {

        getCurrentCanvas();
    },
    //显示图层属性
    showLevelInfo: function () {
        alert("显示图层属性");
    }
};

//隐藏、显示图层。图层列表，单击checkbox触发
$("#levelList input[type='checkbox']").live("click", function () {
    var canvasid;
    var levelclickNum;
    if (this.id == "cklebelbgroud") {//背景
        canvasid = "showcanvas";
        levelclickNum = 0;
    }
    else {
        levelclickNum = this.id.substring(10);
        canvasid = "level" + levelclickNum;
    }

    if ($(this).attr("checked")) {//显示这个图层
        $("#" + canvasid).show();

        //图层栈的中，该图层标注为显示
        levelList[levelclickNum] = { "canvasId": levelList[levelclickNum].canvasId, "isHide": false };
    } else {//隐藏这个图层
        $("#" + canvasid).hide();

        //图层栈的中，该图层标注为隐藏
        levelList[levelclickNum] = { "canvasId": levelList[levelclickNum].canvasId, "isHide": true };
    }

    getCurrentCanvas();
});

//图层记录单击
$("#levelList a").live("click", function () {
    var levelclickNum;
    if (this.id == "levelbgroud") {//背景
        selectedcanvasid = "showcanvas";
    }
    else {
        levelclickNum = this.id.substring(2);
        selectedcanvasid = "level" + levelclickNum;
    }

    selectedLevelId = this.id;//记录当前选中的图层记录id
    $("#levelList a").each(function () {
        if (this.id == selectedLevelId) {//该项为选中状态
            $("#" + selectedLevelId).css("background-color", "#B2CBF0");
        }
        else {//其他为非选中状态
            $(this).css("background-color", "#FFFFFF");
        }
    });

    $('#levellstDelete').linkbutton('enable');
});
//#endregion

//#region创建网格

//创建网格
//levelNum当前图层个数
function drawGrid(levelNum) {

    var drawgridcanvas = document.getElementById("gridcanvas");//获取网格区域
    var gridContext = drawgridcanvas.getContext("2d");

    $(drawgridcanvas).css("z-index", levelNum + 2);//加上临时图层、最终展示图层
    levelNum++;

    gridContext.strokeStyle = "#7F7F7F";
    var canvasWidth = drawgridcanvas.width;
    var canvasHeight = drawgridcanvas.height;

    gridContext.beginPath();

    var dashLength = 1;//虚线间隔
    var startX;//起始X轴坐标
    var startY;//起始Y轴坐标
    var currentX;//终点X轴坐标
    var currentY;//终点Y轴坐标

    var deltaX;
    var deltaY;
    var numDashes;

    gridContext.beginPath();
    //画竖向
    for (var x = 10; x < canvasWidth; x += 10) {
        gridContext.moveTo(x, 0);
        startX = x;
        startY = 0;
        currentX = x;
        currentY = canvasHeight;

        deltaX = currentX - startX;
        deltaY = currentY - startY;
        numDashes = canvasHeight / dashLength;

        for (var i = 0; i < numDashes; ++i) {
            gridContext[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * i, startY + (deltaY / numDashes) * i);
        }
    }

    //画横向
    for (var y = 10; y < canvasHeight; y += 10) {
        gridContext.moveTo(0, y);
        startX = 0;
        startY = y;
        currentX = canvasWidth;
        currentY = y;

        deltaX = currentX - startX;
        deltaY = currentY - startY;
        numDashes = canvasWidth / dashLength;

        for (var j = 0; j < numDashes; ++j) {
            gridContext[j % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * j, startY + (deltaY / numDashes) * j);
        }
    }

    gridContext.stroke();
}

//#endregion

//#region 函数回调，获取子页面的值，进行处理。
//paras为子页面传回的参数。要指定参数的来源，以便做出不同的处理
//例如：{"mark":"selectimg","imgSrc":"C:\Users\Tim\Pictures\test.png"}

function reCallMethod(paras) {
    paras = eval('(' + paras + ')'); //将字符串转换成json
    var mark = paras.mark; //获取标记，标示值的来源
    switch (mark) {
        case "selectimg": //图片选择
            DrawPic(paras.imgSrc);            //调用绘制图片函数
            ShowOpration(oprationmenuid, oprationmenutext, iconmenuCls); //将操作显示在历史记录中
            saveImageHistory();//保存画布
            break;
            //case "communicate"://协同交流
            //    if (paras.result == "success") {//加入协同处理成功，则页面上的操作会发送到其他在线用户
            //        isCommunicate = true;
            //    }
            //    break;
    }
}

//#endregion

//构建协同处理需要的参数
function createDraw(comdrawobject) {
    //构建参数
    if (isCommunicate) {//加入协同操作成功！
        communicateTo = $("#selMsgTo").val();//接收人
        var content = "";//操作函数+参数
        switch (comdrawobject) {
            case "paintline"://直线
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintdottedline"://虚线
                var dottStyle = $("#selline").combobox('getValue');
                var dashLength = 5;
                switch (dottStyle) {
                    case "dottedline1":
                        dashLength = 5;
                        break;
                    case "dottedline2":
                        dashLength = 15;
                        break;
                    case "dottedline3":
                        dashLength = 25;
                        break;
                }
                content = comdrawobject + "@" + dashLength + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintstrokeRect"://矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillRect"://填充矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintradiusStrokeRect"://圆角空心矩形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintcircle"://圆
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillCircle"://填充圆
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintellipse"://椭圆
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillellipse"://填充椭圆
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintrighttriangle"://直角三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillrighttriangle"://填充直角三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintregulartriangle"://等腰三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintfillregulartriangle"://填充等腰三角形
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penalpha + "@" + startX + "@" + startY + "@" + currentX + "@" + currentY;
                break;
            case "paintcurveLine"://曲线
                content = comdrawobject + "@\"" + pencolor + "\"@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"@" + cuStartX + "@" + cuStartY + "@" + cuEndX + "@" + cuEndY + "@" + currentX + "@" + currentY;
                break;
            case "paintdrawText"://绘制文本
                content = comdrawobject + "@\"" + txtFont + "\"@\"" + txtSize + "\"@\"" + txtBold + "\"@\"" + txtItalic + "\"@\"" + txtUnderline + "\"@\"" + txtDeleteline + "\"@\"" + txtAlign + "\"@\"" + pencolor + "\"@\"" + txtInput + "\"@" + txtPoX + "@" + txtPoY + "@" + penshowdow + "@" + penwidth + "@" + penalpha + "@\"" + penstyle + "\"";
                break;
        }

        //发送协同操作
        sendDraw(content, communicateTo);
    }
}
