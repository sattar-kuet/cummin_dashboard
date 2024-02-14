/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } = owl
import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
import { Filter } from "../filter/filter"
import { KpiCard } from "../kpi_card/kpi_card"
import { SelectInput } from "../select_input/select_input"

const actionRegistry = registry.category("actions")

export class OwlKpiDashboard extends Component {
  setup() {
    /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
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
      this.env.bus.on("filterApplied", this, this.onFilterApplied)
      await this.loadKpiData()
    });
    // onMounted(() => {
    //   this.env.bus.on("filterApplied", this, this.onFilterApplied)
    // });
    onWillUnmount(() => {
      this.env.bus.off("filterApplied", this, this.onFilterApplied)
    });
  }
  onFilterApplied(filteringParameter) {
    this.state.filteringParameter = filteringParameter
    console.log('filterApplied trigger', filteringParameter)
    this.loadKpiData()
  }

  async loadKpiData() {
    let kpi_data = await this.rpc("/kpi/data", this.state.filteringParameter)
    this.state.kpi = JSON.parse(kpi_data)
  }
  viewOWaging() {
    this.actionService.doAction(
      "cummin_dashboard.action_wo_aging"
    )
  }

}

OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { Filter, KpiCard, SelectInput }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)
