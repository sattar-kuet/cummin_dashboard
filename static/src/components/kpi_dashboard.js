/** @odoo-module */

import { registry } from "@web/core/registry"
import { KpiCard } from "./kpi_card/kpi_card"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted, useState } = owl

export class OwlKpiDashboard extends Component {
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
        let growthMindSet = {
            woCount: {
                open: 100,
                invoiced: 110
            }
        }
        this.state.growthMindSet = growthMindSet
    }
}

OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { KpiCard }
registry.category("actions").add("owl.kpi_dashboard", OwlKpiDashboard)