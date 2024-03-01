/** @odoo-module */
import { loadJS, loadCSS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted } = owl;
export class TagifyInput extends owl.Component {
    setup() {
        // this.tagify = useRef("tagify")
        onWillStart(async () => {
            await loadJS("/cummin_dashboard/static/src/lib/tagify/tagify.min.js")
            await loadCSS("/cummin_dashboard/static/src/lib/tagify/tagify.css")
        });
        onMounted(() => {
            const input = document.querySelector('input[name=tags]');
            new Tagify(input, {
                whitelist: ['Egypt', 'Ethiopia'],
                enforceWhitelist: true
            });
        });
    }
}

TagifyInput.template = "owl.Tagify"