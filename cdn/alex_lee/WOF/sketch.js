const CANV_SLIDERS = []
class CanvSlider {
    constructor(x, y, w, val = 5, step = 0.1, min = 0, max = 10) {
        // position
        this._x = x;
        this._y = y;
        this._w = w;

        // props
        this.value = val;
        this.min = min;
        this.max = max;
        this.step = step;

        // STYLING
        this.rail_thickness = 5;
        this.rail_bg = "#d0d0d7";
        this.rail_outline_thickness = 1;
        this.rail_outline = "#85858a";

        this.rail_full_bg = "#2374ff"
        this.rail_full_outline = "#3e90ff";

        this.head_bg = "#484851"
        this.head_hover_bg = "#383840"
        this.head_outline = "#ffffff"
        this.head_hover_outline = "#dddddd"
        this.head_outline_thickness = 3;
        this.head_radius = 10;

        this.write_value = true;
        this.value_breakpoints = [
            [0.2, "red"],
            [0.4, "orange"],
            [0.85, "lime"],
            [1, "gold"],
        ]

        // actions
        this.hidden = false;
        this.hovered = false;
        this.pressed = false;

        // events
        this.event_handlers = {}

        CANV_SLIDERS.push(this)
    }

    get longest_text() {
        push()
        textSize(this.head_radius * 2)
        let v = Math.max(textWidth(this.max.toFixed(1)), textWidth(this.min.toFixed(1)));
        pop()
        return v
    }

    get x() {
        if (this.write_value) {
            return this._x + this.longest_text;
        }
        return this._x;
    }

    get y() {
        return this._y - this.rail_thickness / 2;
    }

    get w() {
        if (this.write_value) {
            return this._w - this.longest_text;
        }
        return this._w;
    }

    // STATIC METHODS

    static drawAll() {
        for (var slider of CANV_SLIDERS) {
            slider.draw();
        }
    }

    static onPressAll(event) {
        for (var slider of CANV_SLIDERS) {
            slider.onPress(event);
        }
    }

    static onReleaseAll(event) {
        for (var slider of CANV_SLIDERS) {
            slider.onRelease(event);
        }
    }

    static onDraggedAll(event) {
        for (var slider of CANV_SLIDERS) {
            slider.onDragged(event);
        }
    }

    static hideAll() {
        for (var slider of CANV_SLIDERS) {
            slider.hide();
        }
    }

    // NON_STATIC METHODS

    destroy() {
        const index = CANV_SLIDERS.indexOf(this);
        CANV_SLIDERS.splice(index, 1);
    }

    checkHover() {
        if (this.hidden) {
            this.hovered = false;
            return
        }

        this.hovered = dist(
            this.x + this.w * (this.value - this.min) / (this.max - this.min),
            this.y,
            mouseX,
            mouseY
        ) <= this.head_radius
    }

    position(x = undefined, y = undefined, w = undefined) {
        if (x) {
            this._x = x;
        }
        if (y) {
            this._y = y;
        }
        if (w) {
            this._w = w;
        }
    }

    hide() {
        this.hidden = true;
    }
    unhide() {
        this.hidden = false;
    }

    // DISPLAY

    draw() {
        if (this.hidden) {
            return;
        }
        this.checkHover()

        // RAIL BACKGROUND
        push()
        stroke(this.rail_outline)
        strokeWeight(this.rail_outline_thickness)
        fill(this.rail_bg)

        rectMode(CORNER)
        rect(
            this.x,
            this.y,
            this.w,
            this.rail_thickness,
            this.rail_thickness / 2
        )
        pop()

        // RAIL FULL PART
        push()
        stroke(this.rail_full_outline)
        strokeWeight(this.rail_outline_thickness)
        fill(this.rail_full_bg)

        rectMode(CORNER)
        rect(
            this.x,
            this.y,
            this.w * (this.value - this.min) / (this.max - this.min),
            this.rail_thickness,
            this.rail_thickness / 2
        )
        pop()

        // HEAD
        push()
        stroke(this.hovered ? this.head_hover_outline : this.head_outline)
        strokeWeight(this.head_outline_thickness)
        fill(this.hovered ? this.head_hover_bg : this.head_bg)

        ellipse(
            this.x + this.w * (this.value - this.min) / (this.max - this.min),
            this._y,
            2 * this.head_radius
        )
        pop()

        // draw the value as text
        push()
        if (this.write_value) {
            noStroke()

            for (let breakpoint of this.value_breakpoints) {
                if (this.value <= (this.min + (this.max - this.min) * breakpoint[0])) {
                    fill(breakpoint[1])
                    break;
                }
            }

            textAlign(CENTER, CENTER)
            textSize(this.head_radius * 2)
            let l_t = this.longest_text
            text(this.value.toFixed(1), this.x - l_t, this.y, l_t)
        }
        pop()
    }

    // EVENT INTERACTION

    onPress(event) {
        this.checkHover()

        if (this.hovered) {
            this.pressed = true;
        }
    }

    onRelease(event) {
        this.pressed = false;
    }

    onDragged(event) {
        if (this.pressed) {
            this.value = Math.round(
                (constrain((mouseX - this.x) / (this.w), 0, 1) * (this.max - this.min) + this.min) / this.step
            ) * this.step

            this.runHandlers("change");
        }
    }

    // events
    addEventListener(event_type, handler) {
        let id = Math.random().toString(16).split(".")[1] + Date.now()
        if (!this.event_handlers[event_type]) {
            this.event_handlers[event_type] = {}
        }

        this.event_handlers[event_type][id] = handler;
        return id;
    }
    runHandlers(event_type) {
        if (this.event_handlers[event_type]) {
            for (let handler_id in this.event_handlers[event_type]) {
                this.event_handlers[event_type][handler_id](this);
            }
        }
    }
    deleteEventListener(event_type, id) {
        delete this.event_handlers[event_type][id];
    }
}

const CANV_BUTTONS = []
class CanvButton {
    constructor(x, y, text, fontSize = 12) {
        // position
        this.x = x;
        this.y = y;

        // props
        this.text = text;
        this.fS = fontSize;
        this.padding = 5;
        this.rounding = 10;

        // colors
        this.bg = 255;
        this.hover_bg = 192;
        this.outline = "gray";
        this.outline_thickness = 5;

        // actions
        this.hidden = false;
        this.hovered = false;
        this.pressed = false;

        // events
        this.event_handlers = {}

        CANV_BUTTONS.push(this)
    }

    get w() {
        push()
        textSize(this.fS)
        let v = textWidth(this.text);
        pop()

        return v + 2 * this.padding;
    }

    get h() {
        return this.fS + 2 * this.padding;
    }

    // STATIC METHODS

    static hideAll() {
        for (var btn of CANV_BUTTONS) {
            btn.hide();
        }
    }

    static drawAll() {
        for (var btn of CANV_BUTTONS) {
            btn.draw();
        }
    }

    static onPressAll(event) {
        for (var btn of CANV_BUTTONS) {
            btn.onPress(event);
        }
    }

    static onReleaseAll(event) {
        for (var btn of CANV_BUTTONS) {
            btn.onRelease(event);
        }
    }

    static onDraggedAll(event) {
        for (var btn of CANV_BUTTONS) {
            btn.onDragged(event);
        }
    }

    // NON_STATIC METHODS

    destroy() {
        const index = CANV_BUTTONS.indexOf(this);
        CANV_BUTTONS.splice(index, 1);
    }

    checkHover() {
        if (this.hidden) {
            this.hovered = false;
            return
        }
        this.hovered = ((this.y <= mouseY + this.h / 2) && (mouseY < this.y + this.h / 2) && (this.x <= mouseX + this.w / 2) && (mouseX < this.x + this.w / 2));
    }

    hide() {
        this.hidden = true;
    }
    unhide() {
        this.hidden = false;
    }

    position(x = undefined, y = undefined) {
        if (x) {
            this.x = x;
        }
        if (y) {
            this.y = y;
        }
    }

    // DISPLAY

    draw() {
        if (this.hidden) {
            return;
        }
        this.checkHover()

        push();
        stroke(this.outline);
        fill(this.hovered ? this.hover_bg : this.bg);
        strokeWeight(this.outline_thickness);
        rect(this.x, this.y, this.w, this.h, min(this.w, this.h) / 6)

        fill(0);
        noStroke();
        textSize(this.fS);
        text(this.text, this.x, this.y - this.outline_thickness);
        pop();
    }

    // EVENT INTERACTION

    onPress(event) {
        this.checkHover()

        if (this.hovered) {
            this.pressed = true;
        }
    }

    onRelease(event) {
        if (this.pressed) {
            this.runHandlers("click");
        }
        this.pressed = false;
    }

    onDragged(event) { }

    // events
    addEventListener(event_type, handler) {
        let id = Math.random().toString(16).split(".")[1] + Date.now()
        if (!this.event_handlers[event_type]) {
            this.event_handlers[event_type] = {}
        }

        this.event_handlers[event_type][id] = handler;
        return id;
    }
    runHandlers(event_type) {
        if (this.event_handlers[event_type]) {
            for (let handler_id in this.event_handlers[event_type]) {
                this.event_handlers[event_type][handler_id](this);
            }
        }
    }
    deleteEventListener(event_type, id) {
        delete this.event_handlers[event_type][id];
    }
}

let resulting_data = {};
let grid_sliders = {};

let prompt_texts = [];
let prompt_elems = [];
const numberings = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thriteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twentyteen",
];
const titles = [
    "Career and Profession",
    "Family and Parenting",
    "Personal Development",
    "Spiritual Awareness",
    "Fun and Enjoyment",
    "Intimate and Social",
    "Health and Aging",
    "Personal Finance",
];
const pillar_fields = [
    {
        Excellence: "The overall quality and standard of your work, reflecting your dedication to continuous improvement and exceeding expectations.",
        Leadership: "The ability to guide, influence, and motivate others and yourself towards a common goal.",
        Achievement: "The successful accomplishment of goals or tasks in one's career.",
        "Personal Performance": "Your individual accomplishments and results in your current role, showcasing your effectiveness in meeting goals and fulfilling responsibilities.",
        Vision: "Having a clear and inspiring picture of one's future career goals and aspirations.",
        Fulfillment: "The feeling of satisfaction and purpose derived from one's work.",
        "Self-Expression": "The ability to express one's personality, creativity, and unique talents through their work. In essence, the ability to be authentic.",
        Organization: "The level of structure, order, and efficiency in one's work and professional life.",
    },
    {
        "Home Atmosphere": "The overall feeling and environment within your family home.",
        "Spouse and Partnership": "The quality of the relationship with your spouse or partner.",
        "Children Relationship": "The nature and quality of the relationships with your children.",
        "Parenting / Discipline": "The approach and effectiveness of your parenting and discipline strategies.",
        Communication: "The openness, honesty, and effectiveness of communication within your family.",
        Responsibilities: "The division and management of household and family responsibilities.",
        Boundaries: "The establishment and maintenance of healthy boundaries within the family.",
        "Managing Time": "The effective allocation and management of time for family and personal needs.",
    },
    {
        "Personal Achievement": "The accomplishment of personal goals and aspirations unrelated to your career or family.",
        Friendships: "The quality and depth of your friendships and social connections.",
        "Energy for Life": "Your level of physical and mental energy and vitality.",
        "Self-Acceptance": "The degree to which you accept and value yourself, including both your strengths and weaknesses.",
        Balance: "Your ability to maintain a healthy equilibrium between different areas of your life.",
        Communication: "The effectiveness of your communication in personal relationships and social interactions.",
        "Breaking Through Barriers": "Overcoming personal limitations and obstacles to your growth.",
        Creativity: "The expression of your imagination and originality.",
    },
    {
        "Ego Transcendence": "Moving beyond the limitations of the ego and identifying with a higher self or consciousness.",
        "Life Purpose": "Having a clear sense of meaning and purpose in life.",
        "Belief System": "The set of beliefs and values that guide your life.",
        Integration: "The harmonious blending of your spiritual beliefs and practices with your everyday life.",
        Intuition: "The ability to access your inner wisdom and guidance.",
        Community: "Your connection and involvement with a spiritual or like-minded community.",
        "Practice and Ritual": "Engaging in spiritual practices and rituals that support your growth and connection.",
        "Self-Realization": "The attainment of a deep understanding of your true nature and potential.",
    },
    {
        "Hobbies/Sport": "Engaging in activities that bring you joy, relaxation, and personal satisfaction.",
        Creativity: "Expressing yourself through creative outlets like art, music, or writing.",
        "Outlets for Stress": "Having healthy ways to manage and release stress.",
        Spontaneity: "The willingness to embrace new experiences and step outside of routines.",
        Laughter: "The frequency and enjoyment of laughter and lightheartedness.",
        Culture: "Participating in and appreciating cultural events and experiences.",
        Humor: "The ability to find humor and amusement in life.",
        "Movies/plays": "Enjoying movies, plays, and other forms of entertainment.",
    },
    {
        Intimacy: "The depth of emotional closeness and connection in your romantic relationships.",
        Trust: "The level of trust and reliability you experience in your relationships.",
        Boundaries: "The establishment and maintenance of healthy boundaries in your relationships.",
        Communication: "The openness, honesty, and effectiveness of communication in your relationships.",
        "Mutual Support": "The level of support and encouragement you both give and receive in your relationships.",
        Friendship: "The quality and depth of your friendships.",
        Sexuality: "The level of satisfaction and fulfillment in your sexual relationships (if applicable).",
        Honesty: "The degree of openness and truthfulness in your relationships.",
    },
    {
        Nutrition: "The quality and balance of your diet and eating habits.",
        Exercise: "The level of physical activity and fitness you maintain.",
        "Positive Thinking": "The cultivation of a positive mindset and outlook on life.",
        Vitality: "The overall feeling of health, energy, and well-being you experience.",
        "Social Relationships": "The quality and quantity of social connections and interactions you have.",
        "Support System": "The availability and strength of your support network, including friends, family, and community.",
        Activities: "Engaging in activities that promote physical and mental health.",
        "Self-Care": "Prioritizing your own physical, emotional, and mental well-being.",
    },
    {
        Budgeting: "How well you create and stick to a financial plan.",
        Income: "The amount of money you earn from various sources.",
        Expenses: "The amount of money you spend on different things.",
        "Financial Planning": "How you set financial goals and create a plan to reach them.",
        "Abundance Consciousness": "Your mindset about money and whether you believe in attracting financial abundance.",
        "Legacy / Estate": "Planning for what happens to your assets after you're gone.",
        Organization: "How well you keep track of your financial records and documents.",
        Investments: "How you're growing your money through different investment options.",
    }
]

function draw_pillar(id) {
    push();

    // title
    textSize(30);
    title = titles[id];
    disp_title = `${titles[id]}`;
    text(disp_title, W / 2, 0.05 * H);
    textSize(15)
    text(`(${id + 1} of ${titles.length})`, W / 2, 0.05 * H + 30)

    // ROWS
    fields = {
        ...pillar_fields[id],
        "Total Average": "Average of all your sub-fields.",
        empty: "",
        "Your overall rating": "After seeing how you performed in each of your sub-areas, select how you'd rate yourself overall in this field.",
    };
    let keys = Object.keys(fields);
    let key_count = keys.length;

    // data collection init
    if (resulting_data[id] == undefined) {
        resulting_data[id] = {
            "Your overall rating": 5.0
        };
    }
    // average calculation
    let sum = 0;
    for (let row = 0; row < key_count; row++) {
        let key = keys[row];
        if (
            !["Total Average", "empty", "Your overall rating"].includes(key)
        ) {
            if (resulting_data[id][key] == undefined) {
                resulting_data[id][key] = 5;
            }
            sum += resulting_data[id][key];
        }
    }
    resulting_data[id]["Total Average"] = sum / (keys.length - 3);

    // row drawing
    let box_x = W * 0.1;
    let box_y = 0.12 * H;
    let row_h = (0.75 * H) / key_count;
    let row_w = W * 0.8;
    rectMode(CORNER)
    for (let row = 0; row < key_count; row++) {
        let key = keys[row];
        if (key == "empty") {
            continue;
        }

        // left box
        noStroke();
        fill("white");
        textAlign(LEFT, CENTER);
        textSize(row_h * 0.3);
        text(
            key,
            box_x + row_h / 4,
            box_y + row * row_h,
            row_w / 4,
            row_h * 0.9
        );

        push();
        textAlign(RIGHT, CENTER)
        text("?",
            box_x + row_h / 4,
            box_y + row * row_h,
            row_w / 4,
            row_h * 0.9
        )
        pop();

        // average, sliders
        if (key == "Total Average") {
            push();
            textAlign(CENTER, CENTER);
            textSize(row_h * 0.5);

            const value_breakpoints = [
                [0.2, "red"],
                [0.4, "orange"],
                [0.85, "lime"],
                [1, "gold"],
            ]
            for (let breakpoint of value_breakpoints) {
                if (resulting_data[id]["Total Average"] <= (1 + (9 - 1) * breakpoint[0])) {
                    fill(breakpoint[1])
                    break;
                }
            }

            text(
                resulting_data[id]["Total Average"].toFixed(2),
                box_x + row_h / 4 + row_w / 4,
                box_y + row * row_h,
                (row_w * 3) / 4,
                row_h * 0.9
            );
            pop();
        } else {
            // check that slider exists
            if (grid_sliders[`${id}_${key}`] == undefined) {
                grid_sliders[`${id}_${key}`] = new CanvSlider(0, 0, 100, resulting_data[id][key], 0.1, 1, 10);
                grid_sliders[`${id}_${key}`].addEventListener("change", (slid) => {
                    resulting_data[id][key] = slid.value;
                })
            }

            let slider = grid_sliders[`${id}_${key}`];
            slider.unhide()
            slider.draw()

            w = row_w - (row_h / 2 + row_w / 4);
            h = row_h;
            x = box_x + row_h / 2 + row_w / 4;
            y = box_y + row * row_h;

            slider.position(x + h / 2, y + h / 2, w - h);
        }

        // outline
        noFill();
        stroke("white");
        rect(box_x, box_y + row * row_h, row_w, row_h);

        // write last line reminder
        if (key == "Your overall rating") {
            push()
            textAlign(RIGHT, TOP)
            textSize(15)
            noStroke()
            fill("red")
            text("*Reminder: This score should be based on your own personal level of satisfaction", box_x, box_y + (row + 1) * row_h + 5, row_w)
            pop()
        }

        // hovering
        let text_center_x = box_x + row_h / 4 + row_w / 8;
        let text_center_y = box_y + (row + 0.5) * row_h;
        if (dist(mouseX, 0, text_center_x, 0) < row_w / 8) {
            if (dist(0, mouseY, 0, text_center_y) < row_h / 3) {
                push();
                noStroke();
                fill("white");
                textSize(16);

                textAlign(LEFT, TOP);

                let bb = font.textBounds(
                    fields[key],
                    text_center_x - row_h,
                    text_center_y
                );
                let line_count = 2 + 1.5 * Math.ceil((2 * bb.w) / row_w);
                rect(
                    bb.x - bb.h,
                    bb.y - bb.h * (line_count + 2),
                    min(row_w / 2 + 2 * bb.h, textWidth(fields[key]) + 2 * 16),
                    bb.h * line_count,
                    bb.h
                );

                fill(0);
                noStroke();
                text(
                    fields[key],
                    text_center_x - row_h,
                    text_center_y - bb.h * (line_count + 1),
                    row_w / 2
                );
                pop();
            }
        }

        // separator row
        line(
            box_x + row_h / 2 + row_w / 4,
            box_y + row_h * row,
            box_x + row_h / 2 + row_w / 4,
            box_y + row_h * (row + 1)
        );
    }
    pop();

    if (resulting_data[id]["Your overall rating"]) {
        draw_next_btn(0.95 * W, 0.95 * H)
    }
    draw_back_btn((1 - 0.95) * W, 0.95 * H)
}

function draw_WOF() {
    push()
    let keys = Object.keys(resulting_data);
    let a = (2 * PI) / keys.length;
    let vmin = min(width, height) / 100;
    let R = 35 * vmin;
    let R2 = 43 * vmin;

    // circle levels
    stroke("#ffffff");
    strokeWeight(1);
    noFill();
    for (var l = 1; l <= 10; l++) {
        ellipse(
            width / 2,
            height / 2,
            (2 * R * l) / 10,
            (2 * R * l) / 10
        );
    }

    // level numbers
    push();
    translate(width / 2, height / 2);
    rotate(a / 2);

    textSize(R / 20);
    textAlign(CENTER, CENTER);
    fill("#ffffff");
    noStroke();

    for (let i = 0; i < keys.length; i++) {
        rotate(a);
        for (var l = 1; l <= 10; l++) {
            let r = (R * (l - 0.5)) / 10 + 2;

            text(l, 0, -r);
        }
    }
    pop();

    // colored arcs
    let cols = [
        "4bdbff",
        "4877e0",
        "b71f58",
        "9a2ecc",
        "ff9bf2",
        "6ad007",
        "f5bf40",
        "ef7625",
    ];
    push();
    textSize(R / 15);
    noStroke();
    textAlign(CENTER, CENTER);
    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let l = resulting_data[k]["Your overall rating"];

        fill("#" + cols[i] + "99");
        arc(
            width / 2,
            height / 2,
            (2 * R * l) / 10,
            (2 * R * l) / 10,
            a * i,
            a * (i + 1)
        );

        fill("#" + cols[i]);
        text(
            titles[k].replace(":", ":\n"),
            width / 2 + R2 * cos(a * (i + 0.5)),
            height / 2 + R2 * sin(a * (i + 0.5)),
            120
        );
    }
    pop();
    pop();
}

let font, canv, next_btn, back_btn;
let img1, img2;
function draw_next_btn(x, y) {
    next_btn.position(x, y);
    next_btn.unhide();
}
function draw_back_btn(x, y) {
    back_btn.position(x, y);
    back_btn.unhide();
}
function setup() {
    canv = createCanvas((700 * 16) / 9, 700);
    canv.parent("canvWrap");
    pixelDensity(1);

    img1 = loadImage('./img1.png');
    img2 = loadImage('./img2.png');

    font = loadFont("./Fredoka-Regular.ttf");
    textFont(font);

    canv.mousePressed((event) => {
        CanvSlider.onPressAll(event);
        CanvButton.onPressAll(event);
    })
    canv.mouseReleased((event) => {
        CanvSlider.onReleaseAll(event);
        CanvButton.onReleaseAll(event);
    });
    canv.mouseMoved((event) => {
        CanvSlider.onDraggedAll(event);
        CanvButton.onDraggedAll(event);
    })

    next_btn = new CanvButton(0, 0, "Next >", 30)
    next_btn.addEventListener("click", () => {
        page++;
    })

    back_btn = new CanvButton(0, 0, "< Back", 30)
    back_btn.addEventListener("click", () => {
        if (page <= 0) return;
        page--;
    })

    for (let i = 1; i <= 3; i++) {
        let prompt_elem = document.getElementById(`prompt_response${i}`);
        prompt_elem.style.display = "none";

        const ii = i - 1;
        prompt_elem.onchange = (ev) => {
            prompt_texts[ii] = ev.target.value;
        }

        prompt_elems.push(prompt_elem)
    }
}

function arrow(x0, y0, x1, y1, options) {
    let defaultOptions = { arrowLength: 10, arrowWidth: 5, lineWidth: 5 }
    let { arrowLength, arrowWidth, lineWidth, dash } = { ...defaultOptions, ...options || {} }
    let ll = dist(x0, y0, x1, y1) // line length
    let al = min(arrowLength, ll)
    let sl = ll - al // stem length
    let hw = lineWidth / 2 // line half width
    push()
    translate(x0, y0)
    rotate(atan2(y1 - y0, x1 - x0));
    if (dash) {
        let [pag, gap] = Array.isArray(dash) ? dash : [dash, dash];
        let dl = pag + gap
        while (dl < sl) {
            rect(0, -hw, pag, 2 * hw)
            translate(dl, 0)
            ll -= dl
            sl -= dl
        }
    }
    let pts = [
        [0, hw],
        [sl, hw],
        [sl, hw + arrowWidth / 2],
        [ll, 0],
    ]
    beginShape()
    pts.forEach(([x, y]) => vertex(x, y))
    pts.reverse().forEach(([x, y]) => vertex(x, -y))
    endShape()
    pop()
}

let page = 0;

function draw() {
    background(0, 255);
    W = width;
    H = height;
    let vmin = min(width, height) / 100;

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    CanvButton.hideAll();
    CanvSlider.hideAll();

    if (page != 15) {
        prompt_elems.forEach(p => p.style.display = "none");
    }

    push();
    switch (page) {
        case 0:
            textSize(40);
            text("WHAT IS THE WHEEL OF LIFE", W / 2, H * 0.1);

            textSize(18);
            text('The "Wheel of Life" is an exercise that provides you with a visual snapshot of your current life balance across 8 areas of life', W / 2, H * 0.2);

            imageMode(CENTER)
            var img_h = 70 * vmin;
            image(img1, W / 2, H * 0.6, img_h * img1.width / img1.height, img_h)

            draw_next_btn(0.9 * W, 0.9 * H);
            break;

        case 1:
            textSize(40);
            text("WHY YOU SHOULD CARE ABOUT THE WHEEL OF LIFE", W / 2, 0.25 * H, W * 0.7);

            textSize(20);
            text(
                `
Understanding your current life balance is important because stress, unfulfillment, and unhappiness often come when there is an imbalance in our lives. When one or more areas are neglected, it creates a ripple effect, impacting our overall sense of well-being.

By understanding and pinpointing where these imbalances reside, we can then begin the process of creating a plan to restore balance and identify any existing blockers.
`,
                W / 2,
                H * 0.6,
                0.6 * W,
                0.8 * H
            );

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 2:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.2, H * 0.2, img_h * img2.width / img2.height, img_h)

            textSize(20);
            text(
                `
This exercise will guide you through eight different pillars of life such as Personal Finance, Relationships, and Career/Profession.
`,
                W * 0.8,
                H * 0.25,
                0.3 * W,
                0.9 * H
            );

            fill("red")
            arrow(
                W * 0.65,
                H * 0.25,
                W * 0.2 + img_h * 0.75,
                H * 0.235
            )

            // arrow

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 3:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.2, H * 0.2, img_h * img2.width / img2.height, img_h)

            textSize(20);
            text(
                `
Each of these pillars will be further broken down into 8 sub components 

Rank each of these sub components on a scale of 1 to 10, with 1 being not satisfied at all and 10 being extremely satisfied. 

Remember! Rate each area based on how happy and satisfied YOU are, not on what others expect.
`,
                W * 0.8,
                H * 0.4,
                0.3 * W,
                0.9 * H
            );

            textSize(15);
            text(`
As an example:
If you're earning $50,000 a year and feel completely satisfied, happy and fulfilled, then your score should be closer to a 10.

If you're earning $700k a year but feel very dissatisfied because you have larger financial goals then your score should be closer to a 1.
`,
                W * 0.8,
                H * 0.7,
                0.3 * W,
                0.9 * H
            );

            fill("red")
            arrow(
                W * 0.655,
                H * 0.27,
                W * 0.2 + img_h * 0.95,
                H * 0.35
            )

            // arrow

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 4:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.2, H * 0.2, img_h * img2.width / img2.height, img_h)

            textSize(20);
            text(
                `
Once completed, an average score will be calculated. 

This score is intended to serve as a guiding post only. Ultimately, you'll decide the final score for each of the main pillars based on your own intuition.
    `,
                W * 0.8,
                H * 0.5,
                0.3 * W,
                0.9 * H
            );

            fill("red")
            arrow(
                W * 0.65,
                H * 0.425,
                W * 0.2 + img_h * 0.67,
                H * 0.2 + img_h * 0.775
            )

            // arrow

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 5:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.2, H * 0.2, img_h * img2.width / img2.height, img_h)

            textSize(20);
            text(
                `
Finally, rank the overall “Pillar of Life” on a scale of 1 to 10 with 1 being not satisfied at all and 10 being extremely satisfied

As a reminder: This score should be based on your own personal level of satisfaction. 

Complete this process for all 8 Pillars of Life`,
                W * 0.8,
                H * 0.5,
                0.3 * W,
                0.9 * H
            );

            fill("red")
            arrow(
                W * 0.65,
                H * 0.4,
                W * 0.2 + img_h * 0.67,
                H * 0.2 + img_h * 0.86
            )

            // arrow

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 6:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            draw_next_btn(0.9 * W, 0.9 * H);
            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;

        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
            draw_pillar(page - 7);
            break;

        case 15:
            push()
            translate(-(W - H) / 2, 0)
            draw_WOF()
            pop()

            push()
            translate(H, 0)

            textSize(30);
            textAlign(CENTER, CENTER);
            text(
                "Use the following prompts to reflect on your Wheel of Life.",
                (W - H) / 2,
                H * 0.2,
                (W - H) * 0.85
            );
            pop()

            // prompts
            prompt_elems.forEach(p => p.style.display = "block");
            prompt_elems[0].style.marginTop = "18%"
            prompt_elems[0].style.marginLeft = "64%"
            // prompt_elems[0].placeholder = "etc."

            prompt_elems[1].style.marginTop = "35%"
            prompt_elems[1].style.marginLeft = "64%"

            prompt_elems[2].style.marginTop = "45%"
            prompt_elems[2].style.marginLeft = "64%"

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 16:
            background(0);

            textAlign(CENTER, CENTER);
            text("END", W / 2, H / 2, 0.75 * W);

            //console.log(resulting_data, prompt_texts);

            draw_back_btn((1 - 0.9) * W, 0.9 * H);
            break;
    }
    pop();

    CanvButton.drawAll();
}