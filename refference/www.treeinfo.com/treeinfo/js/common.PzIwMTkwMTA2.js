function OpenWindow(width, height, url, scroll)
{
    var style, url;

    var tpos = (screen.height)?(screen.height-height-80)/2:100;
    var lpos = (screen.width)?(screen.width-width)/2:100;
    style = "resizable=no, menubar=no, scrollbars="+scroll+", toolbar=no, location=no, directories=no, status=no, width="+width+", height="+height+", top="+tpos+", left="+lpos;
    window.open(url, "", style);
    
    return false;
}

function OpenFindAddress(kind) {
    //OpenWindow("600", "550", "../common/findaddress2.aspx?strKind=" + kind + "", "no");
    //OpenWindow("520", "320", "../common/findaddress.aspx?strKind=" + strKind + "", "no");
    
    daum.postcode.load(function () {        
        new daum.Postcode({
            oncomplete: function (data) {
                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                var fullAddr = ''; // 최종 주소 변수
                var extraAddr = ''; // 조합형 주소 변수

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    fullAddr = data.roadAddress;

                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    fullAddr = data.jibunAddress;
                }

                // 사용자가 선택한 주소가 도로명 타입일때 조합한다.
                if (data.userSelectedType === 'R') {
                    //법정동명이 있을 경우 추가한다.
                    if (data.bname !== '') {
                        extraAddr += data.bname;
                    }
                    // 건물명이 있을 경우 추가한다.
                    if (data.buildingName !== '') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
                    fullAddr += (extraAddr !== '' ? ' (' + extraAddr + ')' : '');
                }

                // 우편번호와 주소 정보를 해당 필드에 넣는다.
                //document.getElementById('tbox_addr_post').value = data.zonecode; //5자리 새우편번호 사용
                //document.getElementById('tbox_addr_dong').value = jQuery.trim(fullAddr.replace(data.sido, "").replace(data.sigungu, ""));
                //document.getElementById('tbox_addr_si').value = data.sido;
                //document.getElementById('tbox_addr_gu').value = data.sigungu;

                SetDisplayAddress(data.zonecode, data.sido, data.sigungu, "", "", kind, jQuery.trim(fullAddr.replace(data.sido, "").replace(data.sigungu, "")));

                //data.sido
                //data.sigungu

                // 커서를 상세주소 필드로 이동한다.
                //document.getElementById('sample6_address2').focus();
            }
        }).open();
    });

    return false;
}

function ShowProductBigImage(strUrl) {
    OpenWindow(666, 560, strUrl, "no");
    return false;
}    

function EnterSearch() {
    if (event.srcElement.keyCode == 13) {
        Search();
    }
}


function ChangeTodayItemDetail(strSiteRoot, strGrpKey, strAppKey, strFolKey, strProdcode, strQuantity)
{
    var strUrl = "";
    
    strUrl = strSiteRoot+"/mall_product/sub_detail.aspx";
    strUrl += "?strGrpKey="+strGrpKey;
    strUrl += "&strAppKey="+strAppKey;
    strUrl += "&strFolKey="+strFolKey;
    strUrl += "&strProdCode="+strProdcode;
    strUrl += "&strQuantity="+strQuantity;
    
    location.href = strUrl;
}


function strLowerCase(strValue)
{
    var str = strValue;
    var chr = '';
    var tempstr = "";

    for(i=0; i<str.length; i++)
    {
        chr = str.charAt(i).toLowerCase() //문자를 순차적으로 접근하면서 무조건 소문자로 변환
        tempstr += chr; //변환된 문자를 순차적으로 활당
    }
    
    return tempstr
 }

 function checkScript(strValue)
 {
   
    var strTemp = strLowerCase(strValue);
    
    if(strTemp.indexOf("<script") > -1)
    {
	    return false;
    }
	
    return true;
 }


function InjectionFilter(strValue)
{
    var strEtcWord = strLowerCase("<script,',`,“,/,\\,:,;,<,>,UNION,SELECT,DELETE,INSERT,UPDATE,DROP,CREATE");
    
    var strTemp = strEtcWord.split(',');

    for(var i=0; i<strTemp.length; i++)
    {
        if(strValue.indexOf(strTemp[i]) > -1)
            return false;
    }
    
    for(var i=0; i<strTemp.length; i++)
    {
        if(strValue.indexOf(escape(strTemp[i])) > -1)
            return false;
    }
    
    return true;
    
    //서버쪽공통코드에 같은 코드 삽입
}


function setCookie(name, value, expiredays) {
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays);
    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

function getCookie(name) {
    var nameOfCookie = name + "=";
    var x = 0;
    while (x <= document.cookie.length) {
        var y = (x + nameOfCookie.length);
        if (document.cookie.substring(x, y) == nameOfCookie) {
            if ((endOfCookie = document.cookie.indexOf(";", y)) == -1)
                endOfCookie = document.cookie.length;
            return unescape(document.cookie.substring(y, endOfCookie));
        }

        x = document.cookie.indexOf(" ", x) + 1;

        if (x == 0) break;
    }
    return "";
}

function MainProductLink(){

    //../mall_product/sub_detail.aspx?strProdCode=022720083513011155&strGrpKey=2&strAppKey=27&strFolKey=7&strListType=1
    var strUrl = "../mall_product/sub_detail.aspx?";
    var strPageNum = "1";
    var strPageSize = "10";
    var strListType = "1";

    var objEle = event.srcElement;

    if (!objEle.strProdCode) {
        alert("등록된 상품이 없습니다.");
        return;
     }
    
    
    strUrl = strUrl + "strProdCode=" + objEle.strProdCode + "&strGrpKey=" + objEle.strGrpKey + "&strAppKey=" + objEle.strAppKey + "&strFolKey=" + objEle.strFolKey + "&strListType=1";
    
    location.href = strUrl;
}


function OpenCalender(ctl, root) {
    
    var d = document.getElementById("div_calender")
    var f = document.getElementById("frm_calender")
    var o = document.getElementById(ctl);

    var stop = event.clientY - event.offsetY + document.documentElement.scrollTop + o.clientHeight - 4;
    var sright = event.clientX - event.offsetX + document.documentElement.scrollLeft - o.clientWidth;

    d.style.display = "block";
    d.style.position = "absolute";
    d.style.top = stop;
    d.style.left = sright;
    d.style.width = "150";
    d.style.height = "177";

    f.src = root + "/admin/common/cm_calender.aspx?strCtlId=" + ctl;
    f.style.width = "100%";
    f.style.height = "100%";

    ResizeDocument();
}

function OpenCalenderDual(ctl, root) {
    var d = document.getElementById("calender_dual")
    var f = document.getElementById("frm_calender")
    var o = document.getElementById(ctl + "2");

    var stop = event.clientY - event.offsetY;
    var sright = event.clientX - event.offsetX + document.body.scrollLeft - 80;

    d.style.display = "block";
    d.style.position = "absolute";
    d.style.top = stop;
    d.style.left = sright;
    d.style.width = "305";
    d.style.height = "177";

    f.src = root + "/mall_admin/common/cm_calenderdual.aspx?strCtlId=" + ctl;
    f.style.width = "100%";
    f.style.height = "100%";

    return false;
}

function HideCalender() {
    document.getElementById("div_calender").style.display = "none";
}



function GoProductList() {
    var strPageNum = QueryString("strPageNum");
    var strPageSize = QueryString("strPageSize");
    var categorykey = QueryString("categorykey");
    var strGrpName = QueryString("strGrpName");
    var strProdType = QueryString("strProdType");
    var lc = QueryString("lc");

    var strPage = "";

    if (strProdType == "group") {
        strPage = "../product/cooperative.aspx?";
    }
    else {
        strPage = "../product/list.aspx?";
    }

    location.href = strPage +
                    "strPageNum=" + strPageNum +
                    "&strPageSize=" + strPageSize +
                    "&categorykey=" + categorykey +
                    "&strGrpName=" + strGrpName +
                    "&strProdType=" + strProdType +
                    "&lc=" + lc;
}

function OnlyNumber() {
    var nKey = event.keyCode;

    if (event.ctrlKey) {
        if (nKey == 65 || nKey == 67 || nKey == 82 ||
		nKey == 86 || nKey == 88 || nKey == 90)
            event.returnValue = true;
        else
            event.returnValue = false;
    }
    else {
        if ((nKey >= 48 && nKey <= 57) ||
		(nKey >= 96 && nKey <= 105) ||
		(nKey >= 33 && nKey <= 40) ||
		 nKey == 8 || nKey == 9 || nKey == 27 || nKey == 43 ||
		 nKey == 45 || nKey == 46 || nKey == 107 || nKey == 109
	 )
            event.returnValue = true;
        else
            event.returnValue = false;
    }
}

function Jumin1() {

    OnlyNumber();
}

function moveNext() {

    if (document.getElementById("tbox_ssn1").value.length == 6)
        document.getElementById("tbox_ssn2").focus();
}

function OpenCooperativeInfo() {
    OpenWindow("600", "700", "../common/ma_Popup.aspx", "no");
}

function MoveOldHomepage() {
    window.open('MoveOldHomePage.aspx');
}

function InitFlashMenu(strSiteRoot) {

    var objFrm = document.getElementById("frm_flashmenu");
    var objTable1 = document.getElementById("tbl_preload");
    var objTable2 = document.getElementById("tbl_frame");

    if (objFrm && objTable1 && objTable2) {
        objFrm.src = strSiteRoot + "/mall_main/main_flash.htm";

        objTable1.style.display = "none";
        objTable2.style.display = "block";
    }
}

function initallmenu(strFrom) {

    var objTr = document.getElementById("tr_allmenu");

    var strUrl = location.href;

    if (strUrl.indexOf("diction_main.aspx") > -1 ||
        strUrl.indexOf("order_quick.aspx") > -1 ||
        strUrl.indexOf("order_joint.aspx") > -1 ||
        strUrl.indexOf("info_main.aspx") > -1 ||
        strUrl.indexOf("customer_main.aspx") > -1) {

        objTr.style.display = "none";

        return;
    }
    else if (strUrl.indexOf("sub_list_01.aspx") > -1) {
    
        objTr.style.display = "block";
        return;
    }

    if (strFrom != "main") {
        if (objTr) {
            if (getCookie("isExpand") == "") {
                setCookie("isExpand", "0", 30);
                objTr.style.display = "none";
            }
            else {
                if (getCookie("isExpand") == "0") {
                    objTr.style.display = "none";
                }
                else {
                    objTr.style.display = "block";
                }
            }
        }
    }
}


function viewhideallmenu() {

    var objTr = document.getElementById("menu3_tr_allmenu");

    if (objTr != null) {
        if (objTr.style.display == "none") {
            objTr.style.display = "block";
            setCookie("isExpand", "1", 30);
        }
        else {
            objTr.style.display = "none";
            setCookie("isExpand", "0", 30);
        }
    }

    else {
        objTr = document.getElementById("menu1_tr_allmenu");

        if (objTr.style.display == "none") {
            objTr.style.display = "block";
            setCookie("isExpand", "1", 30);
        }
        else {
            objTr.style.display = "none";
            setCookie("isExpand", "0", 30);
        }
    }
/*
    objTr.style.display = "block";
    setCookie("isExpand", "1", 30);
*/
}

function goNavigationPage(strPath, nMax) {
    var p = document.getElementById("tbox_gopagenum").value;

    if (p > nMax) {
        alert("이동할 페이지 번호가 최종 페이지번호를 넘었습니다.\r\n이동할 페이지를 입력하세요.");
    }
    else {

        location.href = strPath + p;
    }
}

function ResizeDocument() {
    top.document.body.scrollTop = 0;

    var nHeight = document.body.scrollHeight;

    if (parent.document.getElementById("frm_body"))
        parent.document.getElementById("frm_body").style.height = nHeight + 150;
}

function setComma(str)
{
    if (!str) {
        return "0";
    }
    else {
        return Number(String(str).replace(/\..*|[^\d]/g, "")).toLocaleString('kr').split(".")[0];
    }        
}

function NavigatorInfo(TotalCount, CurPage, PageSize, Field, String) {

    intPcnt = parseInt((TotalCount - 1) / PageSize) + 1;

    var strPath;  //링크 주소            

    var intStart = 0; //시작 페이지 주소
    var strEnd = 0; //종료 페이지 주소            

    var strPager = "";

    strPath = jQuery(location).attr('protocol') + "//" + jQuery(location).attr('host') + "" + jQuery(location).attr('pathname');

    strPager += "   <nav class='text-center' aria-label='Page Navigation'>";
    strPager += "       <ul class='list-inline'>";

    intStart = (parseInt((CurPage - 1) / 10)) * 10 + 1;

    if (intPcnt > intStart + 9)
        strEnd = intStart + 9;
    else
        strEnd = intPcnt;

    var strLink = "#!";

    var SearchLink = "";

    

    if (Field != "" && String != "") {
        SearchLink = "strKind=search&strField=" + Field + "&strString=" + String + "&";
    }

    if (parseInt((CurPage - 1) / 10) > 0) {
        strLink = strPath + "?" + SearchLink + "strPageSize=" + PageSize + "&strPageNum=" + CurPage;
    }

    var strQueryString = "";
    var queryString = "";

    if (location.href.indexOf("?") > -1) {
        strQueryString = location.href.split('?')[1];

        var queryStrings = strQueryString.split("&");

        for (var i = 0; i < queryStrings.length; i++) {
            if (queryStrings[i].split("=").length > 0)
            {
                if (queryStrings[i].split("=")[0] !== "strPageSize"
                    && queryStrings[i].split("=")[0] !== "strPageNum"
                    && queryStrings[i].split("=")[0] !== "pnum"
                    && queryStrings[i].split("=")[0] !== "psize"
                    )
                {
                    queryString += queryStrings[i] + "&";
                }
            }
        }
    }

    strLink += strLink + "&" + queryString;

    strPager += "       <li class='list-inline-item g-hidden-sm-down'>";
    strPager += "           <a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-13' href='" + strLink + "'><i class='fa fa-angle-double-left'></i></a>";
    strPager += "       </li>";

    strLink = "#!";

    if (CurPage > 1) {
        strLink = strPath + "?" + SearchLink + "strPageSize=" + PageSize + "&strPageNum=" + (parseInt(CurPage) - 1) + "&" + queryString;
    }

    strPager += "       <li class='list-inline-item'>";
    strPager += "           <a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-13' href='" + strLink + "'><i class='fa fa-angle-left'></i></a>";
    strPager += "       </li>";

    for (i = intStart; i <= strEnd; i++) {
        strLink = strPath + "?" + SearchLink + "strPageSize=" + PageSize + "&strPageNum=" + i + "&" + queryString;

        if (i == CurPage) {
            strPager += "       <li class='list-inline-item'>";
            strPager += "           <a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-11 u-pagination-v1-4--active' href='#!'>" + i + "</a>";
            strPager += "       </li>";
        }
        else {
            strPager += "       <li class='list-inline-item'>";
            strPager += "           <a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-11' href='" + strLink + "'>" + i + "</a>";
            strPager += "       </li>";
        }
    }

    strLink = "#!";

    if (CurPage < strEnd) {

        strLink = strPath + "?" + SearchLink + "strPageSize=10&strPageNum=" + (parseInt(CurPage) + 1) + "&" + queryString;;
    }

    strPager += "       <li class='list-inline-item'>";
    strPager += "			<a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-13' href='" + strLink + "'><i class='fa fa-angle-right'></i></a>";
    strPager += "       </li>";

    strLink = "#!";

    if (strEnd < intPcnt) {
        strLink = strPath + "?" + SearchLink + "strPageSize=" + PageSize + "&strPageNum=" + CurPage + "&" + queryString;;
    }

    strPager += "       <li class='list-inline-item g-hidden-sm-down'>";
    strPager += "           <a class='u-pagination-v1__item u-pagination-v1-4 g-rounded-50 g-pa-4-13' href='#!'><i class='fa fa-angle-double-right'></i></a>";
    strPager += "       </li>";

    strPager += "		</ul>";
    strPager += "	</nav>";

    $("#NavigatorInfo").html(strPager);
}

function PageInfo(TotalCount, CurPage, PageSize) {

    var s = parseFloat(TotalCount) / parseFloat(PageSize);
    var e = TotalCount / PageSize;

    var intPageCnt = 0;

    if (parseInt(s) == e)
        intPageCnt = TotalCount / PageSize;
    else
        intPageCnt = parseInt(TotalCount / PageSize) + 1;

    $("#ListInfo").html("전체 : <span class='g-color-red'>" + TotalCount + "</span> , 페이지 : <span class='g-color-red'>" + CurPage + "</span>/" + intPageCnt + " </p>");
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}