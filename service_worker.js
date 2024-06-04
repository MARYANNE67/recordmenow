
// check storage if recording is on 
const checkRecordingStatus = async () => 
{
    const recording = await chrome.storage.local.get(['recording', 'type']);

    const recordingStat = recording.recording || false;

    const recordingType = recording.type || '';


    console.log('recording status & type: ',recordingStat, recordingType)

    return [recordingStat, recordingType]
}

//updateRecording function sets recording state to arg state and type
const updateRecording = async (state, type) => {
    console.log('start recording', type);

    chrome.storage.local.set({recording : state , type: type})

}


// startRecording function , calls updateRecording function with true state
const startRecording = async (type) => {
    console.log('start recording', type);

    const currentState = await checkRecordingStatus()

    console.log('current state', currentState)

    updateRecording(true, type)

    chrome.action.setIcon({path: "icons/recording.png"})

    if(type == 'tab') 
        recordTabState(true)
    // else
    //     recordTabState(false)
}

// startRecording function , calls updateRecording function with false state

const stopRecording = async () => {
    console.log('stop recording');

    updateRecording(false, '')

    chrome.action.setIcon({path: "icons/not_recording.png"})

    recordTabState(false)
}

const recordTabState  = async(start = true) => {
    // set up offscreen document
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"]
    });

    // const offscreenDocument = existingContexts.find(
    //     (context) => context.contextType == "OFFSCREEN_DOCUMENT"
    // );

    const offscreenExist = existingContexts.length > 0

    // if offscreen document does not exist -> create one
    if(!offscreenExist)
    {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["USER_MEDIA", "DISPLAY_MEDIA"],
            justification: "Recording from chrome.tabCapture API"
        });
    }

    // if offscreen document exist use the tapCapture API to ge the stream
    if(start){
       
        // get active tab id 
        const tab = await chrome.tabs.query({active: true, currentWindow: true})

        if (!tab) return;


        const tabId = tab[0].id

        console.log('service worker.js : active tab id', tabId)

        // get streamId via tabCapture API
        const streamId = await chrome.tabCapture.getMediaStreamId(
        {
            targetTabId: tabId
        }
        )

        console.log('service worker.js : stream id', streamId)
    
        //send message to the offscreen document to start recording tab
        chrome.runtime.sendMessage({
            type: 'start-recording',
            target: 'offscreen', 
            data: streamId
        })

    } else{

        //send message to the offscreen document to stop recording tab
        chrome.runtime.sendMessage({
            type: 'stop-recording',
            target: 'offscreen', 
    })

    }
}

const recordScreen = () => {
    console.log('record screen')
    //TODO: Finish
}

// listener for when message is sent from pop.js
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {

    console.log('message recived', request, sender)

    switch(request.type){
        case 'start-recording':
            startRecording(request.recordingType)
            break;

        case 'stop-recording':
            stopRecording()
            break;

        default:
            console.log('default')
    }

    return true;
})