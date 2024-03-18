
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
export class ProductivitySummary extends Component {

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
            await this.loadProductivitySummaryChartData()
            await this.loadProductivitySummaryTableData()
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
        this.loadProductivitySummaryTableData()
        this.loadProductivitySummaryChartData()
    }

    async loadProductivitySummaryChartData() {
        let productivity_chart_data = await this.rpc("/productivity/chart_data", this.state.filteringParameter)
        console.log('Change on chart data is being detected')
        this.state.productivityChartData = JSON.parse(productivity_chart_data)
    }

    async loadProductivitySummaryTableData() {
        console.log('this.state.filteringParameter', this.state.filteringParameter)
        let productivity_table_data = await this.rpc("/productivity/table_data", this.state.filteringParameter)
        this.state.productivityTableData = JSON.parse(productivity_table_data)
    }

    viewDetail(country, ageStartAt, ageEndAt) {
        const filteringParameterFromCookie = utility.getCookie('filteringParameter')
        let filteringParameter = {}
        if (filteringParameterFromCookie) {
            filteringParameter = JSON.parse(filteringParameterFromCookie)
        }
        let wip_detail_params = { 'country': country, 'ageStartAt': ageStartAt, 'ageEndAt': ageEndAt }
        let filteringDataString = JSON.stringify(wip_detail_params)
        utility.setCookie('wip_detail_params', filteringDataString, 30)
        // this.actionService.doAction("cummin_dashboard.action_wip_detail")
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=1011&menu_id=833' // LIVE
        // let redirectTo = baseUrl + '/web#menu_id=789&action=946' // Local
        window.location.href = redirectTo
    }
    goToDashboard() {
        this.actionService.doAction(
            "cummin_dashboard.action_kpi_dashboard"
        )
    }
}

ProductivitySummary.template = "owl.ProductivitySummary"
ProductivitySummary.components = { ChartRenderer3, Table, Header, Filter }
registry.category("actions").add("productivity_summary", ProductivitySummary)