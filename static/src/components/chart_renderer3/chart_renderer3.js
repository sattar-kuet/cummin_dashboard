/** @odoo-module */

import { loadJS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted } = owl;

export class ChartRenderer3 extends Component {
    setup() {
        this.chartRef = useRef("chart3");
        onWillStart(async () => {
            await loadJS(
                "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
            );
        });
        onMounted(() => this.renderChart3());
    }

    renderChart3() {
        console.log("********", this.props)
        var ctx = this.chartRef.el.getContext("2d")
        var data = this.props.data
        // Notice how nested the beginAtZero is
        var options = {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'WO Count'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: "Worksheets completed this week",
                    position: "bottom"
                },
                legend: {
                    display: true,
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        // Chart declaration:
        if (this.myBarChart) {
            // If the chart already exists, destroy it before re-rendering
            this.myBarChart.destroy();
        }
        this.myBarChart = new Chart(ctx, {
            type: "bar",
            data: data,
            options: options
        });
    }
}
ChartRenderer3.template = "owl.ChartRenderer3";