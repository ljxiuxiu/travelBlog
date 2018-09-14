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

//路由操作，第一步，需要加载路由
var router=express.Router();

//当加载main.js的时候，我们就必定是首页里面的内容，而首页里面的内容，绝对要有分类
var alltype;
router.use(function (req,res,next) {
    pool.getConnection(function (err,conn) {
        conn.query("select * from type order by tid", function (err,result) {
            conn.release();
            alltype=result;
            //请注意，一定要执行next
            next();      //next值继续往下执行，让程序查完sql语句之后，继续往下运行
        })
    })
});


router.get("/", function (req,res) {
    //console.log(req.session.userInfo);
    var page=Number(req.query.page || 1);    //当前的页数，默认第一页
    var mytype=Number(req.query.mytype || 1);    //当前的类型，默认为1  1代表首页
    pool.getConnection(function (err,conn) {
            conn.query("select * from foods order by fid ", function (err,result2) {
                conn.query("select * from gallery order by gid", function (err,result3) {
                    conn.query("select * from travel order by trid", function (err,result4) {
                        conn.query("select * from contents order by cid", function (err,resu) {
                            //总记录条数
                            var count=resu.length;
                            //我们规定，一次默认分2条数据
                            var size=2;
                            //计算总页数
                            var pages=Math.ceil(count/size);
                            //要控制一下页数
                            page=Math.min(page,pages);   //  每次取最小 保证不会超过总页数
                            page=Math.max(page,1);   //  每次取最大 保证不会小于1

                            //开始的条数
                            var beginSize=(page-1)*size;

                            //开始分页查找
                            conn.query("select * from contents order by cid limit ?,?",[beginSize,size], function (err,resu) {
                                conn.release();
                                //将数据传到网页里
                                //    网页路径  传到这个网页的模板引擎的参数
                                //console.log(result2);
                                res.render("main/index",{
                                    types:alltype,
                                    contents:resu,
                                    foods:result2,
                                    gallerys:result3,
                                    travels:result4,
                                    page:page,
                                    pages:pages,
                                    size:size,
                                    count:count,
                                    mytype:mytype,
                                    userInfo: req.session.userInfo      //取session
                                });
                            })

                        })
                    })
                })
            })
    });
    //res.render(__dirname+"/view/main/index.html");
});


router.get("/view", function (req,res) {
    var type=req.query.mytype;
    pool.getConnection(function (err,conn) {
        var page=Number(req.query.page || 1);    //当前的页数，默认第一页
        var mytype=Number(req.query.mytype || 1);
        conn.query("select * from user order by uid", function (err,result) {
            conn.query("select * from foods order by fid ", function (err,result2) {
                conn.query("select * from gallery order by gid", function (err,result3) {
                    conn.query("select * from travel order by trid", function (err,result4) {
                        conn.query("select * from contents order by cid", function (err,resu) {
                            //总记录条数
                            var count=resu.length;
                            //我们规定，一次默认分2条数据
                            var size=2;
                            //计算总页数
                            var pages=Math.ceil(count/size);
                            //要控制一下页数
                            page=Math.min(page,pages);   //  每次取最小 保证不会超过总页数
                            page=Math.max(page,1);   //  每次取最大 保证不会小于1

                            //开始的条数
                            var beginSize=(page-1)*size;

                            //开始分页查找
                            conn.query("select * from contents order by cid limit ?,?",[beginSize,size], function (err,resu1) {
                                conn.release();
                                //将数据传到网页里
                                //    网页路径  传到这个网页的模板引擎的参数
                                //console.log(result2);
                                if(type==1){
                                    res.render("main/index",{
                                        types:alltype,
                                        contents:resu1,
                                        foods:result2,
                                        gallerys:result3,
                                        travels:result4,
                                        page:page,
                                        pages:pages,
                                        size:size,
                                        count:count,
                                        mytype:mytype,
                                        userInfo: req.session.userInfo      //取session
                                    });
                                }
                                if(type==2){
                                    res.render("other/single",{
                                        types:alltype,
                                        contents1:resu,
                                        user:result,
                                        userInfo: req.session.userInfo
                                    });
                                }
                                if(type==3){
                                    res.render("other/blog",{
                                        types:alltype,
                                        foods:result2,
                                        userInfo: req.session.userInfo
                                    });
                                }
                                if(type==4){
                                    res.render("other/typography",{
                                        types:alltype,
                                        travels:result4,
                                        userInfo: req.session.userInfo
                                    });
                                }

                            })

                        })
                    })
                })
            })

        })

    })

})


//查看详情
router.get("/ckxq", function (req,res) {
    var trid=req.query.trid;
    pool.getConnection(function (err,conn) {
        conn.query("select * from comments", function (err,result2) {
            conn.query("select * from type order by tid", function (err,resu) {
                conn.query("select * from travel where trid=?",[trid], function (err,result) {
                    conn.release();
                    res.render("other/ckxq",{
                        userInfo:req.session.userInfo,
                        travels:result,
                        types:resu,
                        comments:result2
                    });
                })
            })

        })
    })
})

router.post("/ckxq", function (req,res) {
    var ctext=req.body.ctext;
    var trid=req.body.trid;
    var uname=req.body.uname;
    var addTime=req.body.addTime;
    pool.getConnection(function (err,conn) {
        conn.query("insert into comments values(0,?,?,?,?)",[uname,trid,addTime,ctext], function (err,result) {
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
//第三步，将这个支线模块，加载到主模块里面去
module .exports=router;