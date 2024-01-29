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
      period: 90,
    });
    this.rpc = useService("rpc");
    onWillStart(async () => {
      await this.loadFilteringData();
      await this.loadKpiData();
    });
  }
  reset() {
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
    let kpi_data = await this.rpc("/kpi/data");
    kpi_data = JSON.parse(kpi_data);
    this.state.kpi = kpi_data;
  }
}

OwlKpiDashboard.template = "owl.KpiDashboard";
OwlKpiDashboard.components = { KpiCard, DateRange, SelectInput };
actionRegistry.add("kpi_dashboard", OwlKpiDashboard);
