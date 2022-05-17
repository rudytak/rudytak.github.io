async function register() {
    const c = new Client();

    var name = document.getElementById("name").value;
    var mail = document.getElementById("mail").value;
    var pass = document.getElementById("pass").value;
    var passConfirm = document.getElementById("passConfirm").value;

    if (pass == passConfirm) {
        var r = await c.register(mail, name, pass);

        if (r) {
            var redir = "?dir=" + url_params["dir"];
            if (redir == null || redir == undefined) redir = "";

            window.open("../login/login.html" + redir, "_self")
        } else {
            var d = document.getElementById("errorMessage");
            d.innerHTML = "Invalid email or password! You also might already be registered.";
        }
    } else {
        var d = document.getElementById("errorMessage");
        d.innerHTML = "The passwords do not match!";
    }
}