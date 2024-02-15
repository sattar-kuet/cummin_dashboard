
/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
import { Filter } from "../filter/filter"
import { ChartRenderer3 } from "../chart_renderer3/chart_renderer3"
import { Table } from "../table/table"
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
        this.rpc = useService("rpc")
        onWillStart(async () => {
            this.loadFilteringParameterFromCookie()
            this.env.bus.on("filterApplied", this, this.onFilterApplied)
            this.loadwoAging()
            await this.loadwoAgingTableData()
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
    }
    loadwoAging() {
        this.state.woAgin = [
            {
                label: "Jan 20",
                value: 2.0,
            },

            {
                label: "Feb 20",
                value: 2.0,
            },

            {
                label: "Mar 20",
                value: 4.0,
            },

            {
                label: "Apr 20",
                value: 6.0,
            },

            {
                label: "May 20",
                value: 8.0,
            },
            {
                label: "Jun 20",
                value: 12.0,
            },
            {
                label: "Jul 20",
                value: 10
            },
            {
                label: "Aug 20",
                value: 9
            },
        ]
    }

    async loadwoAgingTableData() {
        console.log('this.state.filteringParameter', this.state.filteringParameter)
        let wo_aging_table_data = await this.rpc("/wo_aging/table_data", this.state.filteringParameter)
        this.state.woAginTableData = JSON.parse(wo_aging_table_data)
    }
}

WoAging.template = "owl.WoAging"
WoAging.components = { ChartRenderer3, Table, Filter }
registry.category("actions").add("wo_aging", WoAging)