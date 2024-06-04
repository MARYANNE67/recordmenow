// Camera and video access

window.camId = "recordme-camera";

window.camera = document.getElementById(camId);

if(window.camera)
{
    console.log('camera found', camera)
}
else
{
    const camElement = document.createElement('iframe');
    camElement.id = camId;
    camElement.setAttribute('style', 
    `
        all:initial;
        position: fixed;
        height: 200px;
        width: 200px;
        z-index: 999999;
        background-color: black;
        border: none;
        border-radius: 100px;
        right:0;
        top:0;
    `)

    // set permission on iframe - camea and microphaone
    camElement.setAttribute('allow', 'camera; microphone')

    camElement.src = chrome.runtime.getURL('camera.html');
    
    document.body.appendChild(camElement);
}