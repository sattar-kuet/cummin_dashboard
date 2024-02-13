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
        const tb_data = this.props.data
        var ctx = this.chartRef.el.getContext("2d")
        var data = {
            labels: [
                "AFRICA",
                "MIDDLEEAST",
            ],
            datasets: [
                {
                    label: "0 to 30",
                    backgroundColor: [
                        "green",
                        "green",
                    ],
                    data: [2, 6]
                },
                {
                    label: "31 to 80",
                    backgroundColor: [
                        "red",
                        "red",
                    ],
                    data: [4, 3]
                },
                {
                    label: "<80",
                    backgroundColor: [
                        "blue",
                        "blue",
                    ],
                    data: [5, 6]
                }
            ]
        };

        // Notice how nested the beginAtZero is
        var options = {
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
        var myBarChart = new Chart(ctx, {
            type: "bar",
            data: data,
            options: options
        });
    }
}
ChartRenderer3.template = "owl.ChartRenderer3";