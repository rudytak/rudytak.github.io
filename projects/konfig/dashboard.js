var c = new Client();
const key = localStorage.getItem("appLK");
var projects, allProjectDetails, clientEmail;
var color_options = [{
        "rgb": "rgb(128,128,128)",
        "id": "",
        "de": "Blank Aluminium",
        "en": "Blank Aluminium",
        "fr": "Aluminium vierge",
        "es": "Aluminio en blanco",
        "it": "Alluminio grezzo",
        "nl": "Blank aluminium"
    }, {
        "rgb": "rgb(190,189,127)",
        "id": "RAL 1000",
        "de": "Grünbeige",
        "en": "Green beige",
        "fr": "Beige vert",
        "es": "Beige verdoso",
        "it": "Beige verdastro",
        "nl": "Groenbeige"
    },
    {
        "rgb": "rgb(194, 176, 120)",
        "id": "RAL 1001",
        "de": "Beige",
        "en": "Beige",
        "fr": "Beige",
        "es": "Beige",
        "it": "Beige",
        "nl": "Beige"
    },
    {
        "rgb": "rgb(198, 166, 100)",
        "id": "RAL 1002",
        "de": "Sandgelb",
        "en": "Sand yellow",
        "fr": "Jaune sable",
        "es": "Amarillo arena",
        "it": "Giallo sabbia",
        "nl": "Zandgeel"
    },
    {
        "rgb": "rgb(229, 190, 1)",
        "id": "RAL 1003",
        "de": "Signalgelb",
        "en": "Signal yellow",
        "fr": "Jaune de sécurité",
        "es": "Amarillo señales",
        "it": "Giallo segnale",
        "nl": "Signaalgeel"
    },
    {
        "rgb": "rgb(205, 164, 52)",
        "id": "RAL 1004",
        "de": "Goldgelb",
        "en": "Golden yellow",
        "fr": "Jaune or",
        "es": "Amarillo oro",
        "it": "Giallo oro",
        "nl": "Goudgeel"
    },
    {
        "rgb": "rgb(169, 131, 7)",
        "id": "RAL 1005",
        "de": "Honiggelb",
        "en": "Honey yellow",
        "fr": "Jaune miel",
        "es": "Amarillo miel",
        "it": "Giallo miele",
        "nl": "Honinggeel"
    },
    {
        "rgb": "rgb(228, 160, 16)",
        "id": "RAL 1006",
        "de": "Maisgelb",
        "en": "Maize yellow",
        "fr": "Jaune maïs",
        "es": "Amarillo maiz",
        "it": "Giallo polenta",
        "nl": "Maisgeel"
    },
    {
        "rgb": "rgb(220, 157, 0)",
        "id": "RAL 1007",
        "de": "Narzissengelb",
        "en": "Daffodil yellow",
        "fr": "Jaune narcisse",
        "es": "Amarillo narciso",
        "it": "Giallo narciso",
        "nl": "Narcissengeel"
    },
    {
        "rgb": "rgb(138, 102, 66)",
        "id": "RAL 1011",
        "de": "Braunbeige",
        "en": "Brown beige",
        "fr": "Beige brun",
        "es": "Beige pardo",
        "it": "Beige marrone",
        "nl": "Bruinbeige"
    },
    {
        "rgb": "rgb(199, 180, 70)",
        "id": "RAL 1012",
        "de": "Zitronengelb",
        "en": "Lemon yellow",
        "fr": "Jaune citron",
        "es": "Amarillo limón",
        "it": "Giallo limone",
        "nl": "Citroengeel"
    },
    {
        "rgb": "rgb(238, 234, 205)",
        "id": "RAL 1013",
        "de": "Perlweiß",
        "en": "Oyster white",
        "fr": "Blanc perlé",
        "es": "Blanco perla",
        "it": "Bianco perla",
        "nl": "Parelwit"
    },
    {
        "rgb": "rgb(225, 204, 79)",
        "id": "RAL 1014",
        "de": "Elfenbein",
        "en": "Ivory",
        "fr": "Ivoire",
        "es": "Marfil",
        "it": "Avorio",
        "nl": "Ivoorkleurig"
    },
    {
        "rgb": "rgb(230, 214, 144)",
        "id": "RAL 1015",
        "de": "Hellelfenbein",
        "en": "Light ivory",
        "fr": "Ivoire clair",
        "es": "Marfil claro",
        "it": "Avorio chiaro",
        "nl": "Licht ivoorkleurig"
    },
    {
        "rgb": "rgb(237, 255, 33)",
        "id": "RAL 1016",
        "de": "Schwefelgelb",
        "en": "Sulfur yellow",
        "fr": "Jaune soufre",
        "es": "Amarillo azufre",
        "it": "Giallo zolfo",
        "nl": "Zwavelgeel"
    },
    {
        "rgb": "rgb(245, 208, 51)",
        "id": "RAL 1017",
        "de": "Safrangelb",
        "en": "Saffron yellow",
        "fr": "Jaune safran",
        "es": "Amarillo azafrán",
        "it": "Giallo zafferano",
        "nl": "Saffraangeel"
    },
    {
        "rgb": "rgb(248, 243, 43)",
        "id": "RAL 1018",
        "de": "Zinkgelb",
        "en": "Zinc yellow",
        "fr": "Jaune zinc",
        "es": "Amarillo de zinc",
        "it": "Giallo zinco",
        "nl": "Zinkgeel"
    },
    {
        "rgb": "rgb(158, 151, 100)",
        "id": "RAL 1019",
        "de": "Graubeige",
        "en": "Grey beige",
        "fr": "Beige gris",
        "es": "Beige agrisado",
        "it": "Beige grigiastro",
        "nl": "Grijsbeige"
    },
    {
        "rgb": "rgb(153, 153, 80)",
        "id": "RAL 1020",
        "de": "Olivgelb",
        "en": "Olive yellow",
        "fr": "Jaune olive",
        "es": "Amarillo oliva",
        "it": "Giallo olivastro",
        "nl": "Olijfgeel"
    },
    {
        "rgb": "rgb(243, 218, 11)",
        "id": "RAL 1021",
        "de": "Rapsgelb",
        "en": "Colza yellow",
        "fr": "Jaune colza",
        "es": "Amarillo colza",
        "it": "Giallo navone",
        "nl": "Koolzaadgeel"
    },
    {
        "rgb": "rgb(250, 210, 1)",
        "id": "RAL 1023",
        "de": "Verkehrsgelb",
        "en": "Traffic yellow",
        "fr": "Jaune signalisation",
        "es": "Amarillo tráfico",
        "it": "Giallo traffico",
        "nl": "Verkeersgeel"
    },
    {
        "rgb": "rgb(174, 160, 75)",
        "id": "RAL 1024",
        "de": "Ockergelb",
        "en": "Ochre yellow",
        "fr": "Jaune ocre",
        "es": "Amarillo ocre",
        "it": "Giallo ocra",
        "nl": "Okergeel"
    },
    {
        "rgb": "rgb(255, 255, 0)",
        "id": "RAL 1026",
        "de": "Leuchtgelb",
        "en": "Luminous yellow",
        "fr": "Jaune brillant",
        "es": "Amarillo brillante",
        "it": "Giallo brillante",
        "nl": "Briljantgeel"
    },
    {
        "rgb": "rgb(157, 145, 1)",
        "id": "RAL 1027",
        "de": "Currygelb",
        "en": "Curry",
        "fr": "Jaune curry",
        "es": "Amarillo curry",
        "it": "Giallo curry",
        "nl": "Kerriegeel"
    },
    {
        "rgb": "rgb(244, 169, 0)",
        "id": "RAL 1028",
        "de": "Melonengelb",
        "en": "Melon yellow",
        "fr": "Jaune melon",
        "es": "Amarillo melón",
        "it": "Giallo melone",
        "nl": "Meloengeel"
    },
    {
        "rgb": "rgb(214, 174, 1)",
        "id": "RAL 1032",
        "de": "Ginstergelb",
        "en": "Broom yellow",
        "fr": "Jaune genêt",
        "es": "Amarillo retama",
        "it": "Giallo scopa",
        "nl": "Bremgeel"
    },
    {
        "rgb": "rgb(243, 165, 5)",
        "id": "RAL 1033",
        "de": "Dahliengelb",
        "en": "Dahlia yellow",
        "fr": "Jaune dahlia",
        "es": "Amarillo dalia",
        "it": "Giallo dahlien",
        "nl": "Dahliageel"
    },
    {
        "rgb": "rgb(239, 169, 74)",
        "id": "RAL 1034",
        "de": "Pastellgelb",
        "en": "Pastel yellow",
        "fr": "Jaune pastel",
        "es": "Amarillo pastel",
        "it": "Giallo pastello",
        "nl": "Pastelgeel"
    },
    {
        "rgb": "rgb(106, 93, 77)",
        "id": "RAL 1035",
        "de": "Perlbeige",
        "en": "Pearl beige",
        "fr": "Beige nacré",
        "es": "Beige perlado",
        "it": "Beige perlato",
        "nl": "Parelmoergrijs"
    },
    {
        "rgb": "rgb(112, 83, 53)",
        "id": "RAL 1036",
        "de": "Perlgold",
        "en": "Pearl gold",
        "fr": "Or nacré",
        "es": "Oro perlado",
        "it": "Oro perlato",
        "nl": "Parelmoergoud"
    },
    {
        "rgb": "rgb(243, 159, 24)",
        "id": "RAL 1037",
        "de": "Sonnengelb",
        "en": "Sun yellow",
        "fr": "Jaune soleil",
        "es": "Amarillo sol",
        "it": "Giallo sole",
        "nl": "Zonnegeel"
    },
    {
        "rgb": "rgb(255, 117, 20)",
        "id": "RAL 2000",
        "de": "Gelborange",
        "en": "Yellow orange",
        "fr": "Orangé jaune",
        "es": "Amarillo naranja",
        "it": "Arancio giallastro",
        "nl": "Geeloranje"
    },
    {
        "rgb": "rgb(201, 60, 32)",
        "id": "RAL 2001",
        "de": "Rotorange",
        "en": "Red orange",
        "fr": "Orangé rouge",
        "es": "Rojo anaranjado",
        "it": "Arancio rossastro",
        "nl": "Roodoranje"
    },
    {
        "rgb": "rgb(203, 40, 33)",
        "id": "RAL 2002",
        "de": "Blutorange",
        "en": "Vermilion",
        "fr": "Orangé sang",
        "es": "Naranja sanguineo",
        "it": "Arancio sanguigno",
        "nl": "Vermiljoen"
    },
    {
        "rgb": "rgb(255, 117, 20)",
        "id": "RAL 2003",
        "de": "Pastellorange",
        "en": "Pastel orange",
        "fr": "Orangé pastel",
        "es": "Naranja pálido",
        "it": "Arancio pastello",
        "nl": "Pasteloranje"
    },
    {
        "rgb": "rgb(244, 70, 17)",
        "id": "RAL 2004",
        "de": "Reinorange",
        "en": "Pure orange",
        "fr": "Orangé pur",
        "es": "Naranja puro",
        "it": "Arancio puro",
        "nl": "Zuiver oranje"
    },
    {
        "rgb": "rgb(255, 35, 1)",
        "id": "RAL 2005",
        "de": "Leuchtorange",
        "en": "Luminous orange",
        "fr": "Orangé brillant",
        "es": "Naranja brillante",
        "it": "Arancio brillante",
        "nl": "Briljant oranje"
    },
    {
        "rgb": "rgb(255, 164, 32)",
        "id": "RAL 2007",
        "de": "Leuchthellorange",
        "en": "Luminous bright orange",
        "fr": "Orangé clair rillant",
        "es": "Naranja claro brillante",
        "it": "Arancio chiaro brillante",
        "nl": "Briljant lichtoranje"
    },
    {
        "rgb": "rgb(247, 94, 37)",
        "id": "RAL 2008",
        "de": "Hellrotorange",
        "en": "Bright red orange",
        "fr": "Orangé rouge clair",
        "es": "Rojo claro anaranjado",
        "it": "Rosso arancio chiaro",
        "nl": "Licht roodoranje"
    },
    {
        "rgb": "rgb(245, 64, 33)",
        "id": "RAL 2009",
        "de": "Verkehrsorange",
        "en": "Traffic orange",
        "fr": "Orangé signalisation",
        "es": "Naranja tráfico",
        "it": "Arancio traffico",
        "nl": "Verkeersoranje"
    },
    {
        "rgb": "rgb(216, 75, 32)",
        "id": "RAL 2010",
        "de": "Signalorange",
        "en": "Signal orange",
        "fr": "Orangé de sécurité",
        "es": "Naranja señales",
        "it": "Arancio segnale",
        "nl": "Signaaloranje"
    },
    {
        "rgb": "rgb(236, 124, 38)",
        "id": "RAL 2011",
        "de": "Tieforange",
        "en": "Deep orange",
        "fr": "Orangé foncé",
        "es": "Naranja intenso",
        "it": "Arancio profondo",
        "nl": "Dieporanje"
    },
    {
        "rgb": "rgb(229, 81, 55)",
        "id": "RAL 2012",
        "de": "Lachsorange",
        "en": "Salmon range",
        "fr": "Orangé saumon",
        "es": "Naranja salmón",
        "it": "Arancio salmone",
        "nl": "Zalmoranje"
    },
    {
        "rgb": "rgb(195, 88, 49)",
        "id": "RAL 2013",
        "de": "Perlorange",
        "en": "Pearl orange",
        "fr": "Orangé nacré",
        "es": "Naranja perlado",
        "it": "Arancio perlato",
        "nl": "Parelmoeroranje"
    },
    {
        "rgb": "rgb(248, 0, 0)",
        "id": "RAL 3000",
        "de": "Feuerrot",
        "en": "Flame red",
        "fr": "Rouge feu",
        "es": "Rojo vivo",
        "it": "Rosso fuoco",
        "nl": "Vuurrood"
    },
    {
        "rgb": "rgb(165, 32, 25)",
        "id": "RAL 3001",
        "de": "Signalrot",
        "en": "Signal red",
        "fr": "Rouge de sécurité",
        "es": "Rojo señales",
        "it": "Rosso  segnale",
        "nl": "Signaalrood"
    },
    {
        "rgb": "rgb(162, 35, 29)",
        "id": "RAL 3002",
        "de": "Karminrot",
        "en": "Carmine red",
        "fr": "Rouge carmin",
        "es": "Rojo carmin",
        "it": "Rosso carminio",
        "nl": "Karmijnrood"
    },
    {
        "rgb": "rgb(155, 17, 30)",
        "id": "RAL 3003",
        "de": "Rubinrot",
        "en": "Ruby red",
        "fr": "Rouge rubis",
        "es": "Rojo rubí",
        "it": "Rosso rubino",
        "nl": "Robijnrood"
    },
    {
        "rgb": "rgb(117, 21, 30)",
        "id": "RAL 3004",
        "de": "Purpurrot",
        "en": "Purple red",
        "fr": "Rouge pourpre",
        "es": "Rojo purpura",
        "it": "Rosso porpora",
        "nl": "Purperrood"
    },
    {
        "rgb": "rgb(94, 33, 41)",
        "id": "RAL 3005",
        "de": "Weinrot",
        "en": "Wine red",
        "fr": "Rouge vin",
        "es": "Rojo vino",
        "it": "Rosso vino",
        "nl": "Wijnrood"
    },
    {
        "rgb": "rgb(53, 31, 33)",
        "id": "RAL 3007",
        "de": "Schwarzrot",
        "en": "Black red",
        "fr": "Rouge noir",
        "es": "Rojo negruzco",
        "it": "Rosso nerastro",
        "nl": "Zwartrood"
    },
    {
        "rgb": "rgb(100, 36, 36)",
        "id": "RAL 3009",
        "de": "Oxidrot",
        "en": "Oxide red",
        "fr": "Rouge oxyde",
        "es": "Rojo óxido",
        "it": "Rosso  ossido",
        "nl": "Oxyderood"
    },
    {
        "rgb": "rgb(120, 31, 25)",
        "id": "RAL 3011",
        "de": "Braunrot",
        "en": "Brown red",
        "fr": "Rouge brun",
        "es": "Rojo pardo",
        "it": "Rosso marrone",
        "nl": "Bruinrood"
    },
    {
        "rgb": "rgb(193, 135, 107)",
        "id": "RAL 3012",
        "de": "Beigerot",
        "en": "Beige red",
        "fr": "Rouge beige",
        "es": "Rojo beige",
        "it": "Rosso beige",
        "nl": "Beigerood"
    },
    {
        "rgb": "rgb(161, 35, 18)",
        "id": "RAL 3013",
        "de": "Tomatenrot",
        "en": "Tomato red",
        "fr": "Rouge tomate",
        "es": "Rojo tomate",
        "it": "Rosso pomodoro",
        "nl": "Tomaatrood"
    },
    {
        "rgb": "rgb(211, 110, 112)",
        "id": "RAL 3014",
        "de": "Altrosa",
        "en": "Antique pink",
        "fr": "Vieux rose",
        "es": "Rojo viejo",
        "it": "Rosa antico",
        "nl": "Oudroze"
    },
    {
        "rgb": "rgb(234, 137, 154)",
        "id": "RAL 3015",
        "de": "Hellrosa",
        "en": "Light pink",
        "fr": "Rose clair",
        "es": "Rosa claro",
        "it": "Rosa chiaro",
        "nl": "Lichtroze"
    },
    {
        "rgb": "rgb(179, 40, 33)",
        "id": "RAL 3016",
        "de": "Korallenrot",
        "en": "Coral red",
        "fr": "Rouge corail",
        "es": "Rojo coral",
        "it": "Rosso corallo",
        "nl": "Koraalrood"
    },
    {
        "rgb": "rgb(230, 50, 68)",
        "id": "RAL 3017",
        "de": "Rosé",
        "en": "Rose",
        "fr": "Rosé",
        "es": "Rosa",
        "it": "Rosato",
        "nl": "Bleekrood"
    },
    {
        "rgb": "rgb(213, 48, 50)",
        "id": "RAL 3018",
        "de": "Erdbeerrot",
        "en": "Strawberry red",
        "fr": "Rouge fraise",
        "es": "Rojo fresa",
        "it": "Rosso fragola",
        "nl": "Aardbeirood"
    },
    {
        "rgb": "rgb(204, 6, 5)",
        "id": "RAL 3020",
        "de": "Verkehrsrot",
        "en": "Traffic red",
        "fr": "Rouge signalisation",
        "es": "Rojo tráfico",
        "it": "Rosso traffico",
        "nl": "Verkeersrood"
    },
    {
        "rgb": "rgb(217, 80, 48)",
        "id": "RAL 3022",
        "de": "Lachsrot",
        "en": "Salmon pink",
        "fr": "Rouge saumon",
        "es": "Rojo salmón",
        "it": "Rosso salmone",
        "nl": "Zalmrood"
    },
    {
        "rgb": "rgb(248, 0, 0)",
        "id": "RAL 3024",
        "de": "Leuchtrot",
        "en": "Luminous red",
        "fr": "Rouge brillant",
        "es": "Rojo brillante",
        "it": "Rosso brillante",
        "nl": "Briljantrood"
    },
    {
        "rgb": "rgb(254, 0, 0)",
        "id": "RAL 3026",
        "de": "Leuchthellrot",
        "en": "Luminous\\n\\nbright red",
        "fr": "Rouge clair brillant",
        "es": "Rojo claro brillante",
        "it": "Rosso chiaro brillante",
        "nl": "Briljant lichtrood"
    },
    {
        "rgb": "rgb(197, 29, 52)",
        "id": "RAL 3027",
        "de": "Himbeerrot",
        "en": "Raspberry red",
        "fr": "Rouge framboise",
        "es": "Rojo frambuesa",
        "it": "Rosso lampone",
        "nl": "Framboosrood"
    },
    {
        "rgb": "rgb(203, 50, 52)",
        "id": "RAL 3028",
        "de": "Reinrot",
        "en": "Pure  red",
        "fr": "Rouge puro",
        "es": "Rojo puro",
        "it": "Rosso puro",
        "nl": "Zuiverrood"
    },
    {
        "rgb": "rgb(179, 36, 40)",
        "id": "RAL 3031",
        "de": "Orientrot",
        "en": "Orient red",
        "fr": "Rouge oriental",
        "es": "Rojo oriente",
        "it": "Rosso oriente",
        "nl": "Oriëntrood"
    },
    {
        "rgb": "rgb(114, 20, 34)",
        "id": "RAL 3032",
        "de": "Perlrubinrot",
        "en": "Pearl ruby red",
        "fr": "Rouge rubis nacré",
        "es": "Rojo rubí perlado",
        "it": "Rosso rubino perlato",
        "nl": "Parelmoerdonkerrood"
    },
    {
        "rgb": "rgb(180, 76, 67)",
        "id": "RAL 3033",
        "de": "Perlrosa",
        "en": "Pearl pink",
        "fr": "Rose nacré",
        "es": "Rosa perlado",
        "it": "Rosa perlato",
        "nl": "Parelmoerlichtrood"
    },
    {
        "rgb": "rgb(204, 51, 204)",
        "id": "RAL 4001",
        "de": "Rotlila",
        "en": "Red lilac",
        "fr": "Lilas rouge",
        "es": "Rojo lila",
        "it": "Lilla rossastro",
        "nl": "Roodlila"
    },
    {
        "rgb": "rgb(146, 43, 62)",
        "id": "RAL 4002",
        "de": "Rotviolett",
        "en": "Red violet",
        "fr": "Violet rouge",
        "es": "Rojo violeta",
        "it": "Viola rossastro",
        "nl": "Roodpaars"
    },
    {
        "rgb": "rgb(222, 76, 138)",
        "id": "RAL 4003",
        "de": "Erikaviolett",
        "en": "Heather violet",
        "fr": "Violet bruyère",
        "es": "Violeta érica",
        "it": "Viola erica",
        "nl": "Heidepaars"
    },
    {
        "rgb": "rgb(110, 28, 52)",
        "id": "RAL 4004",
        "de": "Bordeauxviolett",
        "en": "Claret violet",
        "fr": "Violet bordeaux",
        "es": "Burdeos",
        "it": "Viola bordeaux",
        "nl": "Bordeauxpaars"
    },
    {
        "rgb": "rgb(108, 70, 117)",
        "id": "RAL 4005",
        "de": "Blaulila",
        "en": "Blue lilac",
        "fr": "Lilas bleu",
        "es": "Lila azulado",
        "it": "Lilla bluastro",
        "nl": "Blauwlila"
    },
    {
        "rgb": "rgb(160, 52, 114)",
        "id": "RAL 4006",
        "de": "Verkehrspurpur",
        "en": "Traffic purple",
        "fr": "Pourpre signalisation",
        "es": "Púrpurá tráfico",
        "it": "Porpora traffico",
        "nl": "Verkeerspurper"
    },
    {
        "rgb": "rgb(74, 25, 44)",
        "id": "RAL 4007",
        "de": "Purpurviolett",
        "en": "Purple violet",
        "fr": "Violet pourpre",
        "es": "Violeta púrpura",
        "it": "Porpora violetto",
        "nl": "Purperviolet"
    },
    {
        "rgb": "rgb(146, 78, 125)",
        "id": "RAL 4008",
        "de": "Signalviolett",
        "en": "Signal violet",
        "fr": "Violet de sécurité",
        "es": "Violeta señales",
        "it": "Violetto segnale",
        "nl": "Signaalviolet"
    },
    {
        "rgb": "rgb(164, 125, 144)",
        "id": "RAL 4009",
        "de": "Pastellviolett",
        "en": "Pastel violet",
        "fr": "Violet pastel",
        "es": "Violeta pastel",
        "it": "Violetto pastello",
        "nl": "Pastelviolet"
    },
    {
        "rgb": "rgb(215, 45, 109)",
        "id": "RAL 4010",
        "de": "Telemagenta",
        "en": "Telemagenta",
        "fr": "Telemagenta",
        "es": "Magenta tele",
        "it": "Tele Magenta",
        "nl": "Telemagenta"
    },
    {
        "rgb": "rgb(134, 115, 161)",
        "id": "RAL 4011",
        "de": "Perlviolett",
        "en": "Pearl violet",
        "fr": "Violet nacré",
        "es": "Violeta perlado",
        "it": "Violetto perlato",
        "nl": "Parelmoerdonkerviolet"
    },
    {
        "rgb": "rgb(108, 104, 129)",
        "id": "RAL 4012",
        "de": "Perlbrombeer",
        "en": "Pearl black berry",
        "fr": "Mûre nacré",
        "es": "Morado perlado",
        "it": "Mora perlato",
        "nl": "Parelmoerlichtviolet"
    },
    {
        "rgb": "rgb(34, 113, 179)",
        "id": "RAL 5000",
        "de": "Violettblau",
        "en": "Violet blue",
        "fr": "Bleu violet",
        "es": "Azul violeta",
        "it": "Blu violaceo",
        "nl": "Paarsblauw"
    },
    {
        "rgb": "rgb(31, 52, 56)",
        "id": "RAL 5001",
        "de": "Grünblau",
        "en": "Green blue",
        "fr": "Bleu vert",
        "es": "Azul verdoso",
        "it": "Blu verdastro",
        "nl": "Groenblauw"
    },
    {
        "rgb": "rgb(32, 33, 79)",
        "id": "RAL 5002",
        "de": "Ultramarinblau",
        "en": "Ultramarine blue",
        "fr": "Bleu outremer",
        "es": "Azul ultramar",
        "it": "Blu oltremare",
        "nl": "Ultramarijnblauw"
    },
    {
        "rgb": "rgb(29, 30, 51)",
        "id": "RAL 5003",
        "de": "Saphirblau",
        "en": "Saphire blue",
        "fr": "Bleu saphir",
        "es": "Azul zafiro",
        "it": "Blu zaffiro",
        "nl": "Saffierblauw"
    },
    {
        "rgb": "rgb(24, 23, 28)",
        "id": "RAL 5004",
        "de": "Schwarzblau",
        "en": "Black blue",
        "fr": "Bleu noir",
        "es": "Azul negruzco",
        "it": "Blu nerastro",
        "nl": "Zwartblauw"
    },
    {
        "rgb": "rgb(30, 45, 110)",
        "id": "RAL 5005",
        "de": "Signalblau",
        "en": "Signal blue",
        "fr": "Bleu de sécurité",
        "es": "Azul señales",
        "it": "Blu segnale",
        "nl": "Signaalblauw"
    },
    {
        "rgb": "rgb(62, 95, 138)",
        "id": "RAL 5007",
        "de": "Brillantblau",
        "en": "Brillant blue",
        "fr": "Bleu brillant",
        "es": "Azul brillante",
        "it": "Blu brillante",
        "nl": "Briljantblauw"
    },
    {
        "rgb": "rgb(38, 37, 45)",
        "id": "RAL 5008",
        "de": "Graublau",
        "en": "Grey blue",
        "fr": "Bleu gris",
        "es": "Azul grisáceo",
        "it": "Blu grigiastro",
        "nl": "Grijsblauw"
    },
    {
        "rgb": "rgb(2, 86, 105)",
        "id": "RAL 5009",
        "de": "Azurblau",
        "en": "Azure blue",
        "fr": "Bleu azur",
        "es": "Azul azur",
        "it": "Blu  azzurro",
        "nl": "Azuurblauw"
    },
    {
        "rgb": "rgb(14, 41, 75)",
        "id": "RAL 5010",
        "de": "Enzianblau",
        "en": "Gentian blue",
        "fr": "Bleu gentiane",
        "es": "Azul genciana",
        "it": "Blu  genziana",
        "nl": "Gentiaanblauw"
    },
    {
        "rgb": "rgb(35, 26, 36)",
        "id": "RAL 5011",
        "de": "Stahlblau",
        "en": "Steel blue",
        "fr": "Bleu acier",
        "es": "Azul acero",
        "it": "Blu acciaio",
        "nl": "Staalblauw"
    },
    {
        "rgb": "rgb(59, 131, 189)",
        "id": "RAL 5012",
        "de": "Lichtblau",
        "en": "Light blue",
        "fr": "Bleu clair",
        "es": "Azul luminoso",
        "it": "Blu luce",
        "nl": "Lichtblauw"
    },
    {
        "rgb": "rgb(30, 33, 61)",
        "id": "RAL 5013",
        "de": "Kobaltblau",
        "en": "Cobalt blue",
        "fr": "Bleu cobalt",
        "es": "Azul cobalto",
        "it": "Blu cobalto",
        "nl": "Kobaltblauw"
    },
    {
        "rgb": "rgb(96, 110, 140)",
        "id": "RAL 5014",
        "de": "Taubenblau",
        "en": "Pigeon blue",
        "fr": "Bleu pigeon",
        "es": "Azul olombino",
        "it": "Blu colomba",
        "nl": "Duifblauw"
    },
    {
        "rgb": "rgb(34, 113, 179)",
        "id": "RAL 5015",
        "de": "Himmelblau",
        "en": "Sky blue",
        "fr": "Bleu ciel",
        "es": "Azul celeste",
        "it": "Blu cielo",
        "nl": "Hemelsblauw"
    },
    {
        "rgb": "rgb(6, 57, 113)",
        "id": "RAL 5017",
        "de": "Verkehrsblau",
        "en": "Traffic blue",
        "fr": "Bleu signalisation",
        "es": "Azul tráfico",
        "it": "Blu traffico",
        "nl": "Verkeersblauw"
    },
    {
        "rgb": "rgb(63, 136, 143)",
        "id": "RAL 5018",
        "de": "Türkisblau",
        "en": "Turquoise blue",
        "fr": "Bleu turquoise",
        "es": "Azul turquesa",
        "it": "Blu turchese",
        "nl": "Turkooisblauw"
    },
    {
        "rgb": "rgb(27, 85, 131)",
        "id": "RAL 5019",
        "de": "Capriblau",
        "en": "Capri blue",
        "fr": "Bleu capri",
        "es": "Azul capri",
        "it": "Blu capri",
        "nl": "Capriblauw"
    },
    {
        "rgb": "rgb(29, 51, 74)",
        "id": "RAL 5020",
        "de": "Ozeanblau",
        "en": "Ocean blue",
        "fr": "Bleu océan",
        "es": "Azul oceano",
        "it": "Blu oceano",
        "nl": "Oceaanblauw"
    },
    {
        "rgb": "rgb(37, 109, 123)",
        "id": "RAL 5021",
        "de": "Wasserblau",
        "en": "Water blue",
        "fr": "Bleu d’eau",
        "es": "Azul agua",
        "it": "Blu acqua",
        "nl": "Waterblauw"
    },
    {
        "rgb": "rgb(37, 40, 80)",
        "id": "RAL 5022",
        "de": "Nachtblau",
        "en": "Night blue",
        "fr": "Bleu nocturne",
        "es": "Azul noche",
        "it": "Blu notte",
        "nl": "Nachtblauw"
    },
    {
        "rgb": "rgb(73, 103, 141)",
        "id": "RAL 5023",
        "de": "Fernblau",
        "en": "Distant blue",
        "fr": "Bleu distant",
        "es": "Azul lejanía",
        "it": "Blu distante",
        "nl": "Verblauw"
    },
    {
        "rgb": "rgb(93, 155, 155)",
        "id": "RAL 5024",
        "de": "Pastellblau",
        "en": "Pastel blue",
        "fr": "Bleu pastel",
        "es": "Azul pastel",
        "it": "Blu pastello",
        "nl": "Pastelblauw"
    },
    {
        "rgb": "rgb(42, 100, 120)",
        "id": "RAL 5025",
        "de": "Perlenzian",
        "en": "Pearl gentian blue",
        "fr": "Gentiane nacré",
        "es": "Gencian perlado",
        "it": "Blu genziana perlato",
        "nl": "Parelmoerblauw"
    },
    {
        "rgb": "rgb(16, 44, 84)",
        "id": "RAL 5026",
        "de": "Perlnachtblau",
        "en": "Pearl night blue",
        "fr": "Bleu nuit nacré",
        "es": "Azul noche perlado",
        "it": "Blu notte perlato",
        "nl": "Parelmoernachtblauw"
    },
    {
        "rgb": "rgb(87, 166, 57)",
        "id": "RAL 6000",
        "de": "Patinagrün",
        "en": "Patina green",
        "fr": "Vert patine",
        "es": "Verde patina",
        "it": "Verde patina",
        "nl": "Patinagroen"
    },
    {
        "rgb": "rgb(40, 114, 51)",
        "id": "RAL 6001",
        "de": "Smaragdgrün",
        "en": "Emerald green",
        "fr": "Vert émeraude",
        "es": "Verde esmeralda",
        "it": "Verde smeraldo",
        "nl": "Smaragdgroen"
    },
    {
        "rgb": "rgb(45, 87, 44)",
        "id": "RAL 6002",
        "de": "Laubgrün",
        "en": "Leaf green",
        "fr": "Vert feuillage",
        "es": "Verde hoja",
        "it": "Verde foglia",
        "nl": "Loofgroen"
    },
    {
        "rgb": "rgb(66, 70, 50)",
        "id": "RAL 6003",
        "de": "Olivgrün",
        "en": "Olive green",
        "fr": "Vert olive",
        "es": "Verde oliva",
        "it": "Verde oliva",
        "nl": "Olijfgroen"
    },
    {
        "rgb": "rgb(31, 58, 61)",
        "id": "RAL 6004",
        "de": "Blaugrün",
        "en": "Blue green",
        "fr": "Vert bleu",
        "es": "Verde azulado",
        "it": "Verde bluastro",
        "nl": "Blauwgroen"
    },
    {
        "rgb": "rgb(47, 69, 56)",
        "id": "RAL 6005",
        "de": "Moosgrün",
        "en": "Moss green",
        "fr": "Vert mousse",
        "es": "Verde musgo",
        "it": "Verde muschio",
        "nl": "Mosgroen"
    },
    {
        "rgb": "rgb(62, 59, 50)",
        "id": "RAL 6006",
        "de": "Grauoliv",
        "en": "Grey olive",
        "fr": "Olive gris",
        "es": "Oliva grisáceo",
        "it": "Oliva grigiastro",
        "nl": "Grijs olijfgroen"
    },
    {
        "rgb": "rgb(52, 59, 41)",
        "id": "RAL 6007",
        "de": "Flaschengrün",
        "en": "Bottle green",
        "fr": "Vert bouteille",
        "es": "Verde botella",
        "it": "Verde bottiglia",
        "nl": "Flessegroen"
    },
    {
        "rgb": "rgb(57, 53, 42)",
        "id": "RAL 6008",
        "de": "Braungrün",
        "en": "Brown green",
        "fr": "Vert brun",
        "es": "Verde parduzco",
        "it": "Verde brunastro",
        "nl": "Bruingroen"
    },
    {
        "rgb": "rgb(49, 55, 43)",
        "id": "RAL 6009",
        "de": "Tannengrün",
        "en": "Fir green",
        "fr": "Vert sapin",
        "es": "Verde abeto",
        "it": "Verde abete",
        "nl": "Dennegroen"
    },
    {
        "rgb": "rgb(53, 104, 45)",
        "id": "RAL 6010",
        "de": "Grasgrün",
        "en": "Grass green",
        "fr": "Vert herbe",
        "es": "Verde hierba",
        "it": "Verde erba",
        "nl": "Grasgroen"
    },
    {
        "rgb": "rgb(88, 114, 70)",
        "id": "RAL 6011",
        "de": "Resedagrün",
        "en": "Reseda green",
        "fr": "Vert réséda",
        "es": "Verde reseda",
        "it": "Verde reseda",
        "nl": "Resedagroen"
    },
    {
        "rgb": "rgb(52, 62, 64)",
        "id": "RAL 6012",
        "de": "Schwarzgrün",
        "en": "Black green",
        "fr": "Vert noir",
        "es": "Verde negruzco",
        "it": "Verde nerastro",
        "nl": "Zwartgroen"
    },
    {
        "rgb": "rgb(108, 113, 86)",
        "id": "RAL 6013",
        "de": "Schilfgrün",
        "en": "Reed green",
        "fr": "Vert jonc",
        "es": "Verde caña",
        "it": "Verde canna",
        "nl": "Rietgroen"
    },
    {
        "rgb": "rgb(71, 64, 46)",
        "id": "RAL 6014",
        "de": "Gelboliv",
        "en": "Yellow olive",
        "fr": "Olive jaune",
        "es": "Amarillo oliva",
        "it": "Oliva giallastro",
        "nl": "Geel olijfgroen"
    },
    {
        "rgb": "rgb(59, 60, 54)",
        "id": "RAL 6015",
        "de": "Schwarzoliv",
        "en": "Black olive",
        "fr": "Olive noir",
        "es": "Oliva negruzco",
        "it": "Oliva nerastro",
        "nl": "Zwart olijfgroen"
    },
    {
        "rgb": "rgb(30, 89, 69)",
        "id": "RAL 6016",
        "de": "Türkisgrün",
        "en": "Turquoise green",
        "fr": "Vert turquoise",
        "es": "Verde turquesa",
        "it": "Verde turchese",
        "nl": "Turkooisgroen"
    },
    {
        "rgb": "rgb(76, 145, 65)",
        "id": "RAL 6017",
        "de": "Maigrün",
        "en": "May green",
        "fr": "Vert mai",
        "es": "Verde mayo",
        "it": "Verde maggio",
        "nl": "Meigroen"
    },
    {
        "rgb": "rgb(87, 166, 57)",
        "id": "RAL 6018",
        "de": "Gelbgrün",
        "en": "Yellow green",
        "fr": "Vert jaune",
        "es": "Verde amarillento",
        "it": "Verde giallastro",
        "nl": "Geelgroen"
    },
    {
        "rgb": "rgb(189, 236, 182)",
        "id": "RAL 6019",
        "de": "Weißgrün",
        "en": "Pastel green",
        "fr": "Vert blanc",
        "es": "Verde lanquecino",
        "it": "Verde biancastro",
        "nl": "Witgroen"
    },
    {
        "rgb": "rgb(46, 58, 35)",
        "id": "RAL 6020",
        "de": "Chromoxidgrün",
        "en": "Chrome green",
        "fr": "Vert oxyde chromique",
        "es": "Verde cromo",
        "it": "Verde cromo",
        "nl": "Chroomoxydegroen"
    },
    {
        "rgb": "rgb(137, 172, 118)",
        "id": "RAL 6021",
        "de": "Blassgrün",
        "en": "Pale green",
        "fr": "Vert pâle",
        "es": "Verde pálido",
        "it": "Verde pallido",
        "nl": "Bleekgroen"
    },
    {
        "rgb": "rgb(37, 34, 27)",
        "id": "RAL 6022",
        "de": "Braunoliv",
        "en": "Olive drab",
        "fr": "Olive brun",
        "es": "Oliva parduzco",
        "it": "Oliva brunastro",
        "nl": "Bruin olijfgroen"
    },
    {
        "rgb": "rgb(48, 132, 70)",
        "id": "RAL 6024",
        "de": "Verkehrsgrün",
        "en": "Traffic green",
        "fr": "Vert signalisation",
        "es": "Verde tráfico",
        "it": "Verde traffico",
        "nl": "Verkeersgroen"
    },
    {
        "rgb": "rgb(61, 100, 45)",
        "id": "RAL 6025",
        "de": "Farngrün",
        "en": "Fern green",
        "fr": "Vert fougère",
        "es": "Verde helecho",
        "it": "Verde felce",
        "nl": "Varengroen"
    },
    {
        "rgb": "rgb(1, 93, 82)",
        "id": "RAL 6026",
        "de": "Opalgrün",
        "en": "Opal green",
        "fr": "Vert opale",
        "es": "Verde opalo",
        "it": "Verde opale",
        "nl": "Opaalgroen"
    },
    {
        "rgb": "rgb(132, 195, 190)",
        "id": "RAL 6027",
        "de": "Lichtgrün",
        "en": "Light green",
        "fr": "Vert clair",
        "es": "Verde luminoso",
        "it": "Verde chiaro",
        "nl": "Lichtgroen"
    },
    {
        "rgb": "rgb(44, 85, 69)",
        "id": "RAL 6028",
        "de": "Kieferngrün",
        "en": "Pine green",
        "fr": "Vert pin",
        "es": "Verde pino",
        "it": "Verde pino",
        "nl": "Pijnboomgroen"
    },
    {
        "rgb": "rgb(32, 96, 61)",
        "id": "RAL 6029",
        "de": "Minzgrün",
        "en": "Mint green",
        "fr": "Vert menthe",
        "es": "Verde menta",
        "it": "Verde menta",
        "nl": "Mintgroen"
    },
    {
        "rgb": "rgb(49, 127, 67)",
        "id": "RAL 6032",
        "de": "Signalgrün",
        "en": "Signal green",
        "fr": "Vert de sécurité",
        "es": "Verde señales",
        "it": "Verde segnale",
        "nl": "Signaalgroen"
    },
    {
        "rgb": "rgb(73, 126, 118)",
        "id": "RAL 6033",
        "de": "Minttürkis",
        "en": "Mint turquoise",
        "fr": "Turquoise menthe",
        "es": "Turquesa menta",
        "it": "Turchese menta",
        "nl": "Mintturquoise"
    },
    {
        "rgb": "rgb(127, 181, 181)",
        "id": "RAL 6034",
        "de": "Pastelltürkis",
        "en": "Pastel turquoise",
        "fr": "Turquoise pastel",
        "es": "Turquesa pastel",
        "it": "Turchese pastello",
        "nl": "Pastelturquoise"
    },
    {
        "rgb": "rgb(28, 84, 45)",
        "id": "RAL 6035",
        "de": "Perlgrün",
        "en": "Pearl green",
        "fr": "Vert nacré",
        "es": "Verde perlado",
        "it": "Verde perlato",
        "nl": "Parelmoerdonkergroen"
    },
    {
        "rgb": "rgb(25, 55, 55)",
        "id": "RAL 6036",
        "de": "Perlopalgrün",
        "en": "Pearl opal green",
        "fr": "Vert opal nacré",
        "es": "Verde ópalo perlado",
        "it": "Verde opalo perlato",
        "nl": "Parelmoerlichtgroen"
    },
    {
        "rgb": "rgb(0, 143, 57)",
        "id": "RAL 6037",
        "de": "Reingrün",
        "en": "Pure green",
        "fr": "Vert pur",
        "es": "Verde puro",
        "it": "Verde puro",
        "nl": "Zuivergroen"
    },
    {
        "rgb": "rgb(0, 187, 45)",
        "id": "RAL 6038",
        "de": "Leuchtgrün",
        "en": "Luminous green",
        "fr": "Vert brillant",
        "es": "Verde brillante",
        "it": "Verde brillante",
        "nl": "Briljantgroen"
    },
    {
        "rgb": "rgb(192, 192, 192)",
        "id": "RAL 7000",
        "de": "Fehgrau",
        "en": "Squirrel grey",
        "fr": "Gris petit-gris",
        "es": "Gris ardilla",
        "it": "Grigio vaio",
        "nl": "Pelsgrijs"
    },
    {
        "rgb": "rgb(138, 149, 151)",
        "id": "RAL 7001",
        "de": "Silbergrau",
        "en": "Silver grey",
        "fr": "Gris argent",
        "es": "Gris plata",
        "it": "Grigio argento",
        "nl": "Zilvergrijs"
    },
    {
        "rgb": "rgb(126, 123, 82)",
        "id": "RAL 7002",
        "de": "Olivgrau",
        "en": "Olive grey",
        "fr": "Gris olive",
        "es": "Gris oliva",
        "it": "Grigio olivastro",
        "nl": "Olijfgrijs"
    },
    {
        "rgb": "rgb(108, 112, 89)",
        "id": "RAL 7003",
        "de": "Moosgrau",
        "en": "Moss grey",
        "fr": "Gris mousse",
        "es": "Gris musgo",
        "it": "Grigio muschio",
        "nl": "Mosgrijs"
    },
    {
        "rgb": "rgb(150, 153, 146)",
        "id": "RAL 7004",
        "de": "Signalgrau",
        "en": "Signal grey",
        "fr": "Gris de sécurité",
        "es": "Gris señales",
        "it": "Grigio segnale",
        "nl": "Signaalgrijs"
    },
    {
        "rgb": "rgb(100, 107, 99)",
        "id": "RAL 7005",
        "de": "Mausgrau",
        "en": "Mouse grey",
        "fr": "Gris souris",
        "es": "Gris ratón",
        "it": "Grigio topo",
        "nl": "Muisgrijs"
    },
    {
        "rgb": "rgb(109, 101, 82)",
        "id": "RAL 7006",
        "de": "Beigegrau",
        "en": "Beige grey",
        "fr": "Gris beige",
        "es": "Gris beige",
        "it": "Grigio beige",
        "nl": "Beigegrijs"
    },
    {
        "rgb": "rgb(106, 95, 49)",
        "id": "RAL 7008",
        "de": "Khakigrau",
        "en": "Khaki grey",
        "fr": "Gris kaki",
        "es": "Gris caqui",
        "it": "Grigio kaki",
        "nl": "Kakigrijs"
    },
    {
        "rgb": "rgb(77, 86, 69)",
        "id": "RAL 7009",
        "de": "Grüngrau",
        "en": "Green grey",
        "fr": "Gris vert",
        "es": "Gris verdoso",
        "it": "Grigio verdastro",
        "nl": "Groengrijs"
    },
    {
        "rgb": "rgb(76, 81, 74)",
        "id": "RAL 7010",
        "de": "Zeltgrau",
        "en": "Tarpaulin grey",
        "fr": "Gris tente",
        "es": "Gris lona",
        "it": "Grigio tenda",
        "nl": "Zeildoekgrijs"
    },
    {
        "rgb": "rgb(67, 75, 77)",
        "id": "RAL 7011",
        "de": "Eisengrau",
        "en": "Iron grey",
        "fr": "Gris fer",
        "es": "Gris hierro",
        "it": "Grigio ferro",
        "nl": "IJzergrijs"
    },
    {
        "rgb": "rgb(78, 87, 84)",
        "id": "RAL 7012",
        "de": "Basaltgrau",
        "en": "Basalt grey",
        "fr": "Gris basalte",
        "es": "Gris basalto",
        "it": "Grigio basalto",
        "nl": "Bazaltgrijs"
    },
    {
        "rgb": "rgb(70, 69, 49)",
        "id": "RAL 7013",
        "de": "Braungrau",
        "en": "Brown grey",
        "fr": "Gris brun",
        "es": "Gris parduzco",
        "it": "Grigio brunastro",
        "nl": "Bruingrijs"
    },
    {
        "rgb": "rgb(67, 71, 80)",
        "id": "RAL 7015",
        "de": "Schiefergrau",
        "en": "Slate grey",
        "fr": "Gris ardoise",
        "es": "Gris pizarra",
        "it": "Grigio ardesia",
        "nl": "Leigrijs"
    },
    {
        "rgb": "rgb(41, 49, 51)",
        "id": "RAL 7016",
        "de": "Anthrazitgrau",
        "en": "Anthracite grey",
        "fr": "Gris anthracite",
        "es": "Gris antracita",
        "it": "Grigio antracite",
        "nl": "Antracietgrijs"
    },
    {
        "rgb": "rgb(35, 40, 43)",
        "id": "RAL 7021",
        "de": "Schwarzgrau",
        "en": "Black grey",
        "fr": "Gris noir",
        "es": "Gris negruzco",
        "it": "Grigio nerastro",
        "nl": "Zwartgrijs"
    },
    {
        "rgb": "rgb(51, 47, 44)",
        "id": "RAL 7022",
        "de": "Umbragrau",
        "en": "Umbra grey",
        "fr": "Gris terre d’ombre",
        "es": "Gris sombra",
        "it": "Grigio ombra",
        "nl": "Ombergrijs"
    },
    {
        "rgb": "rgb(104, 108, 94)",
        "id": "RAL 7023",
        "de": "Betongrau",
        "en": "Concrete grey",
        "fr": "Gris béton",
        "es": "Gris hormigón",
        "it": "Grigio calcestruzzo",
        "nl": "Betongrijs"
    },
    {
        "rgb": "rgb(71, 74, 81)",
        "id": "RAL 7024",
        "de": "Graphitgrau",
        "en": "Graphite grey",
        "fr": "Gris graphite",
        "es": "Gris grafita",
        "it": "Grigio grafite",
        "nl": "Grafietgrijs"
    },
    {
        "rgb": "rgb(47, 53, 59)",
        "id": "RAL 7026",
        "de": "Granitgrau",
        "en": "Granite grey",
        "fr": "Gris granit",
        "es": "Gris granito",
        "it": "Grigio granito",
        "nl": "Granietgrijs"
    },
    {
        "rgb": "rgb(139, 140, 122)",
        "id": "RAL 7030",
        "de": "Steingrau",
        "en": "Stone grey",
        "fr": "Gris pierre",
        "es": "Gris piedra",
        "it": "Grigio pietra",
        "nl": "Steengrijs"
    },
    {
        "rgb": "rgb(71, 75, 78)",
        "id": "RAL 7031",
        "de": "Blaugrau",
        "en": "Blue grey",
        "fr": "Gris bleu",
        "es": "Gris azulado",
        "it": "Grigio bluastro",
        "nl": "Blauwgrijs"
    },
    {
        "rgb": "rgb(184, 183, 153)",
        "id": "RAL 7032",
        "de": "Kieselgrau",
        "en": "Pebble grey",
        "fr": "Gris silex",
        "es": "Gris guijarro",
        "it": "Grigio ghiaia",
        "nl": "Kiezelgrijs"
    },
    {
        "rgb": "rgb(125, 132, 113)",
        "id": "RAL 7033",
        "de": "Zementgrau",
        "en": "Cement grey",
        "fr": "Gris ciment",
        "es": "Gris cemento",
        "it": "Grigio cemento",
        "nl": "Cementgrijs"
    },
    {
        "rgb": "rgb(143, 139, 102)",
        "id": "RAL 7034",
        "de": "Gelbgrau",
        "en": "Yellow grey",
        "fr": "Gris jaune",
        "es": "Gris amarillento",
        "it": "Grigio giallastro",
        "nl": "Geelgrijs"
    },
    {
        "rgb": "rgb(215, 215, 215)",
        "id": "RAL 7035",
        "de": "Lichtgrau",
        "en": "Light grey",
        "fr": "Gris clair",
        "es": "Gris luminoso",
        "it": "Grigio luce",
        "nl": "Lichtgrijs"
    },
    {
        "rgb": "rgb(127, 118, 121)",
        "id": "RAL 7036",
        "de": "Platingrau",
        "en": "Platinum grey",
        "fr": "Gris platine",
        "es": "Gris platino",
        "it": "Grigio platino",
        "nl": "Platinagrijs"
    },
    {
        "rgb": "rgb(125, 127, 125)",
        "id": "RAL 7037",
        "de": "Staubgrau",
        "en": "Dusty grey",
        "fr": "Gris poussière",
        "es": "Gris polvo",
        "it": "Grigio polvere",
        "nl": "Stofgrijs"
    },
    {
        "rgb": "rgb(195, 195, 195)",
        "id": "RAL 7038",
        "de": "Achatgrau",
        "en": "Agate grey",
        "fr": "Gris agate",
        "es": "Gris ágata",
        "it": "Grigio agata",
        "nl": "Agaatgrijs"
    },
    {
        "rgb": "rgb(108, 105, 96)",
        "id": "RAL 7039",
        "de": "Quarzgrau",
        "en": "Quartz grey",
        "fr": "Gris quartz",
        "es": "Gris cuarzo",
        "it": "Grigio quarzo",
        "nl": "Kwartsgrijs"
    },
    {
        "rgb": "rgb(157, 161, 170)",
        "id": "RAL 7040",
        "de": "Fenstergrau",
        "en": "Window grey",
        "fr": "Gris fenêtre",
        "es": "Gris ventana",
        "it": "Grigio finestra",
        "nl": "Venstergrijs"
    },
    {
        "rgb": "rgb(141, 148, 141)",
        "id": "RAL 7042",
        "de": "Verkehrsgrau A",
        "en": "Traffic grey A",
        "fr": "Gris signalisation A",
        "es": "Gris tráfico A",
        "it": "Grigio traffico A",
        "nl": "Verkeesgrijs A"
    },
    {
        "rgb": "rgb(78, 84, 82)",
        "id": "RAL 7043",
        "de": "Verkehrsgrau B",
        "en": "Traffic grey B",
        "fr": "Gris signalisation B",
        "es": "Gris tráfico B",
        "it": "Grigio traffico B",
        "nl": "Verkeersgrijs B"
    },
    {
        "rgb": "rgb(202, 196, 176)",
        "id": "RAL 7044",
        "de": "Seidengrau",
        "en": "Silk grey",
        "fr": "Gris soie",
        "es": "Gris seda",
        "it": "Grigio seta",
        "nl": "Zijdegrijs"
    },
    {
        "rgb": "rgb(144, 144, 144)",
        "id": "RAL 7045",
        "de": "Telegrau 1",
        "en": "Telegrey 1",
        "fr": "Telegris 1",
        "es": "Gris tele 1",
        "it": "Tele grigio 1",
        "nl": "Telegrijs 1"
    },
    {
        "rgb": "rgb(130, 137, 143)",
        "id": "RAL 7046",
        "de": "Telegrau 2",
        "en": "Telegrey 2",
        "fr": "Telegris 2",
        "es": "Gris tele 2",
        "it": "Tele grigio 2",
        "nl": "Telegrijs 2"
    },
    {
        "rgb": "rgb(208, 208, 208)",
        "id": "RAL 7047",
        "de": "Telegrau 4",
        "en": "Telegrey 4",
        "fr": "Telegris 4",
        "es": "Gris tele 4",
        "it": "Tele grigio 4",
        "nl": "Telegrijs 4"
    },
    {
        "rgb": "rgb(137, 129, 118)",
        "id": "RAL 7048",
        "de": "Perlmausgrau",
        "en": "Pearl mouse grey",
        "fr": "Gris souris nacré",
        "es": "Gris musgo perlado",
        "it": "Grigio topo perlato",
        "nl": "Parelmoermuisgrijs"
    },
    {
        "rgb": "rgb(166, 94, 46)",
        "id": "RAL 8000",
        "de": "Grünbraun",
        "en": "Green brown",
        "fr": "Brun vert",
        "es": "Pardo verdoso",
        "it": "Marrone verdastro",
        "nl": "Groenbruin"
    },
    {
        "rgb": "rgb(149, 95, 32)",
        "id": "RAL 8001",
        "de": "Ockerbraun",
        "en": "Ochre brown",
        "fr": "Brun terre de Sienne",
        "es": "Pardo ocre",
        "it": "Marrone ocra",
        "nl": "Okerbruin"
    },
    {
        "rgb": "rgb(108, 59, 42)",
        "id": "RAL 8002",
        "de": "Signalbraun",
        "en": "Signal brown",
        "fr": "Brun de sécurité",
        "es": "Marrón señales",
        "it": "Marrone segnale",
        "nl": "Signaalbruin"
    },
    {
        "rgb": "rgb(115, 66, 34)",
        "id": "RAL 8003",
        "de": "Lehmbraun",
        "en": "Clay brown",
        "fr": "Brun argile",
        "es": "Pardo arcilla",
        "it": "Marrone fango",
        "nl": "Leembruin"
    },
    {
        "rgb": "rgb(142, 64, 42)",
        "id": "RAL 8004",
        "de": "Kupferbraun",
        "en": "Copper brown",
        "fr": "Brun cuivré",
        "es": "Pardo cobre",
        "it": "Marrone\\n\\nrame",
        "nl": "Koperbruin"
    },
    {
        "rgb": "rgb(89, 53, 31)",
        "id": "RAL 8007",
        "de": "Rehbraun",
        "en": "Fawn brown",
        "fr": "Brun fauve",
        "es": "Pardo corzo",
        "it": "Marrone capriolo",
        "nl": "Reebruin"
    },
    {
        "rgb": "rgb(111, 79, 40)",
        "id": "RAL 8008",
        "de": "Olivbraun",
        "en": "Olive brown",
        "fr": "Brun olive",
        "es": "Pardo oliva",
        "it": "Marrone oliva",
        "nl": "Olijfbruin"
    },
    {
        "rgb": "rgb(91, 58, 41)",
        "id": "RAL 8011",
        "de": "Nussbraun",
        "en": "Nut brown",
        "fr": "Brun noisette",
        "es": "Pardo nuez",
        "it": "Marrone noce",
        "nl": "Notebruin"
    },
    {
        "rgb": "rgb(89, 35, 33)",
        "id": "RAL 8012",
        "de": "Rotbraun",
        "en": "Red brown",
        "fr": "Brun rouge",
        "es": "Pardo rojo",
        "it": "Marrone rossiccio",
        "nl": "Roodbruin"
    },
    {
        "rgb": "rgb(56, 44, 30)",
        "id": "RAL 8014",
        "de": "Sepiabraun",
        "en": "Sepia brown",
        "fr": "Brun sépia",
        "es": "Sepia",
        "it": "Marrone seppia",
        "nl": "Sepiabruin"
    },
    {
        "rgb": "rgb(99, 58, 52)",
        "id": "RAL 8015",
        "de": "Kastanienbraun",
        "en": "Chestnut brown",
        "fr": "Marron",
        "es": "Castaño",
        "it": "Marrone castagna",
        "nl": "Kastanjebruin"
    },
    {
        "rgb": "rgb(76, 47, 39)",
        "id": "RAL 8016",
        "de": "Mahagonibraun",
        "en": "Mahogany brown",
        "fr": "Brun acajou",
        "es": "Caoba",
        "it": "Marrone mogano",
        "nl": "Mahoniebruin"
    },
    {
        "rgb": "rgb(69, 50, 46)",
        "id": "RAL 8017",
        "de": "Schokoladenbraun",
        "en": "Chocolate brown",
        "fr": "Brun chocolat",
        "es": "Chocolate",
        "it": "Marrone cioccolata",
        "nl": "Chocoladebruin"
    },
    {
        "rgb": "rgb(64, 58, 58)",
        "id": "RAL 8019",
        "de": "Graubraun",
        "en": "Grey brown",
        "fr": "Brun gris",
        "es": "Pardo grisáceo",
        "it": "Marrone grigiastro",
        "nl": "Grijsbruin"
    },
    {
        "rgb": "rgb(33, 33, 33)",
        "id": "RAL 8022",
        "de": "Schwarzbraun",
        "en": "Black brown",
        "fr": "Brun noir",
        "es": "Pardo negruzco",
        "it": "Marrone nerastro",
        "nl": "Zwartbruin"
    },
    {
        "rgb": "rgb(166, 94, 46)",
        "id": "RAL 8023",
        "de": "Orangebraun",
        "en": "Orange brown",
        "fr": "Brun orangé",
        "es": "Pardo anaranjado",
        "it": "Marrone arancio",
        "nl": "Oranjebruin"
    },
    {
        "rgb": "rgb(121, 85, 61)",
        "id": "RAL 8024",
        "de": "Beigebraun",
        "en": "Beige brown",
        "fr": "Brun beige",
        "es": "Pardo beige",
        "it": "Marrone beige",
        "nl": "Beigebruin"
    },
    {
        "rgb": "rgb(117, 92, 72)",
        "id": "RAL 8025",
        "de": "Blassbraun",
        "en": "Pale brown",
        "fr": "Brun pâle",
        "es": "Pardo pálido",
        "it": "Marrone pallido",
        "nl": "Bleekbruin"
    },
    {
        "rgb": "rgb(78, 59, 49)",
        "id": "RAL 8028",
        "de": "Terrabraun",
        "en": "Terra brown",
        "fr": "Brun terre",
        "es": "Marrón tierra",
        "it": "Marrone terra",
        "nl": "Terrabruin"
    },
    {
        "rgb": "rgb(118, 60, 40)",
        "id": "RAL 8029",
        "de": "Perlkupfer",
        "en": "Pearl copper",
        "fr": "Cuivre nacré",
        "es": "Cobre perlado",
        "it": "Rame perlato",
        "nl": "Parelmoerkoper"
    },
    {
        "rgb": "rgb(255, 255, 255)",
        "id": "RAL 9001",
        "de": "Cremeweiß",
        "en": "Cream",
        "fr": "Blanc crème",
        "es": "Blanco crema",
        "it": "Bianco crema",
        "nl": "Crèmewit"
    },
    {
        "rgb": "rgb(231, 235, 218)",
        "id": "RAL 9002",
        "de": "Grauweiß",
        "en": "Grey white",
        "fr": "Blanc gris",
        "es": "Blanco grisáceo",
        "it": "Bianco grigiastro",
        "nl": "Grijswit"
    },
    {
        "rgb": "rgb(244, 244, 244)",
        "id": "RAL 9003",
        "de": "Signalweiß",
        "en": "Signal white",
        "fr": "Blanc de sécurité",
        "es": "Blanco señales",
        "it": "Bianco segnale",
        "nl": "Signaalwit"
    },
    {
        "rgb": "rgb(40, 40, 40)",
        "id": "RAL 9004",
        "de": "Signalschwarz",
        "en": "Signal black",
        "fr": "Noir de sécurité",
        "es": "Negro señales",
        "it": "Nero segnale",
        "nl": "Signaalzwart"
    },
    {
        "rgb": "rgb(10, 10, 10)",
        "id": "RAL 9005",
        "de": "Tiefschwarz",
        "en": "Jet black",
        "fr": "Noir foncé",
        "es": "Negro intenso",
        "it": "Nero intenso",
        "nl": "Gitzwart"
    },
    {
        "rgb": "rgb(165, 165, 165)",
        "id": "RAL 9006",
        "de": "Weißaluminium",
        "en": "White aluminium",
        "fr": "Aluminium blanc",
        "es": "Aluminio blanco",
        "it": "Aluminio brillante",
        "nl": "Blank \\n\\naluminiumkleurig"
    },
    {
        "rgb": "rgb(143, 143, 143)",
        "id": "RAL 9007",
        "de": "Graualuminium",
        "en": "Grey aluminium",
        "fr": "Aluminium gris",
        "es": "Aluminio gris",
        "it": "Aluminio grigiastro",
        "nl": "Grijs aluminiumkleurig"
    },
    {
        "rgb": "rgb(255, 255, 255)",
        "id": "RAL 9010",
        "de": "Reinweiß",
        "en": "Pure white",
        "fr": "Blanc pur",
        "es": "Blanco puro",
        "it": "Bianco puro",
        "nl": "Zuiverwit"
    },
    {
        "rgb": "rgb(28, 28, 28)",
        "id": "RAL 9011",
        "de": "Graphitschwarz",
        "en": "Graphite black",
        "fr": "Noir graphite",
        "es": "Negro grafito",
        "it": "Nero grafite",
        "nl": "Grafietzwart"
    },
    {
        "rgb": "rgb(246, 246, 246)",
        "id": "RAL 9016",
        "de": "Verkehrsweiß",
        "en": "Traffic white",
        "fr": "Blanc signalisation",
        "es": "Blanco tráfico",
        "it": "Bianco traffico",
        "nl": "Verkeerswit"
    },
    {
        "rgb": "rgb(30, 30, 29)",
        "id": "RAL 9017",
        "de": "Verkehrsschwarz",
        "en": "Traffic black",
        "fr": "Noir signalisation",
        "es": "Negro tráfico",
        "it": "Nero traffico",
        "nl": "Verkeerszwart"
    },
    {
        "rgb": "rgb(215, 215, 215)",
        "id": "RAL 9018",
        "de": "Papyrusweiß",
        "en": "Papyrus white",
        "fr": "Blanc papyrus",
        "es": "Blanco papiro",
        "it": "Bianco papiro",
        "nl": "Papyruswit"
    },
    {
        "rgb": "rgb(156, 156, 156)",
        "id": "RAL 9022",
        "de": "Perlhellgrau",
        "en": "Pearl light grey",
        "fr": "Gris clair nacré",
        "es": "Gris claro perlado",
        "it": "Grigio chiaro perlato",
        "nl": "Parelmoerlichtgrijs"
    },
    {
        "rgb": "rgb(130, 130, 130)",
        "id": "RAL 9023",
        "de": "Perldunkelgrau",
        "en": "Pearl dark grey",
        "fr": "Gris fonçé nacré",
        "es": "Gris oscuro perlado",
        "it": "Grigio scuro perlato",
        "nl": "Parelmoerdonkergrijs"
    }
]


async function autoLogin() {

    if (key != null) {
        await c.useKey(key)

        if (c.authorized) {
            listAllProjects();

            clientEmail = await c.getEmail();
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

            return;
        }
    }

    logout();
}

function logout() {
    delete c;
    localStorage.removeItem("appLK")
    window.open("./login.html", "_self")
}
autoLogin();

async function listAllProjects() {
    allProjectDetails = [];
    projects = await c.getOwnedProjectsIDs();
    var p = document.getElementById("projects");
    p.innerHTML = "";
    for (var i = 0; i < projects.length; i++) {
        var details = await c.getProjectDetails(projects[i]);
        allProjectDetails.push(details)

        if (details.owner == clientEmail && JSON.parse(details.file).appType == globalAppType) {
            var editors = "";

            if (details.editors.length == 0) {
                editors += "<a class='dropdown-item'>Keine Benutzer</a>"
            } else {
                for (var e = 0; e < details.editors.length; e++) editors += "<a class='dropdown-item' onclick='removeEditor(" + i + "," + e + ")' data-toggle='tooltip' title='Click to remove editor.'>" + details.editors[e] + "</a>"
            }
            editors += `
            <div class="form-group" style="margin-bottom:0">
                <div class="input-group" style="flex-wrap:nowrap; padding:4px">
                <input type='text' class='form-control' placeholder='Email hinzufügen' id='addEditorMail${i}'></input>
                    <div class="input-group-append">
                    <button type='button' class='btn btn-success' onclick='addEditor(${i})' data-toggle='tooltip' title='Click to add editor.'>+</button>
                    </div>
                </div>
            </div>`

            var content = `
                        <div class="col-xl-6 mb-5" id="project${i}">
                            <!--begin::Mixed Widget 5-->
                            <div class="card card-custom card-stretch">
                                <!--begin::Header-->
                                <div class="card-header border-0 py-5">
                                    <h3 class="card-title font-weight-bolder text-grey text-capitalize" id="projectName${i}">${details.name} </h3>
                                    <h3 class="card-title font-weight-bolder text-brown"><small>  ${details.owner} </small></h3>
                                </div>
                                <!--end::Header-->
                                <!--begin::Body-->
                                <div class="card-body d-flex flex-column p-0">
                                    <!--begin::IMAGE-->
                                    <!--begin::Stats-->
                                    <div class="card-spacer bg-white card-rounded flex-grow-1">
                                        <!--begin::Row-->
                                            <div class="row m-0">
												<div class="col px-3 py-4 rounded-lg mr-7 mb-7 text-center">
                                                <span class="svg-icon svg-icon-2x svg-icon-gray-500 d-block my-2">
                                                <!--begin::Svg Icon | path:/var/www/preview.keenthemes.com/metronic/releases/2021-04-19-122603/theme/html/demo1/dist/../src/media/svg/icons/General/Visible.svg-->
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <rect x="0" y="0" width="24" height="24"/>
                                                <path d="M11.7573593,15.2426407 L8.75735931,15.2426407 C8.20507456,15.2426407 7.75735931,15.6903559 7.75735931,16.2426407 C7.75735931,16.7949254 8.20507456,17.2426407 8.75735931,17.2426407 L11.7573593,17.2426407 L11.7573593,18.2426407 C11.7573593,19.3472102 10.8619288,20.2426407 9.75735931,20.2426407 L5.75735931,20.2426407 C4.65278981,20.2426407 3.75735931,19.3472102 3.75735931,18.2426407 L3.75735931,14.2426407 C3.75735931,13.1380712 4.65278981,12.2426407 5.75735931,12.2426407 L9.75735931,12.2426407 C10.8619288,12.2426407 11.7573593,13.1380712 11.7573593,14.2426407 L11.7573593,15.2426407 Z" fill="#000000" opacity="0.3" transform="translate(7.757359, 16.242641) rotate(-45.000000) translate(-7.757359, -16.242641) "/>
                                                <path d="M12.2426407,8.75735931 L15.2426407,8.75735931 C15.7949254,8.75735931 16.2426407,8.30964406 16.2426407,7.75735931 C16.2426407,7.20507456 15.7949254,6.75735931 15.2426407,6.75735931 L12.2426407,6.75735931 L12.2426407,5.75735931 C12.2426407,4.65278981 13.1380712,3.75735931 14.2426407,3.75735931 L18.2426407,3.75735931 C19.3472102,3.75735931 20.2426407,4.65278981 20.2426407,5.75735931 L20.2426407,9.75735931 C20.2426407,10.8619288 19.3472102,11.7573593 18.2426407,11.7573593 L14.2426407,11.7573593 C13.1380712,11.7573593 12.2426407,10.8619288 12.2426407,9.75735931 L12.2426407,8.75735931 Z" fill="#000000" transform="translate(16.242641, 7.757359) rotate(-45.000000) translate(-16.242641, -7.757359) "/>
                                                <path d="M5.89339828,3.42893219 C6.44568303,3.42893219 6.89339828,3.87664744 6.89339828,4.42893219 L6.89339828,6.42893219 C6.89339828,6.98121694 6.44568303,7.42893219 5.89339828,7.42893219 C5.34111353,7.42893219 4.89339828,6.98121694 4.89339828,6.42893219 L4.89339828,4.42893219 C4.89339828,3.87664744 5.34111353,3.42893219 5.89339828,3.42893219 Z M11.4289322,5.13603897 C11.8194565,5.52656326 11.8194565,6.15972824 11.4289322,6.55025253 L10.0147186,7.96446609 C9.62419433,8.35499039 8.99102936,8.35499039 8.60050506,7.96446609 C8.20998077,7.5739418 8.20998077,6.94077682 8.60050506,6.55025253 L10.0147186,5.13603897 C10.4052429,4.74551468 11.0384079,4.74551468 11.4289322,5.13603897 Z M0.600505063,5.13603897 C0.991029355,4.74551468 1.62419433,4.74551468 2.01471863,5.13603897 L3.42893219,6.55025253 C3.81945648,6.94077682 3.81945648,7.5739418 3.42893219,7.96446609 C3.0384079,8.35499039 2.40524292,8.35499039 2.01471863,7.96446609 L0.600505063,6.55025253 C0.209980772,6.15972824 0.209980772,5.52656326 0.600505063,5.13603897 Z" fill="#000000" opacity="0.3" transform="translate(6.014719, 5.843146) rotate(-45.000000) translate(-6.014719, -5.843146) "/>
                                                <path d="M17.9142136,15.4497475 C18.4664983,15.4497475 18.9142136,15.8974627 18.9142136,16.4497475 L18.9142136,18.4497475 C18.9142136,19.0020322 18.4664983,19.4497475 17.9142136,19.4497475 C17.3619288,19.4497475 16.9142136,19.0020322 16.9142136,18.4497475 L16.9142136,16.4497475 C16.9142136,15.8974627 17.3619288,15.4497475 17.9142136,15.4497475 Z M23.4497475,17.1568542 C23.8402718,17.5473785 23.8402718,18.1805435 23.4497475,18.5710678 L22.0355339,19.9852814 C21.6450096,20.3758057 21.0118446,20.3758057 20.6213203,19.9852814 C20.2307961,19.5947571 20.2307961,18.9615921 20.6213203,18.5710678 L22.0355339,17.1568542 C22.4260582,16.76633 23.0592232,16.76633 23.4497475,17.1568542 Z M12.6213203,17.1568542 C13.0118446,16.76633 13.6450096,16.76633 14.0355339,17.1568542 L15.4497475,18.5710678 C15.8402718,18.9615921 15.8402718,19.5947571 15.4497475,19.9852814 C15.0592232,20.3758057 14.4260582,20.3758057 14.0355339,19.9852814 L12.6213203,18.5710678 C12.2307961,18.1805435 12.2307961,17.5473785 12.6213203,17.1568542 Z" fill="#000000" opacity="0.3" transform="translate(18.035534, 17.863961) scale(1, -1) rotate(45.000000) translate(-18.035534, -17.863961) "/>
                                            </g>
                                                </svg>
                                                </span>
													<a href="javascript:;" class="text-dark font-weight-bold font-size-h6" onclick="view(${i})">Öffnen</a>
												</div>
												<div class="col px-3 py-4 rounded-lg mb-7 text-center">
                                                    <span class="svg-icon svg-icon-2x svg-icon-gray-500 d-block my-2"><!--begin::Svg Icon | path:/var/www/preview.keenthemes.com/metronic/releases/2021-04-19-122603/theme/html/demo1/dist/../src/media/svg/icons/Home/Trash.svg-->
                                                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                            <rect x="0" y="0" width="24" height="24"/>
                                                            <path d="M6,8 L18,8 L17.106535,19.6150447 C17.04642,20.3965405 16.3947578,21 15.6109533,21 L8.38904671,21 C7.60524225,21 6.95358004,20.3965405 6.89346498,19.6150447 L6,8 Z M8,10 L8.45438229,14.0894406 L15.5517885,14.0339036 L16,10 L8,10 Z" fill="#000000" fill-rule="nonzero"/>
                                                            <path d="M14,4.5 L14,3.5 C14,3.22385763 13.7761424,3 13.5,3 L10.5,3 C10.2238576,3 10,3.22385763 10,3.5 L10,4.5 L5.5,4.5 C5.22385763,4.5 5,4.72385763 5,5 L5,5.5 C5,5.77614237 5.22385763,6 5.5,6 L18.5,6 C18.7761424,6 19,5.77614237 19,5.5 L19,5 C19,4.72385763 18.7761424,4.5 18.5,4.5 L14,4.5 Z" fill="#000000" opacity="0.3"/>
                                                        </g>
                                                    </svg>
                                                </span>
													<a href="javascript:;" class="text-dark font-weight-bold font-size-h6 mt-2" onclick="deleteProject(${i})">Löschen</a>
												</div>
											</div>
                                            <div class="row m-0">
												<div class="col px-3 py-4 rounded-lg mr-7 mb-7 text-center">
                                                    <span class="svg-icon svg-icon-2x svg-icon-gray-500 d-block my-2"><!--begin::Svg Icon | path:/var/www/preview.keenthemes.com/metronic/releases/2021-04-19-122603/theme/html/demo1/dist/../src/media/svg/icons/Design/Edit.svg-->
                                                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                                <rect x="0" y="0" width="24" height="24"/>
                                                                <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero" transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>
                                                                <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>
                                                            </g>
                                                        </svg>
                                                        <!--end::Svg Icon-->
                                                    </span>
													<a href="javascript:;" class="text-dark font-weight-bold font-size-h6" onclick="renameProject(${i})" id="editButton${i}">Umbenennen</a>
												</div>
												<div class="col px-3 py-4 rounded-lg mb-7 text-center">
                                                <span class="svg-icon svg-icon-2x svg-icon-gray-500 d-block my-2"><!--begin::Svg Icon | path:/var/www/preview.keenthemes.com/metronic/releases/2021-04-19-122603/theme/html/demo1/dist/../src/media/svg/icons/General/User.svg-->
                                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                            <polygon points="0 0 24 0 24 24 0 24"/>
                                                            <path d="M12,11 C9.790861,11 8,9.209139 8,7 C8,4.790861 9.790861,3 12,3 C14.209139,3 16,4.790861 16,7 C16,9.209139 14.209139,11 12,11 Z" fill="#000000" fill-rule="nonzero" opacity="0.3"/>
                                                            <path d="M3.00065168,20.1992055 C3.38825852,15.4265159 7.26191235,13 11.9833413,13 C16.7712164,13 20.7048837,15.2931929 20.9979143,20.2 C21.0095879,20.3954741 20.9979143,21 20.2466999,21 C16.541124,21 11.0347247,21 3.72750223,21 C3.47671215,21 2.97953825,20.45918 3.00065168,20.1992055 Z" fill="#000000" fill-rule="nonzero"/>
                                                        </g>
                                                    </svg><!--end::Svg Icon-->
                                                </span>
													
                                                    <div class="dropdown col">
                                                        <a href="javascript:;" class="text-dark font-weight-bold font-size-h6 mt-2 dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Benutzer</a>
                                                        <div class="dropdown-menu p-5" aria-labelledby="dropdownMenuButton" style="min-width: 250px">
                                                            ${editors}
                                                        </div>
                                                    </div>
												</div>
											</div>
                                            <div class="col px-3 py-4 rounded-lg mb-7 text-center">
                                            <span class="svg-icon svg-icon-2x svg-icon-gray-500 d-block my-2"><!--begin::Svg Icon | path:/var/www/preview.keenthemes.com/metronic/releases/2021-04-19-122603/theme/html/demo1/dist/../src/media/svg/icons/Design/Edit.svg-->
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                    <rect x="0" y="0" width="24" height="24"/>
                                                    <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero" transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>
                                                    <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>
                                                </g>
                                            </svg>
                                            <!--end::Svg Icon-->
                                        </span>
                                            <a href="javascript:;" class="text-dark font-weight-bold font-size-h6 mt-2" onclick="editProject(${i})">Bearbeite</a>
                                        </div>
                                    </div>
                                    <!--end::Stats-->
                                </div>
                                <!--end::Body-->
                            </div>
                            <!--end::Mixed Widget 5-->
                        </div> `

            /*
            var content = "<a id = 'projectName" + i + "'>" + details.name + `</a>
            <button onclick='renameProject(` + i + `)' id="editButton` + i + `">✎</button>
            <button onclick='view(` + i + `)'>View</button>
            <button onclick='deleteProject(` + i + `)'>Delete</button>

            <button onclick="openDropdown(` + i + `)" class="dropbtn">Editors</button>`

            content += '<div id="myDropdown' + i + '" class="dropdown-content">' + editors + "</div>";
            content += "<br>" + details.id;*/

            p.innerHTML += content;

            //document.getElementById("myDropdown" + i).style.left = document.getElementsByClassName("dropbtn")[i].getBoundingClientRect().left + "px";
        } else {
            //console.log("Wrong project shown")
        }
    }
}

function deleteProject(id) {
    c.deleteProject(projects[id]).then(() => {
        listAllProjects();
    });
}

async function resetDefaultProjectData(id) {
    var up_details = JSON.parse((await c.getProjectDetails(projects[id])).file);
    //var name = document.getElementById("createName").value;
    var profile_type = document.getElementById("createPT").value;
    var wallThickness = document.getElementById("createWW").value;
    var outer_W = document.getElementById("createOut").value;
    var inner_W = document.getElementById("createInn").value;
    var aMass = document.getElementById("createA").value;
    var cMass = document.getElementById("createC").value;
    var upLength = document.getElementById("createUp").value;
    var def_col = document.getElementById("createCol").value;
    var slope = document.getElementById("createAng").value;
    var material_thickness = document.getElementById("createTh").value;
    var halter = document.getElementById("createHA").value;

    listAllProjects();

    c.updateProject(projects[id],
        JSON.stringify({
            appType: globalAppType,
            closed: up_details.closed,
            tool: 0,
            points: up_details.points ? up_details.points : [],
            addLines: up_details.addLines ? up_details.addLines : [],
            profiles: [],
            default: {
                oh: aMass / 1000,
                ih: cMass / 1000,
                ww: wallThickness / 1000,
                iw: inner_W / 1000,
                ow: outer_W / 1000,
                ul: upLength / 1000,
                col: def_col,
                pt: profile_type,
                st: slope,
                al: material_thickness,
                grid: 0.02,
                ha: halter
            }
        }))

    /*
    {
        appType: globalAppType,
        closed: this.mainGeometry.closed,
        tool: this.tool,
        points: points,
        addLines: addLines,
        profiles: profiles,
        default: {
            oh: this.outerHeight,
            ih: this.innerHeight,
            ww: this.wallWidth,
            iw: this.innerWidth,
            ow: this.outerWidth,
            ul: this.defaultUpLength,
            col: this.defaultCol,
            pt: this.profile_type,
            st: this.steepness,
            al: this.thickness
        }
    };*/

    resetProjectCreation()

    setTimeout(() => {
        document.getElementById("createName").placeholder = 'Name des Projekt';
    }, 1000)
}

function renameProject(id) {
    var name = document.getElementById("projectName" + id).innerText;

    document.getElementById("projectName" + id).innerHTML = "<input type='text' class='form-control form-control-sm' placeholder='Name des Prokekts' id='projectNameInput" + id + "' style='font-size: inherit;'/>"
    document.getElementById("projectNameInput" + id).value = name;

    document.getElementById("editButton" + id).innerHTML = "<i class='fa fa-check'></i> Update";
    document.getElementById("editButton" + id).onclick = () => { saveRenameProject(id); }
}

function saveRenameProject(id) {
    var name = document.getElementById("projectNameInput" + id).value;

    if (name.length < 3) {
        document.getElementById("projectNameInput" + id).value = "";
        document.getElementById("projectNameInput" + id).placeholder = "Name zu kurz!";

        setTimeout(() => {
            document.getElementById("projectNameInput" + id).placeholder = 'Name des Projekts';
        }, 1000)
    } else if (name.length > 32) {
        document.getElementById("projectNameInput" + id).value = "";
        document.getElementById("projectNameInput" + id).placeholder = "Name zu lang!";

        setTimeout(() => {
            document.getElementById("projectNameInput" + id).placeholder = 'Name des Projekt';
        }, 1000)
    } else {
        c.changeProjectName(projects[id], name).then(() => {
            listAllProjects();
        });
        /*

                document.getElementById("editButton" + id).innerText = "Umbenennen";
                document.getElementById("editButton" + id).onclick = () => {
                    renameProject(id);
                }*/
    }

    document.getElementById("projectNameInput" + id).value = "";
}

async function removeEditor(projectIndex, editorIndex) {
    c.removeEditorFromProject(projects[projectIndex], allProjectDetails[projectIndex].editors[editorIndex])

    await listAllProjects();
    //openDropdown(projectIndex);
}

async function addEditor(projectIndex) {
    var mail = document.getElementById("addEditorMail" + projectIndex).value;
    c.addEditorToProject(projects[projectIndex], mail)

    await listAllProjects();
}

function view(id) {
    window.open("./app.html?id=" + encodeURIComponent(projects[id]), "_self")
}

async function createNew() {
    var name = document.getElementById("createName").value;
    var profile_type = document.getElementById("createPT").value;
    var wallThickness = document.getElementById("createWW").value;
    var outer_W = document.getElementById("createOut").value;
    var inner_W = document.getElementById("createInn").value;
    var aMass = document.getElementById("createA").value;
    var cMass = document.getElementById("createC").value;
    var upLength = document.getElementById("createUp").value;
    var def_col = document.getElementById("createCol").value;
    var slope = document.getElementById("createAng").value;
    var material_thickness = document.getElementById("createTh").value;
    var halter = document.getElementById("createHA").value;

    if (name.length < 3) {
        document.getElementById("createName").value = "";
        document.getElementById("createName").placeholder = "Name zu kurz!";
    } else if (name.length > 32) {
        document.getElementById("createName").value = "";
        document.getElementById("createName").placeholder = "Name zu lang!";
    } else {
        var new_id = await c.createProject(name);
        listAllProjects();

        c.updateProject(new_id,
            JSON.stringify({
                appType: globalAppType,
                closed: false,
                tool: 0,
                points: [],
                addLines: [],
                profiles: [],
                default: {
                    oh: aMass / 1000,
                    ih: cMass / 1000,
                    ww: wallThickness / 1000,
                    iw: inner_W / 1000,
                    ow: outer_W / 1000,
                    ul: upLength / 1000,
                    col: def_col,
                    pt: profile_type,
                    st: slope,
                    al: material_thickness,
                    grid: 0.02,
                    ha: halter
                }
            }))
    }

    /*
    {
        appType: globalAppType,
        closed: this.mainGeometry.closed,
        tool: this.tool,
        points: points,
        addLines: addLines,
        profiles: profiles,
        default: {
            oh: this.outerHeight,
            ih: this.innerHeight,
            ww: this.wallWidth,
            iw: this.innerWidth,
            ow: this.outerWidth,
            ul: this.defaultUpLength,
            col: this.defaultCol,
            pt: this.profile_type,
            st: this.steepness,
            al: this.thickness
        }
    };*/

    resetProjectCreation()

    setTimeout(() => {
        document.getElementById("createName").placeholder = 'Name des Projekt';
    }, 1000)
}

function resetProjectCreation() {
    document.getElementById("createName").value = "";
    document.getElementById("createPT").value = "0";
    document.getElementsByClassName("filter-option-inner-inner")[0].innerText = "Profil 1"
    document.getElementById("createWW").value = "250";
    document.getElementById("createOut").value = "50";
    document.getElementById("createInn").value = "25";
    document.getElementById("createA").value = "200";
    document.getElementById("createC").value = "100";
    document.getElementById("createUp").value = "250";
    document.getElementById("createCol").value = "rgb(128,128,128)";
    document.getElementsByClassName("filter-option-inner-inner")[1].innerText = "Blank Aluminium"
    document.getElementById("createAng").value = "3";
    document.getElementById("createTh").value = "2";
    document.getElementById("createHA").value = "1000";
}


//sticky
var KTLayoutStickyCard = function() {
    // Private properties
    var _element;
    var _object;

    // Private functions
    var _init = function() {
        var offset = 300;

        if (typeof KTLayoutHeader !== 'undefined') {
            offset = KTLayoutHeader.getHeight();
        }

        _object = new KTCard(_element, {
            sticky: {
                offset: offset,
                zIndex: 90,
                position: {
                    top: function() {
                        var pos = 0;
                        var body = KTUtil.getBody();

                        if (KTUtil.isBreakpointUp('lg')) {
                            if (typeof KTLayoutHeader !== 'undefined' && KTLayoutHeader.isFixed()) {
                                pos = pos + KTLayoutHeader.getHeight();
                            }

                            if (typeof KTLayoutSubheader !== 'undefined' && KTLayoutSubheader.isFixed()) {
                                pos = pos + KTLayoutSubheader.getHeight();
                            }
                        } else {
                            if (typeof KTLayoutHeader !== 'undefined' && KTLayoutHeader.isFixedForMobile()) {
                                pos = pos + KTLayoutHeader.getHeightForMobile();
                            }
                        }

                        pos = pos - 1; // remove header border width

                        return pos;
                    },
                    left: function(card) {
                        return KTUtil.offset(_element).left;
                    },
                    right: function(card) {
                        var body = KTUtil.getBody();

                        var cardWidth = parseInt(KTUtil.css(_element, 'width'));
                        var bodyWidth = parseInt(KTUtil.css(body, 'width'));
                        var cardOffsetLeft = KTUtil.offset(_element).left;

                        return bodyWidth - cardWidth - cardOffsetLeft;
                    }
                }
            }
        });

        _object.initSticky();

        KTUtil.addResizeHandler(function() {
            _object.updateSticky();
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = KTUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        update: function() {
            if (_object) {
                _object.updateSticky();
            }
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
    module.exports = KTLayoutStickyCard;
}
//sticky end
async function editProject(id) {
    var details = await c.getProjectDetails(projects[id]);
    var data = JSON.parse((details).file);
    $('#m_modal_1_2 .modal-title').html('Edit <span class="text-brown">' + details.name + '</span>');
    $('#m_modal_1_2 #updatePjct').attr('onclick', 'updatePjct(' + id + ')');
    $('#m_modal_1_2').modal('show');

    document.getElementById("ecreatePT").value = data.default.pt;
    document.getElementById("ecreateWW").value = data.default.ww * 1000;
    document.getElementById("ecreateOut").value = data.default.ow * 1000;
    document.getElementById("ecreateInn").value = data.default.iw * 1000;
    document.getElementById("ecreateA").value = data.default.oh * 1000;
    document.getElementById("ecreateC").value = data.default.ih * 1000;
    document.getElementById("ecreateUp").value = data.default.ul * 1000;
    document.getElementById("ecreateCol1").value = data.default.col;
    document.getElementById("ecreateAng").value = data.default.st;
    document.getElementById("ecreateTh").value = data.default.al;
    document.getElementById("ecreateHA").value = data.default.ha;
    //console.log('update req', data);
}

async function updatePjct(id) {
    var up_details = JSON.parse((await c.getProjectDetails(projects[id])).file);
    var profile_type = document.getElementById("ecreatePT").value;
    var wallThickness = document.getElementById("ecreateWW").value;
    var outer_W = document.getElementById("ecreateOut").value;
    var inner_W = document.getElementById("ecreateInn").value;
    var aMass = document.getElementById("ecreateA").value;
    var cMass = document.getElementById("ecreateC").value;
    var upLength = document.getElementById("ecreateUp").value;
    var def_col = document.getElementById("ecreateCol1").value;
    var slope = document.getElementById("ecreateAng").value;
    var material_thickness = document.getElementById("ecreateTh").value;
    var halter = document.getElementById("ecreateHA").value;

    await c.updateProject(projects[id],
        JSON.stringify({
            appType: globalAppType,
            closed: up_details.closed,
            tool: 0,
            points: up_details.points ? up_details.points : [],
            addLines: up_details.addLines ? up_details.addLines : [],
            profiles: [],
            default: {
                oh: aMass / 1000,
                ih: cMass / 1000,
                ww: wallThickness / 1000,
                iw: inner_W / 1000,
                ow: outer_W / 1000,
                ul: upLength / 1000,
                col: def_col,
                pt: profile_type,
                st: slope,
                al: material_thickness,
                grid: 0.02,
                ha: halter
            }
        }))
    $('#m_modal_1_2').modal('hide');
    listAllProjects();
}