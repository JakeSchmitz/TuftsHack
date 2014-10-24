var wiki_prefix = "http://en.wikipedia.org/w/api.php?action=parse&page=";
var wiki_callback = "&prop=text&section=0&format=json&callback=?";

function getWikiSummary(term){
  var query = wiki_prefix + term + wiki_callback; 
  var summary = '';
  // Got this voodoo from http://jsfiddle.net/gautamadude/HMJJg/1/
  $.getJSON(query, function(data) {
    for (text in data.parse.text) {
      var text = data.parse.text[text].split("<p>");
      var pText = "";
      for (p in text) {
            //Remove html comment
            text[p] = text[p].split("<!--");
            if (text[p].length > 1) {
                text[p][0] = text[p][0].split(/\r\n|\r|\n/);
                text[p][0] = text[p][0][0];
                text[p][0] += "</p> ";
            }
            text[p] = text[p][0];

            //Construct a string from paragraphs
            if (text[p].indexOf("</p>") == text[p].length - 5) {
                var htmlStrip = text[p].replace(/<(?:.|\n)*?>/gm, '') //Remove HTML
                var splitNewline = htmlStrip.split(/\r\n|\r|\n/); //Split on newlines
                for (newline in splitNewline) {
                    if (splitNewline[newline].substring(0, 11) != "Cite error:") {
                        pText += splitNewline[newline];
                        pText += "\n";
                    }
                }
            }
      }
      pText = pText.substring(0, pText.length - 2); //Remove extra newline
      pText = pText.replace(/\[\d+\]/g, ""); //Remove reference tags (e.x. [1], [4], etc)
      console.log(pText);
    }
  });
}

function checkIsWikiPage(term, link){
  if (link.indexOf("&") < 0) {
    return true;
  }
  return false;
}

var links = [];

$("a").each(function() {
  var l = {};
  l.link = this.href;
  l.text = this.innerHTML;
  if (checkIsWikiPage(l.text, l.link)) {
    links.push(l);
    //Add qtip
    $(this).qtip({
      content: {
        text: function(event, api) {
          $.ajax({
            url: api.elements.target.attr('href')
          })
          .then(function(content) {
            //Tooltip content on success gets set here
            api.set('content.text', getWikiSummary(l.link.split('/')[l.link.split('/').length - 1]));
          }, function(xhr, status, error) {
            $(this).href = l.link;
          }); 
          return 'Fetching info on ' + l.text + '...'; 
        }
      },
      position: {
        viewport: $(window)
      },
      style: 'qtip-wiki'
    });
    // Add hover actions
    $(this).hover(function(){
      console.log("fetching info for " + l.text + " from " + l.link);
      try {
        getWikiSummary(l.link.split('/')[l.link.split('/').length - 1]);
      } catch(err) {
        console.log(l.text + " isn't a real wiki article"); 
      }
    }, function(){
      console.log("don't trust " + l.text);      
    });
  }
});


