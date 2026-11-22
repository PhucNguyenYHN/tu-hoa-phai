/* Chấm ngày theo việc (quy tắc lịch dân gian, tham khảo; không thuộc sách Tứ Hóa phái). Cần js/lich.js.
   Nguồn bảng: Ngọc Hạp Thông Thư (Thọ tử, Sát chủ dương, Nhị thập bát tú), Nguyệt đức, Thiên đức, Tứ ly, Tứ tuyệt, Tam nương, Nguyệt kỵ, Dương công kỵ. */
(function(g){
"use strict";
var L=g.Lich,CHI=L.CHI,mod=L.mod;
function ci(c){return CHI.indexOf(c)}
var VIEC={
  cuoi:{ten:"Cưới hỏi",mo:"ăn hỏi, rước dâu",tot:["Thành","Khai","Mãn","Định","Kiến"],xau:["Phá","Nguy","Bế"],tuTot:["Giác","Phòng","Vĩ","Thất","Bích","Lâu","Tất","Trương","Chẩn"],tuHung:{}},
  dongtho:{ten:"Động thổ",mo:"khởi công, đổ móng",tot:["Trừ","Bình","Định","Chấp","Thành","Thu","Khai"],xau:["Mãn","Phá","Nguy","Bế"],tuTot:["Phòng","Vĩ","Cơ","Đẩu","Thất","Bích","Khuê","Lâu","Sâm","Chẩn"],tuHung:{"Đê":1,"Tâm":1,"Ngưu":1}},
  nhaptrach:{ten:"Nhập trạch",mo:"về nhà mới",tot:["Trừ","Định","Chấp","Thành","Khai","Mãn"],xau:["Phá","Nguy","Bế","Thu"],tuTot:["Phòng","Vĩ","Cơ","Đẩu","Thất","Bích","Khuê","Lâu","Sâm","Chẩn"],tuHung:{"Đê":1}},
  khaitruong:{ten:"Khai trương",mo:"mở cửa hàng",tot:["Thành","Khai","Mãn","Kiến","Định"],xau:["Phá","Nguy","Bế","Thu"],tuTot:["Phòng","Vĩ","Cơ","Tất","Trương","Thất"],tuHung:{"Hư":1,"Cang":1}},
  xuathanh:{ten:"Xuất hành",mo:"đi xa, công tác",tot:["Thành","Khai","Kiến","Mãn"],xau:["Phá","Nguy","Bế","Chấp"],tuTot:["Giác","Phòng","Vĩ","Tỉnh","Trương","Chẩn"],tuHung:{"Mão":1,"Dực":1,"Nguy":1}},
  hopdong:{ten:"Ký hợp đồng",mo:"ký kết, giao dịch",tot:["Thành","Khai","Định","Mãn","Thu"],xau:["Phá","Nguy","Bế"],tuTot:["Phòng","Vĩ","Cơ","Tất","Trương","Thất"],tuHung:{}}
};
var TU_CAT=["Giác","Phòng","Vĩ","Cơ","Đẩu","Thất","Bích","Lâu","Vị","Tất","Tỉnh","Trương","Chẩn"],TU_TB=["Khuê","Sâm"];
var TAM_NUONG=[3,7,13,18,22,27],NGUYET_KY=[5,14,23];
var DUONG_CONG={1:[13],2:[11],3:[9],4:[7],5:[5],6:[3],7:[8,29],8:[27],9:[25],10:[23],11:[21],12:[19]};
var THO_TU={1:"Tuất",2:"Thìn",3:"Hợi",4:"Tị",5:"Tí",6:"Ngọ",7:"Sửu",8:"Mùi",9:"Dần",10:"Thân",11:"Mão",12:"Dậu"};
var SAT_CHU={1:"Tí",2:"Sửu",3:"Sửu",4:"Tuất",5:"Thìn",6:"Thìn",7:"Sửu",8:"Thìn",9:"Sửu",10:"Thìn",11:"Mùi",12:"Thìn"};
var NGUYET_DUC={2:"Bính",6:"Bính",10:"Bính",11:"Giáp",3:"Giáp",7:"Giáp",8:"Nhâm",0:"Nhâm",4:"Nhâm",5:"Canh",9:"Canh",1:"Canh"}; // theo chi tháng tiết (Tí=0)
var THIEN_DUC={2:["can","Đinh"],3:["chi","Thân"],4:["can","Nhâm"],5:["can","Tân"],6:["chi","Hợi"],7:["can","Giáp"],8:["can","Quý"],9:["chi","Dần"],10:["can","Bính"],11:["can","Ất"],0:["chi","Tị"],1:["can","Canh"]};
var TU_LY=["Xuân phân","Hạ chí","Thu phân","Đông chí"],TU_TUYET=["Lập xuân","Lập hạ","Lập thu","Lập đông"];
function next(i){var s=L.jdToDate(i.jd+1);return L.dayInfo(s.d,s.m,s.y)}
function tinh(i){return mod(i.chiIdx-L.TRUC.indexOf(i.truc))} // chi tháng theo tiết khí
function grade(p,heavy,xung){
  if(xung||p<45)return {k:"tranh",t:"Nên tránh"};
  if(heavy&&p>=45)return {k:"tb",t:"Bình thường"};
  if(p>=85)return {k:"dai",t:"Đại cát"};
  if(p>=70)return {k:"tot",t:"Tốt"};
  return {k:"tb",t:"Bình thường"}}
/* i = Lich.dayInfo; viec = khóa; chis = mảng chi tuổi (0-11) những người liên quan */
function cham(i,viec,chis){
  var v=VIEC[viec],sc=50,cong=[],tru=[],heavy=false,xung=false,L1=i.lunar,tc=tinh(i);
  function P(n,t){sc+=n;cong.push([n,t])}
  function M(n,t,h){sc-=n;tru.push([-n,t]);if(h)heavy=true}
  if(i.hoangDao)P(15,"Ngày hoàng đạo ("+i.than+")");else M(15,"Ngày hắc đạo ("+i.than+")");
  if(i.truc==="Phá"){M(25,"Trực Phá, tức ngày xung với tháng (Nguyệt phá)",true)}
  else if(v.tot.indexOf(i.truc)>=0)P(15,"Trực "+i.truc+" hợp việc "+v.ten.toLowerCase());
  else if(v.xau.indexOf(i.truc)>=0)M(18,"Trực "+i.truc+" kỵ việc "+v.ten.toLowerCase());
  var tu=i.tu;
  if(v.tuHung[tu])M(10,"Sao "+tu+" (28 tú) kiêng việc "+v.ten.toLowerCase());
  else if(v.tuTot.indexOf(tu)>=0)P(8,"Sao "+tu+" (28 tú) hợp việc "+v.ten.toLowerCase());
  else if(TU_CAT.indexOf(tu)>=0)P(3,"Sao "+tu+" (28 tú) là cát tinh");
  else if(TU_TB.indexOf(tu)<0&&!v.tuHung[tu])M(6,"Sao "+tu+" (28 tú) là hung tinh");
  var nd=NGUYET_DUC[tc];if(nd===i.canNgay)P(10,"Có Nguyệt đức (ngày "+nd+" của tháng này)");
  var td=THIEN_DUC[tc],hasTD=false;if(td&&((td[0]==="can"&&td[1]===i.canNgay)||(td[0]==="chi"&&td[1]===i.chiNgay))){P(10,"Có Thiên đức");hasTD=true}
  var CH={"Giáp":"Kỷ","Kỷ":"Giáp","Ất":"Canh","Canh":"Ất","Bính":"Tân","Tân":"Bính","Đinh":"Nhâm","Nhâm":"Đinh","Mậu":"Quý","Quý":"Mậu"};
  if(nd&&CH[nd]===i.canNgay)P(6,"Có Nguyệt đức hợp");
  if(td&&((td[0]==="can"&&CH[td[1]]===i.canNgay)||(td[0]==="chi"&&L.LUC_HOP[ci(td[1])]===i.chiIdx))){P(6,"Có Thiên đức hợp");hasTD=true}
  if(TAM_NUONG.indexOf(L1.d)>=0)M(20,"Ngày Tam nương (mùng "+L1.d+" âm)",true);
  if(NGUYET_KY.indexOf(L1.d)>=0)M(20,"Ngày Nguyệt kỵ (mùng "+L1.d+" âm)",true);
  if((DUONG_CONG[L1.m]||[]).indexOf(L1.d)>=0)M(20,"Ngày Dương công kỵ",true);
  if(THO_TU[L1.m]===i.chiNgay)M(20,"Ngày Thọ tử (tháng "+L1.m+" kỵ ngày "+i.chiNgay+")",true);
  if(SAT_CHU[L1.m]===i.chiNgay){
    if(viec==="cuoi"||viec==="dongtho"||viec==="nhaptrach"||viec==="khaitruong")M(20,"Ngày Sát chủ dương (kỵ cưới, làm nhà, khai trương)",true);
    else M(8,"Ngày Sát chủ dương")}
  var n1=next(i);
  if(n1.tietBatDau&&TU_LY.indexOf(n1.tietBatDau)>=0&&(viec==="cuoi"||viec==="xuathanh"||viec==="nhaptrach"))M(15,"Ngày Tứ ly (trước "+n1.tietBatDau+")",true);
  if(n1.tietBatDau&&TU_TUYET.indexOf(n1.tietBatDau)>=0&&(viec==="cuoi"||viec==="xuathanh"||viec==="nhaptrach"))M(15,"Ngày Tứ tuyệt (trước "+n1.tietBatDau+")",true);
  if(viec==="dongtho"){var ncs={2:3,3:3,4:3,5:6,6:6,7:6,8:9,9:9,10:9,11:0,0:0,1:0}[tc];if(i.chiIdx===ncs)M(hasTD?3:10,"Ngày Nguyệt kiến chuyển sát (kỵ động thổ)"+(hasTD?", đã có Thiên đức chế bớt":""),!hasTD)}
  if(L1.m===7&&(viec==="cuoi"||viec==="khaitruong"||viec==="dongtho"||viec==="nhaptrach"))M(5,"Tháng Bảy âm lịch (tục kiêng nhẹ)");
  var names=[];
  (chis||[]).forEach(function(c,k){if(c==null)return;
    var who=chis.length>1?(k===0?"cô dâu":"chú rể"):"tuổi bạn";
    if(viec==="cuoi"&&chis.length>1)who=k===0?"cô dâu":"chú rể";
    var lb=(chis.length>1?"tuổi "+who+" ":"tuổi ")+CHI[c];
    if(i.chiIdx===mod(c+6)){M(30,"Ngày xung "+lb,false);xung=true}
    else if(i.chiIdx===L.LUC_HOP[c]||i.chiIdx===mod(c+4)||i.chiIdx===mod(c+8))P(6,"Hợp "+lb+" (tam hợp hoặc lục hợp)")});
  var p=Math.max(0,Math.min(100,sc)),gr=grade(p,heavy,xung);
  return {pct:Math.round(p),grade:gr,cong:cong,tru:tru,heavy:heavy,xung:xung}}
g.Ngay={VIEC:VIEC,cham:cham};
})(window);
