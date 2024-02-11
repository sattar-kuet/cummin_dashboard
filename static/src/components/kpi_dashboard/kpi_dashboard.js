/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl;
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { DateRange } from "../date_range/date_range";
import { KpiCard } from "../kpi_card/kpi_card";
import { SelectInput } from "../select_input/select_input";
const actionRegistry = registry.category("actions");

export class OwlKpiDashboard extends Component {
  setup() {
    /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
    this.state = useState({
      distributorId: 0,
      distributor: 'Test',
      period: '',
      showDateRange: false,
      periodStartAt: '',
      periodEndAt: '',
      country: '',
      branch: '',
      currency: '',
      showTbDetail: false
    })

    this.actionService = useService("action")
    this.rpc = useService("rpc")

    onWillStart(async () => {
      await this.loadSession()
      await this.loadFilteringData()
      await this.loadKpiData()
      await this.loadInitialData()
    });
  }

  async loadSession() {
    let session = await this.rpc("/session/info")
    this.state.session = JSON.parse(session)
    console.log(this.state.session)
  }

  convertPeriodIntoRealDate() {
    if (this.state.period == 'this_month') {
      this.state.periodStartAt = moment().startOf('month').format('YYYY-MM-DD')
      this.state.periodEndAt = moment().endOf('month').format('YYYY-MM-DD')
    }
    else if (this.state.period == 'prev_month') {
      this.state.periodStartAt = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
      this.state.periodEndAt = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
    }
    else if (this.state.period == 'today') {
      this.state.periodStartAt = moment().format('YYYY-MM-DD')
      this.state.periodEndAt = moment().format('YYYY-MM-DD')
    }
  }
  onChangePeriod() {
    if (this.state.period == 'custom_date') {
      this.state.showDateRange = true
    } else {
      this.state.showDateRange = false
    }
    this.convertPeriodIntoRealDate()
    console.log('start at:', this.state.periodStartAt)
    console.log('end at:', this.state.periodEndAt)
  }
  onChangeStartAt() {
    this.state.periodStartAt = moment(this.state.periodStartAt).format('YYYY-MM-DD')
    console.log('New start at:', this.state.periodStartAt)
  }
  onChangeEndAt() {
    this.state.periodEndAt = moment(this.state.periodEndAt).format('YYYY-MM-DD')
    console.log('New end at:', this.state.periodEndAt)
  }
  applyFilter() {
    this.state.filteringParameter = {
      distributorId: this.state.distributorId,
      periodStartAt: this.state.periodStartAt,
      periodEndAt: this.state.periodEndAt,
      country: this.state.country,
      branch: this.state.branch,
      currency: this.state.currency
    }
    console.log('**************************', this.state.filteringParameter)
    this.loadKpiData()
    // console.log('distributor Id:', this.state.distributorId)
    // console.log('Start At:', this.state.periodStartAt)
    // console.log('End At:', this.state.periodEndAt)
    // console.log('country:', this.state.country)
    // console.log('branch:', this.state.branch)
    // console.log('currency:', this.state.currency)

  }
  resetFilter() {
    $('.form-control').val('')
    this.state.distributorId = 0
    this.state.periodStartAt = ''
    this.state.periodEndAt = ''
    this.state.country = ''
    this.state.branch = ''
    this.state.currency = ''
    this.state.showDateRange = false
  }
  async loadFilteringData() {
    await this.loadDistributors();
    await this.loadCountries();
    await this.loadBranches();
    await this.loadCurrencies();
  }
  async loadDistributors() {
    if (this.state.session.distributor) {
      this.state.distributorId = this.state.session.company_ids[0]
    } else {
      let distributors = await this.rpc("/distributor/list");
      distributors = JSON.parse(distributors);
      this.state.distributors = distributors;
    }
  }

  async loadCountries() {
    let countries = await this.rpc("/country/list");
    countries = JSON.parse(countries);
    this.state.countries = countries;
  }
  async loadBranches() {
    let branches = await this.rpc("/branch/list");
    branches = JSON.parse(branches);
    this.state.branches = branches;
  }
  async loadCurrencies() {
    let currencies = await this.rpc("/currency/list");
    currencies = JSON.parse(currencies);
    this.state.currencies = currencies;
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
      "cummin_dashboard.action_wo_aging"
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
OwlKpiDashboard.components = { KpiCard, DateRange, SelectInput }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)
