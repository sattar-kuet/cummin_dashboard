
/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
import { Header } from "../header/header"
import { Filter } from "../filter/filter"
import { ChartRenderer3 } from "../chart_renderer3/chart_renderer3"
import { Table } from "../tagify/tagify"
import { Utility } from "../utility"
const utility = new Utility()
export class WoAging extends Component {

    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            filteringParameter: {
                distributorId: 0,
                distributor: '',
                period: '',
                showDateRange: false,
                periodStartAt: '',
                periodEndAt: '',
                country: '',
                branch: '',
                currency: '',
                showTbDetail: false
            }
        })
        this.actionService = useService("action")
        this.rpc = useService("rpc")
        onWillStart(async () => {
            this.loadFilteringParameterFromCookie()
            this.env.bus.on("filterApplied", this, this.onFilterApplied)
            await this.loadwoAgingChartData()
            await this.loadwoAgingTableData()
            this.state.name = 'Shuvro'
        })
        // onMounted(() => {
        //     this.env.bus.on("filterApplied", this, this.onFilterApplied)
        // });
        onWillUnmount(() => {
            this.env.bus.off("filterApplied", this, this.onFilterApplied)
        });
    }

    loadFilteringParameterFromCookie() {
        const filteringParameterFromCookie = utility.getCookie('filteringParameter')
        if (filteringParameterFromCookie) {
            let filteringParameter = JSON.parse(filteringParameterFromCookie)
            // console.log(filteringParameter)
            this.state.distributorId = parseInt(filteringParameter.distributorId)
            this.state.period = filteringParameter.period
            this.state.showDateRange = filteringParameter.showDateRange
            this.state.periodStartAt = filteringParameter.periodStartAt
            this.state.periodEndAt = filteringParameter.periodEndAt
            this.state.country = filteringParameter.country
            this.state.branch = filteringParameter.branch
            this.state.currency = filteringParameter.currency
        }
    }

    onFilterApplied(filteringParameter) {
        this.state.filteringParameter = filteringParameter
        this.loadwoAgingTableData()
        this.loadwoAgingChartData()
    }
    async loadwoAgingChartData() {
        let wo_aging_chart_data = await this.rpc("/wo_aging/chart_data", this.state.filteringParameter)
        console.log('Change on chart data is being detected')
        this.state.woAgingChartData = JSON.parse(wo_aging_chart_data)
    }

    async loadwoAgingTableData() {
        console.log('this.state.filteringParameter', this.state.filteringParameter)
        let wo_aging_table_data = await this.rpc("/wo_aging/table_data", this.state.filteringParameter)
        this.state.woAginTableData = JSON.parse(wo_aging_table_data)
    }
    viewWipDetail(country) {
        let wip_detail_params = { 'country': country }
        let filteringDataString = JSON.stringify(wip_detail_params)
        utility.setCookie('wip_detail_params', filteringDataString, 30)
        this.actionService.doAction("cummin_dashboard.action_wip_detail")
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=942&cids=1&menu_id=780'
        window.location.href = redirectTo

    }
    goToDashboard() {
        this.actionService.doAction(
            "cummin_dashboard.action_kpi_dashboard"
        )
    }
}

WoAging.template = "owl.WoAging"
WoAging.components = { ChartRenderer3, Table, Header, Filter }
registry.category("actions").add("wo_aging", WoAging)