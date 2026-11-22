/* Khung chung: thanh ngày hôm nay, thanh điều hướng, chân trang. Dùng: <body data-active="lich"> + <script src="../js/site.js"> */
(function(){
"use strict";
var me=document.currentScript,src=me&&me.src||"",base=src.replace(/js\/site\.js.*$/,"");
var NAV=[["trang-chu/","Trang chủ","home"],["la-so/","Lá số","laso"],["lich/","Lịch vạn niên","lich"],["tuoi/","Xem tuổi","tuoi"],["han-nam/","Hạn năm","hannam"],["chon-ngay/","Chọn ngày","chonngay"],["gio-sinh/","Giờ sinh","giosinh"],["tien-ich/","Tiện ích","tienich"],["thu-vien/","Thư viện","thuvien"],["","Đọc sách","sach"]];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function mount(){
  var act=document.body.getAttribute("data-active")||"";
  var top=document.createElement("div");top.className="tv-top";top.innerHTML='<div class="in" id="tvtoday">Tứ Hóa phái · tra cứu theo sách</div>';
  var head=document.createElement("header");head.className="tv-head";
  head.innerHTML='<div class="in"><a class="tv-logo" href="'+base+'trang-chu/"><span class="tv-mark">四化</span><span class="tv-name">Tứ Hóa<small>Tử Vi Đẩu Số</small></span></a><nav class="tv-nav" aria-label="Điều hướng">'+
    NAV.map(function(n){return '<a href="'+base+n[0]+'"'+(n[2]===act?' class="on" aria-current="page"':'')+'>'+n[1]+'</a>'}).join("")+'</nav></div>';
  document.body.insertBefore(head,document.body.firstChild);document.body.insertBefore(top,head);
  var f=document.createElement("footer");f.className="tv-foot";
  f.innerHTML='<div class="in"><div>'+NAV.map(function(n){return '<a href="'+base+n[0]+'">'+n[1]+'</a>'}).join("")+'</div><div>Nội dung luận giải lấy từ bộ sách Trung Châu Tử Vi Đẩu Số (Tứ Hóa phái), chữ là bản OCR đã sửa lỗi nên còn chỗ sai; mỗi đoạn kèm số trang để đối chiếu. Lá số và lịch được tính ngay trên máy bạn, không gửi dữ liệu đi đâu. Chỉ để tham khảo, không phải lời phán định; việc lớn nên bàn với gia đình và người có chuyên môn.</div></div>';
  document.body.appendChild(f);
  try{var mf=document.createElement("link");mf.rel="manifest";mf.href=base+"manifest.webmanifest";document.head.appendChild(mf);
    var ic=document.createElement("link");ic.rel="icon";ic.href=base+"icon.svg";document.head.appendChild(ic);var ap=document.createElement("link");ap.rel="apple-touch-icon";ap.href=base+"icon-180.png";document.head.appendChild(ap);
    if("serviceWorker" in navigator&&location.protocol==="https:"||location.hostname==="localhost")navigator.serviceWorker.register(base+"sw.js",{scope:base}).catch(function(){})}catch(e){}
  function today(){
    if(!window.Lich)return;var t=new Date(),i=Lich.dayInfo(t.getDate(),t.getMonth()+1,t.getFullYear());
    var el=document.getElementById("tvtoday");
    el.innerHTML='<span>Hôm nay <b>'+i.thu+', '+("0"+i.d).slice(-2)+'/'+("0"+i.m).slice(-2)+'/'+i.y+'</b></span><span>Âm lịch <b>'+i.lunar.d+'/'+i.lunar.m+', '+i.canNam+' '+i.chiNam+'</b></span><span><span class="tv-dot" style="background:'+(i.hoangDao?'var(--grn)':'var(--red)')+'"></span>'+(i.hoangDao?'Ngày hoàng đạo':'Ngày hắc đạo')+'</span>';
  }
  if(window.Lich)today();else{var s=document.createElement("script");s.src=base+"js/lich.js";s.onload=today;document.head.appendChild(s)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();
