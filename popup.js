document.addEventListener('DOMContentLoaded', function() {
    let mediaRecorder;
    let chunks = [];
  
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function(event) {
          chunks.push(event.data);
        };
        mediaRecorder.start();
      } catch (error) {
        console.error("Error starting recording: ", error);
        alert("Error starting recording. Please try again later.");
      }
    }
  
    async function stopRecording() {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }
  
    async function uploadToS3(blob) {
      // Your AWS S3 configuration
      const bucketName = 'your-bucket-name';
      const accessKeyId = 'your-access-key-id';
      const secretAccessKey = 'your-secret-access-key';
      const region = 'your-region';
      
      AWS.config.update({
        credentials: new AWS.Credentials(accessKeyId, secretAccessKey),
        region: region
      });
  
      const s3 = new AWS.S3();
      const params = {
        Bucket: bucketName,
        Key: 'audioRecording.wav', // Set your desired file name here
        Body: blob,
        ACL: 'public-read' // Adjust the access control policy as needed
      };
  
      s3.upload(params, function(err, data) {
        if (err) {
          console.error("Error uploading to S3: ", err);
          alert("Error uploading to S3. Please try again later.");
        } else {
          console.log("Upload successful: ", data.Location);
          alert("Upload successful. File URL: " + data.Location);
        }
      });
    }
  
    document.getElementById('start').addEventListener('click', startRecording);
  
    document.getElementById('stop').addEventListener('click', function() {
      stopRecording();
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        uploadToS3(blob);
      } else {
        console.error("No audio data recorded.");
        alert("No audio data recorded.");
      }
    });
  });
  