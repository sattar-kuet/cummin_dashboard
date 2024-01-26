/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "web.ajax";
const { Component, onWillStart, useRef, onMounted } = owl

export class ChartRenderer extends Component {
  setup() {
    this.chartRef = useRef("chart")
    onWillStart(async () => {
      await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
    })

    onMounted(() => this.renderChart())
  }

  renderChart() {
    console.log('********', this.props)
    const tb_data = [
      {
        date: "Jan 20",
        count: 2.0,
      },

      {
        date: "Feb 20",
        count: 2.0,
      },

      {
        date: "Mar 20",
        count: 4.0,
      },

      {
        date: "Apr 20",
        count: 6.0,
      },

      {
        date: "May 20",
        count: 8.0,
      },
      {
        date: "Jun 20",
      },
      {
        date: "Jul 20",
      },
      {
        date: "Aug 20",
      },
    ];
    new Chart(this.chartRef.el,
      {
        type: "bar",
        data: {
          labels: tb_data?.map((row) => row.date),
          datasets: [
            {
              data: tb_data?.map((row) => row.count),
              borderWidth: 1,
              backgroundColor: ["#EE2E24"],
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Total to Billed (TB) Ratio",
              font: {
                size: 18,
                weight: "700",
              },
            },
            legend: {
              display: false,
            },
          },
        },
      }
    );
  }
}
ChartRenderer.template = "owl.ChartRenderer"
