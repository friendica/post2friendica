// callback for "done" message from main.js
self.port.on("done", function(data) {
  var success_message = document.getElementById("success_message").childNodes[0].nodeValue;

  alert(success_message);
  self.port.emit("close");
});

// add callback for form submission event
document.getElementById("submit").addEventListener("click", function() {
  var network_url = document.forms[0].elements["network_url"].value;
	if(network_url.search('/rpost') < 0)
		network_url = network_url + '/rpost';	
  self.port.emit("configure", {"network_url":network_url});

  return false;
});
