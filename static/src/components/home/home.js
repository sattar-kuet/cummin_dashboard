/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { useService, useBus } from "@web/core/utils/hooks";
import { Utility } from "../utility"
const utility = new Utility()
export class Home extends owl.Component {
    setup() {
        this.state = useState({
            session: {}
        })
        this.actionService = useService("action")
        this.rpc = useService("rpc")
        onWillStart(async () => {
            await this.loadInitialData()
            await this.loadSession()
        })
    }
    async loadInitialData() {
        let initialData = await this.rpc('/home/load_initial_data')
        initialData = JSON.parse(initialData)
        this.state.serviceOrderTreeViewResId = initialData.serviceOrderTreeViewResId
    }
    async loadSession() {
        let session = await this.rpc("/session/info")
        this.state.session = JSON.parse(session)
        console.log(this.state.session)
    }
    redirectToServiceOrder() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=963&model=maintenance.request&view_type=kanban&cids=1&menu_id=802'
        window.location.href = redirectTo
    }
    redirectToAttendance() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#cids=1&menu_id=754&action=907'
        window.location.href = redirectTo
    }
    redirectToDashboard() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=934&cids=1&menu_id=780'
        window.location.href = redirectTo
    }
    redirectToTimeSheet() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=840&model=account.analytic.line&view_type=list&cids=1&menu_id=702'
        window.location.href = redirectTo
    }
    redirectToReporting() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=934&cids=1&menu_id=780'
        window.location.href = redirectTo
    }
    redirectToTargetData() {
        let baseUrl = utility.getBaseUrl()
        let redirectTo = baseUrl + '/web#action=934&cids=1&menu_id=780'
        window.location.href = redirectTo
    }
}

Home.template = "owl.Home"
Home.components = { Header }
actionRegistry.add("cummin_home", Home)