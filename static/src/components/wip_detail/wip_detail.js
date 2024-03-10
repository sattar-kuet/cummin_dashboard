/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { Utility } from "../utility"
const utility = new Utility()
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
        })
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
        let wip_detail_params = utility.getCookie('wip_detail_params')
        if (wip_detail_params) {
            wip_detail_params = JSON.parse(wip_detail_params)
            this.state.filteringParameter.ageStartAt = wip_detail_params.ageStartAt
            this.state.filteringParameter.ageEndAt = wip_detail_params.ageEndAt
            if (wip_detail_params.country != '-') {
                this.state.filteringParameter.country = [wip_detail_params.country]
            }
            console.log('wip_detail_params >>>>', wip_detail_params)
        }

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
    goToDashboard() {
        this.actionService.doAction(
            "cummin_dashboard.action_kpi_dashboard"
        )
    }
    goToWoAgin() {
        this.actionService.doAction(
            "cummin_dashboard.action_wo_aging"
        )
    }
}

WipDetail.template = "owl.WipDetail"
WipDetail.components = { Header }
actionRegistry.add("wip_detail", WipDetail)