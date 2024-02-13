/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl;
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Filter } from "../filter/filter";
import { KpiCard } from "../kpi_card/kpi_card";
import { SelectInput } from "../select_input/select_input";
const actionRegistry = registry.category("actions");

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
      await this.loadSession()
      await this.loadKpiData()
      await this.loadInitialData()
    });
    this.env.bus.on("filterApplied", this, this.onFilterApplied)
  }

  async loadSession() {
    let session = await this.rpc("/session/info")
    this.state.session = JSON.parse(session)
    console.log(this.state.session)
  }

  onFilterApplied(filteringParameter) {
    this.state.filteringParameter = filteringParameter
    this.loadKpiData()
  }


  async loadInitialData() {
    let initial_data = await this.rpc("/kpi/load_initial_data", this.filteringParameter)
    // console.log(initial_data)
    initial_data = JSON.parse(initial_data)
    this.state.maintenanceRequestTreeViewResId = initial_data.maintenanceRequestTreeViewResId
    this.state.accountAnalyticTreeViewResId = initial_data.accountAnalyticTreeViewResId
  }

  async loadKpiData() {
    let kpi_data = await this.rpc("/kpi/data", this.state.filteringParameter)
    console.log(kpi_data)
    kpi_data = JSON.parse(kpi_data)
    this.state.kpi = kpi_data
  }

  viewOpenMaintananceRequest() {
    let domain = [
      ['id', 'in', this.state.kpi.growthMindSet.woCount.openIds]
    ]
    console.log(this.state.kpi.growthMindSet.woCount.openIds)
    let title = 'Maintenance Requests (Open)'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "maintenance.request",
      domain,
      views: [
        [this.state.maintenanceRequestTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewInvoicedMaintananceRequest() {
    let domain = [
      ['id', 'in', this.state.kpi.growthMindSet.woCount.invoicedIds]
    ]
    console.log(this.state.kpi.growthMindSet.woCount.invoicedIds)
    let title = 'Maintenance Requests (Invoiced)'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "maintenance.request",
      domain,
      views: [
        [this.state.maintenanceRequestTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewOWaging() {
    this.actionService.doAction(
      "cummin_dashboard.action_wo_aging",
      this.state.filteringParameter
    )
  }



  viewWipWoCountMaintananceRequest() {
    let domain = [
      ['id', 'in', this.state.kpi.growthMindSet.wip.ids]
    ]
    console.log(this.state.kpi.growthMindSet.wip.owCountIds)
    let title = 'Maintenance Requests (Wo Count)'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "maintenance.request",
      domain,
      views: [
        [this.state.maintenanceRequestTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewBillableMaintananceRequest() {
    let domain = [
      ['id', 'in', this.state.kpi.growthMindSet.wip.ids]
    ]
    console.log(this.state.kpi.growthMindSet.wip.billableIds)
    let title = 'Maintenance Requests (Billable)'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "maintenance.request",
      domain,
      views: [
        [this.state.maintenanceRequestTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewWipCostMaintananceRequest() {
    let domain = [
      ['id', 'in', this.state.kpi.growthMindSet.wip.ids]
    ]
    console.log(this.state.kpi.growthMindSet.wip.ids)
    let title = 'Maintenance Requests (WIP Cost)'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "maintenance.request",
      domain,
      views: [
        [this.state.maintenanceRequestTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewTBdetail() {
    this.state.showTbDetail = !this.state.showTbDetail
    // let domain = [
    //   ['id', 'in', this.state.kpi.operationalEfficiencies.tb_ids]
    // ]

    // let title = 'TB'

    // this.actionService.doAction({
    //   type: "ir.actions.act_window",
    //   name: title,
    //   res_model: "account.analytic.line",
    //   domain,
    //   views: [
    //     [this.state.accountAnalyticTreeViewResId, "list"],
    //     [false, "form"],
    //   ]
    // })
  }
  viewProductivityDetail() {
    let domain = [
      ['id', 'in', this.state.kpi.operationalEfficiencies.productivity_ids]
    ]

    let title = 'TB'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "account.analytic.line",
      domain,
      views: [
        [this.state.accountAnalyticTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewLabourUtilizationDetail() {
    let domain = [
      ['id', 'in', this.state.kpi.operationalEfficiencies.applied_hours_ids]
    ]

    let title = 'Labour Utilization'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "account.analytic.line",
      domain,
      views: [
        [this.state.accountAnalyticTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
  viewBillingEffeciencyDetail() {
    let domain = [
      ['id', 'in', this.state.kpi.operationalEfficiencies.applied_hours_ids]
    ]

    let title = 'Billing Effeciancy Detail'

    this.actionService.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "account.analytic.line",
      domain,
      views: [
        [this.state.accountAnalyticTreeViewResId, "list"],
        [false, "form"],
      ]
    })
  }
}

OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { Filter, KpiCard, SelectInput }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)
