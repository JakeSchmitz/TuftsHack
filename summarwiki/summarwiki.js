var links = [];
$("a").each(function() {
  var l = {};
  l.link = this.href;
  l.text = this.innerHTML;
  links.push(l);
  $(this).hover(function(){
    console.log("fetching info for " + l.text + " from " + l.link);
  });
});


