let video_url = "https://rudytak.github.io/cdn/lada8101/smart_glass_guide.webm";

let canv, vid;
let vidw, vidh;
let loaded = false;

document.body.innerHTML += ``;

function setup() {
    // document.body.innerHTML += `<video id="vid" loop autoplay controls src="http://maximglobal.netfirms.com/assets/Video/smart_glass_guide.mp4"></video>`;
    document.body.innerHTML = `
    <style>
        body{
            overflow-x: hidden;
        }
        
        #wrap{
        	z-index: 1000 !important;
          position: sticky !important;
        }
        
        jdiv{
        	z-index: 10 !important;
        }

        #defaultCanvas0{
        	z-index: 1001 !important;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <div id="wrap" style="position: sticky;height: 0px; top: 0;">
        <div id="controls" style="
            width: 320px;
            height: 24px;
            position: absolute;
            display: flex;
            margin-top: calc(100vh - 24px - 20px);
            margin-left: 0px;
            justify-content: center;
            align-items: center;
            border-radius: 3px;
            z-index: 100000;
        ">
            <style>
                .icn{
                    display: inline-flex;
                    padding: 6px;
                    background: white;
                    border-radius: 7px;
                    margin: 3px;
                    width: auto;                  
                }
            </style>

            <i class="fa-solid fa-play icn" onclick='console.log("xd");document.getElementById("vid").play();'></i>
            <i class="fa-solid fa-pause icn" onclick='document.getElementById("vid").pause();'></i>
            <i class="fa-solid fa-volume-xmark icn" onclick='document.getElementById("vid").volume = Math.abs(document.getElementById("vid").volume - 1)'></i>
            <i class="fa-solid fa-xmark icn" onclick='document.getElementById("vid").pause(); document.getElementById("wrap").style.opacity = 0;'></i>
        </div>
    </div> 
    ${document.body.innerHTML} 
    <video id="vid" 
    style = "position: absolute; top: 0;" 
    loop autoplay controls 
    crossorigin="anonymous"
    src="${video_url}"></video>`;
    document.getElementById("vid").addEventListener("canplay", () => {
        document.getElementById("vid").style.opacity = 0;
        //document.getElementById("vid").crossOrigin = "anonymous";
        vidw = document.getElementById("vid").getBoundingClientRect().width;
        vidh = document.getElementById("vid").getBoundingClientRect().height;

        resizeCanvas(vidw, vidh / 2);
        canv.elt.style.marginLeft = "0px";
        canv.elt.style.marginTop = "calc(100vh - 320px)";
        canv.elt.style.position = "relative";
        canv.elt.style.zIndex = 10000;

        console.log("loaded");
        loaded = true;
    })

    canv = createCanvas(1, 1);
    canv.parent("wrap");
}

function draw() {
    if (!loaded) {
        return;
    }

    let ctx_src = canv.elt.getContext('2d');
    ctx_src.drawImage(
        document.getElementById("vid"),
        0, 0, vidw, vidh / 2, 0, 0, vidw, vidh / 2
    );
    let src = ctx_src.getImageData(0, 0, vidw, vidh / 2)

    let ctx_mask = canv.elt.getContext('2d');
    ctx_mask.drawImage(
        document.getElementById("vid"),
        0, vidh / 2, vidw, vidh / 2, 0, 0, vidw, vidh / 2
    );
    let mask = ctx_src.getImageData(0, 0, vidw, vidh / 2)

    for (let i = 3; i < src.data.length; i += 4) {
        src.data[i] = mask.data[i - 1]
    }

    drawingContext.clearRect(0, 0, vidw, vidh);
    drawingContext.putImageData(src, 0, 0)
}