alert('Hello World');
var links = [];
$("a").each(function() {
  var l = {};
  l.link = this.href;
  l.text = this.innerHTML;
  console.log(l);
  links.push(l);
});



