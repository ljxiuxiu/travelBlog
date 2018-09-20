$(function() {

    $("#btn_lg").click(function () {
        $(".lgBox").show();
    })

    $(".lg_zc").click(function (){
        $(".lg_zc a").css("color","#fff");
        $(".form_box").eq($(this).index()).show().siblings().hide();
        $(".lg_zc").eq($(this).index()).css("background","rgba(255,255,255,0.8)").siblings().css("background","rgba(108,104,103,0.8)");
        $(".lg_zc a").eq($(this).index()).css("color","#000");
    })

    $("#close").click(function () {
        $(".lgBox").hide();
    })

    var $register = $("#form_register");
    var $login = $("#form_login");

    //美食滑动
    var $daxiuxiu=$("#daxiuxiu");
    var $xiuxiu=$("#xiuxiu");
    var i=4;        //每次滑动4个
    var p=1;        //默认第一页

    //        获取总长度
    var x_width=1200;
    var len=$daxiuxiu.find("div.staff2").length;      //有多少个li
    //计算页数
    var pageCount=Math.ceil(len/i);     //向上取整
    //console.log(pageCount);

    //        下一页
    $("#next").click(function () {
        //  is()  判断是否在某一个状态        是为true 否为false      ：animated  是否正在动画中
        //  判断动画完成之后，我们再添加动画
        if( !$xiuxiu.is(":animated") ){
            if(p==pageCount){
                //最后一张  返回第一张
                $xiuxiu.animate({left:"0px"},"slow");
                p=1;
            }else{
                $xiuxiu.animate({left:"-="+x_width},"slow");
                p++;
            }
        }
    });

    //        上一页
    $("#prev").click(function () {
        if( !$xiuxiu.is(":animated") ){
            if(p==1){
                //  第一张  返回最后一张
                $xiuxiu.animate({left:"-="+x_width*(pageCount-1)},"slow");
                p=pageCount;
            }else{
                $xiuxiu.animate({left:"+="+x_width},"slow");
                p--;
            }
        }
    });

    //游记滑动
    var $sp=$("#sp");
    var $yj=$("#yj");
    var j=2;        //每次滑动2个
    var p1=1;        //默认第一页
    //        获取总长度
    var y_height=300;
    var len1=$yj.find("div").length;      //有多少个li
    //计算页数
    var pageCount1=Math.ceil(len1/j);     //向上取整
//        下一页
    $("#p_prev").click(function () {
        console.log("a");
        //  is()  判断是否在某一个状态        是为true 否为false      ：animated  是否正在动画中
        //  判断动画完成之后，我们再添加动画
        if( !$yj.is(":animated") ){
            if(p1==pageCount1){
                //最后一张  返回第一张
                $yj.animate({top:"0px"},"slow");
                p1=1;
            }else{
                $yj.animate({top:"-="+y_height},"slow");
                p1++;
            }
        }
    });


    //注册
    $("#registerBox").on("click", function () {
        var uname=$register.find('[name="username"]').val();
        var pwd=$register.find('[name="password"]').val();
        var repwd=$register.find('[name="repassword"]').val();
        console.log(uname+"-"+pwd+"-"+repwd);
        if (uname == null || uname == "" || pwd == null || pwd == "") {
            alert("用户名和密码不能为空");
            return;
        }

        if (pwd != repwd) {
            alert("输入的两次密码不一致");
            return;
        }


        $.ajax({
            type:"post",
            url:"/api/user/register",
            data:{
                uname:uname,
                pwd:pwd
            },
            dataType:"json",
            success: function (result) {
                $register.find('.colWarning').html(result.message);
                /*if(result.code==1){
                    $register.find('[name="username"]').val("");
                    $register.find('[name="password"]').val("");
                    $register.find('[name="repassword"]').val("");
                }*/
                if(result.code==2){
                    //注册成功
                    setTimeout(function () {
                        $login.show();
                        $register.hide();
                        $(".lg_zc").last().css("background","rgba(255,255,255,0.8)").siblings().css("background","rgba(108,104,103,0.8)");
                        $(".lg_zc a").last().css("color","#000");
                        $(".lg_zc a").first().css("color","#fff");
                    },1000);
                }
            }
        })
    });

    //登录
    $("#loginBox").on("click", function () {
        var uname=$login.find('[name="username"]').val();
        var pwd=$login.find('[name="password"]').val();

        if(uname=="" || uname==null || pwd=="" || pwd==null){
            alert("用户名或密码不能为空");
            return;
        }

        $.ajax({
            type:"post",
            url:"/api/user/login",
            data:{
                uname:uname,
                pwd:pwd
            },
            dataType:"json",
            success: function (result) {
                $login.find('.colWarning').html(result.message);
                if(result.code==1) {
                    $login.find('[name="username"]').val("");
                    $login.find('[name="password"]').val("");
                }
                if(result.code==2){
                    setTimeout(function () {
                        $(".lgBox").hide();
                    },500);
                    window.location.reload();
                }
            }
        })
    })

    //退出
    $("#btn_exit").click(function () {
        $.ajax({
            type:"post",
            url:"/api/user/exit",
            success: function (result) {
                if(result=="0"){
                    window.location.reload();
                    alert("退出成功");
                }
            }
        })
    })
})