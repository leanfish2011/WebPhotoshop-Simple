//键盘快捷键

//文件菜单
Mousetrap.bind('alt+f', function (e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
        //e.cancel = true;
    }
    alert("123");
    //$("#menumnFile").hover();

    //$("#menumnFile").addClass("menu-active");

});

//#region 文件

//打开
Mousetrap.bind('ctrl+g', function (e) {
    fileOpen();
});

//获取
Mousetrap.bind('ctrl+m', function (e) {
    imgFromCamera();
});

//#endregion

//#region 编辑

//撤销
Mousetrap.bind('ctrl+z', function (e) {
    undo();
});

//重做
Mousetrap.bind('ctrl+y', function (e) {
    redo();
});

//清空
Mousetrap.bind('ctrl+q', function (e) {
    $.messager.confirm('确定', '确定清空当前画布？', function (r) {
        if (r) {
            reset();
        }
    });
});

//#endregion

//#region 效果

//黑白
Mousetrap.bind('ctrl+shift+w', function (e) {
    tobalckwhite();
});

//反色
Mousetrap.bind('ctrl+shift+i', function (e) {
    inverse();
});

//模糊
Mousetrap.bind('ctrl+shift+b', function (e) {
    blur();
});

//雾化
Mousetrap.bind('ctrl+shift+m', function (e) {
    wuhuaView();
});

//锐化
Mousetrap.bind('ctrl+shift+s', function (e) {
    sharpen();
});

//浮雕
Mousetrap.bind('ctrl+shift+f', function (e) {
    selaFloat();
});

//柔化
Mousetrap.bind('ctrl+shift+t', function (e) {
    conslateSoft();
});

//油画
Mousetrap.bind('ctrl+shift+p', function (e) {
    conslatepainting();
});

//积木
Mousetrap.bind('ctrl+shift+d', function (e) {
    conslatewood();
});

//雕刻
Mousetrap.bind('ctrl+shift+v', function (e) {
    diaokeView();
});

//怀旧
Mousetrap.bind('ctrl+shift+o', function (e) {
    turnOld();
});

//红色蒙版
Mousetrap.bind('ctrl+shift+r', function (e) {
    turnRed();
});

//绿色蒙版
Mousetrap.bind('ctrl+shift+g', function (e) {
    turnGreen();
});

//蓝色蒙版
Mousetrap.bind('ctrl+shift+b', function (e) {
    turnBlue();
});

//#endregion

//#region工具箱

//选择工具
Mousetrap.bind('s', function (e) {
    $("#btnSelect").click();
});

//移动工具
Mousetrap.bind('m', function (e) {
    $("#btnMove").click();
});

//套索工具
Mousetrap.bind('a', function (e) {
    $("#btnLasso").click();
});

//缩放工具
Mousetrap.bind('z', function (e) {
    $("#btnZoomAll").click();
});

//手抓工具
Mousetrap.bind('h', function (e) {
    $("#btnHand").click();
});

//填充工具
Mousetrap.bind('f', function (e) {
    $("#btnFill").click();
});

//渐变工具
Mousetrap.bind('n', function (e) {
    $("#btnGradient").click();
});

//画笔
Mousetrap.bind('b', function (e) {
    $("#btnPaintBrush").click();
});

//铅笔
Mousetrap.bind('p', function (e) {
    $("#btnPaintBrush").click();
});

//橡皮擦
Mousetrap.bind('e', function (e) {
    $("#btnEraser").click();
});

//放大镜
Mousetrap.bind('o', function (e) {
    $("#btnZoomMiro").click();
});

//裁剪
Mousetrap.bind('c', function (e) {
    $("#btnSelectCut").click();
});

//文本
Mousetrap.bind('t', function (e) {
    $("#btnText").click();
});

//直线
Mousetrap.bind('l', function (e) {
    $("#btnLine").click();
});

//曲线
Mousetrap.bind('v', function (e) {
    $("#btnCurve").click();
});

//矩形
Mousetrap.bind('r', function (e) {
    $("#btnRectangle").click();
});

//椭圆
Mousetrap.bind('i', function (e) {
    $("#btnEllipse").click();
});

//三角形
Mousetrap.bind('g', function (e) {
    $("#btnTriangle").click();
});

//多边形
Mousetrap.bind('y', function (e) {
    $("#btnPolygon").click();
});

//其他形状
Mousetrap.bind('w', function (e) {
    $("#btnOtherShap").click();
});

//图章
Mousetrap.bind('x', function (e) {
    $("#btnClone").click();
});

//透明度
Mousetrap.bind('d', function (e) {
    $("#btnAlpha").click();
});

//#endregion

//#region视图

//放大
Mousetrap.bind('ctrl+up', function (e) {
    transforms.zoomin();
});

//缩小
Mousetrap.bind('ctrl+down', function (e) {
    transforms.zoomout();
});

//#endregion

//#region

//帮助文档
Mousetrap.bind('ctrl+f1', function (e) {
    window.open("Help.htm");
});

//#endregion

