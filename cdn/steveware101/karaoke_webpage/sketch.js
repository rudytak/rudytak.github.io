// -------------------------------------------------------------------------------------------
// ---------------------------         SETTINGS          -------------------------------------
// -------------------------------------------------------------------------------------------

// Name of the song playing (the .mp3 file and the .xml witht he lyrics have to share the same name and they have to be in the "song" folder)
let songName = "eminem";

// Voice colors (any number of colors can be added, keep enough to cover all the voices)
//              Instructions    Voice 0     Voice 1     Voice 2 ...
let voiceColors = ["white", "red", "green", "blue", "purple", "yellow"];

let backgroundType = 2;
// 1 = solid color as per baseBackgroundColor
// 2 = blobs of colors as per blobColors on a solid color background of color baseBackgroundColor
// 3 = image as per bgImageSrc

// BG TYPE 1
let baseBackgroundColor = "lime";

// BG TYPE 2
// possible colors of the blobs (any number of colors can be added/removed, but keep at least one)
let blobColors = ["yellow", "blue", "turquoise"]
// amount of blobs on the screen
let blobCount = 10;
// size of each blob (0.0 <-> 1.0)
let blobS = 0.5;

// BG TYPE 3
let bgImageSrc = "./img/bg.jpg"; // required if backgroundType is 3, otherwise can be left blank ("")

// ICON
let iconSrc = "./img/icon.png"; // leave blank ("") for no icon

// FONT
let fontSrc = "./fonts/baloo.regular.ttf";

// -------------------------------------------------------------------------------------------
// ---------------------------           CODE            -------------------------------------
// -------------------------------------------------------------------------------------------
function loadLyrics(songName) {
    // load xml file
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {    // IE 5/6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.open("GET", `./songs/${songName}.xml`, false);
    xhttp.send();
    xmlDoc = xhttp.responseXML;

    return {
        xml: xmlDoc,

        artist: xmlDoc.getElementsByTagName("Artist")[0].innerHTML,
        copyright: xmlDoc.getElementsByTagName("Copyright")[0].innerHTML,
        title: xmlDoc.getElementsByTagName("Title")[0].innerHTML,
        writers: xmlDoc.getElementsByTagName("Writers")[0].innerHTML,

        pages: Array.from(xmlDoc.getElementsByTagName("Page")).map(page => {
            return {
                start: parseFloat(page.getElementsByTagName("StartTime")[0].innerHTML),
                end: parseFloat(page.getElementsByTagName("EndTime")[0].innerHTML),
                type: page.getElementsByTagName("Type")[0].innerHTML,
                lines: Array.from(page.querySelectorAll("Paragraphs Block Lines Line")).map(line => {
                    let highlights = line.querySelectorAll('Highlights Highlight');
                    let doHighlight = highlights.length != 0;

                    let voices = line.getElementsByTagName("Voice");
                    return {
                        text: line.getElementsByTagName("Text")[0].innerHTML,
                        voice: voices.length > 0 ? parseInt(voices[0].innerHTML) + 1 : 0,

                        highlight: {
                            applicable: doHighlight,

                            start: doHighlight ? parseFloat(highlights[0].getElementsByTagName("Time")[0].innerHTML) : null,
                            end: doHighlight ? parseFloat(highlights[highlights.length - 1].getElementsByTagName("Time")[0].innerHTML) : null,

                            highlightsXML: highlights
                        }
                    }
                })
            }
        })
    };
}

let songTrack;
let songLyrics;

let fr = 30;
let t = 0;
let playing = false;
let paused = false;
let fs = 30;
let cnv;
let font;

let iconImg;

let blobs = [];
let vmin;

// --------------------------------- MIC ---------------------------------
let mic;
let reverb;
let drywet = 0.1;

let recording = false;
let recorder, soundFile;

function preload() {
    soundFormats('mp3', 'ogg');
    songTrack = loadSound(`./songs/${songName}`);
    songLyrics = loadLyrics(songName);

    if (iconSrc != "") {
        iconImg = loadImage(iconSrc);
    }

    font = loadFont(fontSrc);
}

function setup() {
    cnv = createCanvas(innerWidth, innerHeight);
    // cnv.mousePressed(toggle_play);
    frameRate(fr);

    fs = Math.min(innerWidth, innerHeight) / 20;

    switch (backgroundType) {
        case 3:
            document.getElementById("defaultCanvas0").style.backgroundImage = `url("${bgImageSrc}")`;
            document.getElementById("defaultCanvas0").style.backgroundSize = "cover";
            document.getElementById("defaultCanvas0").style.backgroundPositionX = "center";
            document.getElementById("defaultCanvas0").style.backgroundPositionY = "center";
            document.getElementById("defaultCanvas0").style.backgroundRepeat = "no-repeat";
            break;
    }

    vmin = Math.min(innerWidth, innerHeight) / 100;

    for (var i = 0; i < blobCount; i++) {
        blobs.push({
            id: i,
            c: random(blobColors)
        })
    }

    mic = new p5.AudioIn();
    mic.start();
    mic.connect();
    mic.amp(0.5);

    reverb = new p5.Reverb();
    // mic.disconnect();
    reverb.process(mic, 1, 2);
    reverb.amp(0.5);

    // create a sound recorder
    recorder = new p5.SoundRecorder();
    // recorder.setInput(reverb);
    // create an empty sound file that we will use to playback the recording
    soundFile = new p5.SoundFile();
}

// --------------------------------- SONG ---------------------------------

function start() {
    if (playing) return;

    document.getElementById("audio-play").style.display = "none"
    document.getElementById("audio-pause").style.display = "initial"

    songTrack.play();
    startTime = Date.now();
    playing = true;
}

function pause() {
    document.getElementById("audio-play").style.display = "initial"
    document.getElementById("audio-pause").style.display = "none"

    songTrack.pause();
    paused = true;
}

function contin() {
    document.getElementById("audio-play").style.display = "none";
    document.getElementById("audio-pause").style.display = "initial"

    songTrack.play();
    paused = false;
}

function toggle_play() {
    if (!playing) {
        start();
        return
    }

    if (paused) {
        contin();
    } else {
        pause();
    }
}

function change_volume(e) {
    songTrack.setVolume(e.target.valueAsNumber)
}

// --------------------------------- Reverb ---------------------------------

function setDryWet(e) {
    drywet = e.target.valueAsNumber;
}

function setReverbIntensity(e) {
    reverb.amp(e.target.valueAsNumber);
}

function setMicVol(e) {
    mic.amp(e.target.valueAsNumber);
}

// --------------------------------- RECORDING ---------------------------------

function toggle_recording(){
    if(!recording){
        document.getElementById("recording-play").style.display = "none"
        document.getElementById("recording-pause").style.display = "initial"

        recorder.record(soundFile);
        recording = true;
    }else{
        document.getElementById("recording-play").style.display = "initial"
        document.getElementById("recording-pause").style.display = "none"

        recorder.stop();
        setTimeout(()=>{
            saveSound(soundFile, 'recording.wav');
        }, 100)
        recording = false;
    }
}

function draw() {
    switch (backgroundType) {
        case 1:
            background(baseBackgroundColor);
            break;
        case 2:
            background(baseBackgroundColor);

            for (let b of blobs) {
                push();
                let x = map(noise(frameCount / 500, 100 * b.id, 0), 0, 1, -0.5, 1.5) * width;
                let y = map(noise(frameCount / 500, 100 * b.id, 100), 0, 1, -0.5, 1.5) * height;

                let g = drawingContext.createRadialGradient(x, y, 0, x, y, blobS * vmin * 100);

                g.addColorStop(0, b.c);
                g.addColorStop(1, "#00000000");

                drawingContext.fillStyle = g;

                rect(0, 0, width, height);
                pop();
            }
            break;
        case 3:
            clear();
            break;
    }

    if (iconSrc != "") {
        image(iconImg, 10, 10, 100, 100)
    }

    push();

    fill(voiceColors[0])
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(font);
    translate(width / 2, height / 2)
    textSize(fs);

    reverb.drywet(drywet);

    if (!playing) {
        text('Tap ▶︎ to play', 0, 0);
        return;
    }

    if (!paused) {
        t += 1/fr;
    }

    let page = songLyrics.pages.find(p => p.start < t && p.end > t)

    if (!page) return;

    if (page.type == "Title") {
        textSize(fs * 2);
        text(songLyrics.title, 0, -2 * fs);

        textSize(fs);
        text(songLyrics.artist, 0, 0);

        textSize(fs / 2);
        text(songLyrics.writers, 0, fs);
        text(songLyrics.copyright, 0, 1.5 * fs);

        return;
    }

    let lineCount = page.lines.length;

    for (let i = 0; i < lineCount; i++) {
        let l = page.lines[i];
        let lc = voiceColors[l.voice];

        if (l.highlight.applicable) {
            if (t > l.highlight.end) {
                fill(lc);
                text(l.text, 0, 1.1 * fs * (i - lineCount / 2))
            } else if (t < l.highlight.start) {
                fill(voiceColors[0]);

                text(l.text, 0, 1.1 * fs * (i - lineCount / 2))

            } else {
                let p = (t - l.highlight.start) / (l.highlight.end - l.highlight.start);

                let W = textWidth(l.text);
                let Y = 1.1 * fs * (i - lineCount / 2);

                push();
                let gradient = drawingContext.createLinearGradient(- W / 2, 0, + W / 2, 0);

                gradient.addColorStop(0, lc);
                gradient.addColorStop(Math.max(p - .00005, 0), lc);
                gradient.addColorStop(Math.min(p + .00005, 1), voiceColors[0]);
                gradient.addColorStop(1, voiceColors[0]);

                drawingContext.fillStyle = gradient;

                text(l.text, 0, Y)
                pop();
            }
        } else {
            fill(voiceColors[l.voice]);
            text(l.text, 0, 1.1 * fs * (i - lineCount / 2))
        }
    }

    pop();

    // strokeWeight(10)
    // stroke("black")
    // line(300,100,300,100+100*mic1.getLevel())
    // line(320,100,320,100+100*mic2.getLevel())
}

function windowResized() {
    resizeCanvas(innerWidth, innerHeight);
    vmin = Math.min(innerWidth, innerHeight) / 100;
}

$(window).on("blur focus", function (e) {
    var prevType = $(this).data("prevType");

    if (prevType != e.type) {   //  reduce double fire issues
        switch (e.type) {
            case "blur":
                pause();
                break;
            case "focus":
                //contin();
                break;
        }
    }

    $(this).data("prevType", e.type);
})

setTimeout(async () => {
    document.getElementById("audio-volume").addEventListener("change", change_volume);
    document.getElementById("mic-reverb-drywet").addEventListener("change", setDryWet);
    document.getElementById("mic-reverb-int").addEventListener("change", setReverbIntensity);
    document.getElementById("mic-volume").addEventListener("change", setMicVol);
})