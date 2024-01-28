/** @odoo-module */
// import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted } = owl;

export class SelectInput extends owl.Component {
  setup() {
    this.selectInputRef = useRef("select_input");
    onWillStart(async () => {
      await loadJS(
        "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"
      );
      //   <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    });
    onMounted(() => this.renderSelectInput());
  }

  renderSelectInput() {
    $(this.selectInputRef.el).select2();
  }
}

SelectInput.template = "owl.SelectInput";
