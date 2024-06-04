
// listen for message from service worker
chrome.runtime.onMessage.addListener( (message, sender) => {

    console.log('offscreen message recived', message, sender)

    switch(request.type){
        case 'start-recording':
            console.log('offscreen: start recording tab')
            break;

        case 'stop-recording':
            console.log('offscreen: stop recording tab')
            break;

        default:
            console.log('default')
    }

    return true;
})