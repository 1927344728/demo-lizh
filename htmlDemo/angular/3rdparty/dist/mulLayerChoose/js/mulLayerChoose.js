(function(){
    var domUlHeight=window.innerHeight-90;
    function initPopupLayer(opt, Fn){
        $.ajax({
            url:opt.initDataURL,
            data:"",
            dataType: "json",
            method: "post",
            xhrFields: {
                withCredentials: true
            },
            success: function(data){
                var jobListData = data;

                if(opt.delJoblArr && opt.delJoblArr.length>0){
                    jobListData.map(function(el_1, idx_1){
                        for( var i=el_1.children.length-1; i>=0; i--){
                            opt.delJoblArr.map(function(level){
                                if(el_1.children[i] && el_1.children[i].val==level){
                                    jobListData[idx_1].children.splice(i,1);
                                }
                            });
                        }
                    });
                    jobListData.map(function(el_1, idx_1){
                        if(el_1.children.length===0){
                            jobListData.splice(idx_1,1);
                        }
                    });
                }

                initCatgListDiv(opt, jobListData, Fn);
            },
            error: function(error){
                console.log("数据请求出错");
            }
        });
    }
    function initCatgListDiv(opt, catgData, Fn){
        var arr = opt.choseArr;
        var popDom = $(
            '<section class="catgListSection">' +
            '<header class="catgHead">选择职业</header>' +
            '<div class="catgTitle">' +
            '<span>大分类</span>' +
            '<span>中分类</span>' +
            '<span><em>小分类</em> <em>等级</em></span>' +
            '</div>' +
            '<div class="catgMainDiv">' +
            '<ul class="catgFirstUl"></ul>' +
            '<ul class="catgSecondUl"></ul>' +
            '<ul class="catgthirdUl"></ul>' +
            '</div>' +
            '</section>');
        $("body").append(popDom);
        // popDom.find(".catgMainDiv ul").css("height", window.innerHeight-Math.ceil($(".catgHead").height() + $(".catgTitle").height()+30)+"px");
        popDom.find(".catgMainDiv ul").css("height",  domUlHeight+"px");

        if(opt.backBtn){
            // $("<a id='catgHeadBack' href='javascript:;'></a><em class='leftArrowIcon'></em>").prependTo("header.catgHead");
            $("<a id='catgHeadBack' href='javascript:;'>关闭</a>").prependTo("header.catgHead");
            popDom.find("#catgHeadBack").click(function(){ popDom.remove(); });
        }
        createFirstLi(arr, catgData);
        createSecondLi(arr, catgData);
        createThirdLi(arr, catgData);

        popDom.find(".catgFirstUl").on("click", "li", function(){
            arr = [$(this).index(), 0];
            $(this).addClass("c_blue").siblings("li").removeClass("c_blue");
            createSecondLi(arr,catgData);
            createThirdLi(arr,catgData);
        });
        popDom.find(".catgSecondUl").on("click", "li", function(){
            arr = [arr[0],$(this).index()];
            $(this).addClass("c_blue").siblings("li").removeClass("c_blue");
            createThirdLi(arr,catgData);
        });
        popDom.find(".catgthirdUl").on("click", "li", function(){
            arr = [arr[0], arr[1], $(this).index()];
            $(this).addClass("c_blue").siblings("li").removeClass("c_blue");
            Fn.bind( $(this).closest("section.catgListSection") )(arr.concat(catgData[arr[0]].children[arr[1]].val, catgData[arr[0]].children[arr[1]].code));
        });
    }
    function createFirstLi(arr, catgData){
        $(".catgSecondUl li").remove();
        catgData.map(function(elem, idx){
            $("<li class='" + (idx===arr[0]?"c_blue":"") + "'>" + elem.des + "</li>").appendTo(".catgFirstUl");
        });
    }
    function createSecondLi(arr, catgData){
        $(".catgSecondUl li").remove();
        catgData[arr[0]].children.map(function(elem_2, idx_2){
            $("<li class='" + (idx_2===arr[1]?"c_blue":"") + "'>" + elem_2.des + "</li>").appendTo(".catgSecondUl");
        });
    }
    function createThirdLi(arr, catgData){
        $(".catgthirdUl li").remove();
        catgData[arr[0]].children[arr[1]].children.map(function(elem_3,idx_3){
            $("<li class='" + (arr[2]!==undefined && idx_3===arr[2]?"c_blue":"") + "'><em>" + elem_3 + "</em><em>" + catgData[arr[0]].children[arr[1]].val + "</em></li>").appendTo(".catgthirdUl");
        });
    }
    window.initPopupLayer = initPopupLayer;
})();
