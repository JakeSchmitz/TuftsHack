var wiki_prefix = "https://en.wikipedia.org/w/api.php?action=parse&page=";
var wiki_callback = "&prop=text&redirects&section=0&format=json&callback=?";
var image_prefix = "https://en.wikipedia.org/w/api.php?action=query&titles=";
var file_prefix = "https://en.wikipedia.org/wiki/";
var new_api = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=";
var post_chars = "&redirects&titles=";
var post_title = "&format=json&callback=?";


function setImage(term, summary, api) {
  var query = image_prefix + term + "&prop=images&format=json&callback=?";
  $.getJSON(query, function(data) {
    for (text in data.query.pages) {
      try {
        var image_url = data.query.pages[text];
        console.log(image_url.images[0].title);
        var iurl = file_prefix + encodeURIComponent(image_url.images[0].title) + '#file';
        var image_tag = '<img src=' + iurl + '>';
        console.log(iurl);
        console.log(image_tag);
        summary = image_tag + summary;
        api.set('content.text', summary);
      } catch (err) {
        //HMMM
      }
    }
  }).error(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR);
    });
}

// New hotness implementation of setSummary
function setWikiSummary(term, api) {
  var q2 = new_api + '750' + post_chars + encodeURIComponent(term) + post_title;
  //console.log(q2);
  // Hack to get around cross origin request policy
  var xhr = new XMLHttpRequest();
  xhr.open("GET", q2, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var data = JSON.parse(xhr.responseText.substring(5, xhr.responseText.length -1)); 
       //handle the xhr response here
      for (text in data.query.pages) {
        try {
          //console.log(data.query.pages);
          var extract = data.query.pages[text].extract;
          //console.log(extract);
          extract = extract.replace(/h[1-6]>/g, 'p>');
          extract.replace(/\n/, ' ');
          if (extract.length > 750){
            extract = extract.substring(0, 750) + '...';
          }
          if (extract.indexOf('...') < 5) {
            extract = 'No Data Available';
          } 
          api.set('content.text', extract);
        } catch (err) {
          console.log('Failed to extract summary of ' + term);
          // What to do?
        }
      }
    }
  }
  xhr.send();
}

function setSummary(term, api) {
  api.set('content.text', 'Searching....');
  console.log('Looking up: ' + term);
  var query = wiki_prefix + term + wiki_callback; 
  var qText = "";
  // Got this voodoo from http://jsfiddle.net/gautamadude/HMJJg/1/
  $.getJSON(query, function(data) {
     console.log('DATA: ' + data);
    var pText = "";
    try {
      for (text in data.parse.text) {
        //console.log(text);
        var text = data.parse.text[text].split("<p>");
        for (p in text) {
            //console.log(p);
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
      return pText;
    }
    pText = pText.substring(0, pText.length - 2); //Remove extra newline
    pText = pText.replace(/\[\d+\]/g, ""); //Remove reference tags (e.x. [1], [4], etc)
    //console.log('returning: ' + pText);
    if (pText.length > 1000){
      pText = pText.substring(0, 1000) + '...';
    }
    if (pText.length === 0) {
      pText = 'No Data Available';
    } 
    api.set('content.text', pText);
    //setImage(term, pText, api);
    qText = pText;
    return pText;
  });
  return qText;
}

function checkIsWikiPage(term, link){
  if (link.indexOf('en.wikipedia.org/wiki') >= 0 && link.indexOf('File:') < 0) {
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
    var search_term = decodeURIComponent(l.link.split('/')[l.link.split('/').length - 1]).split('#')[0];
    //Add qtip
    $(this).qtip({
      content: {
        title: search_term.replace(/\_/g, ' ').toUpperCase(),
        text: function(event, api) {
          setWikiSummary(search_term, api);
        }
      },
      position: {
        viewport: $(window),
        target: 'mouse',
        adjust: {x: 0, y: 5}
      },
      style: {classes: 'qtip-dark qtip-jtools summarwiki' }
    });
  }
});


