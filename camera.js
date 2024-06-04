
/* Main function for injecting camera and starting camera */
const main = async () =>
{
    const camElement = document.querySelector('#camera')

    console.log(camElement)

    const permission = await navigator.permissions.query({
        name : "camera"
    })

    if(permission.state == "prompt")
    {
        await navigator.mediaDevices.getUserMedia({audio: true});
    }

    if(permission.state == "denied")
    {
       alert('Camera permission denied')
    }

    console.log(permission);


    /* Start Camera Stream */
    const startCamera = async() => 
    {
        const vidElemet = document.createElement('video');
        vidElemet.setAttribute('style',
        `
            height:205px;
            transform: scaleX(-1);
            border-radius: 100px;
        `)

        vidElemet.setAttribute('autoplay', true);
        vidElemet.setAttribute('muted', true);

        const camStream = 
            await navigator.mediaDevices.getUserMedia({audio: false, video: true});

        vidElemet.srcObject = camStream;

        camElement.appendChild(vidElemet);
    }

    startCamera()
}



main();