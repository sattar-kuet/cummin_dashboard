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
            nextButtonClass: '',
            filteringParameter: {
                page: 1,
                prevButtonClass: 'disabled',
                distributorId: 0,
                distributor: '',
                period: '',
                showDateRange: false,
                periodStartAt: '',
                periodEndAt: '',
                country: '',
                branch: '',
                currency: '',
                showTbDetail: false,
                searchInput: ''
            }
        })
        this.actionService = useService("action")
        this.rpc = useService("rpc")
        onWillStart(async () => {
            await this.loadWipDetailData()
            this.env.bus.on("filterApplied", this, this.onFilterApplied)
        })
        onWillUnmount(() => {
            this.env.bus.off("filterApplied", this, this.onFilterApplied)
        });
    }
    onFilterApplied(filteringParameter) {
        this.state.filteringParameter = filteringParameter
        this.loadWipDetailData()
    }
    search() {
         this.loadWipDetailData()
    }
    next() {
        this.state.filteringParameter.page += 1
        this.loadWipDetailData()
    }
    prev() {
        this.state.filteringParameter.page -= 1
        this.loadWipDetailData()
    }
    async loadWipDetailData() {
        let wip_detail = await this.rpc("/wip_detail", this.state.filteringParameter)
        wip_detail = JSON.parse(wip_detail)
        this.state.wip_detail = wip_detail.data
        this.state.pager = wip_detail.pager
        if (this.state.pager.isFirstPage) {
            this.state.prevButtonClass = 'disabled'
        }
        else {
            this.state.prevButtonClass = ''
        }
        if (this.state.pager.isLastPage) {
            this.state.nextButtonClass = 'disabled'
        } else {
            this.state.nextButtonClass = ''
        }
    }
}

WipDetail.template = "owl.WipDetail"
WipDetail.components = { Header, Filter }
actionRegistry.add("wip_detail", WipDetail)