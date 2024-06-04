

const recTab = document.querySelector('#btn-tab')
const recScreen = document.querySelector('#btn-screen')

// button event listener calls updateRecording function
recTab.addEventListener('click',  async () => {
    console.log('record tab clicked')

    updateRecording('tab')
})

recScreen.addEventListener('click',  async () => {
    console.log('record screen clicked')

    updateRecording('screen')
})


// injectCamera function injects content.js -> the video cam
const injectCamera = async () => 
{
   
    const queryOptions = { active: true, currentWindow: true };
   
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const tab = await chrome.tabs.query(queryOptions);
    
    if(!tab) {
        console.log('no tab found')
        return;
    }

    const tabId = tab[0].id;

    await chrome.scripting.executeScript({
        target : {tabId : tabId},
        files : [ "content.js" ],
    })
    .then(() => console.log("script injected in all frames"));

}


// check storage if recording 
// returns recordingState : true / false
//          recordigType: tab/screen
const checkRecordingStatus = async () => 
{
    const recording = await chrome.storage.local.get(['recording', 'type']);

    const recordingStat = recording.recording || false;

    const recordingType = recording.type || '';

    console.log('recording status & type: ', recordingStat, recordingType)

    return [recordingStat, recordingType]
}



// init function -> checks recording status and changes button state
const init  = async() => 
{
    const recordingStat = await checkRecordingStatus()

    console.log('recording state: ', recordingStat)

    if(recordingStat[0] == true)
    {
        // show stop recording on the button 
        recordingStat[1] === 'tab' ?  recTab.innerText = 'Stop Recording' :  recScreen.innerText = 'Stop Recording'
    }
}


// updateRecording function checks recording state, and sends message to service worker
const updateRecording = async (type) => {
    console.log('update recording', type);

    const recordingStat = await checkRecordingStatus()

    if(recordingStat[0] == true)
    {

    //send message to service worker to stop recording

    chrome.runtime.sendMessage({type:'stop-recording', recordingType:  type})

    }else
    {
    //send message to service worker to start recording

    chrome.runtime.sendMessage({type:'start-recording', recordingType:  type})

    injectCamera()
    }

    // close popup 
    window.close()
}


    

init();
