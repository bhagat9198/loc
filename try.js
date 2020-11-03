alert('try')
$(".menu > ul > li").hover(function (e) {
  alert(1)
  if ($(window).width() > 943) {
    $(this).children("ul").stop(true, false).fadeToggle(150);
    e.preventDefault();
  }
});
$(".menu > ul > li").click(function () {
  alert(2)
  if ($(window).width() <= 943) {
    $(this).children("ul").fadeToggle(150);
  }
});
$(".menu-mobile").click(function (e) {
  $(".menu > ul").toggleClass('show-on-mobile');
  e.preventDefault();
});

$(window).resize(function () {
$(".menu > ul > li").children("ul").hide();
$(".menu > ul").removeClass('show-on-mobile');
});

function shownavigation() {
$('.drobt0').removeClass('colapse');
}

function hidenavigation() {
$('.drobt0').addClass('colapse');
}