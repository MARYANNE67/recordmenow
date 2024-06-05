
// listen for message from service worker
chrome.runtime.onMessage.addListener( (message, sender) => {

    console.log('offscreen message recived', message, sender)

    switch(message.type){
        case 'start-recording':
            console.log('offscreen: start recording tab')
            startRecording(message.data)
            break;

        case 'stop-recording':
            console.log('offscreen: stop recording tab')
            stopRecording()
            break;

        default:
            console.log('default')
    }

    return true;
})

let recorder;

let data = [];

const startRecording = async (streamId) => {
    try{

        if(recorder?.state == "recording")
            throw new Error("Recording in already in progress...")

        console.log("Start recoring offscreen: ", streamId)

        //access MediaStream from streamId
        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
              mandatory: {
                chromeMediaSource: "tab",
                chromeMediaSourceId: streamId,
              },
            },
            video: {
              mandatory: {
                chromeMediaSource: "tab",
                chromeMediaSourceId: streamId,
              },
            },
          });
        
        // get microphone audio as well
          const microphone = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          })


        // comibine microphone and tab media 
        const output = new AudioContext();
        const destination = output.createMediaStreamDestination()

        output.createMediaStreamSource(media).connect(destination)
        output.createMediaStreamSource(microphone).connect(destination)

        const combinedStream = new MediaStream([
            media.getVideoTracks()[0],
            destination.stream.getTracks()[0]
        ]);

        recorder = new MediaRecorder(combinedStream, {mimeType: "video/webm"})

        //listen for data 
        recorder.ondataavailable = (e) => {
            console.log("data available", e)
            data.push(e.data)
        }

        //listen for stop recording 
        recorder.onstop = async() => {
            console.log("recording stopped")

            //send data to service worker
            console.log("sending data to service worker")

            // make a video file and open it on stop recording
            const blob = new Blob(data, {type: "video/webm"})
            const url = URL.createObjectURL(blob);

            window.open(url)
        }

        recorder.start();

    }catch(error){
        console.error(error)
    }
}

const stopRecording = () => {
    console.log("stop recording")

    if(recorder?.state == "recording"){
        recorder.stop();

        //stop all streams
        recorder.stream.getTracks().forEach(element => {
            element.stop()
        });
    }
}

