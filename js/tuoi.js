/* Xem tuổi (can chi, nạp âm, cung phi bát trạch, hợp tuổi vợ chồng) và chấm điểm ngày theo việc.
   Quy tắc lịch dân gian phổ biến; không thuộc bộ sách Tứ Hóa phái. Cần js/lich.js. */
(function(g){
"use strict";
var L=g.Lich,CAN=L.CAN,CHI=L.CHI,mod=L.mod;
var HANH=["Kim","Mộc","Thủy","Hỏa","Thổ"];
var SINH={Kim:"Thủy",Thủy:"Mộc",Mộc:"Hỏa",Hỏa:"Thổ",Thổ:"Kim"};   // X sinh Y
var KHAC={Kim:"Mộc",Mộc:"Thổ",Thổ:"Thủy",Thủy:"Hỏa",Hỏa:"Kim"};   // X khắc Y
var CUNGPHI=["","Khảm","Khôn","Chấn","Tốn","","Càn","Đoài","Cấn","Ly"];
var NHOM={Khảm:"Đông tứ mệnh",Ly:"Đông tứ mệnh",Chấn:"Đông tứ mệnh",Tốn:"Đông tứ mệnh",Càn:"Tây tứ mệnh",Khôn:"Tây tứ mệnh",Cấn:"Tây tứ mệnh",Đoài:"Tây tứ mệnh"};
var HUONG={ // Sinh khí, Thiên y, Diên niên, Phục vị
  Khảm:["Đông Nam","Đông","Nam","Bắc"],Ly:["Đông","Đông Nam","Bắc","Nam"],Chấn:["Nam","Bắc","Đông Nam","Đông"],Tốn:["Bắc","Nam","Đông","Đông Nam"],
  Càn:["Tây","Đông Bắc","Tây Nam","Tây Bắc"],Khôn:["Đông Bắc","Tây","Tây Bắc","Tây Nam"],Cấn:["Tây Nam","Tây Bắc","Tây","Đông Bắc"],Đoài:["Tây Bắc","Tây Nam","Đông Bắc","Tây"]};
var HUONG_TEN=["Sinh khí","Thiên y","Diên niên","Phục vị"];
var CAN_HOP={0:5,5:0,1:6,6:1,2:7,7:2,3:8,8:3,4:9,9:4};
var CAN_XUNG={0:6,6:0,1:7,7:1,2:8,8:2,3:9,9:3};
var TAM_HOP=[[8,0,4],[2,6,10],[5,9,1],[11,3,7]];
var HAI={0:7,7:0,1:6,6:1,2:5,5:2,3:4,4:3,8:11,11:8,9:10,10:9};

function napAmYear(y){var can=mod(y+6,10),chi=mod(y+8),seq=0;for(var n=0;n<60;n++)if(n%10===can&&n%12===chi)seq=n;
  var name=L.NAPAM[Math.floor(seq/2)],parts=name.split(" ");return {ten:name,hanh:parts[parts.length-1].charAt(0).toUpperCase()+parts[parts.length-1].slice(1)}}
function cungPhi(y,nam){
  var s=y%100,r=Math.floor(s/10)+s%10;while(r>9)r=Math.floor(r/10)+r%10;if(r===0)r=9;
  var c;if(nam){c=(y<2000?10:9)-r}else{c=(y<2000?5:6)+r}
  while(c<=0)c+=9;while(c>9)c-=9;
  if(c===5)c=nam?2:8;return CUNGPHI[c]}
function tuoi(y,nam){var can=mod(y+6,10),chi=mod(y+8),na=napAmYear(y),cp=cungPhi(y,nam);
  return {y:y,canIdx:can,chiIdx:chi,can:CAN[can],chi:CHI[chi],con:L.CON[chi],napAm:na.ten,hanh:na.hanh,cungPhi:cp,nhom:NHOM[cp],huong:HUONG[cp]}}
/* năm âm lịch từ ngày dương; nếu thiếu ngày/tháng thì coi y là năm âm lịch */
function lunarYear(d,m,y){if(d&&m){var t=new Date(y,m-1,d);if(t.getMonth()!==m-1||t.getDate()!==d)return null;return L.toLunar(d,m,y).y}return y}

function hanhRel(a,b){ // a: chồng, b: vợ
  if(a===b)return {k:2,t:"Cùng hành "+a+": bình hòa, hiểu nhau."};
  if(SINH[a]===b)return {k:3,t:a+" sinh "+b+": chồng nâng đỡ vợ, hợp."};
  if(SINH[b]===a)return {k:3,t:b+" sinh "+a+": vợ nâng đỡ chồng, hợp."};
  if(KHAC[a]===b)return {k:0,t:a+" khắc "+b+": chồng lấn vợ, nên nhường nhịn."};
  if(KHAC[b]===a)return {k:0,t:b+" khắc "+a+": vợ lấn chồng, nên nhường nhịn."};
  return {k:1,t:"Không sinh không khắc."}}
function canRel(a,b){
  if(CAN_HOP[a]===b)return {k:3,t:CAN[a]+" hợp "+CAN[b]+" (thiên can hợp)."};
  if(CAN_XUNG[a]===b)return {k:0,t:CAN[a]+" xung "+CAN[b]+" (thiên can xung)."};
  return {k:1,t:"Thiên can không hợp không xung."}}
function chiRel(a,b){
  if(a===b)return {k:1,t:"Cùng tuổi "+CHI[a]+": giống nhau nên dễ hiểu mà cũng dễ va chạm."};
  if(L.LUC_HOP[a]===b)return {k:3,t:CHI[a]+" và "+CHI[b]+" lục hợp."};
  for(var i=0;i<4;i++)if(TAM_HOP[i].indexOf(a)>=0&&TAM_HOP[i].indexOf(b)>=0)return {k:3,t:CHI[a]+" và "+CHI[b]+" tam hợp."};
  if(mod(a+6)===b)return {k:0,t:CHI[a]+" và "+CHI[b]+" lục xung."};
  if(HAI[a]===b)return {k:0,t:CHI[a]+" và "+CHI[b]+" lục hại."};
  return {k:1,t:"Địa chi không hợp không xung."}}
function phiRel(a,b){
  if(NHOM[a.cungPhi]===NHOM[b.cungPhi])return {k:3,t:"Cùng "+NHOM[a.cungPhi]+" ("+a.cungPhi+" và "+b.cungPhi+"): hợp."};
  return {k:0,t:"Khác nhóm: "+a.cungPhi+" ("+NHOM[a.cungPhi]+") và "+b.cungPhi+" ("+NHOM[b.cungPhi]+")."}}
function vochong(a,b){ // a chồng, b vợ (đã qua tuoi())
  var r=[["Thiên can",canRel(a.canIdx,b.canIdx)],["Địa chi",chiRel(a.chiIdx,b.chiIdx)],["Ngũ hành nạp âm",hanhRel(a.hanh,b.hanh)],["Cung phi bát trạch",phiRel(a,b)]];
  var s=0;r.forEach(function(x){s+=x[1].k});
  var maxS=12,pct=Math.round(s/maxS*100),v=pct>=75?"Rất hợp":pct>=58?"Khá hợp":pct>=42?"Trung bình":"Nhiều điểm cần cân nhắc";
  return {rows:r,score:s,max:maxS,pct:pct,verdict:v}}

/* ---------- chấm ngày theo việc ---------- */
var VIEC={
  cuoi:{ten:"Cưới hỏi",tot:["Thành","Khai","Mãn","Định","Kiến"],xau:["Phá","Nguy","Bế"]},
  khaitruong:{ten:"Khai trương",tot:["Thành","Khai","Mãn","Kiến","Định"],xau:["Phá","Nguy","Bế","Thu"]},
  dongtho:{ten:"Động thổ",tot:["Thành","Khai","Định","Chấp"],xau:["Phá","Nguy","Bế","Kiến"]},
  nhaptrach:{ten:"Nhập trạch",tot:["Thành","Khai","Định","Mãn"],xau:["Phá","Nguy","Bế","Thu"]},
  xuathanh:{ten:"Xuất hành",tot:["Thành","Khai","Kiến","Mãn"],xau:["Phá","Nguy","Bế","Chấp"]},
  hopdong:{ten:"Ký hợp đồng",tot:["Thành","Khai","Định","Mãn"],xau:["Phá","Nguy","Bế"]}
};
var TAM_NUONG=[3,7,13,18,22,27],NGUYET_KY=[5,14,23];
var DUONG_CONG={1:[13],2:[11],3:[9],4:[7],5:[5],6:[3],7:[8,29],8:[27],9:[25],10:[23],11:[21],12:[19]};
function chamNgay(i,viec,tuoiChi){ // i = Lich.dayInfo
  var v=VIEC[viec],pts=0,ly=[],xau=[],xungTuoi=false;
  if(i.hoangDao){pts+=2;ly.push("Ngày hoàng đạo ("+i.than+")")}else{pts-=1;xau.push("Ngày hắc đạo ("+i.than+")")}
  if(v.tot.indexOf(i.truc)>=0){pts+=2;ly.push("Trực "+i.truc+" tốt cho việc này")}
  if(v.xau.indexOf(i.truc)>=0){pts-=3;xau.push("Trực "+i.truc+" không hợp việc này")}
  var d=i.lunar.d,m=i.lunar.m;
  if(TAM_NUONG.indexOf(d)>=0){pts-=3;xau.push("Ngày Tam nương (mùng "+d+")")}
  if(NGUYET_KY.indexOf(d)>=0){pts-=3;xau.push("Ngày Nguyệt kỵ (mùng "+d+")")}
  if((DUONG_CONG[m]||[]).indexOf(d)>=0){pts-=3;xau.push("Ngày Dương công kỵ")}
  if(tuoiChi!=null){
    if(i.chiIdx===mod(tuoiChi+6)){pts-=5;xungTuoi=true;xau.push("Ngày xung tuổi "+CHI[tuoiChi]+" của bạn")}
    else if(i.chiIdx===L.LUC_HOP[tuoiChi]||i.chiIdx===mod(tuoiChi+4)||i.chiIdx===mod(tuoiChi+8)){pts+=1;ly.push("Hợp tuổi "+CHI[tuoiChi]+" của bạn")}}
  return {pts:pts,ly:ly,xau:xau,xung:xungTuoi}}
g.Tuoi={tuoi:tuoi,lunarYear:lunarYear,vochong:vochong,napAmYear:napAmYear,cungPhi:cungPhi,HUONG_TEN:HUONG_TEN,VIEC:VIEC,chamNgay:chamNgay};
})(window);
