import wwObject from './wwObjectSrc.vue'

const name = "ww-img-slider";
const wwEnableMetrics = false;

const addComponent = function () {
    if (window.vm) {
        window.vm.addComponent(name, wwObject);

        wwLib.wwObject.registerContentType(
            name,
            {
                type: name,
                data: {
                    slides: [],
                    bullets: {
                        show: true,
                        color: ""
                    },
                    arrows: {
                        show: true,
                        showBg: true,
                        color: ""
                    }
                }
            },
            wwEnableMetrics
        );

        return true;
    }
    return false;
}

if (!addComponent()) {
    const iniInterval = setInterval(function () {
        if (addComponent()) {
            clearInterval(iniInterval);
        }
    }, 10);
}