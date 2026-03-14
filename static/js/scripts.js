const content_dir = 'contents/';
const config_file = 'config.yml';
const section_names = ['home', 'publications', 'awards', 'projects', 'teaching', 'talks'];

window.addEventListener('DOMContentLoaded', event => {

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
    const configPromise = fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const el = document.getElementById(key);
                if (el) {
                    el.innerHTML = yml[key];
                } else {
                    console.log("Unknown id and value: " + key + "," + yml[key]);
                }
            });
        })
        .catch(error => console.log(error));

    // Load markdown sections
    const sectionPromises = section_names.map(name => {
        return fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const container = document.getElementById(name + '-md');
                if (container) {
                    container.innerHTML = html;
                    return container;
                }
                return null;
            })
            .catch(error => {
                console.log(error);
                return null;
            });
    });

    // Typeset math after all content is inserted
    Promise.all([configPromise, ...sectionPromises]).then(results => {
        const validContainers = results.filter(el => el instanceof HTMLElement);

        if (window.MathJax && MathJax.startup && MathJax.typesetPromise) {
            MathJax.startup.promise
                .then(() => {
                    MathJax.typesetClear(validContainers);
                    return MathJax.typesetPromise(validContainers);
                })
                .catch(err => console.log('MathJax error:', err));
        }
    });

});
