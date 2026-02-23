// Go on top of the page on load, unless there's a hash in the URL (e.g. from an anchor link)
window.addEventListener('load', function () {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
});

// Smooth redirect link animation
window.addEventListener('load', function () {
    window.document.querySelectorAll('.smooth-link').forEach(el => {
        if (el.classList.contains('ignore')) return;

        el.addEventListener('click', (e) => {
            e.preventDefault();

            // Perform the fade-out animation
            let overlay = window.document.querySelector('.page-transition-overlay')
            overlay.classList.remove('fade-out');
            overlay.classList.add('fade-in');

            var newone = overlay.cloneNode(true);
            overlay.parentNode.replaceChild(newone, overlay);

            //
            const href = el.getAttribute('href');
            var style = window.getComputedStyle(document.body)
            setTimeout(() => {
                window.open(href, '_self');
            }, 1000 * (
                (parseFloat(style.getPropertyValue('--page-transition-duration')) || 0)
                + (parseFloat(style.getPropertyValue('--page-transition-pause')) || 0)
            ));
        });
    });
});

// Secondary infinite jiggle animation for icons with a delay after the initial fade-in
window.addEventListener('load', () => {
    setTimeout(() => {
        const icons = document.querySelectorAll('.jiggle-after');
        icons.forEach(icon => {
            // Add a delay before starting the jiggle animation
            var style = window.getComputedStyle(icon)

            setTimeout(() => {
                icon.classList.remove('jiggle-after');
                icon.classList.remove('slide-in-left-fade');
                icon.classList.remove('fade-in');
                icon.classList.remove('fade-out');
                icon.classList.add('jiggle-idle');
            }, parseFloat(style.animationDelay.replace('s', '')) * 1000 + parseFloat(style.animationDuration.replace('s', '')) * 1000); // Start after the fade-in animation plus an additional delay
        });
    }, 100)
});

// On come into view animations
const on_view_callback = function () {
    document.querySelectorAll('.animate-on-view').forEach(function (elem) {
        var vwTop = window.pageYOffset;
        var vwBottom = (window.pageYOffset + window.innerHeight);
        var elemTop = elem.offsetTop;
        var elemHeight = elem.offsetHeight;

        if (vwBottom > elemTop && ((vwTop - elemHeight) < elemTop)) {
            elem.classList.remove("animate-on-view");
            elem.style.setProperty('--element-transition-pause', '0s !important');
            elem.style.setProperty('--element-transition-duration', '.5s !important');
        }
    });
}
window.addEventListener('load', function () {
    on_view_callback();
    window.addEventListener("scroll", on_view_callback, false);
});