/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { registry } from "@web/core/registry"
const actionRegistry = registry.category("actions")
import { Header } from "../header/header"
import { useService, useBus } from "@web/core/utils/hooks";

export class Home extends owl.Component {
    setup() {
        this.state = useState({
            session: {}
        })
        this.rpc = useService("rpc")
        onWillStart(async () => {
            await this.loadSession()
        })
    }
    async loadSession() {
        let session = await this.rpc("/session/info")
        this.state.session = JSON.parse(session)
        console.log(this.state.session)
    }
}

Home.template = "owl.Home"
Home.components = { Header }
actionRegistry.add("cummin_home", Home)