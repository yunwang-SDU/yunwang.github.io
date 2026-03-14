const content_dir = 'contents/';
const config_file = 'config.yml';
const section_names = ['home', 'publications', 'awards', 'projects', 'teaching', 'talks'];

window.addEventListener('DOMContentLoaded', async () => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.forEach(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Configure marked
    marked.use({ mangle: false, headerIds: false });

    // Load YAML
    try {
        const response = await fetch(content_dir + config_file);
        const text = await response.text();
        const yml = jsyaml.load(text);

        Object.keys(yml).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                el.innerHTML = yml[key];
            } else {
                console.log("Unknown id and value:", key, yml[key]);
            }
        });
    } catch (error) {
        console.log('YAML load error:', error);
    }

    // Load markdown sections one by one
    for (const name of section_names) {
        try {
            const response = await fetch(content_dir + name + '.md');
            const markdown = await response.text();
            const html = marked.parse(markdown);
            const container = document.getElementById(name + '-md');

            if (container) {
                container.innerHTML = html;

                if (window.MathJax && MathJax.typesetPromise) {
                    MathJax.typesetClear([container]);
                    await MathJax.typesetPromise([container]);
                }
            }
        } catch (error) {
            console.log(`Section load error (${name}):`, error);
        }
    }

    console.log('All content loaded and MathJax typeset finished.');
});
