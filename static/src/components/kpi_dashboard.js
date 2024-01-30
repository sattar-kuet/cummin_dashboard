/** @odoo-module */
const { Component, onWillStart, useRef, onMounted, useState } = owl;
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { DateRange } from "./date_range/date_range";
import { KpiCard } from "./kpi_card/kpi_card";
import { SelectInput } from "./select_input/select_input";
const actionRegistry = registry.category("actions");

export class OwlKpiDashboard extends Component {
  setup() {
    /* #####################################################################################
                                ATTENTION: such initial config is MUST
        ########################################################################################*/
    this.state = useState({
      distributorId: 0,
      period: 'all_time',
      showDateRange: false,
      periodStartAt: '',
      periodEndAt: '',
      country: '',
      branch: '',
      currency: ''
    });
    this.rpc = useService("rpc")
    onWillStart(async () => {
      await this.loadFilteringData()
      await this.loadKpiData()
    });
  }

  convertPeriodIntoRealDate() {
    if (this.state.period == 'this_month') {
      this.state.periodStartAt = moment().startOf('month').format('YYYY-MM-DD')
      this.state.periodEndAt = moment().endOf('month').format('YYYY-MM-DD')
    } else if (this.state.period == 'today') {
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
    this.filteringParameter = {
      distributorId: this.state.distributorId,
      periodStartAt: this.state.periodStartAt,
      periodEndAt: this.state.periodEndAt,
      country: this.state.country,
      branch: this.state.branch,
      currency: this.state.currency
    }
    this.loadKpiData()
    // console.log('distributor Id:', this.state.distributorId)
    // console.log('Start At:', this.state.periodStartAt)
    // console.log('End At:', this.state.periodEndAt)
    // console.log('country:', this.state.country)
    // console.log('branch:', this.state.branch)
    // console.log('currency:', this.state.currency)

  }
  resetFilter() {
    $('.form-control').val('');
  }
  async loadFilteringData() {
    await this.loadDistributors();
    await this.loadCountries();
    await this.loadBranches();
    await this.loadCurrencies();
  }
  async loadDistributors() {
    let distributors = await this.rpc("/distributor/list");
    distributors = JSON.parse(distributors);
    this.state.distributors = distributors;
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


  async loadKpiData() {

    let kpi_data = await this.rpc("/kpi/data", this.filteringParameter)
    console.log(kpi_data)
    kpi_data = JSON.parse(kpi_data)
    this.state.kpi = kpi_data
  }
}

OwlKpiDashboard.template = "owl.KpiDashboard"
OwlKpiDashboard.components = { KpiCard, DateRange, SelectInput }
actionRegistry.add("kpi_dashboard", OwlKpiDashboard)
