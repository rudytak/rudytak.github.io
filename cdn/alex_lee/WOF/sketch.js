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
        this.rail_full_outline = "#3e90ff00";

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
            text(this.value.toFixed(1), this.x - l_t - 10, this.y, l_t)
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
        this.fontColor = "white";
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

        fill(this.fontColor);
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

const booking_link = "https://coaching244829.hbportal.co/schedule/67095c1a8078a0001fe67fdf"
const color_scheme = {
    "bg": "#fff5d9",
    "bg2": "#ffcf5a",
    "text": "#655a3f",
    "text2": "#ffffff",
    "action": "#ffc124",
    value_breakpoints: [
        [0.2, "#fe797b"],
        [0.4, "#ffb750"],
        [1, "#08d308"],
    ],
    WOF_img: "img1.png",
    pillar_img: "img2.png",
    pfp_icon_light: "pfp_small.png",
    pfp_icon_dark: "pfp_small_gold.png",
    arc_colors: [
        "#4bdbff",
        "#4877e0",
        "#b71f58",
        "#9a2ecc",
        "#ff9bf2",
        "#6ad007",
        "#f5bf40",
        "#ef7625",
    ]
}
// : {
//     "bg": "#a4c3b2",
//     "bg2": "#183a37",
//     "text": "#000000",
//     "text2": "#ffffff",
//     "action": "#006d77",
//     value_breakpoints: [
//         [0.2, "#ec0e47"],
//         [0.4, "#fa7329"],
//         [1, "#006d77"],
//     ],
//     WOF_img: "img3.png",
//     pillar_img: "img4.png",
//     pfp_icon: "pfp_small.png",
//     arc_colors: [
//         "#0988fa",
//         "#4877e0",
//         "#b71f58",
//         "#9a2ecc",
//         "#ff37cc",
//         "#077353",
//         "#fcb117",
//         "#f68950",
//     ]
// }

function setThemeColors() {
    document.documentElement.style.setProperty('--background-color', color_scheme["bg"]);
    document.documentElement.style.setProperty('--text-color', color_scheme["text"]);
    document.documentElement.style.setProperty('--secondary-color', color_scheme["bg2"]);
    document.documentElement.style.setProperty('--active-color', color_scheme["action"]);
}
setThemeColors()
let grid_sliders = {};

const resulting_data = {};
const prompts = [
    {
        name: "Prompt 1",
        texts: [
            ["What stood out to you while doing this exercise? (ie. insights, epiphanies, realizations, etc)", 10, 32]
        ],
    },
    {
        name: "Prompt 2",
        texts: [
            ["Do any of these Pillars of Life bring up feelings of discomfort such as anxiety, stress, or a desire to avoid them?", 4, 32],
            ["Why do you suppose this is?", 4, 32]
        ],
    },
    {
        name: "Prompt 3",
        texts: [
            ["Which area of your life do you intuitively feel would have the biggest positive ripple effect on your overall life if you dedicated focused efforts towards it?", 4, 32],
            ["What area specifically would you focus on?", 4, 32],
            ["What would be the smallest or quickest win you could achieve related to this specific area within the next 60 minutes? What about within the next 24 hours?", 4, 32],
            ["What about within the next 7 days?", 4, 32]
        ],
    }
];
let prompts_count = prompts.map(x => x.texts.length).reduce((a, b) => a + b)
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

function hover_textbox(_text_lines, cx, cy, box_style = {}, p5inst = window) {
    const c = p5inst

    let default_style = {
        align_vertical: TOP,
        align_horizontal: LEFT,
        fontSize: 12,
        color: "black",
        outline: "#0000",
        outline_width: .2,
    }
    let default_box_style = {
        bg: color_scheme["bg2"],
        outline: "#0000",
        outline_width: 2,
        line_height: 1.25,
        padding: 12,
        line_separation: 6
    }

    box_style = {
        ...default_box_style,
        ...box_style
    }

    let lines = []
    for (var i = 0; i < _text_lines.length; i++) {
        let line_text = ""
        if (typeof _text_lines[i] == "string") {
            line_text = _text_lines[i]
        } else {
            line_text = _text_lines[i][0]
        }

        let style = JSON.parse(JSON.stringify(default_style));
        if (_text_lines[i].length > 1 && typeof _text_lines == "object") {
            style = {
                ...style,
                ..._text_lines[i][1]
            }
        }

        let BB = font.textBounds("$" + line_text, 0, 0, style.fontSize)

        lines.push({ text: line_text, style, BB })
    }

    let line_h = box_style.line_height
    let line_sep = box_style.line_separation
    let tot_h = lines.map(l => l.BB.h).reduce((a, b) => a + b) * line_h + (lines.length - 1) * line_sep
    let tot_w = max(lines.map(l => l.BB.w))
    let pad = box_style.padding

    c.push();
    c.stroke(box_style["outline"]);
    c.strokeWeight(box_style["outline_width"])
    c.fill(box_style["bg"]);
    c.rectMode(CENTER)
    c.rect(
        cx - pad,
        cy - pad,
        tot_w + 2 * pad,
        tot_h + 2 * pad,
        pad
    );

    c.rectMode(CORNER)
    let y_acc = 0
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        c.textAlign(line.style.align_horizontal, line.style.align_vertical);
        c.textSize(line.style.fontSize);
        c.fill(line.style.color);
        c.stroke(line.style.outline)
        c.strokeWeight(line.style.outline_width)

        c.text(
            line.text,
            cx - tot_w / 2 - pad,
            cy - tot_h / 2 - pad + y_acc,
            tot_w + pad,
            line_sep + line.BB.h * line_h
        )

        y_acc += line_sep + line.BB.h * line_h;
    }
    c.pop()
}

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
            // "Your overall rating": 5.0
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
    resulting_data[id]["Total Average"] = Math.round((sum / (keys.length - 3))*1000)/1000;

    // row drawing
    let box_x = W * 0.1;
    let box_y = 0.15 * H;
    let row_h = (0.72 * H) / key_count;
    let row_w = W * 0.8;
    rectMode(CORNER)
    for (let row = 0; row < key_count; row++) {
        let key = keys[row];
        if (key == "empty") {
            continue;
        }

        // left box
        noStroke();
        fill(color_scheme["text"])
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

        if (row == 0) {
            push();
            textAlign(LEFT, BOTTOM)
            text("Worst",
                box_x + row_w / 4 + row_h / 2 + 4,
                box_y,
            )

            textAlign(RIGHT, BOTTOM)
            text("Best",
                box_x + row_w / 4,
                box_y,
                row_w * 3 / 4
            )
            pop();
        }

        // average, sliders
        if (key == "Total Average") {
            push();
            textAlign(CENTER, CENTER);
            textSize(row_h * 0.5);

            const value_breakpoints = color_scheme["value_breakpoints"]
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
                grid_sliders[`${id}_${key}`] = new CanvSlider(-100, -100, 100, resulting_data[id][key], 0.1, 1, 10);

                grid_sliders[`${id}_${key}`].rail_full_bg = color_scheme["action"]
                grid_sliders[`${id}_${key}`].value_breakpoints = color_scheme["value_breakpoints"]

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
        stroke(color_scheme["text"]);
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

        // separator row
        line(
            box_x + row_h / 2 + row_w / 4,
            box_y + row_h * row,
            box_x + row_h / 2 + row_w / 4,
            box_y + row_h * (row + 1)
        );

        // hovering
        let text_center_x = box_x + row_h / 4 + row_w / 8;
        let text_center_y = box_y + (row + 0.5) * row_h;
        if (dist(mouseX, 0, text_center_x, 0) < row_w / 8) {
            if (dist(0, mouseY, 0, text_center_y) < row_h / 3) {
                hover_textbox(
                    splitter(fields[key], 50).map(t => [t, { color: color_scheme["text2"], fontSize: 15 }]),
                    text_center_x + row_w / 8,
                    text_center_y - row_h * .8,
                    {
                        "bg": color_scheme["bg2"]
                    }
                )
            }
        }
    }
    pop();

    if (resulting_data[id]["Your overall rating"]) {
        draw_next_btn(0.95 * W, 0.95 * H)
    }
    draw_back_btn((1 - 0.95) * W, 0.95 * H)
}

function draw_WOF(interactive = true, p5inst = window) {
    const c = p5inst;

    c.push()
    let keys = Object.keys(resulting_data);
    let a = (2 * PI) / keys.length;
    let vmin = min(c.width, c.height) / 100;
    let R = 35 * vmin;
    let R2 = 44 * vmin;

    // circle levels
    c.stroke(color_scheme["text"]);
    c.strokeWeight(1);
    c.textAlign(CENTER, CENTER)
    c.rectMode(CENTER);

    c.noFill();
    for (var l = 1; l <= 10; l++) {
        c.ellipse(
            c.width / 2,
            c.height / 2,
            (2 * R * l) / 10,
            (2 * R * l) / 10
        );
    }

    // level numbers
    c.push();
    c.translate(c.width / 2, c.height / 2);
    c.rotate(a / 2);

    c.textSize(R / 20);
    c.textAlign(CENTER, CENTER);
    c.fill(color_scheme["text"]);
    c.noStroke();

    for (let i = 0; i < keys.length; i++) {
        c.rotate(a);
        for (var l = 1; l <= 10; l++) {
            let r = (R * (l - 0.5)) / 10 + 2;

            c.text(l, 0, -r);
        }
    }
    c.pop();

    // colored arcs
    let cols = color_scheme["arc_colors"];
    c.push();
    c.textSize(R / 14);
    c.noStroke();
    c.textAlign(CENTER, CENTER);
    let got_hover = undefined;
    let mouse_dist = c.dist(c.mouseX, c.mouseY, 50 * vmin, 50 * vmin)
    let mouse_ang = (Math.atan2((c.mouseY - 50 * vmin), (c.mouseX - 50 * vmin)) + 2 * PI) % (2 * PI)

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let l = resulting_data[k]["Your overall rating"];
        if (mouse_ang > a * i && mouse_ang <= a * (i + 1) && mouse_dist < (R * l) / 10) {
            // hover
            got_hover = i;
        }
    }
    if (!interactive) {
        got_hover = undefined;
    }


    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let l = resulting_data[k]["Your overall rating"];

        let is_hovered = (got_hover != undefined && got_hover == i)
        let make_colored = is_hovered || got_hover == undefined

        let cols_i = cols[i]
        let gray = '#' + Array(4).join(Math.round([1 - .3, 1 - .59, 1 - .11].reduce((a, v, i) => a + v * parseInt(cols_i[2 * i + 1] + cols_i[2 * i + 2], 16), 0) / 3).toString(16).padStart(2, '0'));
        let col = make_colored ? cols_i : gray;

        c.fill(col + "aa");
        c.arc(
            c.width / 2,
            c.height / 2,
            (2 * R * l) / 10,
            (2 * R * l) / 10,
            a * i,
            a * (i + 1)
        );

        c.fill(col);
        c.stroke(col)
        c.strokeWeight(0.2)
        c.text(
            titles[k].replace(":", ":\n"),
            c.width / 2 + R2 * cos(a * (i + 0.5)),
            c.height / 2 + R2 * sin(a * (i + 0.5)),
            c.width / 10
        );
    }

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let res = resulting_data[k];

        let is_hovered = (got_hover != undefined && got_hover == i)

        if (is_hovered) {
            let txt = [
                [
                    titles[k],
                    { color: cols[i], fontSize: 18 }
                ]
            ]
            for (let key in res) {
                if (["Your overall rating", "Total Average"].includes(key)) {
                    txt.push([
                        `${key}: ${res[key].toFixed(2)}`,
                        { color: "black", fontSize: 15 }
                    ]);
                } else {
                    txt.push(` - ${key}: ${res[key].toFixed(1)}`);
                }
            }

            hover_textbox(
                txt,
                width / 2 - .6 * R2 * cos(a * (i + 0.5)),
                height / 2 - .6 * R2 * sin(a * (i + 0.5)),
                {
                    "bg": "#fff",
                    outline: color_scheme["action"]
                },
                c
            )
        }
    }

    c.pop();
    c.pop();
}

let font, canv;
let next_btn, back_btn, save_img_btn, save_pdf_btn, finish_WOF_btn;
let img1, img2, pfp_dark, pfp_light;
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
    document.getElementById("canvWrap").style.height = height + "px";
    pixelDensity(2);

    img1 = loadImage(color_scheme["WOF_img"]);
    img2 = loadImage(color_scheme["pillar_img"]);

    try {
        pfp_light = loadImage(color_scheme["pfp_icon_light"]);
        pfp_dark = loadImage(color_scheme["pfp_icon_dark"]);
    } catch (error) { }

    font = loadFont("./Poppins-Regular.otf");
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
    next_btn.bg = color_scheme["bg2"]
    next_btn.hover_bg = color_scheme["bg2"] + "aa"
    next_btn.fontColor = color_scheme["text2"]
    next_btn.outline = "#0000"
    next_btn.addEventListener("click", () => {
        page++;
    })

    back_btn = new CanvButton(0, 0, "< Back", 30)
    back_btn.bg = color_scheme["bg2"]
    back_btn.hover_bg = color_scheme["bg2"] + "aa"
    back_btn.fontColor = color_scheme["text2"]
    back_btn.outline = "#0000"
    back_btn.addEventListener("click", () => {
        if (page <= 0) return;
        page--;
    })

    save_img_btn = new CanvButton(0, 0, "Save as image", 20)
    save_img_btn.bg = color_scheme["bg2"]
    save_img_btn.hover_bg = color_scheme["bg2"] + "aa"
    save_img_btn.fontColor = color_scheme["text2"]
    save_img_btn.outline = "#0000"
    save_img_btn.addEventListener("click", exportImg)

    save_pdf_btn = new CanvButton(0, 0, "Save as PDF", 20)
    save_pdf_btn.bg = color_scheme["bg2"]
    save_pdf_btn.hover_bg = color_scheme["bg2"] + "aa"
    save_pdf_btn.fontColor = color_scheme["text2"]
    save_pdf_btn.outline = "#0000"
    save_pdf_btn.addEventListener("click", exportPDF)

    finish_WOF_btn = new CanvButton(0, 0, "Book Your Free Consultation Now", 25)
    finish_WOF_btn.bg = color_scheme["bg2"]
    finish_WOF_btn.hover_bg = color_scheme["bg2"] + "aa"
    finish_WOF_btn.fontColor = color_scheme["text2"]
    finish_WOF_btn.outline = "#0000"
    finish_WOF_btn.addEventListener("click", openHB)

    // create prompt textareas
    let canvWrap = document.getElementById("canvWrap")
    for (let p = 0; p < prompts.length; p++) {
        prompts[p].elems = []
        prompts[p].answers = []
        for (var i = 0; i < prompts[p].texts.length; i++) {
            let prompt = prompts[p].texts[i];

            let prompt_elem = document.createElement("textarea")
            prompt_elem.id = `prompt_response${p}_${i}`;
            prompt_elem.rows = prompt[1]
            prompt_elem.cols = prompt[2]
            prompt_elem.placeholder = prompt[0]
            prompt_elem.style.position = "absolute"
            prompt_elem.style.marginLeft = "-29%"
            prompt_elem.style.marginTop = "-100%"
            prompt_elem.style.display = "none";
            prompt_elem.style.resize = "none";
            prompt_elem.style.fontSize = "12px";

            const ii = i
            const pp = p
            prompt_elem.onchange = (ev) => {
                prompts[pp].answers[ii] = ev.target.value;
            }

            prompts[p].elems.push(prompt_elem)
            prompt_elems.push(prompt_elem)
            canvWrap.appendChild(prompt_elem)
        }
    }

    // create the booking iframe
    let iframe = document.createElement("iframe")
    iframe.id = "booking_ifr"
    iframe.setAttribute("src", booking_link)
    iframe.style.width = "100%"
    iframe.style.height = "100vh"
    iframe.style.display = "none";
    document.body.appendChild(iframe)
}

// EXPORTS
function getExportGraphic(upscale_factor = 2) {
    let gr = createGraphics(upscale_factor * width, upscale_factor * height)

    let W = gr.width;
    let H = gr.height;

    gr.background(color_scheme["bg"]);
    gr.textAlign(gr.CENTER, gr.CENTER)
    gr.rectMode(CENTER)
    gr.fill(color_scheme["text"])
    gr.textFont(font)

    gr.push()
    gr.translate(-(W - H) / 2, 0)
    draw_WOF(false, gr)
    gr.pop()

    gr.push()
    gr.translate(H, 0)

    gr.textSize(0.04285 * H);
    gr.text(
        "Your Wheel of Life",
        (W - H) / 2,
        H * 0.1,
        (W - H) * 0.85
    );

    let lines = []
    for (let pr of prompts) {
        for (let i = 0; i < pr.elems.length; i++) {
            let el = pr.elems[i]
            let ans = pr.answers[i]

            lines.push(
                ...splitter(
                    `${el.placeholder}:`,
                    70
                ).map(t => [t, { fontSize: 0.018 * H, color: color_scheme["text"] }]),
                ...splitter(
                    `${ans == undefined ? "No response" : ans}`,
                    70
                ).map(t => [t, { fontSize: 0.018 * H, color: color_scheme["text"], outline: color_scheme["text"], outline_width: .8 }]),
                ["", { fontSize: 0.02 * H }]
            )
        }
    }

    let promptsH = 0.8
    lines.forEach(l => l[1].fontSize = 0.6 * H * promptsH / lines.length)
    hover_textbox(lines, (W - H) / 2, (0.1 + 0.05 + promptsH / 2) * H, { bg: "#0000" }, gr)

    gr.pop()

    gr.push();
    if (pfp_dark) {
        let pfpW = pfp_dark.width
        let pfpH = pfp_dark.height
        let pad = 0.015 * H
        let targetW = 0.065 * W
        let targetH = targetW * pfpH / pfpW
        gr.image(pfp_dark, W - targetW - pad, pad, targetW, targetH)
    }
    gr.pop();

    return gr;
}
function exportImg() {
    getExportGraphic().save("export.png")
}
function exportPDF() {
    let gr = getExportGraphic(1.5)

    let pdf = new jspdf.jsPDF({
        orientation: "l",
        unit: "px",
        format: [gr.width, gr.height],
        putOnlyUsedFonts: true
    })

    pdf.addImage(
        gr.canvas.toDataURL(),
        "png",
        0, 0,
        gr.width,
        gr.height
    )

    pdf.save("export.pdf")
}
function openHB() {
    document.querySelectorAll("body *").forEach(el => el.style.display = "none")
    document.getElementById("booking_ifr").style.display = "block"
}

// HELPERS
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
function splitter(str, l) {
    var strs = [];
    while (str.length > l) {
        var pos = str.substring(0, l).lastIndexOf(' ');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        var i = str.indexOf(' ', pos) + 1;
        if (i < pos || i > pos + l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}

let page = 0;
let last_page = 0;

function draw() {
    background(color_scheme["bg"]);
    W = width;
    H = height;
    let vmin = min(width, height) / 100;

    noStroke();
    fill(color_scheme["text"]);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    CanvButton.hideAll();
    CanvSlider.hideAll();

    if (![15, 16, 17].includes(page) || page != last_page) {
        prompt_elems.forEach(p => p.style.display = "none");
    }

    push();
    switch (page) {
        case 0:
            fill(color_scheme["bg2"])
            rect(W / 2, H * 0.1 + 60 / 8, W, 100)

            fill(color_scheme["text2"])
            textSize(60);
            text("WHAT IS THE WHEEL OF LIFE", W / 2, H * 0.1);

            fill(color_scheme["text"])
            textSize(18);
            text('The "Wheel of Life" is an exercise that provides you with a visual snapshot of your current life balance across 8 areas of life', W / 2, H * 0.25);

            imageMode(CENTER)
            var img_h = 65 * vmin;
            image(img1, W / 2, H * 0.65, img_h * img1.width / img1.height, img_h)

            draw_next_btn(0.95 * W, 0.95 * H);
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

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 2:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.18, H * 0.2, img_h * img2.width / img2.height, img_h)

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

            fill(color_scheme["action"])
            arrow(
                W * 0.65,
                H * 0.25,
                W * 0.2 + img_h * 0.75,
                H * 0.235
            )

            // arrow

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 3:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.18, H * 0.2, img_h * img2.width / img2.height, img_h)

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
                H * 0.75,
                0.3 * W,
                0.9 * H
            );

            fill(color_scheme["action"])
            arrow(
                W * 0.655,
                H * 0.27,
                W * 0.2 + img_h * 0.95,
                H * 0.35
            )

            // arrow

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 4:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.18, H * 0.2, img_h * img2.width / img2.height, img_h)

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

            fill(color_scheme["action"])
            arrow(
                W * 0.65,
                H * 0.425,
                W * 0.2 + img_h * 0.67,
                H * 0.2 + img_h * 0.775
            )

            // arrow

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 5:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img2, W * 0.18, H * 0.2, img_h * img2.width / img2.height, img_h)

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

            fill(color_scheme["action"])
            arrow(
                W * 0.65,
                H * 0.4,
                W * 0.2 + img_h * 0.67,
                H * 0.2 + img_h * 0.86
            )

            // arrow

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 6:
            textSize(40);
            text("INSTRUCTIONS", W / 2, 0.1 * H);

            imageMode(CORNER)
            var img_h = 70 * vmin;
            image(img1, W * 0.12, H * 0.2, img_h * img1.width / img1.height, img_h)

            textSize(20);
            text(
                `
Once complete, a report will be generated based on your results along with ${prompts.length} # of prompts
`,
                W * 0.8,
                H * 0.5,
                0.3 * W,
                0.9 * H
            );

            fill(color_scheme["action"])
            arrow(
                W * 0.65,
                H * 0.5,
                W * 0.2 + img_h * 0.8,
                H * 0.2 + img_h * 0.5
            )

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
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
        case 16:
        case 17:
            push()
            translate(-(W - H) / 2, 0)
            draw_WOF()
            pop()

            push()
            translate(H, 0)

            textSize(30);
            textAlign(CENTER, CENTER);
            text(
                "Use the following prompts to reflect on your Wheel of Life:",
                (W - H) / 2,
                H * 0.2,
                (W - H) * 0.85
            );
            pop()

            let prompt = prompts[page - 15]
            prompt.elems.forEach(p => p.style.display = "block");
            for (let i = 0; i < prompt.elems.length; i++) {
                prompt.elems[i].style.marginTop = `-${height * (1 - 0.30 - 0.15 * i)}px` // 18 - 45
                prompt.elems[i].style.marginLeft = "64%"
            }

            draw_next_btn(0.95 * W, 0.95 * H);
            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;

        case 18:
            push()
            translate(-(W - H) / 2, 0)
            draw_WOF()
            pop()

            push()
            translate(H, 0)

            textSize(30);
            textAlign(CENTER, CENTER);
            text(
                "Save your Wheel of Life:",
                (W - H) / 2,
                H * 0.18,
                (W - H) * 0.85
            );

            textSize(26);
            text("Ready to take action?",
                (W - H) / 2,
                H * 0.58,
                (W - H) * 0.85
            )

            textSize(18);
            text("Let's discuss your personalized results and turn your insights into an actionable roadmap",
                (W - H) / 2,
                H * 0.655,
                (W - H) * 0.85
            )

            save_img_btn.position(H + (W - H) / 2, H * 0.33)
            save_img_btn.unhide()
            save_pdf_btn.position(H + (W - H) / 2, H * 0.43)
            save_pdf_btn.unhide()
            finish_WOF_btn.position(H + (W - H) / 2, H * 0.74)
            finish_WOF_btn.unhide()

            pop()

            saveUserData()

            draw_back_btn((1 - 0.95) * W, 0.95 * H);
            break;
    }
    pop();

    push();
    if (pfp_dark && pfp_light) {
        let pfp = page == 0 ? pfp_light : pfp_dark

        let pfpW = pfp.width
        let pfpH = pfp.height
        let pad = 0.015 * H
        let targetW = 0.065 * W
        let targetH = targetW * pfpH / pfpW
        if (page == 0) {
            pad = 0.055 * H;
        }
        image(pfp, W - targetW - pad, pad, targetW, targetH)
    }
    pop();

    CanvButton.drawAll();

    last_page = page;
}


// SERVER SAVING

let has_unsaved_changes = true
async function saveUserData() {
    if (!has_unsaved_changes) {
        return has_unsaved_changes
    }
    has_unsaved_changes = false;

    let res = await save_data(
        formData,
        {
            pillars: resulting_data,
            prompts: prompts.map(p => // make all the prompts into key-val pairs inside one object
                p.texts.map((t, i) => {
                    let o = {};
                    o[t[0]] = p.answers[i];
                    return o
                })).flat().reduce((a, b) => { return { ...a, ...b } }, {})
        }
    )

    if (!res.ok){
        has_unsaved_changes = true;
    }

    return res
}

// window.addEventListener('beforeunload', (ev) => {
//     if (has_unsaved_changes) {
//         saveUserData()

//         ev.preventDefault()
//         ev.returnValue = "";
//     }
// })