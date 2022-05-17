async function login() {
    const c = new Client();

    var mail = document.getElementById("mail").value;
    var pass = document.getElementById("pass").value;

    var r = await c.login(mail, pass);

    if (r) {
        var key = await c.generateKey();

        localStorage.setItem("appLK", key)

        var redir = url_params["dir"];
        if (redir == null || redir == "undefined" || redir == undefined) redir = btoa(encodeURIComponent("./dashboard.html"));

        window.open(decodeURIComponent(atob(redir)), "_self")
    } else {
        var d = document.getElementById("errorMessage");
        d.innerHTML = "Invalid email or password!";
    }
}