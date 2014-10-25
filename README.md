TuftsHack
=========

Tufts Hackathon Fall 2014

First idea is SummarWiki, which is a chrome extension for viewing the 
summaries of pages linked to in wikipedia articles.

*SummarWiki*
This chrome extension adds a qtip to each link on wikipedia pages.

The qtip executes a js snippet on hover that gets the summary of the article
associated with the link and populates the tooltip box on hover.

I found code on jsfiddle (linked to in code) to scrape the summary of an
article from the raw content of a page (accessible through the wikipedia
API). Right now this code block only works on roughly 3/4 of links, so 
improving this chunk of code is one of the priorities moving forward.

Another place to go from here is to add the principle image for the article
to the top of the summary. I've written the code to get the url that the
image is at but I'm having a little trouble interpretting it as anything
but plain html right now.

