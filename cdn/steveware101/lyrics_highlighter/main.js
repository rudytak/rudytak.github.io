Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

/*
Output XML format:

Karaoke 
    Artist
    Copyright
    Format
    Genre
    Label
    Title
    Writers
    Id

    Pages[]
        Page
            StartTime
            PresentTime
            EndTime
            ClearTime
            Type (Title/Instructions/Lyrics)

            Paragraphs[]
                Block xsi:type="TextBlock"
                    Lines[]
                        Line
                            Text
                            Voice

                            Highlights[]
                                Highlight
                                    Character
                                    Time
                                    Type (Empty/Full)
*/

class Line {
    #Voice = 0;
    #Text = ""

    #StartTime = -1.0;
    #EndTime = 1e6;

    get is_active() {
        return !(this.#StartTime == this.#EndTime && this.#StartTime == -1)
    }

    constructor(TextDef) {
        this.DOM_element = document.createElement("div");
        this.DOM_element.classList.add("line")
        this.DOM_element.setAttribute("start_time", "--:--")
        this.DOM_element.setAttribute("end_time", "--:--")

        // Dispatch click events to the handler
        this.DOM_element.addEventListener("click", (ev) => {
            document.dispatchEvent(new CustomEvent("line_click", {detail: {target_line: this}}))
        })

        this.Text = TextDef;

        this.highligh_timings = []
    }

    // Timing

    get Duration() {
        return this.EndTime - this.StartTime;
    }

    get StartTime() {
        return this.#StartTime;
    }

    set StartTime(time_s) {
        // Time checking
        if (time_s > this.EndTime) {
            console.warn(`Attempt to set invalid StartTime on Line: ${time_s}. Maximum allowed is ${this.EndTime}`);
            time_s = this.EndTime;
        }

        this.#StartTime = time_s;
        this.DOM_element.setAttribute("start_time", this.#StartTime.toFixed(2) + "s")
        this.DOM_element.style.opacity = 1;

        if (this.#StartTime == this.#EndTime && this.#StartTime < 0) {
            // line is toggled off
            this.DOM_element.setAttribute("start_time", "xx:xx")
            this.DOM_element.setAttribute("end_time", "xx:xx")
            this.DOM_element.style.opacity = 0.5;
        }

        this.reset_highlights_timings()
    }

    get EndTime() {
        return this.#EndTime;
    }

    set EndTime(time_s) {
        // Time checking
        if (time_s < this.StartTime) {
            console.warn(`Attempt to set invalid EndTime on Line: ${time_s}. Minimum allowed is ${this.StartTime}`);
            time_s = this.StartTime;
        }

        this.#EndTime = time_s;
        this.DOM_element.setAttribute("end_time", this.#EndTime.toFixed(2) + "s")
        this.DOM_element.setAttribute("start_time", this.#StartTime.toFixed(2) + "s")
        this.DOM_element.style.opacity = 1;

        if (this.#StartTime == this.#EndTime && this.#StartTime < 0) {
            // line is toggled off
            this.DOM_element.setAttribute("start_time", "xx:xx")
            this.DOM_element.setAttribute("end_time", "xx:xx")
            this.DOM_element.style.opacity = 0.5;
        }

        this.reset_highlights_timings()
    }

    // Props

    get Text() {
        return this.#Text;
    }

    set Text(value) {
        if (value != this.#Text) {
            this.DOM_element.innerHTML = value;
            this.#Text = value;

            this.reset_highlights_timings()
        }
    }

    get Voice() {
        return this.#Voice;
    }

    set Voice(value) {
        if (value >= 0 && value < XML_Lyrics_Handler.MAX_VOICES) {
            this.#Voice = value;

            this.DOM_element.style.setProperty("--col", XML_Lyrics_Handler.highlightColors[value])
        }
    }

    // Highlighs
    reset_highlights_timings() {
        this.highligh_timings = []

        // add start and end point
        let words = this.#Text.split(" ")
        let glob_len_counter = 0
        for (let w = 0; w < words.length; w++) {
            let word = words[w]

            // start
            this.highligh_timings.push(
                { c: glob_len_counter, t: this.#StartTime + (this.#EndTime - this.#StartTime) * glob_len_counter / this.#Text.length, type: "Empty" }
            );

            glob_len_counter += word.length;

            // end
            this.highligh_timings.push(
                { c: glob_len_counter, t: this.#StartTime + (this.#EndTime - this.#StartTime) * glob_len_counter / this.#Text.length, type: "Full" }
            );

            glob_len_counter += 1;
        }
    }

    toXML() {
        if (this.#EndTime == this.#StartTime && this.#EndTime == -1) {
            return ""
        }

        return `
            <Line>
              <Voice>${this.Voice}</Voice>
              <Text>${this.Text}</Text>
              <Highlights>
                ${this.highligh_timings.map(highlight => {
            return `
                            <Highlight>
                                <Character>${highlight.c}</Character>
                                <Time>${highlight.t}</Time>
                                <Type>${highlight.type}</Type>
                            </Highlight>
                        `
        }).join("\n")
            }
              </Highlights>
            </Line>
        `
    }

    // destructor
    destroy(){
        this.DOM_element.remove()
    }
}

class Page {
    // Private fields
    #StartTime = -1.0;
    #RampUpTime = 0.0;
    #RampDownTime = 0.0;
    #EndTime = 1e6;
    #Type = "Lyrics" // Title/Instructions/Lyrics

    constructor() {
        this.DOM_element = document.createElement("div");
        this.DOM_element.classList.add("page")

        this.create_wrapper();
        this.rows;

        this.lines = []
    }

    // Timing
    get Duration() {
        return this.EndTime - this.StartTime;
    }

    get StartTime() {
        return this.#StartTime;
    }

    get MaxStartTime() {
        return this.EndTime - this.RampDownTime - this.RampUpTime;
    }

    set StartTime(time_s) {
        // Time checking
        if (time_s > this.MaxStartTime) {
            console.warn(`Attempt to set invalid StartTime: ${time_s}. Maximum allowed is ${this.MaxStartTime}`);
            time_s = this.MaxStartTime;
        }

        this.#StartTime = time_s;
    }

    get RampUpTime() {
        return this.#RampUpTime;
    }

    get MaxRampUpTime() {
        return this.Duration - this.RampDownTime;
    }

    set RampUpTime(time_s) {
        if (time_s > this.MaxRampUpTime) {
            console.warn(`Attempt to set invalid RampUpTime: ${time_s}. Maximum allowed is ${this.MaxRampUpTime}`);
            time_s = this.MaxRampUpTime;
        }

        this.#RampUpTime = time_s;
    }

    get PresentTime() {
        return this.StartTime + this.RampUpTime;
    }

    get RampDownTime() {
        return this.#RampDownTime;
    }

    get MaxRampDownTime() {
        return this.Duration - this.RampUpTime;
    }

    set RampDownTime(time_s) {
        if (time_s > this.MaxRampDownTime) {
            console.warn(`Attempt to set invalid RampDownTime: ${time_s}. Maximum allowed is ${this.MaxRampDownTime}`);
            time_s = this.MaxRampDownTime;
        }

        this.#RampDownTime = time_s;
    }

    get ClearTime() {
        return this.EndTime - this.RampDownTime;
    }

    get EndTime() {
        return this.#EndTime;
    }

    get MinEndTime() {
        return this.StartTime + this.RampUpTime + this.RampDownTime;
    }

    set EndTime(time_s) {
        // Time checking
        if (time_s < this.MinEndTime) {
            console.warn(`Attempt to set invalid EndTime: ${time_s}. Minimum allowed is ${this.MinEndTime}`);
            time_s = this.MinEndTime;
        }

        this.#EndTime = time_s;
    }

    // Type
    get Type() {
        return this.#Type;
    }

    set Type(page_type) {
        // Only allow specific page types
        if (!["Title", "Instructions", "Lyrics"].includes(page_type)) {
            console.warn(`Attempt to set invalid page type: ${page_type}`)
            return
        }

        this.#Type = page_type;
    }

    // Timings
    gen_auto_timings() {
        let min_t = Math.min(...this.lines.filter(l => l.is_active).map(l => l.StartTime))
        let max_t = Math.max(...this.lines.filter(l => l.is_active).map(l => l.EndTime))

        this.StartTime = min_t - this.RampUpTime;
        this.EndTime = max_t + this.RampDownTime;
    }

    // DOM
    create_wrapper() {
        this.DOM_element = document.createElement("div");
        this.DOM_element.classList.add("page");
    }

    add_line(line) {
        this.lines.push(line);

        this.DOM_element.appendChild(line.DOM_element)
    }

    // XML output
    toXML() {
        return `
            <Page>
                <Type>${this.Type}</Type>
                <StartTime>${this.StartTime}</StartTime>
                <PresentTime>${this.PresentTime}</PresentTime>
                <ClearTime>${this.ClearTime}</ClearTime>
                <EndTime>${this.EndTime}</EndTime>

                <Paragraphs>
                    <Block xsi:type="TextBlock">
                        <Lines>
                            ${this.lines.map(el => el.toXML()).join("\n")}
                        </Lines>
                    </Block>
                </Paragraphs>
            </Page>
        `
    }

    // destructor
    destroy(){
        this.lines.forEach(l=>l.destroy())
        this.DOM_element.remove()
    }

}

class XML_Lyrics_Handler {
    static MAX_VOICES = 9;
    static VOICE_TRIGGERS = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
    static highlightColors = [
        "#FFFFFF",
        "#FFB3BA", // soft pastel red
        "#FFDFBA", // light peach
        "#FFFFBA", // pale yellow
        "#BAFFC9", // mint green
        "#BAE1FF", // light sky blue
        "#E0BAFF", // lavender
        "#FFD6E0", // pink blush
        "#C8F7C5"  // light pastel green
    ];

    constructor() {
        this.DOM_element = document.querySelector("main");
        this.player;
        this.audio_speed = document.getElementById("audio_speed");

        this.cursor = document.createElement("div")
        this.cursor_line_id = 0;
        this.cursor.classList.add("cursor")
        this.cursor.style.display = "none";
        this.DOM_element.appendChild(this.cursor)

        this.pages = []

        this.audio_file = "";
        this.lyrics_text = "";

        // File events
        document.getElementById("files_Lyrics").addEventListener("change", this.lyrics_load.bind(this))
        document.getElementById("files_Audio").addEventListener("change", this.audio_load.bind(this))

        setTimeout(() => {
            this.lyrics_load({
                target: document.getElementById("files_Lyrics")
            })

            this.audio_load({
                target: document.getElementById("files_Audio")
            })
        }, 1)

        // Player events
        this.audio_speed.addEventListener("change", (ev) => {
            this.player.playbackRate = parseFloat(ev.target.value)
        })

        // Line events
        document.addEventListener("line_click",
            this.handle_line_click.bind(this)
        )

        // Voices
        document.getElementById("voices_add").addEventListener("click", this.add_voice.bind(this));

        // Keyboard events

        this.key_states = {}
        document.addEventListener("keydown", (ev) => {
            let key = ev.key.toUpperCase()

            if (ev.target.tagName == "INPUT") return;

            if (this.key_states[key] == undefined)
                this.key_states[key] = false;

            if (!this.overlay_opened) {
                if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(ev.code) > -1) {
                    ev.preventDefault();
                }
            }

            if (!this.key_states[key])
                this.key_start_hold_callback(key);
            this.key_states[key] = true;
        })

        document.addEventListener("keyup", (ev) => {
            let key = ev.key.toUpperCase()

            if (ev.target.tagName == "INPUT") return;

            if (this.key_states[key] == undefined)
                this.key_states[key] = true;

            if (!this.overlay_opened) {
                if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(ev.code) > -1) {
                    ev.preventDefault();
                }
            }

            if (this.key_states[key])
                this.key_end_hold_callback(key);
            this.key_states[key] = false;
        })

        this.assigning_voice = {};
        this.voice_assign_start = {};
    }

    add_page(page) {
        this.pages.push(page);

        this.DOM_element.appendChild(page.DOM_element)
    }

    // Voices 

    get active_voice_triggers() {
        return Array.from(document.querySelectorAll("#voices_table tbody tr > td:nth-child(4)")).map(el => el.innerText)
    }

    get active_voices() {
        return Array.from(document.querySelectorAll("#voices_table tbody tr > td:nth-child(2)")).map(el => el.innerText || el.querySelector("input").value)
    }

    update_voice_ids() {
        document.querySelectorAll("#voices_table tbody tr > td:nth-child(1)").forEach((el, key, par) => {
            el.innerText = key;
        })

        document.querySelectorAll("#voices_table tbody tr > td:nth-child(4)").forEach((el, key, par) => {
            el.innerText = XML_Lyrics_Handler.VOICE_TRIGGERS[key];
            el.style.color = XML_Lyrics_Handler.highlightColors[key];
        })
    }

    add_voice() {
        let len = document.querySelectorAll("#voices_table tbody tr").length
        if (len >= XML_Lyrics_Handler.MAX_VOICES) {
            alert("No more voices allowed!")
            return;
        }

        let row = document.createElement("tr")
        row.innerHTML = `
            <td></td>
            <td><input type="text" class="voices_name" placeholder="Voice Name"></td>
            <td><button class="voices_remove">-</button></td>
            <td>${XML_Lyrics_Handler.VOICE_TRIGGERS[len]}</td>
        `
        document.querySelectorAll("#voices_table tbody")[0].appendChild(row);
        row.querySelectorAll("button")[0].addEventListener("click", this.remove_voice.bind(this))

        this.update_voice_ids();
    }

    remove_voice(el) {
        el.target.parentElement.parentElement.remove();

        this.update_voice_ids();
    }

    key_start_hold_callback(key) {
        document.querySelectorAll("#voices_table tbody tr > td:nth-child(4)").forEach(el => {
            if (el.innerText == key) {
                el.style.fontWeight = "bold";
            }
        })

        if (key == "ESCAPE") {
            this.close_overlay();
        }

        if (this.overlay_opened) return

        if (key == " "){
            if (this.player.paused){
                this.player.play()
            }else{
                this.player.pause()
            }
        }

        if (key == "ARROWDOWN") {
            // Skip line
            this.cursor_to(this.cursor_line_id + 1);
        }

        if (key == "ARROWUP") {
            // Skip line
            this.cursor_to(this.cursor_line_id - 1);
        }

        if (key == "R") {
            this.current_line.EndTime = 1e6;
            this.current_line.StartTime = -1;
            this.current_line.Voice = 0;
            this.current_line.DOM_element.setAttribute("start_time", "--:--")
            this.current_line.DOM_element.setAttribute("end_time", "--:--")
        }

        if (key == "T") {
            this.current_line.Voice = 0;
            this.current_line.StartTime = -1;
            this.current_line.EndTime = -1;

            this.cursor_to(this.cursor_line_id + 1);
        }

        // key check
        if (!this.active_voice_triggers.includes(key)) return;

        // do not assign multiple voices at the same time
        if (this.is_assigning_voice) return

        // start the voice assigning process
        this.assigning_voice[key] = true;
        if (this.player.paused) {
            this.player.play();
        }

        this.voice_assign_start[key] = this.player.currentTime;

        this.current_line.EndTime = 1e6;

        this.current_line.DOM_element.setAttribute("start_time", "--:--")
        this.current_line.DOM_element.setAttribute("end_time", "--:--")

        this.current_line.StartTime = this.voice_assign_start[key];
        this.current_line.Voice = XML_Lyrics_Handler.VOICE_TRIGGERS.indexOf(key)
    }

    key_end_hold_callback(key) {
        document.querySelectorAll("#voices_table tbody tr > td:nth-child(4)").forEach(el => {
            if (el.innerText == key) {
                el.style.fontWeight = "normal";
            }
        })

        // key check
        if (!this.active_voice_triggers.includes(key)) return;

        if (this.overlay_opened) return

        // the voice assigning process wasn't started correctly
        if (this.assigning_voice[key] == undefined) return;
        if (this.voice_assign_start[key] == undefined) return;

        this.assigning_voice[key] = false;
        let voice_assign_end = this.player.currentTime;

        // The start cannot come after the end
        if (voice_assign_end < this.voice_assign_start[key]) return;

        this.current_line.EndTime = voice_assign_end;
        this.current_line.StartTime = this.voice_assign_start[key];

        this.cursor_to(this.cursor_line_id + 1);
    }

    // Lyrics

    async lyrics_load(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith(".txt")) return;

        this.cursor.style.display = "block";

        this.lyrics_text = await file.text(); // works for txt and rtf
        this.parse_lyrics(this.lyrics_text.trim())
    }

    async audio_load(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Create a temporary object URL
        this.audio_file = URL.createObjectURL(file);

        this.player = document.querySelector("audio");
        this.player.src = this.audio_file;
        this.player.play();
    }

    parse_lyrics(lyrics_text) {
        // clear old pages
        this.pages.forEach(p=>p.destroy())
        this.pages = []

        lyrics_text = lyrics_text.replaceAll("\r\n", "\n").replaceAll("\r", "\n")
        let page_texts = lyrics_text.split("\n\n")

        for (let pt of page_texts) {
            let page = new Page();

            let line_texts = pt.split("\n")

            for (let lt of line_texts) {
                lt = lt.trim()

                if (lt != "") {
                    let line = new Line(lt)
                    page.add_line(line)
                }
            }
            this.add_page(page);
        }
    }

    // Cursor

    get current_line() {
        return this.all_lines[this.cursor_line_id];
    }

    get all_lines() {
        return this.pages.map(el => el.lines).reduce((a, b) => [...a, ...b], [])
    }

    cursor_to(line_id) {
        line_id = line_id.clamp(0, this.all_lines.length - 1)
        this.cursor_line_id = line_id;

        let dY = this.all_lines[line_id].DOM_element.getBoundingClientRect().y - this.all_lines[0].DOM_element.getBoundingClientRect().y
        this.cursor.style.transform = `translateY(${dY}px)`


        let line_pos = this.current_line.DOM_element.getBoundingClientRect().y
        if (line_pos < 20 || line_pos > window.innerHeight - 20) {
            window.scrollTo({ left: 0, top: line_pos + window.scrollY, behavior: "smooth" });
        }
    }

    get is_assigning_voice() {
        for (let key in this.assigning_voice) {
            if (this.assigning_voice[key]) {
                return true
            }
        }

        return false
    }

    handle_line_click(ev) {
        let line = this.all_lines.filter(el => el.DOM_element == ev.detail.target_line.DOM_element)
        if (line.length != 1)
            return

        // Do not respond to line clicks when voice is recorded
        if (this.is_assigning_voice) return

        line = line[0]
        let line_id = this.all_lines.indexOf(line);

        if (this.current_line != line) {
            // first click
            this.cursor_to(line_id)
        } else {
            // begin edit
            this.open_overlay();
        }
    }

    // Overlay

    get overlay_opened() {
        return !Array.from(document.getElementById("editorOverlay").classList).includes("hidden");
    }

    // Per line edits and timing
    open_overlay() {
        document.getElementById("editorOverlay").classList.remove("hidden");
    }

    close_overlay() {
        if (Array.from(document.getElementById('editorOverlayPage1').classList).includes("hidden")) {
            document.getElementById('editorOverlayPage1').classList.remove('hidden');
            document.getElementById('editorOverlayPage2').classList.add('hidden');
            document.getElementById('editorOverlayPage3').classList.add('hidden');
        } else {
            document.getElementById("editorOverlay").classList.add("hidden");
        }
    }

    // XML export

    toXML() {
        for (let p of this.pages) {
            p.gen_auto_timings();
        }

        if (document.getElementById("rulecheck").checked){
            // Start and end timings
            if (this.pages[0].StartTime < 5) {
                alert("First page must start at least 5s after the start of the song!")
                return
            }
    
            if (this.pages[this.pages.length - 1].EndTime > this.player.duration - 0) {
                alert("Last page must end before the end of the song!")
                return
            }
    
            // Line checks
            for (let line of this.all_lines) {
                // ignored lines are okay
                if (line.StartTime == line.EndTime && line.EndTime == -1) continue;
    
                // non-ignored lines that have not been filled are not okay
                if (line.StartTime == -1 || line.EndTime == 1e6) {
                    alert(`The line "${line.Text}" has not been correctly assigned!`)
                    return
                }
            }
    
            // Page checks
            for (var i = 0; i < this.pages.length - 1; i++) {
                if (this.pages[i].EndTime > this.pages[i + 1].StartTime) {
                    alert(`The pages ${i} and ${i + 1} are overlapping in time and should be more spread out!`)
                    return
                }
            }
        }

        return `<?xml version="1.0" encoding="iso-8859-15"?> 
            <Karaoke xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <Artist>${document.getElementById("meta_Artist").value}</Artist>
                <Copyright>${document.getElementById("meta_Copyright").value}</Copyright>
                <Format>${document.getElementById("meta_Format").value}</Format>
                <Genre>${document.getElementById("meta_Genre").value}</Genre>
                <Label>${document.getElementById("meta_Label").value}</Label>
                <Title>${document.getElementById("meta_Title").value}</Title>
                <Writers>${document.getElementById("meta_Writers").value}</Writers>

                <Pages>
                    <Page>
                        <ClearTime>2.25</ClearTime>
                        <PresentTime>0.5</PresentTime>
                        <StartTime>0.5</StartTime>
                        <EndTime>2.25</EndTime>
                        <Paragraphs />
                        <Type>Title</Type>
                    </Page>
                    <Page>
                        <ClearTime>5</ClearTime>
                        <PresentTime>2.5</PresentTime>
                        <StartTime>2.5</StartTime>
                        <EndTime>5</EndTime>
                        <Paragraphs>
                            <Block xsi:type="TextBlock">
                            <Lines>
                                ${this.active_voices.map(
            (text, id) => {
                return `
                                                <Line>
                                                <Text>${text}</Text>
                                                <Voice>${id}</Voice>
                                                </Line>
                                            `
            }
        )
            }
                            </Lines>
                            </Block>
                        </Paragraphs>
                        <Type>Instruction</Type>
                    </Page>
                    
                    ${this.pages.map(p => p.toXML()).join("\n")}

                    ${
                    // // END TITLE/CREDITS
                    // <Page>
                    //     <ClearTime>${LH.player.duration}</ClearTime>
                    //     <PresentTime>${LH.player.duration - 7}</PresentTime>
                    //     <StartTime>${LH.player.duration - 10}</StartTime>
                    //     <EndTime>${LH.player.duration}</EndTime>
                    //     <Paragraphs />
                    //     <Type>Title</Type>
                    // </Page>
                    ""
                    }
                </Pages>
            </Karaoke>
        `
    }

    download_XML(data, filename, type = 'text/plain') {
        data = this.toXML()
        if (data == undefined) return;

        filename = document.getElementById("meta_Title").value + "_lyrics.xml"

        var file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}