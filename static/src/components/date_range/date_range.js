/** @odoo-module */
// import { registry } from "@web/core/registry"
import { loadJS, loadCSS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted } = owl;

export class DateRange extends owl.Component {
  setup() {
    this.dateRangeRef = useRef("daterange");
    onWillStart(async () => {
      await loadJS("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js")
      await loadCSS("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css")
    });
    onMounted(() => this.renderDateRange());
  }

  renderDateRange() {
    $(this.dateRangeRef.el).daterangepicker(
      {
        showDropdowns: true,
        ranges: {
          Today: [moment(), moment()],
          Yesterday: [
            moment().subtract(1, "days"),
            moment().subtract(1, "days"),
          ],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "This Month": [moment().startOf("month"), moment().endOf("month")],
          "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
          ],
        },
        alwaysShowCalendars: false,
        startDate: "1 Jan, 1919",
        endDate: moment(),
        locale: {
          format: "D MMM, YYYY",
        },
      },
      function (start, end, label) {
        console.log("start: ", start.format("YYYY-MM-DD"));
        console.log("end: ", end.format("YYYY-MM-DD"));
        console.log("label: ", label);
      }
    );
  }
}

DateRange.template = "owl.DateRange";
