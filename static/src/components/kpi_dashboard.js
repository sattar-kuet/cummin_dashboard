/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { KpiCard } from "./kpi_card/kpi_card"
import { loadJS } from "@web/core/assets"


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
        this.state.kpi = {
            growthMindSet: {
                woCount: {
                    open: 100,
                    invoiced: 110,
                    serviceOperatingSales: 220
                }
            }
        }
    }
}

OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { KpiCard }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)