/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { useService } from "@web/core/utils/hooks"
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { Utility } from "../utility"
const utility = new Utility()
export class ServiceOperatingSaleDetail extends Component {
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
            await this.loadServiceOperatingSaleDetailData()
        })
    }
    search() {
        this.loadServiceOperatingSaleDetailData()
    }
    next() {
        this.state.filteringParameter.page += 1
        this.loadServiceOperatingSaleDetailData()
    }
    prev() {
        this.state.filteringParameter.page -= 1
        this.loadServiceOperatingSaleDetailData()
    }
    async loadServiceOperatingSaleDetailData() {
        let service_operation_sales_detail_params = utility.getCookie('service_operation_sales_detail_params')
        if (service_operation_sales_detail_params) {
            service_operation_sales_detail_params = JSON.parse(service_operation_sales_detail_params)
            this.state.filteringParameter.ageStartAt = service_operation_sales_detail_params.ageStartAt
            this.state.filteringParameter.ageEndAt = service_operation_sales_detail_params.ageEndAt
            if (service_operation_sales_detail_params.country != '-') {
                this.state.filteringParameter.country = [service_operation_sales_detail_params.country]
            }
            console.log('service_operation_sales_detail_params >>>>', service_operation_sales_detail_params)
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
    goToServiceOperatingSale() {
        this.actionService.doAction(
            "cummin_dashboard.action_service_operating_sale"
        )
    }
}

ServiceOperatingSaleDetail.template = "owl.ServiceOperatingSaleDetail"
ServiceOperatingSaleDetail.components = { Header }
actionRegistry.add("service_operating_sale_detail", ServiceOperatingSaleDetail)