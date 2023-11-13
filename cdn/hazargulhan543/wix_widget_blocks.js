let form_code;
$w.onReady(function () {
    // Initialize your widget here. If your widget has properties, this is a good place to read their values and initialize the widget accordingly.
    form_code = $widget.props.form_code;
});

$widget.onPropsChanged((oldProps, newProps) => {
    form_code = newProps.form_code;
});

function updateIframe() {
    $w('#ifr').postMessage(
        JSON.stringify({
            action: "parse",
            code: form_code
        })
    );
}