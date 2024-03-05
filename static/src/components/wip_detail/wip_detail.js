/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { Filter } from "../filter/filter"
export class WipDetail extends Component {
    setup() {
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
            await this.loadLedgerDetailData()
            this.env.bus.on("filterApplied", this, this.onFilterApplied)
        })
        onWillUnmount(() => {
            this.env.bus.off("filterApplied", this, this.onFilterApplied)
        });
    }
    onFilterApplied(filteringParameter) {
        this.state.filteringParameter = filteringParameter
        this.loadLedgerDetailData()
    }
    async loadLedgerDetailData() {
        let wip_detail = await this.rpc("/wip_detail", this.state.filteringParameter)
        this.state.wip_detail = JSON.parse(wip_detail)
    }
}

WipDetail.template = "owl.WipDetail"
WipDetail.components = { Header, Filter }
actionRegistry.add("wip_detail", WipDetail)