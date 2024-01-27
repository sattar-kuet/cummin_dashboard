/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted } = owl

export class ChartRenderer2 extends Component {
    setup() {
        this.chartRef = useRef("chart2")
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
        })
        onMounted(() => this.renderChart2())
    }
    renderChart2() {
        console.log('********', this.props)
        const tb_data = this.props.data;
        new Chart(this.chartRef.el,
            {
                data: {
                    datasets: [
                        {
                            type: "line",
                            // label: "Line Dataset",
                            data: tb_data?.map((row) => row.count),
                            backgroundColor: ["#EE2E24"],
                            borderColor: ["#EE2E24"],
                        },
                        {
                            type: "bar",
                            // label: "Bar Dataset",
                            data: tb_data?.map((row) => row.count),
                            backgroundColor: ["#DB843D"],
                        },
                    ],
                    labels: tb_data?.map((row) => row.date),
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
                            text: this.props.title,
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

ChartRenderer2.template = "owl.ChartRenderer2"
