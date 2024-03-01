
/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
import { Header } from "../header/header"
import { Filter } from "../filter/filter"
import { Table } from "../table/table"
import { Utility } from "../utility"
const utility = new Utility()
export class WipDetail extends Component {

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
        this.rpc = useService("rpc")
        onWillStart(async () => {
            this.loadFilteringParameterFromCookie()
            this.env.bus.on("filterApplied", this, this.onFilterApplied)
            await this.loadWipDetailChartData()
            await this.loadWipDetailTableData()
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
        this.loadWipDetailTableData()
        this.loadWipDetailChartData()
    }
    async loadWipDetailChartData() {
        let wo_aging_chart_data = await this.rpc("/wo_aging/chart_data", this.state.filteringParameter)
        console.log('Change on chart data is being detected')
        this.state.WipDetailChartData = JSON.parse(wo_aging_chart_data)
    }

    async loadWipDetailTableData() {
        console.log('this.state.filteringParameter', this.state.filteringParameter)
        let wo_aging_table_data = await this.rpc("/wo_aging/table_data", this.state.filteringParameter)
        this.state.woAginTableData = JSON.parse(wo_aging_table_data)
    }
}

WipDetail.template = "owl.WipDetail"
WipDetail.components = { Table, Header, Filter }
registry.category("actions").add("wip_detail", WipDetail)