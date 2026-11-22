/* Hạn năm theo lịch dân gian: Tam tai, Kim lâu, Hoang ốc, Cửu diệu (sao hạn), Thái Tuế; Lục diệu Khổng Minh.
   Không thuộc bộ sách Tứ Hóa phái. Cần js/lich.js. */
(function(g){
"use strict";
var L=g.Lich,CHI=L.CHI,mod=L.mod;
var TAMTAI_NHOM=[[[8,0,4],[2,3,4]],[[2,6,10],[8,9,10]],[[5,9,1],[11,0,1]],[[11,3,7],[5,6,7]]];
function tamTai(birthChi,yearChi){
  for(var i=0;i<4;i++){if(TAMTAI_NHOM[i][0].indexOf(birthChi)>=0){var y=TAMTAI_NHOM[i][1],k=y.indexOf(yearChi);return k<0?null:{nam:k+1,ten:["Tam tai năm đầu","Tam tai năm giữa","Tam tai năm cuối"][k]}}}
  return null}
function kimLau(age){var r=age%9;return {xau:[1,3,6,8].indexOf(r)>=0,ten:{1:"Kim lâu thân",3:"Kim lâu thê",6:"Kim lâu tử",8:"Kim lâu lục súc"}[r]||null}}
var HOANGOC=[["Nhất cát",1],["Nhị nghi",0],["Tam địa sát",-1],["Tứ tấn tài",1],["Ngũ thọ tử",-1],["Lục hoang ốc",-1]];
/* Hoang ốc: cộng các chữ số của tuổi mụ rồi đếm trên sáu cung (đối chiếu trang tuvivansu.com cho tuổi 34-39) */
function hoangOc(age){var s=0,a=age;while(a>0){s+=a%10;a=Math.floor(a/10)}var r=((s-1)%6)+1,h=HOANGOC[r-1];return {ten:h[0],k:h[1]}}
var SAO_NAM=["Mộc Đức","La Hầu","Thổ Tú","Thủy Diệu","Thái Bạch","Thái Dương","Vân Hán","Kế Đô","Thái Âm"];
var SAO_NU=["Thủy Diệu","Kế Đô","Vân Hán","Mộc Đức","Thái Âm","Thổ Tú","La Hầu","Thái Dương","Thái Bạch"];
var SAO_TXT={"La Hầu":[-2,"Xấu nhiều: dễ thị phi, kiện tụng, tai nạn; kỵ nhất với nam."],"Kế Đô":[-2,"Xấu nhiều: dễ bệnh, buồn phiền; kỵ nhất với nữ."],"Thái Bạch":[-1,"Xấu về tiền bạc, hao tài; cẩn thận giao dịch."],"Thổ Tú":[-1,"Xấu nhẹ: dễ trở ngại, tiểu nhân, nên giữ gìn súc vật, nhà cửa."],"Vân Hán":[-1,"Xấu nhẹ: dễ bệnh tật, thị phi nhỏ."],"Thủy Diệu":[1,"Khá: tài lộc tốt, nhưng cẩn thận sông nước."],"Thái Dương":[2,"Tốt: công việc hanh thông, nam hợp hơn nữ."],"Thái Âm":[2,"Tốt: được quý nhân, nữ hợp hơn nam."],"Mộc Đức":[2,"Tốt: vui vẻ, hôn nhân, tài lộc."]};
function cuuDieu(age,nam){var n=(nam?SAO_NAM:SAO_NU)[age%9];return {ten:n,k:SAO_TXT[n][0],t:SAO_TXT[n][1]}}
var PHA={0:9,9:0,1:4,4:1,2:11,11:2,3:6,6:3,5:8,8:5,7:10,10:7};
var HAI={0:7,7:0,1:6,6:1,2:5,5:2,3:4,4:3,8:11,11:8,9:10,10:9};
function thaiTue(bc,yc){
  var r=[];if(bc===yc)r.push({ten:"Trị Thái Tuế",k:-1,t:"Năm tuổi: nhiều biến động, nên cẩn trọng."});
  if(mod(bc+6)===yc)r.push({ten:"Xung Thái Tuế",k:-1,t:"Đối xung năm tuổi: dễ thay đổi, di chuyển."});
  if(HAI[bc]===yc)r.push({ten:"Hại Thái Tuế",k:-1,t:"Tương hại: dễ bị người khác làm phiền."});
  if(PHA[bc]===yc)r.push({ten:"Phá Thái Tuế",k:-1,t:"Tương phá: công việc dễ dở dang."});
  return r}
function nam(by,y,gt){ // by: năm sinh âm lịch, y: năm xét
  var age=y-by+1,bc=mod(by+8),yc=mod(y+8);
  return {y:y,can:L.CAN[mod(y+6,10)],chi:CHI[yc],age:age,tamTai:tamTai(bc,yc),kimLau:kimLau(age),hoangOc:hoangOc(age),sao:cuuDieu(age,gt),tue:thaiTue(bc,yc)}}
function lamNha(r){ // đủ 3 điều kiện: không Kim lâu, không Tam tai, Hoang ốc cát
  return !r.kimLau.xau&&!r.tamTai&&r.hoangOc.k>=0}
/* Lục diệu Khổng Minh (cách tính phổ biến): ngày = (tháng + ngày - 2) mod 6; giờ = (sao ngày + giờ từ Tý) mod 6 */
var LUC=[["Đại An",1,"Mọi việc tốt lành, cầu tài đi hướng Tây Nam."],["Lưu Liên",-1,"Công việc khó thành, chậm trễ, nên hoãn nếu được."],["Tốc Hỷ",1,"Tin vui đến nhanh, cầu tài đi hướng Nam."],["Xích Khẩu",-1,"Dễ cãi vã, thị phi, nên cẩn trọng lời nói."],["Tiểu Cát",1,"Hay có may mắn, cầu tài đi hướng Tây Nam."],["Không Vong",-1,"Việc dễ hỏng, mất mát, không nên khởi sự."]];
function xuatHanh(lm,ld){var s=mod(lm+ld-2,6),h=[];for(var i=0;i<12;i++){var k=mod(s+i,6);h.push({chi:CHI[i],ten:LUC[k][0],k:LUC[k][1],t:LUC[k][2]})}return {ngay:{ten:LUC[s][0],k:LUC[s][1],t:LUC[s][2]},gio:h}}
g.Han={tamTai:tamTai,kimLau:kimLau,hoangOc:hoangOc,cuuDieu:cuuDieu,thaiTue:thaiTue,nam:nam,lamNha:lamNha,xuatHanh:xuatHanh};
})(window);
