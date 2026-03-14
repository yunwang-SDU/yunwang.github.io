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

    // Load YAML
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString());
                }
            });
        })
        .catch(error => console.log(error));

    // Configure marked
    marked.use({ mangle: false, headerIds: false });

    // Load all markdown sections first
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

    // After all sections are inserted, typeset math once
    Promise.all(sectionPromises).then(containers => {
        const validContainers = containers.filter(x => x !== null);

        if (window.MathJax && window.MathJax.startup && window.MathJax.typesetPromise) {
            MathJax.startup.promise.then(() => {
                MathJax.typesetPromise(validContainers).catch(err => console.log(err));
            });
        }
    });

});
