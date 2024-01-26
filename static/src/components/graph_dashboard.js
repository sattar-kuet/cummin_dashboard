/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
import { ChartRenderer } from "./chart_renderer/chart_renderer"


export class OwlGraphDashboard extends Component {
    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            period: 90,
        })
        onWillStart(async () => {
            this.loadKpiData()
        })
    }

    loadKpiData() {
        this.state.kpi = {
            growthMindSet: {
                woCount: {
                    open: 100,
                    invoiced: 110,
                    serviceOperatingSales: 220
                },
                wip: {
                    woCount: 200,
                    cost: 210,
                    billableAmount: 230
                },
            }

        }
    }
}


OwlGraphDashboard.template = "owl.GraphDashboard"
OwlGraphDashboard.components = { ChartRenderer }
registry.category("actions").add("graph_dashboard", OwlGraphDashboard)