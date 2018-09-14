var express=require("express");
var mysql=require("mysql");

//配置数据库连接池
var pool=mysql.createPool({
    host:"127.0.0.1",
    port:3306,
    database:"personal_blog",
    user:"root",
    password:"a"
});

//var upload=multer({dest:"../public/photo"});


//路由操作，第一步，需要加载路由
var router=express.Router();

//当加载main.js的时候，我们就必定是首页里面的内容，而首页里面的内容，绝对要有分类
var alltype1;
router.use(function (req,res,next) {
    pool.getConnection(function (err,conn) {
        conn.query("select * from type where tid!=1 order by tid", function (err,result) {
            conn.release();
            alltype1=result;
            //请注意，一定要执行next
            next();      //next值继续往下执行，让程序查完sql语句之后，继续往下运行
        })
    })
});

//判断 如果没有登录或普通用户 无法访问管理员后台界面
router.use(function (req,res,next) {
    //console.log(req.session.userInfo);
    if(req.session.userInfo==null || req.session.userInfo==undefined || req.session.userInfo.isAdmin===0){
        res.send("<script>alert('非法操作，请重新登录');location.href='http://127.0.0.1/'</script>");
        return;
    }
    next();
})


router.get("/", function (req,res) {
    res.render("admin/index",{
        userInfo:req.session.userInfo,
        types:alltype1
    });

});

//用户管理
router.get("/user", function (req,res) {
    var page=Number(req.query.page || 1);
    var size=6;
    pool.getConnection(function (err,conn) {
        conn.query("select * from user order by uid", function (err,result) {
                var count=result.length;
                var pages=Math.ceil(count/size);
                page=Math.min(page,pages);
                page=Math.max(page,1);

                var beginSize=(page-1)*size;

                //开始分页查询
                conn.query("select * from user order by uid limit ?,?",[beginSize,size], function (err,result2) {
                    conn.release();
                    if(err){
                        console.log(err);
                    }else if(result.length>0){
                        res.render("admin/user_index",{
                            userInfo:req.session.userInfo,
                            users:result2,
                            types:alltype1,
                            page:page,
                            pages:pages,
                            size:size,
                            count:count,
                            tag:'user'
                        });
                    }
                })
            })
    })
})

//分类首页
router.get("/category", function (req,res) {
    var page=Number(req.query.page || 1);
    var size=6;
    pool.getConnection(function (err,conn) {
        conn.query("select * from type order by tid", function (err,result) {
                var count=result.length;
                var pages=Math.ceil(count/size);
                var beginSize=(page-1)*size;
                page=Math.max(page,1);
                page=Math.min(page,pages);
                conn.query("select * from type order by tid limit ?,?",[beginSize,size], function (err,resu) {
                    conn.release();
                    if(err){
                        console.log(err);
                    }
                    res.render("admin/type_index",{
                        userInfo:req.session.userInfo,
                        types1:resu,
                        types:alltype1,
                        page:page,
                        pages:pages,
                        count:count,
                        size:size,
                        tag:'category'
                    })
                })
            })
    })
})

//分类添加
router.get("/category/add", function (req,res) {
    res.render("admin/type_add",{
        userInfo:req.session.userInfo,
        types:alltype1
    });
})

var resData={
    code:-1,
    messages:""
};

router.post("/category/add", function (req,res) {
    var tname=req.body.tname;
    pool.getConnection(function (err,conn) {
        conn.query("insert into type values(0,?)",[tname], function (err,result) {
            conn.release();
            if(err){
                resData.code=0;
                resData.messages="类名不能重复";
                res.json(resData);
            }else {
                resData.code=1;
                resData.messages="添加成功";
                res.json(resData);
            }
        });
    });
});

//分类修改
router.post("/category/edit", function (req,res) {
    var tid=req.body.tid;
    var tname=req.body.tname;
    pool.getConnection(function (err,conn) {
        conn.query("update type set tname=? where tid=?",[tname,tid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }else if(result.affectedRows>0){
                res.send("1");
            }else{
                res.send("0");
            }
        })
    })
})


//分类删除  ??
router.post("/category/del", function (req,res) {
    var tid=req.body.tid;
    var flag=false;
    //要删除，可以，但是，这个数据，不能在contents里面
    pool.getConnection(function (err,conn) {
        conn.query("delete from type where tid=?",[tid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
                res.send("0");
            }else if(result.affectedRows>0){
                res.send("1");
            }else{
                res.send("0");
            }
        })
    })
})

//内容首页
router.get("/content", function (req,res) {
    var type=req.query.mytype;
    pool.getConnection(function (err,conn) {
        conn.query("select tname from type_content where tid=?",[type], function (err,result) {
            var tablename=result[0].tname;
            conn.query("select * from foods order by fid", function (err,result4) {
                    conn.query("select * from travel order by trid", function (err,result5) {
                        conn.query("select * from contents order by cid", function (err,result2) {
                            conn.release();
                            if(type==2){
                                res.render("admin/jd",{
                                    userInfo:req.session.userInfo,
                                    types:alltype1,
                                    contents:result2
                                });
                            }
                            if(type==3){
                                res.render("admin/ms",{
                                    userInfo:req.session.userInfo,
                                    types:alltype1,
                                    foods:result4
                                });
                            }
                            if(type==4){
                                res.render("admin/yj",{
                                    userInfo:req.session.userInfo,
                                    types:alltype1,
                                    travels:result5
                                });
                            }
                        })
                    })
                })
        })
    })

});

//景点删除
router.post("/content/jd/del", function (req,res) {
    var cid=req.body.cid;
    pool.getConnection(function (err,conn) {
        conn.query("delete from contents where cid=?",[cid], function (err,result) {
            conn.release();
            if(err){
                consle.log(err);
            }else if(result.affectedRows>0){
                res.send("1");
            }else{
                res.send("0");
            }
        })
    })
})

//景点修改
router.get("/jd/edit", function (req,res) {
    var cid=req.query.cid;
    pool.getConnection(function (err,conn) {
        conn.query("select * from contents where cid=?",[cid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            res.render("admin/jd_edit",{
                userInfo:req.session.userInfo,
                types:alltype1,
                contents:result[0]
            })
        })
    })
})
router.post("/jd/edit", function (req,res) {
    var cid=req.query.cid;
    var cname=req.body.cname;
    var photo=req.body.photo;
    var content=req.body.content;

    pool.getConnection(function (err,conn) {
        conn.query("update contents set cname=?,photo=?,content=? where cid=?",[cname,photo,content,cid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            res.send("<script>alert('修改成功');location.href='../content?mytype=2'</script>")
        })
    })

})

//美食删除
router.post("/content/ms/del", function (req,res) {
    var fid=req.body.fid;
    console.log(fid);
    pool.getConnection(function (err,conn) {
        conn.query("delete from foods where fid=?",[fid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            if(result.affectedRows>0){
                res.send("1");
            }else{
                res.send("0");
            }
        })
    })
})

//美食修改
router.get("/ms/edit", function (req,res) {
    var fid=req.query.fid;
    pool.getConnection(function (err,conn) {
        conn.query("select * from foods where fid=?",[fid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            res.render("admin/ms_edit",{
                userInfo:req.session.userInfo,
                types:alltype1,
                foods:result[0]
            })
        })
    })
})
router.post("/ms/edit", function (req,res) {
    var fid=req.query.fid;
    var fname=req.body.fname;
    var photo=req.body.photo;
    var intro=req.body.content;

    pool.getConnection(function (err,conn) {
        conn.query("update foods set fname=?,photo=?,intro=? where fid=?",[fname,photo,intro,fid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            res.send("<script>alert('修改成功');location.href='../content?mytype=3'</script>");
        })
    })
})

//美食添加
router.get("/ms_add", function (req,res) {
    res.render("admin/ms_add");
})

//游记删除
router.post("/content/ms/del", function (req,res) {
    var trid=req.body.trid;
    pool.getConnection(function (err,conn) {
        conn.query("delete from travel where trid=?",[trid], function (err,result) {
            conn.release();
            if(err){
                console.log(err);
            }
            if(result.affectedRows>0){
                res.send("1");
            }else{
                res.send("0");
            }
        })
    })
})

//游记修改
router.get("/yj/edit", function (req,res) {
    var trid=req.query.trid;
    pool.getConnection(function (err,conn) {
        conn.query("select * from travel where trid=?",[trid], function (err,result) {
            conn.release();
            res.render("admin/yj_edit",{
                userInfo:req.session.userInfo,
                types:alltype1,
                travels:result[0]
            })
        })
    })

})

router.post("/yj/edit", function (req,res) {
    var trid=req.query.trid;
    //其余数据都是表单提交
    var tname=req.body.tname;
    var title=req.body.title;
    var photo=req.body.photo;
    var content=req.body.content;

    pool.getConnection(function (err,conn) {
        conn.query("update travel set tname=?,title=?,photo=?,content=? where trid=?",[tname,title,photo,content,trid], function (err,resu){
            conn.release();
            if(err){
                console.log(err);
            }
            res.send("<script>alert('修改成功');location.href='../content?mytype=4'</script>");
        })
    })
})


//第三步，将这个支线模块，加载到主模块里面去
module .exports=router;