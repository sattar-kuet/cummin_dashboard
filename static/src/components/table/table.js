/** @odoo-module */
import { loadJS, loadCSS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted } = owl;
export class Table extends owl.Component {
    setup() {
        // this.tagify = useRef("tagify")
        onWillStart(async () => {

        });
        onMounted(() => {
            const input = document.querySelector('input[name=tags]');
            new Tagify(input, {
                whitelist: ['Nazia', 'Shuvro'],
                enforceWhitelist: true
            });
        });
    }
}

Table.template = "owl.Table"