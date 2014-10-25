var wiki_prefix = "http://en.wikipedia.org/w/api.php?action=parse&page=";
var wiki_callback = "&prop=text&section=0&format=json&callback=?";

function getWikiSummary(term){
  var query = wiki_prefix + term + wiki_callback; 
  var summary = '';
  // Got this voodoo from http://jsfiddle.net/gautamadude/HMJJg/1/
  $.getJSON(query, function(data) {
    try {
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
      }
    } catch (err) {
      console.log("PROBLEM : " + pText);
    }
    pText = pText.substring(0, pText.length - 2); //Remove extra newline
    pText = pText.replace(/\[\d+\]/g, ""); //Remove reference tags (e.x. [1], [4], etc)
    console.log(pText);
    return pText;
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
    var search_term = l.link.split('/')[l.link.split('/').length - 1];
    //Add qtip
    $(this).qtip({
      content: {
        text: function(event, api) {
                    $.ajax({
                      url: chrome.extension.getURL('wiki_summary.js'),
                      data: { func: 'getWikiSummary', term: search_term}
                    })
                    .then(function(content) {
                        var c = content.split('term');
                        var code = c[0] + search_term + c[1]; 
                        var summary = getWikiSummary(search_term)
                        console.log(summary);
                        // Set the tooltip content upon successful retrieval
                        api.set('content.text', content);
                    }, function(xhr, status, error) {
                        console.log('failed to load wiki summary');
                        // Upon failure... set the tooltip content to error
                        api.set('content.text', status + ': ' + error);
                    });
            }
      },
      position: {
        viewport: $(window)
      },
      style: 'qtip-wiki'
    });
  }
});


