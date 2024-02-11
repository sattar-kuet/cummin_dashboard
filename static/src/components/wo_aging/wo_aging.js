
  /** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
import { ChartRenderer } from "./chart_renderer/chart_renderer"


export class WoAging extends Component {
    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            period: 90,
        })
        onWillStart(async () => {
            this.loadTotalBilled()
        })
    }

    loadTotalBilled() {
        this.state.totalBilled = [
            {
                date: "Jan 20",
                count: 2.0,
            },

            {
                date: "Feb 20",
                count: 2.0,
            },

            {
                date: "Mar 20",
                count: 4.0,
            },

            {
                date: "Apr 20",
                count: 6.0,
            },

            {
                date: "May 20",
                count: 8.0,
            },
            {
                date: "Jun 20",
                count: 12.0,
            },
            {
                date: "Jul 20",
                count: 10
            },
            {
                date: "Aug 20",
                count: 9
            },
        ]
    }


}


WoAging.template = "owl.WoAging"
WoAging.components = { ChartRenderer }
registry.category("actions").add("wo_aging", WoAging)