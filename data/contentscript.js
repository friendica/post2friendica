//  taken from the Friendica jotShare function (view/jot-header.tpl)
InsertHTMLScript = 'window.addEventListener("message", function(ev) { if (!editor) $("#profile-jot-text").val(""); initEditor(function() { addhtmltext(ev.data);  $("#like-rotator-" + id).spin(false); $(window).scrollTop(0); }); }, false);'

//  taken from the Friendica jotGetLink function (view/jot-header.tpl)
InsertURLScript = 'window.addEventListener("message", function(ev) { reply = bin2hex(ev.data); $.get("parse_url?binurl=" + reply, function(data) { if (!editor) $("#profile-jot-text").val(""); initEditor(function() { addeditortext(data);  $("#profile-rotator").spin(false); }); }); }, false);';

InsertBookMarkScript = 'window.addEventListener("message", function(ev) { $("#id_url").val(ev.data); $("#id_title").val(ev.data); })';


// functions to insert items into the Friendica textarea
function insertURL(href) {
  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertURLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(href, '*');
}

function insertBookMark(href) {
  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertBookMarkScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(href, '*');
}


function insertImage(src, alt) {

  var s = '[img]' + src + '[/img]';

  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertHTMLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(s, '*');
}

function insertQuote(source, title, text) {
  // create html code to insert
  // http://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string
  var container = document.createElement("div");
  var el = document.createElement("a");
  el.setAttribute("href", source);
  el.setAttribute("class", "bookmark");
  el.textContent = title;
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  var el = document.createElement("blockquote");
  el.textContent = text;
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  htmlcode = container.innerHTML;

  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertHTMLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(htmlcode, '*');
}

// callback for the "post" event from main.js
self.port.on("post", function(data) {
  // get generator meta tag
  try {
    generator = document.getElementsByName('generator')[0].getAttribute('content');
  }
  catch (err) {
    generator = "";
  }

  if (generator.substring(0, 10)=="Red Matrix") {
    // if this is the login site, wait until login is completed
    if (document.getElementById("main-login")) {
      return;
    }

    if (document.getElementById("id_url")) {
      if (data.type=="bookmark") {
        insertBookMark(data.href);
      }
	}

    // insert item if text field present
    else if (document.getElementById("profile-jot-text")) {
      if (data.type=="url") {
        insertURL(data.href);
      }
      else if (data.type=="img") {
        insertImage(data.src, data.alt);
      }
      else if (data.type="quote") {
        insertQuote(data.source, data.title, data.text);
      }
    }
    else {
      self.port.emit("error", "text_field");
    }
  }
  else {
    self.port.emit("error", "generator");
  }

  // notify main.js that the content script should no longer be attached when a new site loads in the tab
  self.port.emit("done", true);
});
