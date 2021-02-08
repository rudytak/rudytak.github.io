var slider1, slider2, slider3, _text, check, foot, textDiv;
var divisor = 9.328;

var infoDivOverBool = false;
var infoDivOverAboutVal = 40;
var infoDivOverContactsVal = 50;
var infoDivOverDivVal = 40;
var infoDivAnimStartTime;

slider1 = document.getElementById('myRange1');
slider2 = document.getElementById('myRange2');
slider3 = document.getElementById('myRange3');
textDiv = document.getElementsByClassName("RealText")[0];
_text = textDiv.getElementsByTagName("span")[0];
check = document.getElementById("myCheck");
foot = document.getElementsByClassName("foot")[0];
footText = foot.getElementsByTagName("span")[0];

function infoDivOver() {
    infoDivOverAboutVal = about.style.left.slice(0, -1);
    infoDivOverContactsVal = contacts.style.left.slice(0, -1);
    infoDivOverDivVal = infoDiv.style.height.slice(0, -2);

    infoDivOverBool = !infoDivOverBool;
    infoDivAnimStartTime = new Date().getTime();
}

infoDiv = document.getElementsByClassName("info")[0];
about = infoDiv.getElementsByClassName("about")[0];
contacts = infoDiv.getElementsByClassName("contacts")[0];

var _update = function(e) {
    if (check.checked) {
        slider1.value = calcMouthOpen([100, 1000])
        slider2.value = calcEyebrowHeight([50, 151])
        slider3.value = calcHappy([0, 10])
    }
    _text.style["font-weight"] = `${ slider1.value }`;
    _text.style["transform"] = `scale(${ slider2.value/100 },1)`;
    _text.style["font-variation-settings"] = `'slnt' ${ -slider3.value }`;

    textFit(_text, { alignHoriz: true, alignVert: true, multiLine: true, maxFontSize: innerWidth / divisor })
    _text.getElementsByTagName("span")[0].setAttribute("contenteditable", "true");
    /*if (_text.getElementsByTagName("span")[0].innerHTML == "") {
        _text.getElementsByTagName("span")[0].innerHTML = "";
    }*/

    foot.style["top"] = innerHeight - 48;
    footText.style.top = (48 - 19) / 2;

    var currT = new Date().getTime();
    if (currT < infoDivAnimStartTime + 600) {
        if (infoDivOverBool) {
            about.style.left = l((infoDivAnimStartTime + 600 - currT) / 600, -27, infoDivOverAboutVal, true) + "%";
            contacts.style.left = l((infoDivAnimStartTime + 600 - currT) / 600, 27, infoDivOverContactsVal, true) + "%";
            infoDiv.style.height = l((infoDivAnimStartTime + 600 - currT) / 600, innerHeight - 48, infoDivOverDivVal, true) + "px";
        } else {
            about.style.left = l((infoDivAnimStartTime + 600 - currT) / 600, -7.5, infoDivOverAboutVal, true) + "%";
            contacts.style.left = l((infoDivAnimStartTime + 600 - currT) / 600, 7.5, infoDivOverContactsVal, true) + "%";
            infoDiv.style.height = l((infoDivAnimStartTime + 600 - currT) / 600, 40, infoDivOverDivVal, true) + "px";
        }
    } else {
        if (infoDivOverBool) {
            about.style.left = "-27%";
            contacts.style.left = "27%";
            infoDiv.style.height = innerHeight - 48 + "px";
        } else {
            about.style.left = "-7.5%";
            contacts.style.left = "7.5%";
            infoDiv.style.height = "40px";
        }
    }
}

function l(x, y, z) {
    if (x > 1) {
        x = 1;
    } else if (x < 0) {
        x = 0;
    }

    return lerp(y, z, s(x));
}

function s(x) {
    return (1 / (1 + Math.pow(x / (1 - x), -2)));
}

setInterval(_update, 1000 / 60)