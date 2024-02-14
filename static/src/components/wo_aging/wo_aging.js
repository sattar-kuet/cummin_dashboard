
/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { registry } from "@web/core/registry"
import { Filter } from "../filter/filter"
import { ChartRenderer3 } from "../chart_renderer3/chart_renderer3"
import { Table } from "../table/table"

export class WoAging extends Component {

    setup() {
        /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
        this.state = useState({
            state1: 1
        })
        onWillStart(async () => {
            this.loadwoAging()
            this.loadwoAgingTableData()
        })

        // this.env.bus.on("filterApplied", this, this.onFilterApplied)
    }

    // onFilterApplied(ev) {
    //     this.state.message = ev.message
    //     console.log('I am at parent component ', ev)
    // }

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

    loadwoAgingTableData() {
        this.state.woAginTableData = {
            th: {
                class: 'highlighted',
                items:
                    [
                        { title: '', colspan: 1, key: 1 },
                        { title: '', colspan: 1, key: 2 },
                        { title: 'Order Age', colspan: 3, key: 3 },
                        { title: 'Applied', colspan: 1, key: 4 },
                        { title: 'Bill Amount', colspan: 4, key: 5 },
                        { title: 'Cost', colspan: 4, key: 6 },
                    ]
            },
            tr: [
                {
                    class: 'highlighted',
                    key: 1000,
                    td:
                        [
                            { title: 'Region', colspan: 1, key: 7 },
                            { title: 'Order Count', colspan: 1, key: 8 },
                            { title: '0 to 30', colspan: 1, key: 9 },
                            { title: '31 to 80', colspan: 1, key: 10 },
                            { title: '>80', colspan: 1, key: 11 },
                            { title: 'Labour Hours', colspan: 1, key: 12 },
                            { title: '0 to 30', colspan: 1, key: 13 },
                            { title: '31 to 80', colspan: 1, key: 14 },
                            { title: '>80', colspan: 1, key: 15 },
                            { title: 'Total for all Open WO', colspan: 1, key: 16 },
                            { title: '0 to 30', colspan: 1, key: 17 },
                            { title: '31 to 80', colspan: 1, key: 18 },
                            { title: '>80', colspan: 1, key: 19 },
                            { title: 'Total', colspan: 1, key: 20 },
                        ]
                },
                {
                    class: '',
                    key: 1001,
                    td:
                        [
                            { title: 'AFRICA', colspan: 1, key: 7 },
                            { title: 750, colspan: 1, key: 8 },
                            { title: 135, colspan: 1, key: 9 },
                            { title: 166, colspan: 1, key: 10 },
                            { title: 449, colspan: 1, key: 11 },
                            { title: 22893.2, colspan: 1, key: 12 },
                            { title: 78459.53, colspan: 1, key: 13 },
                            { title: 77854.32, colspan: 1, key: 14 },
                            { title: 232086.25, colspan: 1, key: 15 },
                            { title: 388400.10, colspan: 1, key: 16 },
                            { title: 73241.01, colspan: 1, key: 17 },
                            { title: 149294.48, colspan: 1, key: 18 },
                            { title: 1092690.46, colspan: 1, key: 19 },
                            { title: 1315225.94, colspan: 1, key: 20 },
                        ]
                },
                {
                    class: 'highlighted',
                    key: 1002,
                    td:
                        [
                            { title: 'Grand Total', colspan: 1, key: 7 },
                            { title: 750, colspan: 1, key: 8 },
                            { title: 135, colspan: 1, key: 9 },
                            { title: 166, colspan: 1, key: 10 },
                            { title: 449, colspan: 1, key: 11 },
                            { title: 22893.2, colspan: 1, key: 12 },
                            { title: 78459.53, colspan: 1, key: 13 },
                            { title: 77854.32, colspan: 1, key: 14 },
                            { title: 232086.25, colspan: 1, key: 15 },
                            { title: 388400.10, colspan: 1, key: 16 },
                            { title: 73241.01, colspan: 1, key: 17 },
                            { title: 149294.48, colspan: 1, key: 18 },
                            { title: 1092690.46, colspan: 1, key: 19 },
                            { title: 1315225.94, colspan: 1, key: 20 },
                        ]
                }
            ]
        }
    }


}


WoAging.template = "owl.WoAging"
WoAging.components = { ChartRenderer3, Table, Filter }
registry.category("actions").add("wo_aging", WoAging)