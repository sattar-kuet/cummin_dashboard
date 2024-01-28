/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { KpiCard } from "./kpi_card/kpi_card"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks"


export class OwlKpiDashboard extends Component {
    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            period: 90,
        })
        this.rpc = useService("rpc")
        onWillStart(async () => {

            await this.loadFilteringData()
            this.loadKpiData()
        })
    }
    async loadFilteringData() {
        await this.loadDistributors()
    }
    async loadDistributors() {
        let distributors = await this.rpc('/distributor/list')
        distributors = JSON.parse(distributors)
        this.state.distributors = distributors
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
            },
            positivelyImpactingEmployees: {
                recordableIncidentRate: 300,
                nearHitMissRate: 310,
                jsoCompletionRate: 320,
                na: 330


            },
            operationalEfficiencies: {
                tb: 10,
                Productivity: 11,
                labourUtilization: 12,
                na: 13

            },

        }
    }
}


OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { KpiCard }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)