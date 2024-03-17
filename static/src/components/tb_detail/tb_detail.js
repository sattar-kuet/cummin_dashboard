/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { Utility } from "../utility"
const utility = new Utility()
export class TbDetail extends Component {
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
            await this.loadTbDetailData()
        })
    }
    search() {
        this.loadTbDetailData()
    }
    next() {
        this.state.filteringParameter.page += 1
        this.loadTbDetailData()
    }
    prev() {
        this.state.filteringParameter.page -= 1
        this.loadTbDetailData()
    }
    async loadTbDetailData() {
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
    goToTbSummary() {
        this.actionService.doAction(
            "cummin_dashboard.action_tb_summary"
        )
    }
}

TbDetail.template = "owl.TbDetail"
TbDetail.components = { Header }
actionRegistry.add("tb_detail", TbDetail)