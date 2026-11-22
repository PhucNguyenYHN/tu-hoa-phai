/* Thư viện lịch dùng chung: âm lịch Việt Nam (múi giờ +7), can chi, tiết khí, trực, 28 tú, hoàng đạo.
   Âm lịch: thuật toán Hồ Ngọc Đức. Chạy trong trình duyệt, không gọi máy chủ. */
(function(g){
"use strict";
var CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
var CHI=["Tí","Sửu","Dần","Mão","Thìn","Tị","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
var CON=["Chuột","Trâu","Hổ","Mèo","Rồng","Rắn","Ngựa","Dê","Khỉ","Gà","Chó","Lợn"];
function mod(x,n){n=n||12;return ((x%n)+n)%n}

function jdFrom(dd,mm,yy){var a=Math.floor((14-mm)/12),y=yy+4800-a,m=mm+12*a-3;
  var jd=dd+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;
  if(jd<2299161)jd=dd+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-32083;return jd}
function jdToDate(jd){var a,b,c,d,e,m,day,mon,yr;
  if(jd>2299160){a=jd+32044;b=Math.floor((4*a+3)/146097);c=a-Math.floor(b*146097/4)}
  else{b=0;c=jd+32082}
  d=Math.floor((4*c+3)/1461);e=c-Math.floor(1461*d/4);m=Math.floor((5*e+2)/153);
  day=e-Math.floor((153*m+2)/5)+1;mon=m+3-12*Math.floor(m/10);yr=b*100+d-4800+Math.floor(m/10);
  return {d:day,m:mon,y:yr}}
function newMoon(k){var T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180,S=Math.sin;
  var J=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;
  J+=0.00033*S((166.56+132.87*T-0.009173*T2)*dr);
  var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3,
      Mp=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3,
      F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;
  var C=(0.1734-0.000393*T)*S(M*dr)+0.0021*S(2*dr*M);
  C-=0.4068*S(Mp*dr)+(-0.0161*S(dr*2*Mp));C-=0.0004*S(dr*3*Mp);
  C+=0.0104*S(dr*2*F)-0.0051*S(dr*(M+Mp));C-=0.0074*S(dr*(M-Mp))+0.0004*S(dr*(2*F+M));
  C-=0.0004*S(dr*(2*F-M))-0.0006*S(dr*(2*F+Mp));C+=0.0010*S(dr*(2*F-Mp))+0.0005*S(dr*(2*Mp+M));
  var dt=-0.000278+0.000265*T+0.000262*T2;return J+C-dt}
function nmDay(k,tz){return Math.floor(newMoon(k)+0.5+tz/24)}
/* kinh độ mặt trời (độ) tại 0h địa phương của ngày jdn */
function sunDeg(jdn,tz){var T=(jdn-2451545.5-tz/24)/36525,T2=T*T,dr=Math.PI/180;
  var M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2,L0=280.46645+36000.76983*T+0.0003032*T2;
  var DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.000290*Math.sin(dr*3*M);
  var L=(L0+DL)*dr;L=L-Math.PI*2*Math.floor(L/(Math.PI*2));return L/dr}
function sunLong(jdn,tz){return Math.floor(sunDeg(jdn,tz)/30)}
function lunarM11(yy,tz){var off=jdFrom(31,12,yy)-2415021,k=Math.floor(off/29.530588853),nm=nmDay(k,tz);
  if(sunLong(nm,tz)>=9)nm=nmDay(k-1,tz);return nm}
function leapOff(a11,tz){var k=Math.floor((a11-2415021.076998695)/29.530588853+0.5),i=1,arc=sunLong(nmDay(k+i,tz),tz),last;
  do{last=arc;i++;arc=sunLong(nmDay(k+i,tz),tz)}while(arc!==last&&i<14);return i-1}
function toLunar(dd,mm,yy){var tz=7,dn=jdFrom(dd,mm,yy),k=Math.floor((dn-2415021.076998695)/29.530588853),ms=nmDay(k+1,tz);
  if(ms>dn)ms=nmDay(k,tz);
  var a11=lunarM11(yy,tz),b11=a11,ly;
  if(a11>=ms){ly=yy;a11=lunarM11(yy-1,tz)}else{ly=yy+1;b11=lunarM11(yy+1,tz)}
  var ld=dn-ms+1,diff=Math.floor((ms-a11)/29),leap=0,lm=diff+11;
  if(b11-a11>365){var lo=leapOff(a11,tz);if(diff>=lo){lm=diff+10;if(diff===lo)leap=1}}
  if(lm>12)lm-=12;if(lm>=11&&diff<4)ly-=1;
  return {d:ld,m:lm,y:ly,leap:leap,start:ms}}
/* âm → dương: quét các ngày từ 1/1 năm âm đến 1/3 năm sau; trả null nếu không có (vd tháng nhuận không tồn tại) */
function toSolar(ld,lm,ly,leap){
  var a=jdFrom(1,1,ly),b=jdFrom(1,3,ly+1);
  for(var jd=a+ (lm>2?20:0);jd<=b;jd++){var s=jdToDate(jd),l=toLunar(s.d,s.m,s.y);
    if(l.d===ld&&l.m===lm&&l.y===ly&&(l.leap?1:0)===(leap?1:0))return s}
  return null}
function monthLen(lunar){ // số ngày của tháng âm chứa ngày này
  var ms=lunar.start,k0=Math.floor((ms-2415021.076998695)/29.530588853+0.5),k=k0;
  for(var i=-1;i<=1;i++)if(nmDay(k0+i,7)===ms)k=k0+i;
  return nmDay(k+1,7)-ms}

/* ----- bảng ----- */
var NAPAM=["Hải trung kim","Lư trung hỏa","Đại lâm mộc","Lộ bàng thổ","Kiếm phong kim","Sơn đầu hỏa","Giản hạ thủy","Thành đầu thổ","Bạch lạp kim","Dương liễu mộc","Tuyền trung thủy","Ốc thượng thổ","Tích lịch hỏa","Tùng bách mộc","Trường lưu thủy","Sa trung kim","Sơn hạ hỏa","Bình địa mộc","Bích thượng thổ","Kim bạch kim","Phú đăng hỏa","Thiên hà thủy","Đại dịch thổ","Thoa xuyến kim","Tang đố mộc","Đại khê thủy","Sa trung thổ","Thiên thượng hỏa","Thạch lựu mộc","Đại hải thủy"];
var TRUC=["Kiến","Trừ","Mãn","Bình","Định","Chấp","Phá","Nguy","Thành","Thu","Khai","Bế"];
var TU=["Giác","Cang","Đê","Phòng","Tâm","Vĩ","Cơ","Đẩu","Ngưu","Nữ","Hư","Nguy","Thất","Bích","Khuê","Lâu","Vị","Mão","Tất","Chủy","Sâm","Tỉnh","Quỷ","Liễu","Tinh","Trương","Dực","Chẩn"];
var TU_OFF=mod(9-jdFrom(21,11,2026),28); // 21/11/2026 là sao Nữ (đối chiếu lịch vạn niên); Nữ ứng thứ Bảy
var THAN=["Thanh Long","Minh Đường","Thiên Hình","Chu Tước","Kim Quỹ","Bảo Quang","Bạch Hổ","Ngọc Đường","Thiên Lao","Huyền Vũ","Tư Mệnh","Câu Trận"];
var HOANG={0:1,1:1,4:1,5:1,7:1,10:1};
var THAN_START={1:0,7:0,2:2,8:2,3:4,9:4,4:6,10:6,5:8,11:8,6:10,12:10}; // tháng âm → chi khởi Thanh Long (Tí=0)
THAN_START={1:0,7:0,2:2,8:2,3:4,9:4,4:6,10:6,5:8,11:8,6:10,12:10};
var GIO_HD={0:[0,1,3,6,8,9],6:[0,1,3,6,8,9],1:[2,3,5,8,10,11],7:[2,3,5,8,10,11],2:[0,1,4,5,7,10],8:[0,1,4,5,7,10],3:[0,2,3,6,7,9],9:[0,2,3,6,7,9],4:[2,4,5,8,9,11],10:[2,4,5,8,9,11],5:[1,4,6,7,10,11],11:[1,4,6,7,10,11]};
var TIETKHI=["Xuân phân","Thanh minh","Cốc vũ","Lập hạ","Tiểu mãn","Mang chủng","Hạ chí","Tiểu thử","Đại thử","Lập thu","Xử thử","Bạch lộ","Thu phân","Hàn lộ","Sương giáng","Lập đông","Tiểu tuyết","Đại tuyết","Đông chí","Tiểu hàn","Đại hàn","Lập xuân","Vũ thủy","Kinh trập"];
var THU=["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
var LUC_HOP={0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
var NGUHANH={Giáp:"Mộc",Ất:"Mộc",Bính:"Hỏa",Đinh:"Hỏa",Mậu:"Thổ",Kỷ:"Thổ",Canh:"Kim",Tân:"Kim",Nhâm:"Thủy",Quý:"Thủy"};

function termIdx(jdn){return Math.floor(sunDeg(jdn+1,7)/15)} // tiết khí đang chạy vào cuối ngày
function monthChiTiet(jdn){var k=termIdx(jdn);return (2+Math.floor((k+3)/2))%12}
function canChiNgay(jd){return {can:mod(jd+9,10),chi:mod(jd+1)}}
function canThang(yearCan,lm){ // ngũ hổ độn: tháng Giêng (Dần) của năm Giáp/Kỷ là Bính...
  var start={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}[yearCan];return mod(start+lm-1,10)}

function dayInfo(dd,mm,yy){
  var jd=jdFrom(dd,mm,yy),L=toLunar(dd,mm,yy),cc=canChiNgay(jd),yc=mod(L.y+6,10),yi=mod(L.y+8);
  var mcan=canThang(yc,L.m),mchi=mod(2+L.m-1);
  var k=termIdx(jd),kPrev=termIdx(jd-1),tchi=monthChiTiet(jd);
  var seq=0;for(var n=0;n<60;n++)if(n%10===cc.can&&n%12===cc.chi)seq=n;
  var tIdx=mod(cc.chi-tchi),than=mod(cc.chi-THAN_START[L.m]),
      tu=mod(jd+TU_OFF,28),wd=mod(jd+1,7);
  var gio=[];for(var i=0;i<12;i++)gio.push(GIO_HD[cc.chi].indexOf(i)>=0);
  return {jd:jd,d:dd,m:mm,y:yy,wd:wd,thu:THU[wd],lunar:L,monthLen:monthLen(L),
    canNgay:CAN[cc.can],chiNgay:CHI[cc.chi],chiIdx:cc.chi,
    canThang:CAN[mcan],chiThang:CHI[mchi],canNam:CAN[yc],chiNam:CHI[yi],
    napAm:NAPAM[Math.floor(seq/2)],nguHanh:NGUHANH[CAN[cc.can]],
    truc:TRUC[tIdx],tu:TU[tu],than:THAN[than],hoangDao:!!HOANG[than],
    tietKhi:TIETKHI[k],tietBatDau:k!==kPrev?TIETKHI[k]:null,
    xung:CHI[mod(cc.chi+6)],gio:gio,
    mung1:L.d===1,ram:L.d===15};
}
g.Lich={CAN:CAN,CHI:CHI,CON:CON,THU:THU,TRUC:TRUC,TU:TU,THAN:THAN,TIETKHI:TIETKHI,NAPAM:NAPAM,LUC_HOP:LUC_HOP,
  jdFrom:jdFrom,jdToDate:jdToDate,toLunar:toLunar,toSolar:toSolar,dayInfo:dayInfo,mod:mod,termIdx:termIdx,sunDeg:sunDeg};
})(typeof window!=="undefined"?window:globalThis);
