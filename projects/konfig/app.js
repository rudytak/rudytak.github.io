var zoomVal = 1,
    nickainley;
var maxFPS = 60;
var cam = false,
    showModel = false,
    startingPoints = [];
var floorPlan = null;
var liveshareConnections = [];
var askForPermision = true;
var renderer;

var trashPM;
var cameraPosition;
var movingOnCanvas = false;

const c = new Client();
const key = localStorage.getItem("appLK");
var projectDetails = null;
const defaultProfileData = '"{\"appType\":\"kantmanufaktur\",\"closed\":false,\"tool\":0,\"points\":[],\"addLines\":[],\"profiles\":[],\"default\":{\"oh\":0.2,\"ih\":0.1,\"ww\":0.25,\"iw\":0.025,\"ow\":0.05,\"ul\":0.25,\"col\":\"rgb(128,128,128)\",\"pt\":\"0\",\"st\":\"3\",\"al\":\"2\",\"grid\":0.02,\"ha\":\"1000\"},\"pdf\":[]}"'

async function autoLogin() {
    var clientEmail = "Not signed in";

    if (key != null) {
        await c.useKey(key)
        if (c.authorized) {
            clientEmail = await c.getEmail();
        }
    }

    floorPlan = new FloorplanManager();

    if (url_params["id"] != undefined) {
        projectDetails = await c.getProjectDetails(decodeURIComponent(url_params["id"]));
        floorPlan.import(projectDetails.file);
    } else {
        if (c.authorized) {
            if (url_params["newUser"] == "true") {
                var last = localStorage.getItem("last_project")
                if (last == null) last = defaultProfileData;

                floorPlan.import(last);

                await saveProject();
            } else {
                try {
                    floorPlan.import(localStorage.getItem("last_project"));
                } catch (error) {
                    projectDetails = await c.getProjectDetails(localStorage.getItem("last_project"));

                    var last;
                    if (projectDetails == null) last = defaultProfileData;
                    else last = projectDetails.file;

                    floorPlan.import(last)
                }
            }
        } else {
            var last = defaultProfileData;
            floorPlan.import(last);
        }
    }

    if (url_params["linkCopy"] == "true") {
        createLiveshareLink();
    }

    if (projectDetails != null) {
        localStorage.setItem("last_project", projectDetails.id);

        document.title = projectDetails.name;
        document.getElementById("ownerName").innerText = "Owner: " + projectDetails.owner;

        try {
            if (clientEmail == projectDetails.owner) {
                document.getElementById("interactions").innerHTML += "<button onclick='renameProject()' id='editButton' class='btn btn-outline-secondary'>Umbenennen</button>"
                document.getElementById("interactions").innerHTML += `
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-reference="parent">
                        PDF<span class="sr-only">Toggle Dropdown</span>
                    </button>
        
                    <div class="dropdown-menu hold-on-click" aria-labelledby="dropdownMenuButton" id="pdfDrop" style="padding: 0.5rem; width: max-content; position: absolute; transform: translate3d(0px, 39px, 0px); top: 0px; left: 0px; will-change: transform; z-index: 1000000;" x-placement="bottom-start">
                    </div>
                </div>
                `
                reloadPDFDrop();
            }
        } catch (error) {}
    } else {
        document.title = "Unbenanntes Projekt";
        document.getElementById("interactions").innerHTML += "<button onclick='renameProject()' id='editButton' class='btn btn-outline-secondary'>Umbenennen</button>"
        document.getElementById("interactions").innerHTML += `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-reference="parent">
               PDF <span class="sr-only">Toggle Dropdown</span>
            </button>

            <div class="dropdown-menu hold-on-click" aria-labelledby="dropdownMenuButton" id="pdfDrop" style="padding: 0.5rem; width: max-content; position: absolute; transform: translate3d(0px, 39px, 0px); top: 0px; left: 0px; will-change: transform; z-index: 1000000;" x-placement="bottom-start">
            </div>
        </div>
        `
        reloadPDFDrop();
    }
    document.getElementById("projectName").innerText = document.title;

    if (projectDetails != null) {
        if (c.authorized && clientEmail != projectDetails.owner) {
            document.getElementById("interactions").innerHTML += '<button onclick="forkProject()" class="btn btn-outline-secondary font-weight-bold mr-2">Copy project</button>'
        }

        floorPlan.import(projectDetails.file, true);

        c.on("listenerUpdate", (id, type, mail) => {
            if (type == "connected") {
                liveshareConnections.push(mail);
            } else {
                liveshareConnections.splice(liveshareConnections.indexOf(mail), 1);
            }
            listAllConnections();
        })

        //document.getElementsByName("Checkboxes5")[0].checked = false
    } else {
        document.getElementById("liveshareToggle").innerHTML = "";
        document.getElementById("connectedUsers").innerHTML = "";
    }

    if (!c.authorized) {
        document.getElementById("userMail").innerText = "Not signed in";

        var loginBtn = `
        <li class="menu-item menu-item-submenu menu-item-rel" aria-haspopup="true" onclick="
        () => {
            localStorage.setItem("last_project", floorPlan.export());

            localStorage.removeItem("appLK");
            window.open("../login/login.html?dir=" + encodeURIComponent(btoa("../app/app.html?newUser=true")), "_self");
        };">
            <a href="./login.html" class="menu-link">
                <span class="menu-text">Anmelden</span>
            </a>
        </li>
        `

        document.getElementById("topnav").innerHTML += loginBtn;
    } else {
        document.getElementById("userMail").innerText = clientEmail;
        document.getElementById("userName").innerText = await c.getName();

        var logoutBtn = `
        <li class="menu-item menu-item-submenu menu-item-rel" aria-haspopup="true" onclick="logout()">
            <a href="./login.html" class="menu-link">
                <span class="menu-text">Abmelden</span>
            </a>
        </li>
        `
            //document.getElementById("topnav").innerHTML += logoutBtn;
    }

    c.on("projectUpdated", (id, file, include) => {
        floorPlan.import(file, include)
    })

    c.on("fileMessage", async(id, message) => {
        var d = document.getElementById("chat");
        d.innerText += message + "\n";

        var elem = document.getElementById('chat');
        elem.scrollTop = elem.scrollHeight;
    });
}

function openLastPdf() {
    setTimeout(function() { document.querySelectorAll("#pdfDrop button")[document.querySelectorAll("#pdfDrop button").length - 3].click(); }, 1500);
}

function reloadPDFDrop() {
    document.getElementById("pdfDrop").innerHTML = `
    ${(()=>{
        var ret="";

        for(var i = 0; i < floorPlan.pdf.length; i++){
            ret+=`<button type="button" class="btn btn-outline-secondary" style="margin: 2px" onclick="window.open('pdf.html?id=${encodeURIComponent(projectDetails.id)}&pdfId=${i}','_blank')">PDF ${i}</button><button type="button" class="btn btn-outline-secondary" style="margin: 2px" onclick="floorPlan.removePDF(${i}); saveProject(); reloadPDFDrop();">-</button><br>`
        }

        ret+=`<button type="button" class="btn btn-outline-secondary" style="margin: 2px" onclick="{
            floorPlan.addPDF(); 
            saveProject();
            reloadPDFDrop();
            openLastPdf();
        }">PDF hinzufügen</button>`
    
        return ret
    })()}
    `
}

async function sendMessage() {
    if (document.getElementById('chatMessage').value != "") {
        try {
            c.sendFileMessage(projectDetails.id, (await c.getEmail()) + ": " + document.getElementById('chatMessage').value);
        } catch (error) {
            c.sendFileMessage(projectDetails.id, "Unregistered: " + document.getElementById('chatMessage').value);
        }
        document.getElementById('chatMessage').value = '';
    }
}

function renameProject() {
    var name = document.getElementById("projectName").innerText;

    document.getElementById("projectName").innerHTML = "<input type='text' class='form-control text-grey' id='projectNameInput' style='font-size: inherit;'></input>"
    document.getElementById("projectNameInput").value = name;

    document.getElementById("editButton").innerText = "Speichern";
    document.getElementById("editButton").onclick = () => {
        saveRenameProject();
    }
}

function saveRenameProject() {
    try {
        var name = document.getElementById("projectNameInput").value;
        if (name.length < 3) {
            document.getElementById("projectNameInput").value = "";
            document.getElementById("projectNameInput").placeholder = "Name too short!";

            setTimeout(() => {
                document.getElementById("projectNameInput").placeholder = 'Project name';
            }, 1000)
        } else if (name.length > 32) {
            document.getElementById("projectNameInput").value = "";
            document.getElementById("projectNameInput").placeholder = "Name too long!";

            setTimeout(() => {
                document.getElementById("projectNameInput").placeholder = 'Project name';
            }, 1000)
        } else {
            c.changeProjectName(projectDetails.id, name).then(async() => {
                document.getElementById("projectName").innerText = (await c.getProjectDetails(projectDetails.id)).name;
                document.title = document.getElementById("projectName").innerText;

                document.getElementById("editButton").innerText = "Umbenennen";
                document.getElementById("editButton").onclick = () => {
                    renameProject();
                }
            });
        }
    } catch (error) {
        document.getElementById("projectName").innerText = document.getElementById("projectNameInput").value;
        document.title = document.getElementById("projectName").innerText;
    }
}

async function liveshareToggle() {
    var id;

    if (projectDetails) id = projectDetails.id

    if (c.authorized) var mail = await c.getEmail();
    if (c.authorized &&
        (projectDetails.editors.indexOf(mail) != -1 ||
            mail == projectDetails.owner) && !floorPlan.sendData) {

        floorPlan.sendData = true;

        floorPlan.stack = [floorPlan.export()];
        floorPlan.stackIndex = 0;
    } else {
        floorPlan.sendData = false;
    }

    if (id) {
        if (floorPlan.receiveData) {
            c.removeFileListener(projectDetails.id);
            floorPlan.receiveData = false;

            document.getElementById("connectedUsers").innerHTML = "";

            document.getElementById("stack").style.display = "block";
            document.getElementById("chatInput").style.display = "none";
            document.getElementById("chat").style.display = "none";
        } else {
            liveshareConnections = await c.getProjectListeners(projectDetails.id)
            if (liveshareConnections) listAllConnections();

            c.addFileListener(projectDetails.id)
            floorPlan.receiveData = true;

            projectDetails = await c.getProjectDetails(projectDetails.id);

            floorPlan.import(projectDetails.file, false);

            document.title = projectDetails.name;
            document.getElementById("projectName").innerText = document.title;

            if (!floorPlan.sendData) document.getElementById("stack").style.display = "none";
            document.getElementById("chatInput").style.display = "flex";
            document.getElementById("chat").style.display = "block";

            document.getElementById("chat").innerText = "Verbindung zu LiveShare hergestellt!\n"
        }
    }

    floorPlan.stack = [floorPlan.export()];
    floorPlan.stackIndex = 0;
}

function logout() {
    delete c;
    localStorage.removeItem("appLK")
    window.open("../login/login.html", "_self")
}

async function forkProject() {
    if (c.authorized) {
        c.forkProject(projectDetails.id);
    }
}

async function saveProject() {
    var d = document.getElementById("savingMessage");

    if (floorPlan.tool == 3) {
        floorPlan.setTool(2);
    }

    if (c.authorized) {
        d.innerText = "Speichern...";

        if (projectDetails == null) {
            var cProjectID = await c.createProject(url_params["projectName"] ? url_params["projectName"] : "Unbenanntes Projekt");
            projectDetails = await c.getProjectDetails(cProjectID);
        }

        localStorage.setItem("last_project", projectDetails.id);

        await c.updateProject(projectDetails.id, floorPlan.export(), true)
        var r = await c.saveProject(projectDetails.id);

        if (r) d.innerText = "Erfolgreich gespeichert!";
        else d.innerText = "Nicht gespeichert!";

        setTimeout(() => { d.innerText = "" }, 1000);
    } else {
        localStorage.setItem("last_project", floorPlan.export());

        localStorage.removeItem("appLK")
        askForPermision = false;
        window.open("../login/login.html?dir=" + btoa("../app/app.html?newUser=true&projectName=" + document.title), "_self")
    }
}

function createLiveshareLink() {
    if (!projectDetails) {
        localStorage.setItem("last_project", floorPlan.export());

        localStorage.removeItem("appLK")
        askForPermision = false;
        window.open("../login/login.html?dir=" + btoa("../app/app.html?newUser=true&linkCopy=true&projectName=" + document.title), "_self")
    } else {
        var textArea = document.createElement("textarea");

        // Place in the top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of the white box if rendered for any reason.
        textArea.style.background = 'transparent';


        textArea.value = location.href + "?id=" + encodeURIComponent(projectDetails.id);

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            /*
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);*/
        } catch (err) {
            //console.log('Oops, unable to copy');
        }

        document.body.removeChild(textArea);
    }
}

function listAllConnections() {
    var d = document.getElementById("connectedUsers");
    d.innerHTML = "Verbundene LiveShare Benutzer:<br>";

    var addedUsers = 0;

    for (var con of liveshareConnections) {
        if (con != null) {
            d.innerHTML += con + "<br>";
            addedUsers++;
        }
    }

    if (addedUsers == 0) {
        d.innerHTML += "0 registrierte Benutzer. <br>"
    }

    var unregiteredUsers = liveshareConnections.length - addedUsers
    if (unregiteredUsers > 1) {
        d.innerHTML += "<br> Und " + unregiteredUsers + " weitere nicht registrierte Benutzer."
    } else if (unregiteredUsers == 1) {
        d.innerHTML += "<br> Und " + unregiteredUsers + " weitere nicht registrierte Benutzer."
    }
}

//P5 BS
function preload() {
    autoLogin().then(() => {
        floorPlan.stack = [floorPlan.export()];
        floorPlan.stackIndex = 0;
    });
    nickainley = loadFont("./Muli-Regular.ttf")
}

function setup() {
    let container = "canvas-container";
    renderer = createCanvas(
        document.getElementById("canvas-container").getBoundingClientRect().width,
        500,
        WEBGL);
    renderer.parent(container);
    document.body.addEventListener('keydown', (event) => { keyPress(event) }, false);
    document.getElementById(container).addEventListener('contextmenu', function(event) {
        return event.preventDefault()
    })

    if (floorPlan == null) {
        floorPlan = new FloorplanManager();
    }

    trashPM = new PointManager([]);
    trashPM.convertToUnit = true;

    cameraPosition = {
        x: 0,
        y: 0
    }

    cam = createCamera();
    setCamera(cam);

    var preview = new p5((p) => {
        p.setup = () => {
            var tab = document.getElementById("tab2");
            var rect = tab.getBoundingClientRect();

            var pc = p.createCanvas(rect.width - 20 - 20, (rect.height - 20) / 4);
            pc.parent("previewCanvasDiv");
            window.handlepreview = p;
            setTimeout(()=>window.handlepreview.windowResized(), 1000);
        }

        p.draw = () => {
            p.background(255);

            if (floorPlan.tool == 2) {
                //Draw a copy of the hovered profile
                if (floorPlan.changingProfile == null) {
                    if (floorPlan.hoverProfile != null)  {
                        p.push();
                        p.strokeCap(p.PROJECT)
                        var avPos = floorPlan.hoverProfile.getAveragePosition();
                        var avSize = floorPlan.hoverProfile.getAverageSize();

                        var newSize = max(avSize.x, avSize.y);
                        var sc = p.height / (newSize + 50);
                        var dx = (-avSize.x / 2 - avPos.x);
                        var dy = (-avSize.y / 2 - avPos.y);
                        p.translate((p.width + avSize.x * 1.75*sc) / 2, (p.height + avSize.y * sc) / 2);
                        p.scale(1.75*sc,sc);

                        for (var part of floorPlan.hoverProfile.parts) {
                            p.push();

                            // Set the default color
                            p.stroke(part.c);
                            p.fill(part.c);
                            p.strokeWeight(part.thickness * zoomVal);

                            part.thickness = 4;

                            p.line(part.points[0].x + dx, part.points[0].y + dy, part.points[1].x + dx, part.points[1].y + dy);

                            // DESCRIPTOR
                            var text;
                            if (floorPlan.hoverProfile.type == "Straight" || floorPlan.hoverProfile.type == "End") {
                                text = String.fromCharCode((floorPlan.hoverProfile.parts.indexOf(part) + 10) % 13 + 110) + "=" +
                                    round(floorPlan.mainGeometry.grid.toUnit(part.length), 2) + floorPlan.mainGeometry.grid.unit // Name descriptor
                            } else {
                                text = String.fromCharCode((floorPlan.hoverProfile.parts.indexOf(part) + 10) % 13 + 110) // Name descriptor
                            }

                            p.push();
                            // Prepare for drawing
                            p.noStroke();
                            p.fill(part.c);
                            p.translate(part.x + dx, part.y + dy);
                            p.rotate(part.angle);

                            // Prepare text
                            p.textFont(nickainley);
                            p.textSize(15);
                            p.textAlign(CENTER, CENTER)

                            // Draw text
                            p.text(text, 0, -15);
                            p.pop();

                            p.pop();
                        }
                        p.pop();
                    }
                } else {
                    p.push();
                    p.strokeCap(p.PROJECT)
                    var avPos = floorPlan.changingProfile.getAveragePosition();
                    var avSize = floorPlan.changingProfile.getAverageSize();

                    var newSize = max(avSize.x, avSize.y);
                    var sc = p.height / (newSize + 50);
                    var dx = (-avSize.x / 2 - avPos.x);
                    var dy = (-avSize.y / 2 - avPos.y);
                    p.translate((p.width + avSize.x * 1.75*sc) / 2, (p.height + avSize.y * sc) / 2);
                    p.scale(1.75*sc,sc);

                    for (var part of floorPlan.changingProfile.parts) {
                        p.push();

                        // LINE
                        // Set the default color
                        p.stroke(part.c);
                        p.fill(part.c);
                        p.strokeWeight(part.thickness * zoomVal);

                        part.thickness = 4;

                        p.line(part.points[0].x + dx, part.points[0].y + dy, part.points[1].x + dx, part.points[1].y + dy);

                        // DESCRIPTOR
                        var text;
                        if (floorPlan.changingProfile.type == "Straight" || floorPlan.changingProfile.type == "End") {
                            text = String.fromCharCode((floorPlan.changingProfile.parts.indexOf(part) + 10) % 13 + 110) + "=" +
                                round(floorPlan.mainGeometry.grid.toUnit(part.length), 2) + floorPlan.mainGeometry.grid.unit // Name descriptor
                        } else {
                            text = String.fromCharCode((floorPlan.changingProfile.parts.indexOf(part) + 10) % 13 + 110) // Name descriptor
                        }

                        p.push();
                        // Prepare for drawing
                        p.noStroke();
                        p.fill(part.c);
                        p.translate(part.x + dx, part.y + dy);
                        p.rotate(part.angle);

                        // Prepare text
                        p.textFont(nickainley);
                        p.textSize(15);
                        p.textAlign(CENTER, CENTER)

                        // Draw text
                        p.text(text, 0, -15);
                        p.pop();

                        p.pop();
                    }
                    p.pop();
                }
            }
        }

        p.windowResized = () => {
            var tab = document.getElementById("tab2");
            var rect = tab.getBoundingClientRect();

            p.resizeCanvas(rect.width - 20 - 20, (rect.height - 20) / 4);
        }
    })
}

function draw() {
    background("white");

    // 3D
    if (floorPlan.tool == 3) {
        zoomVal = 1;
        scale(zoomVal);
        orbitControl(1, 1);

        document.getElementById("export3D").style.display = "inline";

        push()
        translate(-width / 2, -height / 2);
        floorPlan.draw();
        pop();
    } else { // 2D
        camera(0, 0, (height / 2.0) / tan(PI * 30.0 / 180.0), 0, 0, 0, 0, 1, 0);
        document.getElementById("export3D").style.display = "none";

        translate(-width / 2 + cameraPosition.x, -height / 2 + cameraPosition.y);
        scale(zoomVal, zoomVal)

        floorPlan.draw();
    }
}

function mouseWheel(event) {
    if (event.target == document.getElementById("defaultCanvas0")) {
        var mP = mousePos();
        if (event.delta < 0) {
            zoom("in", .1, mP.x, mP.y);
        } else {
            zoom("out", .1, mP.x, mP.y)
        }

        event.preventDefault();
    }
}

function mousePressed(event) {
    if (event.target == document.getElementById("defaultCanvas0")) {
        if (event.which == 2) {
            movingOnCanvas = true;
        } else {
            if (floorPlan.sendData || !floorPlan.receiveData) floorPlan.mousePressed(event);
        }
        event.preventDefault();
    }
}

function mouseDragged(event) {
    if (event.target == document.getElementById("defaultCanvas0")) {
        if (movingOnCanvas) {
            cameraPosition.x += event.movementX;
            cameraPosition.y += event.movementY;
        } else {
            if (floorPlan.sendData || !floorPlan.receiveData) floorPlan.mouseDragged();
        }
        event.preventDefault();
    }
}

function mouseReleased(event) {
    if (event.target == document.getElementById("defaultCanvas0")) {
        if (movingOnCanvas) movingOnCanvas = false;
        else {
            if (floorPlan.sendData || !floorPlan.receiveData) floorPlan.mouseReleased();
        }
        window.handlepreview.windowResized()
        event.preventDefault();
    }
}

function keyPress(e) {
    keyCode = e.keyCode;
    if ((e.key == 's' || e.key == 'S') && (e.ctrlKey || e.metaKey)) {
        saveProject();
        e.preventDefault();
        return false;
    } else if (floorPlan.sendData || !floorPlan.receiveData) floorPlan.keyPressed();
}

function windowResized() {
    resizeCanvas(document.getElementById("canvas-container").getBoundingClientRect().width,
        500);
}