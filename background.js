let port;

chrome.runtime.onConnect.addListener(function (newPort) {
  console.assert(newPort.name == "micCapture");
  port = newPort;

  port.onDisconnect.addListener(() => {
    console.error("Port disconnected.");
    port = null;
  });

  port.onMessage.addListener(function (msg) {
    if (msg.action == "startCapture") {
      startCapture();
    } else if (msg.action == "stopCapture") {
      stopCapture();
    }
  });
});

function startCapture() {
  chrome.tabCapture.capture({ audio: true }, function (stream) {
    if (chrome.runtime.lastError) {
      console.error(
        "Error capturing audio: ",
        chrome.runtime.lastError.message
      );
      return;
    }
    if (stream) {
      chrome.storage.local.set({ micStream: stream });
    } else {
      console.error("No stream captured.");
    }
  });
}

function stopCapture() {
  chrome.storage.local.get("micStream", function (data) {
    const stream = data.micStream;
    if (stream) {
      stream.getTracks()[0].stop();
      chrome.storage.local.remove("micStream");
    } else {
      console.error("No audio stream found.");
    }
  });
}
