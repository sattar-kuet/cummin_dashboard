
/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
import { ChartRenderer } from "../chart_renderer/chart_renderer"
import { Table } from "../table/table"


export class WoAging extends Component {
    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            period: 90,
        })
        onWillStart(async () => {
            this.loadwoAgin()
        })
    }

    loadwoAgin() {
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


}


WoAging.template = "owl.WoAging"
WoAging.components = { ChartRenderer, Table }
registry.category("actions").add("wo_aging", WoAging)