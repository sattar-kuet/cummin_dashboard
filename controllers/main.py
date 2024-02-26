import json
import requests
from odoo import http, fields
from odoo.http import request
from odoo.osv import expression
from datetime import datetime, timezone, timedelta


class Api(http.Controller):

    @http.route('/distributor/list', auth="user", type="json")
    def distributor_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].sudo().search([])
        distributor_list = []
        company_considered = []
        for maintenance_request in maintenance_requests:
            company = maintenance_request.create_uid.company_id
            if company.id in company_considered:
                continue
            company_considered.append(company.id)
            distributor_list.append({
                    "id": company.id,
                    "name": company.name,
                    "key": company.id
                })
        
        return json.dumps(distributor_list)
    
    @http.route('/country/list', auth="user", type="json")
    def country_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        country_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.country:
                country_list.append({
                    "id": maintenance_request.country,
                    "name": maintenance_request.country,
                    "key": f'country{maintenance_request.id}'
                })
           
        return json.dumps(country_list)
    
    @http.route('/branch/list', auth="user", type="json")
    def branch_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        branch_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.branch:
                branch_list.append({
                    "id": maintenance_request.branch,
                    "name": maintenance_request.branch,
                    "key": f'branch{maintenance_request.id}'
                })
           
        return json.dumps(branch_list)
    
    @http.route('/currency/list', auth="user", type="json")
    def currency_list(self, **data):
        maintenance_requests = request.env['maintenance.request'].search([])
        currency_list = []
        for maintenance_request in maintenance_requests:
            if maintenance_request.currency:
                currency_list.append({
                    "id": maintenance_request.currency,
                    "name": maintenance_request.currency,
                    "key": f'currency{maintenance_request.id}'
                })
           
        return json.dumps(currency_list)
    
    @http.route('/kpi/load_initial_data', auth="user", type="json")
    def load_initial_data(self,**data):
        maintenance_request_list_view_obj = http.request.env['ir.model.data'].sudo().search(
            [('name', '=', 'hr_equipment_request_view_tree')]
            , limit=1)
        maintenance_request_tree_view_res_id = False
        if maintenance_request_list_view_obj:
            maintenance_request_tree_view_res_id = maintenance_request_list_view_obj.res_id

        account_analytic_line_tree_view_obj = http.request.env['ir.model.data'].sudo().search(
            [('name', '=', 'hr_timesheet.hr_timesheet_line_tree')]
            , limit=1)
        account_analytic_line_tree_view_res_id = False
        if account_analytic_line_tree_view_obj:
            account_analytic_line_tree_view_res_id = account_analytic_line_tree_view_obj.res_id

        initial_dta = {
            'maintenanceRequestTreeViewResId': maintenance_request_tree_view_res_id,
             'accountAnalyticTreeViewResId': account_analytic_line_tree_view_res_id
        }
        return json.dumps(initial_dta)
    
    @http.route('/session/info', auth="user", type="json")
    def user_type(self, **data):
        user_type = {
            'admin':  request.env.user.has_group('cummin_dashboard.group_cummin_admin'), 
            'distributor':  request.env.user.has_group('cummin_dashboard.group_distributor'), 
            'technician':  request.env.user.has_group('cummin_dashboard.group_technician'), 
            'company_ids': request.env.user.company_ids.ids,
            'company_names': [company.name for company in request.env.user.company_ids]
        }
        return json.dumps(user_type)
    
    @http.route('/kpi/data', auth="user", type="json")
    def kpi_data(self, **data):
        domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data)
        maintenance_requests = request.env['maintenance.request'].search(domain)
        wip_cost = 0
        wip_cost_ids = []
        wip_billable_amount = 0
        wip_billable_ids = []
        wo_count = 0
        wo_count_ids = []
        wo_open = 0
        wo_invoiced = 0
        billed_hours = 0
        billable_hours = 0
        service_operating_sales = 0
        maintenance_request_open_ids = []
        maintenance_request_invoiced_ids = []
        
        for maintenance_request in maintenance_requests:
            if maintenance_request.invoice:
              wo_invoiced += 1
              maintenance_request_invoiced_ids.append(maintenance_request.id)
            else:
                wo_open += 1
                maintenance_request_open_ids.append(maintenance_request.id)
            if maintenance_request.stage_id.name == 'Closure':
                billable_hours += maintenance_request.billed_hours
                service_operating_sales += maintenance_request.labour_sales + maintenance_request.parts_sales + maintenance_request.other_sales
            else:
               wip_billable_amount += maintenance_request.labour_sales + maintenance_request.parts_sales + maintenance_request.other_sales
               wip_billable_ids.append(maintenance_request.id)
               wo_count += 1
               wo_count_ids.append(maintenance_request.id)
               wip_cost += maintenance_request.wip_cost
               wip_cost_ids.append(maintenance_request.id)

            billed_hours += maintenance_request.billed_hours

        account_analytics = request.env['account.analytic.line'].search(time_sheet_domain)
        
        total_hours = 0
        benifit_hours = 0
        applied_hours = 0
        tb_detail = {}
        productivity_ids = []
        applied_hours_ids = []
        for account_analytic in account_analytics:
            total_hours += account_analytic.unit_amount
            if account_analytic.task in ['0410','0710','0711','0712']:
                benifit_hours += account_analytic.unit_amount
                productivity_ids.append(account_analytic.id)
            if account_analytic.task in ['0104','0105','0107','0108','0800']:
                applied_hours += account_analytic.unit_amount
                applied_hours_ids.append(account_analytic.id)

        payroll_hours = total_hours
        available_hours = payroll_hours - benifit_hours
       
        kpi_data = {
            'growthMindSet': {
                'woCount': {
                    'open': wo_open,
                    'openIds': maintenance_request_open_ids,
                    'invoiced': wo_invoiced,
                    'invoicedIds': maintenance_request_invoiced_ids,
                    'serviceOperatingSales': service_operating_sales,
                },
                'wip':{
                    'woCount': wo_count,
                    'cost': wip_cost,
                    'billableAmount': wip_billable_amount,
                    'ids': wip_billable_ids
                }
            },
            
            
            'operationalEfficiencies': {
                'tb': request.env['cummin_dashboard.helper'].calculate_percentage(total_hours,billed_hours),
                'tbDetail': {'totalHours': total_hours, 'billedHours':billed_hours},
                'productivity': request.env['cummin_dashboard.helper'].calculate_percentage(payroll_hours,benifit_hours), 
                'productivity_ids': productivity_ids,
                'labourUtilization': request.env['cummin_dashboard.helper'].calculate_percentage(applied_hours,available_hours),
                'billingEfficiency': request.env['cummin_dashboard.helper'].calculate_percentage(billed_hours,applied_hours),
                'applied_hours_ids': applied_hours_ids
            },
            'parameter': data
        }
        # return {'ids':wip_billable_ids, 'amount':wip_billable_amount,'stage_id':stage_id}
        return json.dumps(kpi_data)
    

    @http.route('/wo_aging/table_data', auth="user", type="json")
    def wo_aging_table_data(self, **data):
        key = 1
        table_data = {
                    "th": {
                        "class": "highlighted",
                        "items": [
                            {"title": "", "colspan": 1, "key": key+1},
                            {"title": "", "colspan": 1, "key": key+2},
                            {"title": "Order Age", "colspan": 3, "key": key+3},
                            {"title": "Applied", "colspan": 1, "key": key+4},
                            {"title": "Billable Amount", "colspan": 4, "key": key+5},
                            {"title": "Cost", "colspan": 4, "key": key+6}
                        ]
                    }
                }
        key = key+7
        table_data["tr"] = [
                        {
                            "class": "highlighted",
                            "key": 1000,
                            "td": [
                                {"title": "Region", "colspan": 1, "key": key},
                                {"title": "Order Count", "colspan": 1, "key": key+1},
                                {"title": "0 to 30", "colspan": 1, "key": key+2},
                                {"title": "31 to 80", "colspan": 1, "key": key+3},
                                {"title": ">80", "colspan": 1, "key": key+4},
                                {"title": "Labour Hours", "colspan": 1, "key": key+5},
                                {"title": "0 to 30", "colspan": 1, "key": key+6},
                                {"title": "31 to 80", "colspan": 1, "key": key+7},
                                {"title": ">80", "colspan": 1, "key": key+8},
                                {"title": "Total for all Open WO", "colspan": 1, "key": key+9},
                                {"title": "0 to 30", "colspan": 1, "key": key+10},
                                {"title": "31 to 80", "colspan": 1, "key": key+11},
                                {"title": ">80", "colspan": 1, "key": key+12},
                                {"title": "Total", "colspan": 1, "key": key+13}
                            ]
                        }
                    ]
        key = key+14
        maintenance_request_domain, time_sheet_domain = request.env['cummin_dashboard.helper'].get_filtering_domain(data) 
        countries = request.env['cummin_dashboard.helper'].get_countries()
        total_order_count = 0
        total_order_0_30 = 0
        total_order_31_80 = 0
        total_order_81_infinity = 0
        total_labour_hours = 0
        total_billable_amount = 0
        total_billable_amount_0_30 = 0
        total_billable_amount_31_80 = 0
        total_billable_amount_81_infinity = 0
        total_cost_0_30 = 0
        total_cost_31_80 = 0
        total_cost_81_infinity = 0
        total_cost = 0
        for country in countries:
            country_name = '-'
            if country:
                country_name = country
            maintenance_request_domain.append(('country','=', country))
            maintenance_request_ids,order_count,order_0_30,order_31_80,order_81_infinity = request.env['cummin_dashboard.helper'].order_count_detail(maintenance_request_domain)
            time_sheet_domain.append(('maintenance_request_id','in',maintenance_request_ids))
            labour_hours = request.env['cummin_dashboard.helper'].labour_hours_detail(time_sheet_domain)
            billable_amount, billable_amount_0_30, billable_amount_31_80, billable_amount_81_inifinity = request.env['cummin_dashboard.helper'].billable_amount_detail(maintenance_request_domain)
            cost, cost_0_30, cost_31_80, cost_81_inifinity = request.env['cummin_dashboard.helper'].cost_detail(maintenance_request_domain)
            
            total_order_count += int(order_count)
            total_order_0_30 += int(order_0_30)
            total_order_31_80 += int(order_31_80)
            total_order_81_infinity += int(order_81_infinity)
            total_labour_hours += float(labour_hours)
            total_billable_amount += float(billable_amount)
            total_billable_amount_0_30 += float(billable_amount_0_30)
            total_billable_amount_31_80 += float(billable_amount_31_80)
            total_billable_amount_81_infinity += float(billable_amount_81_inifinity)

            total_cost += float(cost)
            total_cost_0_30 += float(cost_0_30)
            total_cost_31_80 += float(cost_31_80)
            total_cost_81_infinity += float(total_cost_81_infinity)

            table_data["tr"].append({
                            "class": "",
                            "key": key,
                            "td": [
                                {"title": country_name, "colspan": 1, "key": key+1},
                                {"title": order_count, "colspan": 1, "key": key+2},
                                {"title": order_0_30, "colspan": 1, "key": key+3},
                                {"title": order_31_80, "colspan": 1, "key": key+4},
                                {"title": order_81_infinity, "colspan": 1, "key": key+5},
                                {"title": labour_hours, "colspan": 1, "key": key+6},
                                {"title": billable_amount_0_30, "colspan": 1, "key": key+7},
                                {"title": billable_amount_31_80, "colspan": 1, "key": key+8},
                                {"title": billable_amount_81_inifinity, "colspan": 1, "key": key+9},
                                {"title": billable_amount, "colspan": 1, "key": key+10},
                                {"title": cost_0_30, "colspan": 1, "key": key+11},
                                {"title": cost_31_80, "colspan": 1, "key": key+12},
                                {"title": cost_81_inifinity, "colspan": 1, "key": key+13},
                                {"title": cost, "colspan": 1, "key": key+14}
                            ]
                        })
            key = key+15
        
        table_data["tr"].append({
                            "class": "highlighted",
                            "key": key+1,
                            "td": [
                                {"title": "Grand Total", "colspan": 1, "key": key+2},
                                {"title": total_order_count, "colspan": 1, "key": key+3},
                                {"title": total_order_0_30, "colspan": 1, "key": key+4},
                                {"title": total_order_31_80, "colspan": 1, "key": key+5},
                                {"title": total_order_81_infinity, "colspan": 1, "key": key+6},
                                {"title": total_labour_hours, "colspan": 1, "key": key+7},
                                {"title": total_billable_amount_0_30, "colspan": 1, "key": key+8},
                                {"title": total_billable_amount_31_80, "colspan": 1, "key": key+9},
                                {"title": total_billable_amount_81_infinity, "colspan": 1, "key": key+10},
                                {"title": total_billable_amount, "colspan": 1, "key": key+11},
                                {"title": total_cost_0_30, "colspan": 1, "key": key+12},
                                {"title": total_cost_31_80, "colspan": 1, "key": key+13},
                                {"title": total_cost_81_infinity, "colspan": 1, "key": key+14},
                                {"title": total_cost, "colspan": 1, "key": key+15}
                            ]
                        })
        return json.dumps(table_data)
    
    @http.route('/wo_aging/chart_data', auth="user", type="json")
    def wo_aging_chart_data(self, **data):
        countries = request.env['cummin_dashboard.helper'].get_countries()
        labels = []
        bg_0_30 = []
        bg_31_80 = []
        bg_81_infinity = []
        data_0_30 = []
        data_31_80 = []
        data_81_infinity = []
        for country in countries:
            if not country:
                country = '-'
            labels.append(country)
            bg_0_30.append('green')
            bg_31_80.append('red')
            bg_81_infinity.append('blue')
            data_0_30.append(3)
            data_31_80.append(4)
            data_81_infinity.append(5)
        chart_data = {
            "labels": labels,
            "datasets": [
                {
                    "label": "0 to 30",
                    "backgroundColor": bg_0_30,
                    "data": data_0_30
                },
                {
                    "label": "31 to 80",
                    "backgroundColor": bg_31_80,
                    "data": data_31_80
                },
                {
                    "label": "<80",
                    "backgroundColor": bg_81_infinity,
                    "data": data_81_infinity
                }
            ]
        }
        return json.dumps(chart_data)
        
    @http.route('/test_url', auth="public", type="http", website="true")
    def test_url(self, **data):
        return request.render('cummin_dashboard.test_page', {'message':'Hey Gerald. How are you?'})