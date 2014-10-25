var wiki_prefix = "http://en.wikipedia.org/w/api.php?action=parse&page=";
var wiki_callback = "&prop=text&redirects&section=0&format=json&callback=?";

function setSummary(term, api){
  console.log('Looking up: ' + term);
  var query = wiki_prefix + term + wiki_callback; 
  var qText = "";
  // Got this voodoo from http://jsfiddle.net/gautamadude/HMJJg/1/
  $.getJSON(query, function(data) {
    // console.log('DATA: ' + data);
    var pText = "";
    try {
      for (text in data.parse.text) {
        var text = data.parse.text[text].split("<p>");
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
      }
    } catch (err) {
      console.err("PROBLEM SUMMARIZING:  " + pText);
      return pText;
    }
    pText = pText.substring(0, pText.length - 2); //Remove extra newline
    pText = pText.replace(/\[\d+\]/g, ""); //Remove reference tags (e.x. [1], [4], etc)
    //console.log('returning: ' + pText);
    if (pText.length > 500){
      pText = pText.substring(0, 500) + '...';
    }
    if (pText.length === 0) {
      pText = 'No Data Available';
    }
    api.set('content.text', pText);
    qText = pText;
    return pText;
  });
  return qText;
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
  l.text = this.innerHTML.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});;
  if (checkIsWikiPage(l.text, l.link)) {
    var search_term = l.link.split('/')[l.link.split('/').length - 1].replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
    //Add qtip
    $(this).qtip({
      content: {
        text: function(event, api) {
          setSummary(search_term, api);
        }
      },
      position: {
        viewport: $(window)
      },
      style: 'qtip-dark'
    });
  }
});


