// localization
var _ = require("l10n").get;

// open configuration tab if network_url is still the default value
simplePrefs = require("simple-prefs");
if (simplePrefs.prefs.network_url=="http://example.com") {
  require("tabs").open({
    url: require("self").data.url("configuration.html"),
    onOpen: function(tab) {
      tab.on("ready", function(tab) {
        var worker = tab.attach({
          contentScriptFile: require("self").data.url("configuration.js"),
          contentScriptWhen: "end"
        });

        // register callbacks
        worker.port.on("configure", function(configuration) {
          for (prop in configuration) {
            simplePrefs.prefs[prop] = configuration[prop];
          }

          worker.port.emit("done");
        });

        worker.port.on("close", function(data) {
          tab.close();
        });
      });
    }
  });
}

// opens a new tab with red, attaches a content script and sends the data to it
function redshare(data) {
  var attach_worker = function(tab) {
    var worker = tab.attach({
      contentScriptFile: require("self").data.url("contentscript.js"),
      contentScriptWhen: "ready"
    });

    worker.port.on("error", function(error_type) {
      if (error_type=="text_field") require("notifications").notify({
        title: _("text_field_error_title"),
        text: _("text_field_error_text")
      });
      else if (error_type=="generator") require("notifications").notify({
        title: _("generator_error_title"),
        text: _("generator_error_text")
      });
    });

    worker.port.on("done", function(success) {
      tab.removeListener("ready", attach_worker);
    });

    worker.port.emit("post", data);
  }

  require("tabs").open({
      url: simplePrefs.prefs.network_url.replace('/rpost','') + '/rpost',
    onOpen: function onOpen(tab) {
      tab.on("ready", attach_worker);
    }
  });
}


// opens a new tab with red, attaches a content script and sends the data to it
function redbookmark(data) {
  var attach_worker = function(tab) {
    var worker = tab.attach({
      contentScriptFile: require("self").data.url("contentscript.js"),
      contentScriptWhen: "ready"
    });

    worker.port.on("error", function(error_type) {
      if (error_type=="text_field") require("notifications").notify({
        title: _("text_field_error_title"),
        text: _("text_field_error_text")
      });
      else if (error_type=="generator") require("notifications").notify({
        title: _("generator_error_title"),
        text: _("generator_error_text")
      });
    });

    worker.port.on("done", function(success) {
      tab.removeListener("ready", attach_worker);
    });

    worker.port.emit("post", data);
  }

  require("tabs").open({
      url: simplePrefs.prefs.network_url.replace('/rpost','') + '/rbmark',
    onOpen: function onOpen(tab) {
      tab.on("ready", attach_worker);
    }
  });
}


// add context menu items
var contextMenu = require("context-menu");

contextMenu.Item({
  label: _("share_page"),
  context: contextMenu.PageContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href":document.URL}); });',
  onMessage: redshare
});

contextMenu.Item({
  label: _("share_bookmark"),
  context: contextMenu.PageContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"bookmark", "href":document.URL}); });',
  onMessage: redbookmark
});



contextMenu.Item({
  label: _("share_image"),
  context: contextMenu.SelectorContext("img"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"img", "src":node.src, "alt":node.alt}); });',
  onMessage: redshare
});

contextMenu.Item({
  label: _("share_link"),
  context: contextMenu.SelectorContext("a[href]"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href": node.href}); });',
  onMessage: redshare
});

contextMenu.Item({
  label: _("share_bookmark"),
  context: contextMenu.SelectorContext("a[href]"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"bookmark", "href": node.href}); });',
  onMessage: redbookmark
});


contextMenu.Item({
  label: _("share_selection"),
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"quote", "source": document.URL, "title":document.title, "text":window.getSelection().toString()}); });',
  onMessage: redshare
});
