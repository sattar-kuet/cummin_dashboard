/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService, useBus } from "@web/core/utils/hooks";
const { Component, onWillStart, useRef, onMounted, useState } = owl
import { Utility } from "../utility"
const utility = new Utility()

export class Filter extends Component {
    setup() {
        this.state = useState({
            session: {},
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
        })
        this.rpc = useService("rpc")
        onWillStart(async () => {
            await this.loadSession()
            await this.loadFilteringData()
            this.loadFilteringParameterFromCookie()
        })
    }

    async loadSession() {
        let session = await this.rpc("/session/info")
        this.state.session = JSON.parse(session)
        console.log(this.state.session)
    }

    async loadFilteringData() {
        await this.loadDistributors()
        await this.loadCountries()
        await this.loadBranches()
        await this.loadCurrencies()
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

    loadFilteringParameterFromCookie() {
        const filteringParameterFromCookie = utility.getCookie('filteringParameter')
        if (filteringParameterFromCookie) {
            let filteringParameter = JSON.parse(filteringParameterFromCookie)
            this.state.distributorId = parseInt(filteringParameter.distributorId)
            let filteringData = this.getFilteringData()
            this.env.bus.trigger('filterApplied', filteringData)
        }
    }
    onChangePeriod() {
        if (this.state.period == 'custom_date') {
            this.state.showDateRange = true
        } else {
            this.state.showDateRange = false
        }
        this.convertPeriodIntoRealDate()
    }
    convertPeriodIntoRealDate() {
        if (this.state.period == '') {
            this.state.periodStartAt = ''
            this.state.periodEndAt = ''
        }
        else if (this.state.period == 'this_month') {
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

    onChangeStartAt() {
        this.state.periodStartAt = moment(this.state.periodStartAt).format('YYYY-MM-DD')
        console.log('New start at:', this.state.periodStartAt)
    }
    onChangeEndAt() {
        this.state.periodEndAt = moment(this.state.periodEndAt).format('YYYY-MM-DD')
        console.log('New end at:', this.state.periodEndAt)
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
        let filteringData = this.getFilteringData()
        this.setFilteringDataToCookie(filteringData)
    }
    applyFilter() {
        let filteringData = this.getFilteringData()
        this.setFilteringDataToCookie(filteringData)
        this.env.bus.trigger('filterApplied', filteringData)
    }
    getFilteringData() {
        return {
            distributorId: this.state.distributorId,
            periodStartAt: this.state.periodStartAt,
            periodEndAt: this.state.periodEndAt,
            country: this.state.country,
            branch: this.state.branch,
            currency: this.state.currency
        }
    }
    setFilteringDataToCookie(filteringData) {
        let filteringDataString = JSON.stringify(filteringData)
        utility.setCookie('filteringParameter', filteringDataString, 30)
    }
}

Filter.template = "owl.Filter"
