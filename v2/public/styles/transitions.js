window.onload = function () {
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
}

// Wait for the page to fully load before starting the animation
window.addEventListener('load', () => {
    setTimeout(() => {
        const icons = document.querySelectorAll('.jiggle-after');
        icons.forEach(icon => {
            // Add a delay before starting the jiggle animation
            var style = window.getComputedStyle(icon)
            console.log(style.animationDelay, style.animationDuration);

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